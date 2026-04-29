"""Instagram Graph API (with Instagram Login) OAuth flow.

Flow:
1. App calls GET /api/instagram/start?token=<jwt> → server returns 302 to instagram.com/oauth/authorize
2. User logs into IG → IG redirects to /api/instagram/callback?code=...&state=...
3. Server exchanges code → short-lived → long-lived token, fetches /me/media, stores encrypted
4. Server responds with HTML page that deep-links back to the app: localvibe://instagram-connected
"""

import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
import jwt as jwtlib
from cryptography.fernet import Fernet
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse, HTMLResponse

router = APIRouter(prefix="/api/instagram", tags=["instagram"])

META_APP_ID = os.environ["META_APP_ID"]
META_APP_SECRET = os.environ["META_APP_SECRET"]
JWT_SECRET = os.environ["JWT_SECRET"]
ENCRYPTION_KEY = os.environ["ENCRYPTION_KEY"].encode()
APP_DEEP_LINK = os.environ.get("APP_DEEP_LINK", "localvibe://instagram-connected")
PUBLIC_BACKEND_URL = os.environ["PUBLIC_BACKEND_URL"]

REDIRECT_URI = f"{PUBLIC_BACKEND_URL}/api/instagram/callback"
SCOPES = "instagram_business_basic"

_cipher = Fernet(ENCRYPTION_KEY)


def _encrypt(s: str) -> str:
    return _cipher.encrypt(s.encode()).decode()


def _decrypt(s: str) -> str:
    return _cipher.decrypt(s.encode()).decode()


def _close_html(message: str, success: bool = True) -> str:
    icon = "✓" if success else "✗"
    color = "#16A34A" if success else "#E11D48"
    return f"""<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>LocalVibe</title>
<style>
body{{font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#FAFAF9;color:#1C1917;padding:24px;text-align:center}}
.card{{max-width:340px;background:#fff;padding:32px 24px;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,.08)}}
.icon{{font-size:48px;color:{color};margin-bottom:16px}}
h1{{font-size:20px;margin:0 0 8px}}
p{{color:#57534E;font-size:14px;line-height:1.5}}
a{{display:inline-block;margin-top:16px;background:#E11D48;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}}
</style></head>
<body>
<div class="card">
<div class="icon">{icon}</div>
<h1>{message}</h1>
<p>Returning to LocalVibe…</p>
<a href="{APP_DEEP_LINK}?status={'ok' if success else 'error'}">Open LocalVibe</a>
</div>
<script>setTimeout(function(){{location.href="{APP_DEEP_LINK}?status={'ok' if success else 'error'}";}},1200);</script>
</body></html>"""


