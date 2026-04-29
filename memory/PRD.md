# LocalVibe — PRD

## Concept
Geo-local discovery mobile app for Indian event creators (bakers, MUAs, decorators, photographers, event planners, caterers). Seekers find local providers; providers showcase portfolios & receive leads.

## Stack
- **Mobile:** Expo Router 6 / React Native 0.81 (file-based routing)
- **Backend:** FastAPI + Motor (async MongoDB)
- **Auth:** JWT Bearer tokens stored in expo-secure-store; bcrypt password hashing

## Features Implemented
1. **Auth** — Email/password signup with role select (seeker | provider), login, logout, persisted session.
2. **Discover** (home) — Greeting, city picker, search bar, 6 category grid, "Trending" horizontal carousel, "Top rated" list. City picker is **free-text searchable** AND has a **"Use my current location"** button that requests permission, gets coords via `expo-location`, and reverse-geocodes to a city (native `reverseGeocodeAsync` on iOS/Android, Nominatim/OpenStreetMap fallback for web).
3. **Search tab** — Filterable list (free-text city input + popular city chips, category chips, sort: top rated / price low / high / recent).
4. **Provider profile** — Cover, avatar, multi-city chips, bio, rating, services, **"Latest from Instagram" 6-image portfolio gallery** (each tile taps through to the provider's IG handle), reviews. Sticky bottom bar: Call, WhatsApp deep link, Inquiry CTA.
5. **Inquiry flow** — Bottom-sheet style form (event type, date, budget, message) → POST /api/inquiries.
6. **Leads / Inquiries tab** — Provider sees received leads with email-reply action; seeker sees their sent inquiries.
7. **Provider onboarding** — Multi-step form. Provider can serve **multiple cities** (typed or selected from popular suggestions; chip-based add/remove).
8. **Profile/settings** — User info, role badge, links to public profile, logout.

## Multi-City Architecture
- `Provider.cities: List[str]` (array). Filter via Mongo regex case-insensitive match against array elements.
- Seekers can pick or type ANY city — provider matches if their `cities` array contains it.

## Seed Data
- 15 providers across Delhi/NCR, Mumbai/Pune, Bangalore/Mysore, Hyderabad, Jaipur/Udaipur, Chennai, Goa.
- Each provider serves 1–4 cities; portfolio images from curated Unsplash + Pexels Indian wedding photography.

## Endpoints (`/api`)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /providers?city=&category=&q=&sort=`, `GET /providers/featured?city=`, `GET /providers/{id}`
- `POST /providers` (provider auth), `PUT /providers/me`
- `POST /reviews`, `POST /inquiries`, `GET /inquiries/me`
- `GET /meta/cities`, `GET /meta/categories`

## Test Credentials
- Seeker: `demo@localvibe.app` / `Demo@12345`
- Admin: `admin@localvibe.app` / `Admin@12345`
