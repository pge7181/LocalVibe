from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from seed_data import SEED_PROVIDERS

# ---------- App / DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="LocalVibe API")
api = APIRouter(prefix="/api")

JWT_ALG = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]


# ---------- Auth helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


# ---------- Models ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    role: str = Field(pattern="^(seeker|provider)$")


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    provider_id: Optional[str] = None


class AuthResp(BaseModel):
    token: str
    user: UserOut


class ServiceItem(BaseModel):
    title: str
    description: str = ""
    price: int  # in INR
    unit: str = "per event"


class ProviderCreate(BaseModel):
    name: str
    category: str
    city: str
    bio: str = ""
    avatar: str = ""
    cover: str = ""
    phone: str
    whatsapp: str
    instagram: Optional[str] = None
    portfolio: List[str] = []
    services: List[ServiceItem] = []
    price_min: int
    price_max: int


class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    cover: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    portfolio: Optional[List[str]] = None
    services: Optional[List[ServiceItem]] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None


class ReviewIn(BaseModel):
    provider_id: str
    rating: int = Field(ge=1, le=5)
    comment: str
    quality: int = Field(ge=1, le=5)
    communication: int = Field(ge=1, le=5)
    value: int = Field(ge=1, le=5)


class InquiryIn(BaseModel):
    provider_id: str
    event_type: str
    event_date: str
    budget: int
    message: str


# ---------- Routes: auth ----------
@api.get("/")
async def root():
    return {"app": "LocalVibe", "version": "1.0"}


@api.post("/auth/register", response_model=AuthResp)
async def register(body: RegisterIn):
    email = body.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "role": body.role,
        "provider_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email, body.role)
    return AuthResp(
        token=token,
        user=UserOut(id=user_id, email=email, name=body.name, role=body.role),
    )


@api.post("/auth/login", response_model=AuthResp)
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user["id"], email, user["role"])
    return AuthResp(
        token=token,
        user=UserOut(
            id=user["id"], email=email, name=user["name"], role=user["role"],
            provider_id=user.get("provider_id"),
        ),
    )