def make_router(db):
    @router.get("/start")
    async def start(token: str):
        """Begin OAuth — validates user JWT, generates a state, redirects to Instagram."""
        try:
            payload = jwtlib.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwtlib.InvalidTokenError:
            raise HTTPException(401, "Invalid token")

        user_id = payload["sub"]
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user or user["role"] != "provider" or not user.get("provider_id"):
            raise HTTPException(403, "Only providers with a profile can connect Instagram")

        state = secrets.token_urlsafe(24)
        await db.ig_oauth_states.insert_one({
            "state": state,
            "user_id": user_id,
            "provider_id": user["provider_id"],
            "created_at": datetime.now(timezone.utc),
            # auto-expire in 10 min via TTL index
        })

        url = (
            "https://www.instagram.com/oauth/authorize"
            f"?client_id={META_APP_ID}"
            f"&redirect_uri={REDIRECT_URI}"
            f"&scope={SCOPES}"
            "&response_type=code"
            f"&state={state}"
        )
        return RedirectResponse(url=url, status_code=302)

    @router.get("/callback")
    async def callback(code: Optional[str] = None, state: Optional[str] = None,
                       error: Optional[str] = None, error_description: Optional[str] = None):
        if error:
            return HTMLResponse(_close_html(f"Connect failed: {error_description or error}", success=False))
        if not code or not state:
            return HTMLResponse(_close_html("Missing code or state", success=False))

        st = await db.ig_oauth_states.find_one({"state": state})
        if not st:
            return HTMLResponse(_close_html("State expired or invalid", success=False))
        await db.ig_oauth_states.delete_one({"state": state})

        try:
            async with httpx.AsyncClient(timeout=20) as cx:
                # Step 1: short-lived token
                tr = await cx.post(
                    "https://api.instagram.com/oauth/access_token",
                    data={
                        "client_id": META_APP_ID,
                        "client_secret": META_APP_SECRET,
                        "grant_type": "authorization_code",
                        "redirect_uri": REDIRECT_URI,
                        "code": code,
                    },
                )
                if tr.status_code != 200:
                    return HTMLResponse(_close_html(f"Token exchange failed: {tr.text[:80]}", False))
                td = tr.json()
                short_token = td["access_token"]
                ig_user_id = str(td.get("user_id", ""))

                # Step 2: long-lived token
                lr = await cx.get(
                    "https://graph.instagram.com/access_token",
                    params={
                        "grant_type": "ig_exchange_token",
                        "client_secret": META_APP_SECRET,
                        "access_token": short_token,
                    },
                )
                if lr.status_code != 200:
                    return HTMLResponse(_close_html(f"Long-lived token failed: {lr.text[:80]}", False))
                ld = lr.json()
                long_token = ld["access_token"]
                expires_in = int(ld.get("expires_in", 60 * 24 * 3600))

                # Step 3: profile info
                pr = await cx.get(
                    "https://graph.instagram.com/me",
                    params={"fields": "id,username,account_type", "access_token": long_token},
                )
                profile = pr.json() if pr.status_code == 200 else {}
                username = profile.get("username")

                # Step 4: latest 6 media (images only)
                mr = await cx.get(
                    "https://graph.instagram.com/me/media",
                    params={
                        "fields": "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp",
                        "limit": 12,
                        "access_token": long_token,
                    },
                )
                media_items = []
                if mr.status_code == 200:
                    raw = mr.json().get("data", [])
                    for m in raw:
                        url = m.get("media_url") if m.get("media_type") in ("IMAGE", "CAROUSEL_ALBUM") else m.get("thumbnail_url")
                        if url:
                            media_items.append(url)
                        if len(media_items) >= 6:
                            break

            # Persist
            now = datetime.now(timezone.utc)
            update = {
                "instagram": f"@{username}" if username else None,
                "ig_connected": True,
                "ig_user_id": ig_user_id,
                "ig_username": username,
                "ig_token_enc": _encrypt(long_token),
                "ig_token_expires_at": (now + timedelta(seconds=expires_in)).isoformat(),
                "ig_connected_at": now.isoformat(),
            }
            # Hybrid: if we got media, set as portfolio + cover/avatar
            if len(media_items) >= 1:
                update["portfolio"] = media_items
                update["cover"] = media_items[0]
                update["avatar"] = media_items[0]

            await db.providers.update_one({"id": st["provider_id"]}, {"$set": update})
            return HTMLResponse(_close_html(
                f"Connected as @{username}!" if username else "Instagram connected!",
                success=True,
            ))
        except Exception as e:
            return HTMLResponse(_close_html(f"Unexpected error: {str(e)[:80]}", False))

    @router.post("/disconnect")
    async def disconnect(request: Request):
        from server import get_current_user
        user = await get_current_user(request)
        if not user.get("provider_id"):
            raise HTTPException(404, "No provider profile")
        await db.providers.update_one(
            {"id": user["provider_id"]},
            {"$set": {"ig_connected": False, "ig_token_enc": None, "ig_user_id": None,
                      "ig_username": None, "ig_token_expires_at": None}},
        )
        return {"ok": True}

    @router.post("/sync")
    async def sync_media(request: Request):
        from server import get_current_user
        user = await get_current_user(request)
        if not user.get("provider_id"):
            raise HTTPException(404, "No provider profile")
        p = await db.providers.find_one({"id": user["provider_id"]}, {"_id": 0})
        if not p or not p.get("ig_connected") or not p.get("ig_token_enc"):
            raise HTTPException(400, "Instagram not connected")
        token = _decrypt(p["ig_token_enc"])
        async with httpx.AsyncClient(timeout=20) as cx:
            mr = await cx.get(
                "https://graph.instagram.com/me/media",
                params={
                    "fields": "id,media_type,media_url,thumbnail_url,permalink",
                    "limit": 12,
                    "access_token": token,
                },
            )
        if mr.status_code != 200:
            raise HTTPException(400, f"IG fetch failed: {mr.text[:80]}")
        media_items = []
        for m in mr.json().get("data", []):
            url = m.get("media_url") if m.get("media_type") in ("IMAGE", "CAROUSEL_ALBUM") else m.get("thumbnail_url")
            if url:
                media_items.append(url)
            if len(media_items) >= 6:
                break
        if not media_items:
            raise HTTPException(400, "No images found on Instagram")
        await db.providers.update_one(
            {"id": user["provider_id"]},
            {"$set": {"portfolio": media_items, "cover": media_items[0], "avatar": media_items[0]}},
        )
        return {"ok": True, "count": len(media_items)}

    return router
