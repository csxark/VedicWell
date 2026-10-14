# API Contract — Dosha Assessment Application

## Service Architecture

```
Frontend (Vite/React)
  ├── Railway FastAPI Service  (ML inference)
  │     POST /predict
  │     GET  /health
  │     GET  /current-dosha
  │     GET  /recommendations
  └── Supabase
        ├── Auth (signUp, signIn, signOut)
        ├── Tables (profiles, dosha_assessments, symptom_history, user_engagement)
        └── Edge Functions (symptom-checker)
```

---

## Railway FastAPI Endpoints

Base URL: `VITE_DOSHA_API_URL` (e.g. `https://your-service.railway.app`)

---

### GET /

**Description**: Root info endpoint.

**Auth**: None required.

**Response 200**:
```json
{
  "message": "Dosha Prediction AI API",
  "version": "1.0.0"
}
```

---

### GET /health

**Description**: Service health check and model status.

**Auth**: None required.

**Response 200**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "feature_columns_loaded": true
}
```

**Response fields**:
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"ok"` when service is running |
| `model_loaded` | boolean | Whether XGBoost model is in memory |
| `feature_columns_loaded` | boolean | Whether feature columns are loaded |

---

### POST /predict

**Description**: Run XGBoost dosha prediction. Falls back to rule-based predictor if model fails to load.

**Auth**: Optional Bearer token (Supabase JWT). When provided, the endpoint returns the same prediction result (persistence is handled client-side in this architecture).

**Request Content-Type**: `application/json`

**Request Body**:
```json
{
  "bodyFrame": "Thin and Lean",
  "paceOfWork": "Fast",
  "bodyEnergy": "Low",
  "hungerPattern": "Skips Meals",
  "hairType": "Dry",
  "sleepPattern": "Light Sleeper",
  "mentalActivity": "Restless",
  "voiceQuality": "Fast",
  "jointStructure": "Light",
  "skinType": "Dry",
  "bodyOdor": "Mild"
}
```

**Request field valid values**:

| Field | Valid Values |
|-------|-------------|
| `bodyFrame` | `"Thin and Lean"`, `"Medium"`, `"Well Built"` |
| `paceOfWork` | `"Fast"`, `"Medium"`, `"Slow"` |
| `bodyEnergy` | `"Low"`, `"Medium"`, `"High"` |
| `hungerPattern` | `"Skips Meals"`, `"Irregular"`, `"Regular"` |
| `hairType` | `"Dry"`, `"Normal"`, `"Greasy"` |
| `sleepPattern` | `"Light Sleeper"`, `"Normal"`, `"Sleepy"` |
| `mentalActivity` | `"Restless"`, `"Stable"`, `"Active"` |
| `voiceQuality` | `"Deep"`, `"Rough"`, `"Fast"` |
| `jointStructure` | `"Light"`, `"Medium"`, `"Heavy"` |
| `skinType` | `"Dry"`, `"Rough"`, `"Soft"`, `"Oily"` |
| `bodyOdor` | `"Mild"`, `"Moderate"`, `"Strong"` |

**Response 200**:
```json
{
  "primaryDosha": "Vata",
  "confidence": 0.731,
  "secondaryDosha": "Pitta",
  "secondaryConfidence": 0.183,
  "keyTraits": [
    "Fast Pace of Work",
    "Light Sleep Pattern",
    "Restless Mind",
    "Lean Body Frame"
  ]
}
```

**Response fields**:
| Field | Type | Description |
|-------|------|-------------|
| `primaryDosha` | `"Vata" \| "Pitta" \| "Kapha"` | Top-ranked dosha prediction |
| `confidence` | float [0,1] | Model confidence for primary dosha |
| `secondaryDosha` | `"Vata" \| "Pitta" \| "Kapha"` | Second-ranked dosha |
| `secondaryConfidence` | float [0,1] | Model confidence for secondary dosha |
| `keyTraits` | string[] | Up to 4 trait labels driving the primary prediction |