@api.get("/auth/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return UserOut(**{k: user.get(k) for k in ["id", "email", "name", "role", "provider_id"]})


# ---------- Routes: providers ----------
@api.get("/providers")
async def list_providers(
    city: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort: str = "rating",
):
    query: dict = {}
    if city and city.lower() != "all":
        query["city"] = city
    if category and category.lower() != "all":
        query["category"] = category
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    if min_price is not None:
        query["price_min"] = {"$gte": min_price}
    if max_price is not None:
        query["price_max"] = {"$lte": max_price}

    cursor = db.providers.find(query, {"_id": 0})
    if sort == "rating":
        cursor = cursor.sort("rating", -1)
    elif sort == "price_low":
        cursor = cursor.sort("price_min", 1)
    elif sort == "price_high":
        cursor = cursor.sort("price_max", -1)
    elif sort == "recent":
        cursor = cursor.sort("created_at", -1)

    items = await cursor.to_list(200)
    return items


@api.get("/providers/featured")
async def featured(city: Optional[str] = None):
    q: dict = {"verified": True}
    if city and city.lower() != "all":
        q["city"] = city
    items = await db.providers.find(q, {"_id": 0}).sort("rating", -1).limit(10).to_list(10)
    return items


@api.get("/providers/{pid}")
async def get_provider(pid: str):
    p = await db.providers.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Provider not found")
    reviews = await db.reviews.find({"provider_id": pid}, {"_id": 0}).sort("created_at", -1).to_list(50)
    p["reviews"] = reviews
    return p


@api.post("/providers")
async def create_my_provider(body: ProviderCreate, user=Depends(get_current_user)):
    if user["role"] != "provider":
        raise HTTPException(403, "Only providers can create a profile")
    if user.get("provider_id"):
        raise HTTPException(400, "Provider profile already exists")
    pid = str(uuid.uuid4())
    doc = {
        "id": pid,
        "owner_id": user["id"],
        **body.model_dump(),
        "rating": 0.0,
        "review_count": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.providers.insert_one(doc)
    await db.users.update_one({"id": user["id"]}, {"$set": {"provider_id": pid}})
    doc.pop("_id", None)
    return doc


@api.put("/providers/me")
async def update_my_provider(body: ProviderUpdate, user=Depends(get_current_user)):
    if not user.get("provider_id"):
        raise HTTPException(404, "No provider profile")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.providers.update_one({"id": user["provider_id"]}, {"$set": update})
    p = await db.providers.find_one({"id": user["provider_id"]}, {"_id": 0})
    return p


# ---------- Routes: reviews ----------
@api.post("/reviews")
async def add_review(body: ReviewIn, user=Depends(get_current_user)):
    p = await db.providers.find_one({"id": body.provider_id})
    if not p:
        raise HTTPException(404, "Provider not found")
    rid = str(uuid.uuid4())
    doc = {
        "id": rid,
        "provider_id": body.provider_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "rating": body.rating,
        "comment": body.comment,
        "quality": body.quality,
        "communication": body.communication,
        "value": body.value,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reviews.insert_one(doc)
    # update aggregate
    all_revs = await db.reviews.find({"provider_id": body.provider_id}, {"_id": 0, "rating": 1}).to_list(1000)
    avg = round(sum(r["rating"] for r in all_revs) / len(all_revs), 2)
    await db.providers.update_one(
        {"id": body.provider_id},
        {"$set": {"rating": avg, "review_count": len(all_revs)}},
    )
    doc.pop("_id", None)
    return doc


# ---------- Routes: inquiries ----------
@api.post("/inquiries")
async def create_inquiry(body: InquiryIn, user=Depends(get_current_user)):
    p = await db.providers.find_one({"id": body.provider_id})
    if not p:
        raise HTTPException(404, "Provider not found")
    iid = str(uuid.uuid4())
    doc = {
        "id": iid,
        "provider_id": body.provider_id,
        "provider_name": p["name"],
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "event_type": body.event_type,
        "event_date": body.event_date,
        "budget": body.budget,
        "message": body.message,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.inquiries.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/inquiries/me")
async def my_inquiries(user=Depends(get_current_user)):
    if user["role"] == "provider":
        if not user.get("provider_id"):
            return []
        items = await db.inquiries.find(
            {"provider_id": user["provider_id"]}, {"_id": 0}
        ).sort("created_at", -1).to_list(200)
    else:
        items = await db.inquiries.find(
            {"user_id": user["id"]}, {"_id": 0}
        ).sort("created_at", -1).to_list(200)
    return items


# ---------- Routes: meta ----------
@api.get("/meta/cities")
async def cities():
    return ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Jaipur"]


@api.get("/meta/categories")
async def categories():
    return [
        {"key": "Bakers", "icon": "cake"},
        {"key": "Makeup Artists", "icon": "color-palette"},
        {"key": "Decorators", "icon": "flower"},
        {"key": "Photographers", "icon": "camera"},
        {"key": "Event Planners", "icon": "calendar"},
        {"key": "Caterers", "icon": "restaurant"},
    ]


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.providers.create_index("id", unique=True)
    await db.providers.create_index([("city", 1), ("category", 1)])
    await db.reviews.create_index("provider_id")
    await db.inquiries.create_index("provider_id")

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@localvibe.app")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "Admin@12345")
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_pw),
            "name": "Admin",
            "role": "seeker",
            "provider_id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Seed demo seeker
    demo_email = "demo@localvibe.app"
    if not await db.users.find_one({"email": demo_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": demo_email,
            "password_hash": hash_password("Demo@12345"),
            "name": "Demo Seeker",
            "role": "seeker",
            "provider_id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Seed providers
    if await db.providers.count_documents({}) == 0:
        for sp in SEED_PROVIDERS:
            await db.providers.insert_one({**sp, "created_at": datetime.now(timezone.utc).isoformat()})


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
