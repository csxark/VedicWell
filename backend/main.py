from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import Optional
import os

app = FastAPI(title="Dosha Prediction AI API", version="1.0.0")

# ---------------------------------------------------------------------------
# CORS
# allow_origins="*" with allow_credentials=False is the correct combination
# for a fully public inference API that does not rely on cookies.
# In production, replace "*" with the actual frontend origin via the
# ALLOWED_ORIGINS environment variable (comma-separated list).
# ---------------------------------------------------------------------------
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Catch-all OPTIONS preflight handler — guarantees a 200 with CORS headers
# even if the middleware ordering somehow misses a route.
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    origin = request.headers.get("origin", "*")
    allowed = origin if ("*" in _allowed_origins or origin in _allowed_origins) else ""
    return JSONResponse(
        content={"ok": True},
        headers={
            "Access-Control-Allow-Origin": allowed or "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )

# ---------------------------------------------------------------------------
# Model loading — lazy, on first request, to keep Railway boot fast
# ---------------------------------------------------------------------------
MODEL_PATH = os.getenv("MODEL_PATH", "dosha_model.pkl")
model = None
feature_columns = None


def ensure_model_loaded():
    """Load model artifacts on first use. Non-async to keep predict handler simple."""
    global model, feature_columns
    if model is not None:
        return
    try:
        artifacts = joblib.load(MODEL_PATH)
        model = artifacts.get("model")
        feature_columns = artifacts.get("feature_columns")
        print(f"Model and feature columns loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Warning: Could not load model: {e}")
        model = None
        feature_columns = None

# ---------------------------------------------------------------------------
# Encoding maps — must exactly match what was used during training
# ---------------------------------------------------------------------------
ENCODING_MAPS = {
    "bodyFrame": {
        "Thin and Lean": 0,
        "Medium": 1,
        "Well Built": 2,
    },
    "paceOfWork": {
        "Fast": 0,
        "Medium": 1,
        "Slow": 2,
    },
    "bodyEnergy": {
        "Low": 0,
        "Medium": 1,
        "High": 2,
    },
    "hungerPattern": {
        "Skips Meals": 0,
        "Irregular": 1,
        "Regular": 2,
    },
    "hairType": {
        "Dry": 0,
        "Normal": 1,
        "Greasy": 2,
    },
    "sleepPattern": {
        "Light Sleeper": 0,
        "Normal": 1,
        "Sleepy": 2,
    },
    "mentalActivity": {
        "Restless": 0,
        "Stable": 1,
        "Active": 2,
    },
    "voiceQuality": {
        "Deep": 0,
        "Rough": 1,
        "Fast": 2,
    },
    "jointStructure": {
        "Light": 0,
        "Medium": 1,
        "Heavy": 2,
    },
    "skinType": {
        "Dry": 0,
        "Rough": 1,
        "Soft": 2,
        "Oily": 3,
    },
    "bodyOdor": {
        "Mild": 0,
        "Moderate": 1,
        "Strong": 2,
    },
}

DOSHA_LABELS = {0: "Vata", 1: "Pitta", 2: "Kapha"}

FEATURE_ORDER = [
    "bodyFrame",
    "paceOfWork",
    "bodyEnergy",
    "hungerPattern",
    "hairType",
    "sleepPattern",
    "mentalActivity",
    "voiceQuality",
    "jointStructure",
    "skinType",
    "bodyOdor",
]

# ---------------------------------------------------------------------------
# Recommendation data — mirrors doshaRecommendations.ts
# ---------------------------------------------------------------------------
DOSHA_RECOMMENDATIONS = {
    "Vata": {
        "tagline": "Air & Ether — Governs Movement, Communication & Change",
        "element": "Air & Space",
        "description": (
            "Vata energy is light, quick, dry, and cool. When balanced you are creative, "
            "energetic, and intuitive. When imbalanced, you may experience anxiety, "
            "irregular digestion, coldness, or sleep disturbances."
        ),
        "dietGuidance": [
            "Favor warm, freshly cooked, grounding foods with healthy oils (ghee, sesame oil, olive oil).",
            "Incorporate sweet, sour, and salty tastes to pacify dry and light qualities.",
            "Enjoy nourishing soups, stews, warm porridges, and cooked root vegetables.",
            "Minimize cold, dry, light, and raw foods like iced drinks, dry crackers, and raw salads.",
        ],
        "lifestyleRituals": [
            {"title": "Grounding Morning Meditation", "time": "6:00 AM", "description": "Sit in quiet stillness for 10-15 minutes to center restless mind."},
            {"title": "Warm Sesame Oil Abhyanga", "time": "6:30 AM", "description": "Warm self-massage before showering to calm the nervous system."},
            {"title": "Nourishing Warm Breakfast", "time": "7:30 AM", "description": "Warm spiced oatmeal or stewed apples with cinnamon and ghee."},
            {"title": "Calming Evening Routine", "time": "9:00 PM", "description": "Warm milk or almond milk with nutmeg and cinnamon before sleep."},
        ],
        "herbalSupport": [
            {"herb": "Ashwagandha", "purpose": "Rejuvenates the nervous system and fosters deep, restorative sleep."},
            {"herb": "Brahmi", "purpose": "Calms mental restlessness and enhances mental clarity."},
            {"herb": "Triphala", "purpose": "Maintains regular, gentle digestion and bowel regularity."},
        ],
        "yogaAndPranayama": [
            "Nadi Shodhana (Alternate Nostril Breathing) — 5-10 minutes to balance right and left brain hemispheres.",
            "Slow, grounding yoga: Mountain Pose, Warrior I, Tree Pose, Child's Pose, and Savasana.",
            "Maintain consistent, steady transitions rather than rapid or erratic movements.",
        ],
        "foodsToFavor": ["Sweet potatoes", "Cooked apples", "Basmati rice", "Ghee", "Avocados", "Almonds (soaked)", "Warm soups"],
        "foodsToAvoid": ["Raw kale/salads", "Iced beverages", "Dry crackers", "Carbonated drinks", "Excessive caffeine"],
    },
    "Pitta": {
        "tagline": "Fire & Water — Governs Digestion, Metabolism & Intellect",
        "element": "Fire & Water",
        "description": (
            "Pitta energy is hot, sharp, light, and oily. When balanced, you are focused, "
            "articulate, brave, and ambitious. When imbalanced, you may experience irritability, "
            "inflammation, hyperacidity, or skin flare-ups."
        ),
        "dietGuidance": [
            "Favor cooling, sweet, bitter, and astringent foods to pacify internal heat.",
            "Eat at consistent meal times; avoid skipping lunch when the digestive fire (Agni) peaks.",
            "Stay hydrated with room-temperature water, coconut water, mint teas, and sweet fruit juices.",
            "Limit spicy, pungent, fermented, salty, and sour foods.",
        ],
        "lifestyleRituals": [
            {"title": "Cooling Morning Meditation", "time": "6:00 AM", "description": "Cultivate compassion, patience, and non-judgmental presence."},
            {"title": "Coconut Oil Self-Massage", "time": "6:30 AM", "description": "Gentle massage with organic coconut oil to cool and soothe skin."},
            {"title": "Pitta-Balancing Lunch", "time": "12:30 PM", "description": "Substantial lunch with grains, steamed greens, and cooling cucumber raita."},
            {"title": "Moonlight Stroll", "time": "8:00 PM", "description": "Walk outdoors under cool moonlight or near water to release accumulated heat."},
        ],
        "herbalSupport": [
            {"herb": "Shatavari", "purpose": "Nourishes vital fluids and cools inflammatory heat throughout the body."},
            {"herb": "Amalaki (Amla)", "purpose": "Cooling antioxidant fruit rich in natural Vitamin C."},
            {"herb": "Neem", "purpose": "Purifies the blood and supports clear, glowing skin."},
        ],
        "yogaAndPranayama": [
            "Sheetali & Sheetkari Pranayama (Cooling Breath) to lower core body temperature and soothe anger.",
            "Moon Salutations (Chandra Namaskar), Camel Pose, Cobra, and Forward Folds.",
            "Exercise with relaxed joy, releasing perfectionism and competition.",
        ],
        "foodsToFavor": ["Cucumbers", "Watermelon", "Coconut water", "Fennel tea", "Sweet berries", "Leafy greens", "Ghee"],
        "foodsToAvoid": ["Chili peppers", "Fermented cheeses", "Deep-fried foods", "Vinegar", "Hard alcohol", "Excess garlic"],
    },
    "Kapha": {
        "tagline": "Earth & Water — Governs Structure, Immunity & Stability",
        "element": "Earth & Water",
        "description": (
            "Kapha energy is heavy, slow, cool, and moist. When balanced, you are calm, loving, "
            "loyal, and physically strong. When imbalanced, you may experience sluggishness, "
            "weight gain, congestion, or attachment to routine."
        ),
        "dietGuidance": [
            "Favor light, warm, dry, and spicy foods that kindle metabolism and digestive fire.",
            "Embrace pungent, bitter, and astringent tastes with abundant warming spices.",
            "Incorporate raw honey in moderation with warm herbal teas (never boiled).",
            "Reduce heavy, oily, sugary, dairy-laden, and cold refrigerated foods.",
        ],
        "lifestyleRituals": [
            {"title": "Early Rise Routine", "time": "5:30 AM", "description": "Wake before sunrise to prevent morning heaviness and stagnation."},
            {"title": "Garshana (Dry Silk Brushing)", "time": "6:00 AM", "description": "Dry body brushing to awaken lymphatic circulation."},
            {"title": "Invigorating Exercise", "time": "6:30 AM", "description": "Brisk cardio, fast-paced vinyasa yoga, or strength building to work up a sweat."},
            {"title": "Light Early Dinner", "time": "6:30 PM", "description": "Light spiced lentil broth or steamed vegetables; avoid late-night eating."},
        ],
        "herbalSupport": [
            {"herb": "Trikatu", "purpose": "Blend of ginger, black pepper, and pippali to ignite sluggish digestion."},
            {"herb": "Guggulu", "purpose": "Supports healthy lipid balance, metabolism, and joint comfort."},
            {"herb": "Tulsi (Holy Basil)", "purpose": "Uplifts mood and cleanses respiratory passages."},
        ],
        "yogaAndPranayama": [
            "Kapalabhati & Bhastrika (Breath of Fire) — invigorates mind and cleanses respiratory congestion.",
            "Sun Salutations (Surya Namaskar) practiced with vigorous, continuous rhythm.",
            "Dynamic postures: Warrior II, Chair Pose, Backbends, and Bow Pose.",
        ],
        "foodsToFavor": ["Steamed vegetables", "Ginger tea", "Lentils", "Millet", "Quinoa", "Bitter greens", "Apples", "Pomegranates"],
        "foodsToAvoid": ["Ice cream", "Heavy cheeses", "Deep-fried foods", "Excess wheat/bread", "Cold milk", "Daytime naps"],
    },
}

# ---------------------------------------------------------------------------
# Supabase client for authenticated endpoints
# ---------------------------------------------------------------------------
_supabase_url = os.getenv("SUPABASE_URL", "")
_supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


async def _get_user_id_from_token(authorization: str) -> str:
    """
    Validate a Supabase JWT and return the user's UUID.
    Uses Supabase Admin API to avoid local key verification complexity.
    Raises HTTPException(401) if the token is invalid or missing.
    """
    import httpx

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")

    token = authorization[7:]

    if not _supabase_url or not _supabase_service_key:
        # Cannot verify — return a placeholder that indicates auth is not configured
        raise HTTPException(
            status_code=503,
            detail="Supabase credentials not configured on this service",
        )

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{_supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": _supabase_service_key,
                },
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return resp.json()["id"]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {exc}")


async def _fetch_latest_assessment(user_id: str) -> Optional[dict]:
    """Fetch the latest dosha_assessment row for a user via Supabase REST API."""
    import httpx

    if not _supabase_url or not _supabase_service_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{_supabase_url}/rest/v1/dosha_assessments",
                headers={
                    "apikey": _supabase_service_key,
                    "Authorization": f"Bearer {_supabase_service_key}",
                    "Accept": "application/json",
                },
                params={
                    "user_id": f"eq.{user_id}",
                    "order": "created_at.desc",
                    "limit": "1",
                },
            )
        if resp.status_code == 200:
            rows = resp.json()
            return rows[0] if rows else None
    except Exception as exc:
        print(f"Supabase fetch error: {exc}")
    return None

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class AssessmentInput(BaseModel):
    bodyFrame: str
    paceOfWork: str
    bodyEnergy: str
    hungerPattern: str
    hairType: str
    sleepPattern: str
    mentalActivity: str
    voiceQuality: str
    jointStructure: str
    skinType: str
    bodyOdor: str


class PredictionResponse(BaseModel):
    primaryDosha: str
    confidence: float
    secondaryDosha: str
    secondaryConfidence: float
    keyTraits: list[str]

# ---------------------------------------------------------------------------
# Encoding / prediction helpers
# ---------------------------------------------------------------------------

def encode_input(data: AssessmentInput) -> np.ndarray:
    """
    Encode assessment input into model features using one-hot encoding.
    Aligns columns with feature_columns and fills missing columns with 0.
    """
    row_data = {
        "bodyFrame": data.bodyFrame,
        "paceOfWork": data.paceOfWork,
        "bodyEnergy": data.bodyEnergy,
        "hungerPattern": data.hungerPattern,
        "hairType": data.hairType,
        "sleepPattern": data.sleepPattern,
        "mentalActivity": data.mentalActivity,
        "voiceQuality": data.voiceQuality,
        "jointStructure": data.jointStructure,
        "skinType": data.skinType,
        "bodyOdor": data.bodyOdor,
    }

    # Create one-hot encoded features
    encoded_features = {}
    for field, value in row_data.items():
        for possible_value in ENCODING_MAPS.get(field, {}).keys():
            key = f"{field}_{possible_value}"
            encoded_features[key] = 1 if value == possible_value else 0

    # Align with model's expected feature columns
    if feature_columns:
        X = np.array([[encoded_features.get(col, 0) for col in feature_columns]])
    else:
        X = np.array([[ENCODING_MAPS.get(field, {}).get(row_data[field], 0) for field in FEATURE_ORDER]])

    return X


def rule_based_predict(data: AssessmentInput):
    """Fallback rule-based prediction when model is not available."""
    scores = {"Vata": 0, "Pitta": 0, "Kapha": 0}

    if data.bodyFrame == "Thin and Lean": scores["Vata"] += 2
    if data.paceOfWork == "Fast": scores["Vata"] += 2
    if data.bodyEnergy == "Low": scores["Vata"] += 1
    if data.sleepPattern == "Light Sleeper": scores["Vata"] += 2
    if data.mentalActivity == "Restless": scores["Vata"] += 2
    if data.hairType == "Dry": scores["Vata"] += 1
    if data.skinType == "Dry": scores["Vata"] += 1
    if data.bodyOdor == "Mild": scores["Vata"] += 1

    if data.bodyFrame == "Medium": scores["Pitta"] += 2
    if data.bodyEnergy == "High": scores["Pitta"] += 2
    if data.hungerPattern == "Regular": scores["Pitta"] += 2
    if data.voiceQuality == "Fast": scores["Pitta"] += 1
    if data.skinType == "Oily": scores["Pitta"] += 1
    if data.bodyOdor == "Strong": scores["Pitta"] += 2
    if data.mentalActivity == "Active": scores["Pitta"] += 1

    if data.bodyFrame == "Well Built": scores["Kapha"] += 2
    if data.paceOfWork == "Slow": scores["Kapha"] += 2
    if data.sleepPattern == "Sleepy": scores["Kapha"] += 2
    if data.hairType == "Greasy": scores["Kapha"] += 1
    if data.jointStructure == "Heavy": scores["Kapha"] += 2
    if data.skinType == "Soft": scores["Kapha"] += 1
    if data.bodyEnergy == "Medium": scores["Kapha"] += 1

    total = sum(scores.values()) or 1
    probs = {k: v / total for k, v in scores.items()}

    sorted_doshas = sorted(probs.items(), key=lambda x: x[1], reverse=True)
    return sorted_doshas[0][0], sorted_doshas[0][1], sorted_doshas[1][0], sorted_doshas[1][1]


def get_key_traits(data: AssessmentInput, primary_dosha: str) -> list[str]:
    """Return user-friendly trait descriptions."""
    traits = []
    field_labels = {
        "bodyFrame": {"Thin and Lean": "Lean Body Frame", "Medium": "Medium Body Frame", "Well Built": "Well-Built Frame"},
        "paceOfWork": {"Fast": "Fast Pace of Work", "Medium": "Moderate Work Pace", "Slow": "Slow and Steady Pace"},
        "bodyEnergy": {"Low": "Low Body Energy", "Medium": "Moderate Energy", "High": "High Body Energy"},
        "hungerPattern": {"Skips Meals": "Irregular Hunger", "Irregular": "Variable Appetite", "Regular": "Strong Regular Hunger"},
        "hairType": {"Dry": "Dry Hair Type", "Normal": "Normal Hair", "Greasy": "Oily Hair"},
        "sleepPattern": {"Light Sleeper": "Light Sleep Pattern", "Normal": "Normal Sleep", "Sleepy": "Deep Heavy Sleep"},
        "mentalActivity": {"Restless": "Restless Mind", "Stable": "Stable Mental Activity", "Active": "Active Sharp Mind"},
        "voiceQuality": {"Deep": "Deep Voice Quality", "Rough": "Rough Voice", "Fast": "Fast Talking Speed"},
        "jointStructure": {"Light": "Light Joint Structure", "Medium": "Medium Joints", "Heavy": "Heavy Joint Structure"},
        "skinType": {"Dry": "Dry Skin", "Rough": "Rough Skin Texture", "Soft": "Soft Smooth Skin", "Oily": "Oily Skin"},
        "bodyOdor": {"Mild": "Mild Body Odor", "Moderate": "Moderate Body Odor", "Strong": "Strong Body Odor"},
    }

    vata_key = ["paceOfWork", "sleepPattern", "mentalActivity", "bodyFrame", "bodyEnergy"]
    pitta_key = ["bodyEnergy", "hungerPattern", "bodyOdor", "mentalActivity", "voiceQuality"]
    kapha_key = ["jointStructure", "sleepPattern", "paceOfWork", "bodyFrame", "hairType"]

    dosha_fields = {"Vata": vata_key, "Pitta": pitta_key, "Kapha": kapha_key}.get(primary_dosha, vata_key)

    for field in dosha_fields[:4]:
        val = getattr(data, field)
        label = field_labels.get(field, {}).get(val, val)
        traits.append(label)

    return traits

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.post("/predict", response_model=PredictionResponse)
async def predict_dosha(data: AssessmentInput):
    global model, feature_columns
    try:
        ensure_model_loaded()

        if model is not None:
            X = encode_input(data)
            probs = model.predict_proba(X)[0]
            pred_idx = int(np.argmax(probs))
            sorted_idx = np.argsort(probs)[::-1]

            primary_dosha = DOSHA_LABELS.get(pred_idx, "Vata")
            confidence = float(probs[sorted_idx[0]])
            secondary_dosha = DOSHA_LABELS.get(int(sorted_idx[1]), "Pitta")
            secondary_confidence = float(probs[sorted_idx[1]])
        else:
            primary_dosha, confidence, secondary_dosha, secondary_confidence = rule_based_predict(data)

        key_traits = get_key_traits(data, primary_dosha)

        return PredictionResponse(
            primaryDosha=primary_dosha,
            confidence=round(confidence, 3),
            secondaryDosha=secondary_dosha,
            secondaryConfidence=round(secondary_confidence, 3),
            keyTraits=key_traits,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "feature_columns_loaded": feature_columns is not None,
    }


@app.get("/current-dosha")
async def current_dosha(authorization: Optional[str] = Header(None)):
    """
    Return the authenticated user's most recent dosha assessment.
    Requires a valid Supabase JWT in the Authorization header.
    """
    user_id = await _get_user_id_from_token(authorization or "")

    row = await _fetch_latest_assessment(user_id)
    if not row:
        raise HTTPException(status_code=404, detail="No assessment found")

    answers = row.get("answers") or {}
    ml_meta = answers.get("_ml_prediction") if isinstance(answers, dict) else {}
    ml_meta = ml_meta or {}

    return {
        "userId": user_id,
        "dominantDosha": (row.get("dominant_dosha") or "Vata").capitalize(),
        "confidence": row.get("confidence") or ml_meta.get("confidence") or 0.75,
        "secondaryDosha": row.get("secondary_dosha") or ml_meta.get("secondaryDosha"),
        "secondaryConfidence": row.get("secondary_confidence") or ml_meta.get("secondaryConfidence"),
        "vataScore": row.get("vata_score", 0),
        "pittaScore": row.get("pitta_score", 0),
        "kaphaScore": row.get("kapha_score", 0),
        "keyTraits": row.get("key_traits") or ml_meta.get("keyTraits") or [],
        "assessmentId": row.get("id"),
        "assessedAt": row.get("created_at"),
    }


@app.get("/recommendations")
async def recommendations(authorization: Optional[str] = Header(None)):
    """
    Return personalized Ayurvedic recommendations for the authenticated user
    based on their most recent dosha assessment.
    Requires a valid Supabase JWT in the Authorization header.
    """
    user_id = await _get_user_id_from_token(authorization or "")

    row = await _fetch_latest_assessment(user_id)
    if not row:
        raise HTTPException(status_code=404, detail="No assessment found")

    dominant = (row.get("dominant_dosha") or "vata").capitalize()
    secondary_raw = row.get("secondary_dosha")
    secondary = secondary_raw.capitalize() if secondary_raw else None

    recs = DOSHA_RECOMMENDATIONS.get(dominant, DOSHA_RECOMMENDATIONS["Vata"])

    return {
        "dominantDosha": dominant,
        "secondaryDosha": secondary,
        **recs,
    }


# ---------------------------------------------------------------------------
# Database schema verification & auto-migration
# ---------------------------------------------------------------------------
from db_migrator import check_schema, run_migrations, get_database_url


@app.on_event("startup")
async def startup_db_check():
    """
    Check if Supabase schema is present. If direct PostgreSQL connection is
    configured (DATABASE_URL) and tables are missing, automatically execute
    migrations so all tables and functions exist before handling traffic.
    """
    try:
        status = await check_schema()
        if status.get("all_ready"):
            print("Supabase schema check: All required tables and functions are verified.")
        else:
            db_url = get_database_url()
            if db_url:
                print("Missing schema elements detected. Executing auto-migrations via DATABASE_URL...")
                migration_result = await run_migrations(db_url)
                print("Auto-migration result:", migration_result)
            else:
                print("Notice: Supabase schema is missing elements, and direct DATABASE_URL is not set.")
                print("To create tables, execute supabase/migrations/all_in_one_setup.sql in the Supabase SQL editor.")
    except Exception as exc:
        print(f"Startup database check notice: {exc}")


def _require_admin_auth(
    authorization: Optional[str] = Header(None),
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret"),
):
    admin_secret = os.getenv("ADMIN_SECRET") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not admin_secret:
        raise HTTPException(
            status_code=503,
            detail="Admin secret not configured on this service",
        )
    token = None
    if x_admin_secret:
        token = x_admin_secret
    elif authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    if not token or token != admin_secret:
        raise HTTPException(status_code=401, detail="Invalid or missing admin credentials")


@app.get("/db-status")
async def db_status(
    authorization: Optional[str] = Header(None),
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret"),
):
    """Return the verification status of all required Supabase tables, columns, and functions."""
    _require_admin_auth(authorization, x_admin_secret)
    return await check_schema()


@app.post("/run-migrations")
async def trigger_migrations(
    authorization: Optional[str] = Header(None),
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret"),
):
    """Execute migrations on demand using DATABASE_URL."""
    _require_admin_auth(authorization, x_admin_secret)
    result = await run_migrations()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Migration failed"))
    return result


@app.get("/")
async def root():
    return {"message": "Dosha Prediction AI API", "version": "1.0.0"}