**Response 422** (Unprocessable Entity — invalid field value):
```json
{
  "detail": [
    {
      "loc": ["body", "bodyFrame"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Response 500** (Model or server error):
```json
{
  "detail": "Error message"
}
```

---

### GET /current-dosha

**Description**: Returns the authenticated user's most recent assessment stored in Supabase. Requires a valid Supabase JWT.

**Auth**: **Required** — `Authorization: Bearer <supabase-jwt>`

**Response 200**:
```json
{
  "userId": "uuid",
  "dominantDosha": "Vata",
  "confidence": 0.731,
  "secondaryDosha": "Pitta",
  "secondaryConfidence": 0.183,
  "vataScore": 9,
  "pittaScore": 1,
  "kaphaScore": 1,
  "keyTraits": ["Fast Pace of Work", "Light Sleep Pattern"],
  "assessmentId": "uuid",
  "assessedAt": "2026-10-15T01:19:45Z"
}
```

**Response 401** (Missing or invalid token):
```json
{"detail": "Authorization header required"}
```

**Response 404** (No assessment found for user):
```json
{"detail": "No assessment found"}
```

---

### GET /recommendations

**Description**: Returns personalized Ayurvedic recommendations for the authenticated user based on their most recent dosha assessment.

**Auth**: **Required** — `Authorization: Bearer <supabase-jwt>`

**Response 200**:
```json
{
  "dominantDosha": "Vata",
  "secondaryDosha": "Pitta",
  "tagline": "Air & Ether — Governs Movement, Communication & Change",
  "element": "Air & Space",
  "description": "...",
  "dietGuidance": ["..."],
  "lifestyleRituals": [
    { "title": "...", "time": "6:00 AM", "description": "..." }
  ],
  "herbalSupport": [
    { "herb": "Ashwagandha", "purpose": "..." }
  ],
  "yogaAndPranayama": ["..."],
  "foodsToFavor": ["Sweet potatoes", "Ghee"],
  "foodsToAvoid": ["Raw kale/salads", "Iced beverages"]
}
```

**Response 401**: Missing/invalid token  
**Response 404**: No assessment found for user

---

## Supabase Tables

### dosha_assessments

**Insert payload** (authenticated user):
```json
{
  "user_id": "auth-user-uuid",
  "dominant_dosha": "vata",
  "vata_score": 9,
  "pitta_score": 1,
  "kapha_score": 1,
  "answers": {
    "bodyFrame": "Thin and Lean",
    "paceOfWork": "Fast",
    "..._ml_prediction": {
      "dominantDosha": "vata",
      "confidence": 0.731,
      "secondaryDosha": "Pitta",
      "secondaryConfidence": 0.183,
      "keyTraits": ["..."],
      "source": "api",
      "persistedAt": "2026-10-15T01:19:45Z"
    }
  },
  "confidence": 0.731,
  "secondary_dosha": "pitta",
  "secondary_confidence": 0.183,
  "prediction_source": "api",
  "key_traits": ["Fast Pace of Work", "Light Sleep Pattern"]
}
```

**Insert payload** (guest — after Migration 3):
```json
{
  "user_id": null,
  "guest_session_id": "random-uuid-v4",
  "dominant_dosha": "vata",
  "vata_score": 9,
  "pitta_score": 1,
  "kapha_score": 1,
  "answers": { "..." },
  "confidence": 0.731,
  "secondary_dosha": "pitta",
  "secondary_confidence": 0.183,
  "prediction_source": "api",
  "key_traits": ["..."]
}
```

---

## Supabase Edge Functions

### POST /functions/v1/symptom-checker

**Description**: AI-powered Ayurvedic symptom analysis using streaming response.

**Auth**: Anon key (unauthenticated users) or user JWT (saves to history).

**Request headers**:
```
Authorization: Bearer <anon-key-or-user-jwt>
Content-Type: application/json
```

**Request body**:
```json
{
  "symptoms": "digestive issues, bloating after meals",
  "doshaType": "vata",
  "additionalContext": "stress at work, poor sleep"
}
```

**Response**: `text/event-stream` (SSE) with OpenAI-compatible delta chunks.

**Error responses**:
- `400`: Missing/empty symptoms
- `429`: Rate limit exceeded
- `402`: AI quota exceeded
- `500`: AI service not configured or server error

---

## Guest Cache Schema (localStorage)

Key: `dosha_guest_cache`

```json
{
  "version": 1,
  "guestSessionId": "uuid-v4",
  "assessmentId": "supabase-uuid-or-null",
  "primaryDosha": "Vata",
  "confidence": 0.731,
  "secondaryDosha": "Pitta",
  "secondaryConfidence": 0.183,
  "keyTraits": ["..."],
  "answers": {
    "bodyFrame": "Thin and Lean",
    "..."
  },
  "vataScore": 9,
  "pittaScore": 1,
  "kaphaScore": 1,
  "timestamp": "2026-10-15T01:19:45Z",
  "synced": false,
  "pendingClaim": false
}
```

**Fields**:
| Field | Description |
|-------|-------------|
| `version` | Cache schema version for migration |
| `guestSessionId` | Random UUID generated at assessment time for secure claiming |
| `assessmentId` | Supabase UUID if persisted to DB, null if local-only |
| `synced` | True after successful DB insert |
| `pendingClaim` | True while a claim operation is in progress |

---

## Error Handling Contract

| Scenario | Frontend Behavior |
|----------|-------------------|
| Railway down / unreachable | Fall back to local scoring; show `"Based on Ayurvedic scoring heuristics"` label |
| Supabase write failure | Show destructive toast; do not report success; cache result locally |
| Expired session | Redirect to /auth with toast message |
| Failed guest claim | Log warning; load existing profile data; do not clear cache yet |
| Missing Railway URL | Always use local scoring; no error toast to user |
| Model loading failure | Use rule-based fallback; prediction still returned |
| Invalid assessment input | FastAPI returns 422; frontend shows error toast |

---

*Generated: 2026-10-15*
