"""Seed providers for LocalVibe."""
import uuid

# Image pools from design_guidelines.json
MAKEUP_IMGS = [
    "https://images.unsplash.com/photo-1671450632893-9b6ec834f492?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwbWFrZXVwJTIwYnJpZGV8ZW58MHx8fHwxNzc3NDQwMDAzfDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1677691257001-8bfd91e288ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3ZWRkaW5nJTIwbWFrZXVwJTIwYnJpZGV8ZW58MHx8fHwxNzc3NDQwMDAzfDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1677691257026-62560c7cae99?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjB3ZWRkaW5nJTIwbWFrZXVwJTIwYnJpZGV8ZW58MHx8fHwxNzc3NDQwMDAzfDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1711128640065-cdac1e385dc2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nJTIwbWFrZXVwJTIwYnJpZGV8ZW58MHx8fHwxNzc3NDQwMDAzfDA&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/29368866/pexels-photo-29368866.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/19021379/pexels-photo-19021379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]
BAKER_IMGS = [
    "https://images.unsplash.com/photo-1720798299028-c3bfaf06b522?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY2FrZSUyMGJha2VyfGVufDB8fHx8MTc3NzQ0MDAwM3ww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1703740613041-0298814d1bc2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY2FrZSUyMGJha2VyfGVufDB8fHx8MTc3NzQ0MDAwM3ww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1720798299109-6adf5d84438c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY2FrZSUyMGJha2VyfGVufDB8fHx8MTc3NzQ0MDAwM3ww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1703740612713-490e631e8b57?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjB3ZWRkaW5nJTIwY2FrZSUyMGJha2VyfGVufDB8fHx8MTc3NzQ0MDAwM3ww&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/28259736/pexels-photo-28259736.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/6997253/pexels-photo-6997253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]
DECOR_IMGS = [
    "https://images.unsplash.com/photo-1772127822514-682aeffcc0d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3IlMjBzZXR1cHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1772127822525-7eda37383b9f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3IlMjBzZXR1cHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1772127822653-4431a9b8c31b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3IlMjBzZXR1cHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1739815256285-1764538c89f3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3IlMjBzZXR1cHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/36943221/pexels-photo-36943221.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/33331302/pexels-photo-33331302.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]
CATER_IMGS = [
    "https://images.unsplash.com/photo-1643146001775-92cab5e7a88a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBldmVudCUyMHBsYW5uZXIlMjBjYXRlcmVyJTIwZm9vZHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1560117531-2304cfbbe9f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBldmVudCUyMHBsYW5uZXIlMjBjYXRlcmVyJTIwZm9vZHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1738202321539-9ed4a727f735?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBldmVudCUyMHBsYW5uZXIlMjBjYXRlcmVyJTIwZm9vZHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1575469503114-6ce5ae5dcdf5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjBldmVudCUyMHBsYW5uZXIlMjBjYXRlcmVyJTIwZm9vZHxlbnwwfHx8fDE3Nzc0NDAwMDN8MA&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/19659620/pexels-photo-19659620.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/33419116/pexels-photo-33419116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]
PHOTO_IMGS = [
    "https://images.unsplash.com/photo-1657098439949-fee638f883cc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBwaG90b2dyYXBoZXIlMjBjYW5kaWR8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1612872642947-931dc3bcb5ac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwaG90b2dyYXBoZXIlMjBjYW5kaWR8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1734313805338-a30b86e912a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBwaG90b2dyYXBoZXIlMjBjYW5kaWR8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/30657776/pexels-photo-30657776.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1673315849128-18a12439969d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjBwaG90b2dyYXBoZXIlMjBjYW5kaWR8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/9727189/pexels-photo-9727189.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]
AVATARS_W = [
    "https://images.unsplash.com/photo-1759840278381-bf7d5e332050?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3Nzc0NDAwMDl8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1725611224180-4a50ef13a0e8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3Nzc0NDAwMDl8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1580746453801-37b0bc56f3b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3Nzc0NDAwMDl8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1759840278511-f73a3d62fb9f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3Nzc0NDAwMDl8MA&ixlib=rb-4.1.0&q=85",
]
AVATARS_M = [
    "https://images.unsplash.com/photo-1766162689608-b14a572cf9d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1759851683916-b1aee28f28a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1586138888839-4990b010bb23?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1741363863033-2d68f0bd9fde?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzc3NDQwMDA5fDA&ixlib=rb-4.1.0&q=85",
]


def _p(name, category, city, bio, avatar, cover, portfolio, services, price_min, price_max, rating, reviews, phone, ig, verified=True):
    return {
        "id": str(uuid.uuid4()),
        "owner_id": None,
        "name": name,
        "category": category,
        "city": city,
        "bio": bio,
        "avatar": avatar,
        "cover": cover,
        "phone": phone,
        "whatsapp": phone,
        "instagram": ig,
        "portfolio": portfolio,
        "services": services,
        "price_min": price_min,
        "price_max": price_max,
        "rating": rating,
        "review_count": reviews,
        "verified": verified,
    }


SEED_PROVIDERS = [
    _p("Aanya Kapoor MUA", "Makeup Artists", "Delhi",
       "Bridal & editorial makeup artist with 8+ years crafting timeless looks for Delhi brides.",
       AVATARS_W[0], MAKEUP_IMGS[0], MAKEUP_IMGS[:5],
       [{"title": "Bridal Makeup", "description": "HD bridal makeup with hair styling", "price": 25000, "unit": "per booking"},
        {"title": "Engagement Look", "description": "Soft glam for engagement ceremony", "price": 12000, "unit": "per booking"},
        {"title": "Party Makeup", "description": "Glamorous party makeup", "price": 6000, "unit": "per booking"}],
       6000, 25000, 4.8, 124, "+919810012345", "@aanyakapoor.mua"),

    _p("Sunehri Cakes by Riya", "Bakers", "Delhi",
       "Boutique baker specializing in fondant tier cakes and dessert tables for weddings.",
       AVATARS_W[1], BAKER_IMGS[0], BAKER_IMGS[:5],
       [{"title": "3-Tier Wedding Cake", "description": "Custom fondant 3-tier cake", "price": 15000, "unit": "per cake"},
        {"title": "Dessert Table", "description": "20-piece curated dessert table", "price": 8500, "unit": "per setup"},
        {"title": "Birthday Cake", "description": "Themed designer cake", "price": 2500, "unit": "per kg"}],
       2500, 25000, 4.9, 210, "+919810023456", "@sunehri.cakes"),

    _p("Mandap Magic Decor", "Decorators", "Delhi",
       "Full-service wedding decor — mandaps, floral installations and stage design.",
       AVATARS_M[0], DECOR_IMGS[0], DECOR_IMGS[:5],
       [{"title": "Wedding Mandap Setup", "description": "Floral mandap with lighting", "price": 80000, "unit": "per event"},
        {"title": "Sangeet Stage", "description": "Themed stage decor", "price": 45000, "unit": "per event"},
        {"title": "Haldi Decor", "description": "Marigold + drape haldi setup", "price": 18000, "unit": "per event"}],
       18000, 200000, 4.7, 86, "+919810034567", "@mandap.magic"),

    _p("Frame & Feel Studios", "Photographers", "Mumbai",
       "Candid wedding photography duo capturing real emotions in cinematic style.",
       AVATARS_M[1], PHOTO_IMGS[0], PHOTO_IMGS[:5],
       [{"title": "Full-Day Wedding Coverage", "description": "Two photographers + edited album", "price": 75000, "unit": "per event"},
        {"title": "Pre-Wedding Shoot", "description": "Half-day shoot at one location", "price": 25000, "unit": "per session"},
        {"title": "Engagement Coverage", "description": "4-hour candid coverage", "price": 18000, "unit": "per event"}],
       18000, 150000, 4.9, 156, "+919820045678", "@frameandfeel"),

    _p("Spice Route Caterers", "Caterers", "Mumbai",
       "Multi-cuisine wedding caterers — North Indian, Continental and South Indian live counters.",
       AVATARS_M[2], CATER_IMGS[0], CATER_IMGS[:5],
       [{"title": "Wedding Buffet (per plate)", "description": "Veg buffet, 5 starters + 8 mains", "price": 850, "unit": "per plate"},
        {"title": "Live Counter", "description": "Chaat / pasta / dosa live counter", "price": 12000, "unit": "per counter"},
        {"title": "Sangeet Cocktail Menu", "description": "Curated cocktail evening", "price": 1200, "unit": "per plate"}],
       650, 15000, 4.6, 98, "+919820056789", "@spice.route.caters"),

    _p("Glow by Meher", "Makeup Artists", "Mumbai",
       "Airbrush makeup specialist for the camera — featured in Vogue India weddings.",
       AVATARS_W[2], MAKEUP_IMGS[1], MAKEUP_IMGS[1:6],
       [{"title": "Bridal Airbrush", "description": "HD airbrush + draping + hair", "price": 35000, "unit": "per booking"},
        {"title": "Reception Glam", "description": "Modern glam reception look", "price": 18000, "unit": "per booking"}],
       8000, 35000, 4.9, 178, "+919820067890", "@glow.by.meher"),

    _p("Floraison Decor", "Decorators", "Bangalore",
       "Modern minimal floral decor for intimate weddings and brunch parties.",
       AVATARS_W[3], DECOR_IMGS[1], DECOR_IMGS[1:6],
       [{"title": "Intimate Wedding Decor", "description": "Floral arch + table styling", "price": 55000, "unit": "per event"},
        {"title": "Birthday Theme Setup", "description": "Balloon + floral theme", "price": 15000, "unit": "per event"}],
       15000, 120000, 4.7, 64, "+919900078901", "@floraison.bangalore"),

    _p("Crumb Boutique", "Bakers", "Bangalore",
       "Artisanal home baker — semi-naked cakes, cupcakes and macaron towers.",
       AVATARS_W[0], BAKER_IMGS[1], BAKER_IMGS[1:6],
       [{"title": "Semi-Naked Cake", "description": "Buttercream + fresh fruit", "price": 3500, "unit": "per kg"},
        {"title": "Macaron Tower", "description": "60-piece macaron tower", "price": 9500, "unit": "per setup"}],
       1800, 12000, 4.8, 142, "+919900089012", "@crumb.boutique"),

    _p("Pixel Diaries", "Photographers", "Bangalore",
       "South Indian wedding specialists with a candid storytelling approach.",
       AVATARS_M[3], PHOTO_IMGS[1], PHOTO_IMGS[1:6],
       [{"title": "Wedding Day Coverage", "description": "Candid + traditional + reels", "price": 65000, "unit": "per event"},
        {"title": "Engagement Reel", "description": "Cinematic Instagram reel", "price": 12000, "unit": "per session"}],
       12000, 130000, 4.8, 110, "+919900090123", "@pixel.diaries"),

    _p("Plan With Pari", "Event Planners", "Delhi",
       "End-to-end wedding planner for couples who want it stress-free and Pinterest-perfect.",
       AVATARS_W[1], DECOR_IMGS[2], DECOR_IMGS[2:],
       [{"title": "Full Wedding Planning", "description": "End-to-end 3-day planning", "price": 250000, "unit": "per wedding"},
        {"title": "Day-Of Coordination", "description": "On-site execution + vendor mgmt", "price": 60000, "unit": "per event"}],
       60000, 500000, 4.9, 47, "+919810101234", "@plan.with.pari"),

    _p("Tandoor Tales Catering", "Caterers", "Delhi",
       "Authentic Awadhi & Mughlai catering for cocktail & sangeet evenings.",
       AVATARS_M[0], CATER_IMGS[1], CATER_IMGS[1:6],
       [{"title": "Veg Wedding Menu", "description": "Veg buffet, 6 starters + 9 mains", "price": 950, "unit": "per plate"},
        {"title": "Non-Veg Premium Menu", "description": "Tandoor + biryani live", "price": 1450, "unit": "per plate"}],
       750, 18000, 4.5, 73, "+919810112345", "@tandoor.tales"),

    _p("Hyderabad Henna Studio", "Makeup Artists", "Hyderabad",
       "Bridal mehendi + makeup combo packages — designs inspired by Hyderabadi nizami art.",
       AVATARS_W[2], MAKEUP_IMGS[2], MAKEUP_IMGS[2:],
       [{"title": "Bridal Mehendi + Makeup", "description": "Full hands+feet mehendi + makeup", "price": 28000, "unit": "per booking"},
        {"title": "Mehendi Only", "description": "Premium bridal mehendi", "price": 12000, "unit": "per booking"}],
       8000, 28000, 4.7, 88, "+919930123456", "@hyd.henna.studio"),

    _p("Pune Petal Decor", "Decorators", "Pune",
       "Bohemian & rustic decor specialists — perfect for vineyard and outdoor weddings.",
       AVATARS_W[3], DECOR_IMGS[3], DECOR_IMGS[3:],
       [{"title": "Outdoor Decor Setup", "description": "Pampas + dried floral aesthetic", "price": 45000, "unit": "per event"},
        {"title": "Photo Booth Wall", "description": "Custom rustic photo wall", "price": 8500, "unit": "per setup"}],
       8500, 95000, 4.6, 42, "+919930134567", "@pune.petal"),

    _p("Mehfil Events Jaipur", "Event Planners", "Jaipur",
       "Royal Rajasthani destination weddings — palace bookings, decor and logistics.",
       AVATARS_M[1], DECOR_IMGS[4], DECOR_IMGS[1:5],
       [{"title": "Destination Wedding", "description": "3-day palace wedding planning", "price": 400000, "unit": "per wedding"},
        {"title": "Royal Mehndi Function", "description": "Themed Rajasthani sangeet", "price": 95000, "unit": "per event"}],
       95000, 800000, 4.9, 31, "+919941145678", "@mehfil.jaipur"),

    _p("Chennai Click Co.", "Photographers", "Chennai",
       "Tamil tradition meets modern composition — bridal portraits with soul.",
       AVATARS_M[2], PHOTO_IMGS[2], PHOTO_IMGS[:6],
       [{"title": "Wedding Coverage", "description": "Full-day photo + video", "price": 60000, "unit": "per event"},
        {"title": "Bridal Portrait Session", "description": "2hr studio bridal shoot", "price": 18000, "unit": "per session"}],
       18000, 120000, 4.7, 67, "+919941156789", "@chennai.click"),
]
