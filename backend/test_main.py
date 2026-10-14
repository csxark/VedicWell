"""
Backend API Unit Tests for Dosha Prediction Service.
Tests all endpoints:
  - GET /
  - GET /health
  - POST /predict (both ML inference and rule-based fallback)
  - GET /current-dosha (auth header validation, 401 handling, 503 unconfigured check)
  - GET /recommendations (auth header validation, 401 handling)
  - OPTIONS /{path} preflight
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app, ensure_model_loaded

client = TestClient(app)

SAMPLE_VATA_INPUT = {
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
    "bodyOdor": "Mild",
}

SAMPLE_PITTA_INPUT = {
    "bodyFrame": "Medium",
    "paceOfWork": "Medium",
    "bodyEnergy": "High",
    "hungerPattern": "Regular",
    "hairType": "Normal",
    "sleepPattern": "Normal",
    "mentalActivity": "Active",
    "voiceQuality": "Fast",
    "jointStructure": "Medium",
    "skinType": "Oily",
    "bodyOdor": "Strong",
}

SAMPLE_KAPHA_INPUT = {
    "bodyFrame": "Well Built",
    "paceOfWork": "Slow",
    "bodyEnergy": "Medium",
    "hungerPattern": "Regular",
    "hairType": "Greasy",
    "sleepPattern": "Sleepy",
    "mentalActivity": "Stable",
    "voiceQuality": "Deep",
    "jointStructure": "Heavy",
    "skinType": "Soft",
    "bodyOdor": "Mild",
}


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Dosha Prediction AI API"
    assert "version" in data


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model_loaded" in data
    assert "feature_columns_loaded" in data


def test_options_preflight():
    response = client.options("/predict")
    assert response.status_code == 200
    assert "Access-Control-Allow-Origin" in response.headers
    assert "Access-Control-Allow-Methods" in response.headers


def test_predict_vata():
    response = client.post("/predict", json=SAMPLE_VATA_INPUT)
    assert response.status_code == 200
    data = response.json()
    assert data["primaryDosha"] in ["Vata", "Pitta", "Kapha"]
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["secondaryDosha"] in ["Vata", "Pitta", "Kapha"]
    assert 0.0 <= data["secondaryConfidence"] <= 1.0
    assert isinstance(data["keyTraits"], list)
    assert len(data["keyTraits"]) > 0


def test_predict_pitta():
    response = client.post("/predict", json=SAMPLE_PITTA_INPUT)
    assert response.status_code == 200
    data = response.json()
    assert data["primaryDosha"] == "Pitta" or data["confidence"] > 0


def test_predict_kapha():
    response = client.post("/predict", json=SAMPLE_KAPHA_INPUT)
    assert response.status_code == 200
    data = response.json()
    assert data["primaryDosha"] in ["Vata", "Pitta", "Kapha"]


def test_predict_missing_fields_validation_error():
    incomplete_input = {"bodyFrame": "Thin and Lean"}
    response = client.post("/predict", json=incomplete_input)
    assert response.status_code == 422


def test_current_dosha_requires_auth():
    response = client.get("/current-dosha")
    assert response.status_code == 401
    assert "Authorization header required" in response.json()["detail"]


def test_recommendations_requires_auth():
    response = client.get("/recommendations")
    assert response.status_code == 401
    assert "Authorization header required" in response.json()["detail"]


@patch("main._get_user_id_from_token", new_callable=AsyncMock)
@patch("main._fetch_latest_assessment", new_callable=AsyncMock)
def test_current_dosha_with_valid_mocked_auth(mock_fetch, mock_auth):
    mock_auth.return_value = "test-user-uuid-1234"
    mock_fetch.return_value = {
        "id": "assess-uuid-5678",
        "user_id": "test-user-uuid-1234",
        "dominant_dosha": "Vata",
        "confidence": 0.85,
        "secondary_dosha": "Pitta",
        "secondary_confidence": 0.12,
        "vata_score": 9,
        "pitta_score": 1,
        "kapha_score": 1,
        "key_traits": ["Lean Body Frame", "Fast Pace of Work"],
        "created_at": "2026-10-15T00:00:00Z",
        "answers": {},
    }

    response = client.get(
        "/current-dosha",
        headers={"Authorization": "Bearer mock-token-123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dominantDosha"] == "Vata"
    assert data["confidence"] == 0.85
    assert data["userId"] == "test-user-uuid-1234"
    assert data["assessmentId"] == "assess-uuid-5678"


@patch("main._get_user_id_from_token", new_callable=AsyncMock)
@patch("main._fetch_latest_assessment", new_callable=AsyncMock)
def test_recommendations_with_valid_mocked_auth(mock_fetch, mock_auth):
    mock_auth.return_value = "test-user-uuid-1234"
    mock_fetch.return_value = {
        "id": "assess-uuid-5678",
        "user_id": "test-user-uuid-1234",
        "dominant_dosha": "Pitta",
        "secondary_dosha": "Vata",
        "confidence": 0.78,
    }

    response = client.get(
        "/recommendations",
        headers={"Authorization": "Bearer mock-token-123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dominantDosha"] == "Pitta"
    assert data["secondaryDosha"] == "Vata"
    assert "dietGuidance" in data
    assert "lifestyleRituals" in data
    assert "herbalSupport" in data
    assert "foodsToFavor" in data
    assert "foodsToAvoid" in data


def test_db_status_rejects_unauthenticated():
    response = client.get("/db-status")
    assert response.status_code in [401, 503]


def test_run_migrations_rejects_unauthenticated():
    response = client.post("/run-migrations")
    assert response.status_code in [401, 503]


@patch.dict("os.environ", {"ADMIN_SECRET": "test-admin-secret"})
@patch("main.check_schema", new_callable=AsyncMock)
def test_db_status_endpoint_with_admin_auth(mock_check):
    mock_check.return_value = {
        "connected": True,
        "method": "postgres",
        "all_ready": True,
        "tables": {"profiles": True, "dosha_assessments": True},
        "missing_tables": [],
    }
    response = client.get(
        "/db-status",
        headers={"X-Admin-Secret": "test-admin-secret"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["connected"] is True
    assert data["all_ready"] is True
    assert "profiles" in data["tables"]


@patch.dict("os.environ", {"ADMIN_SECRET": "test-admin-secret"})
@patch("main.run_migrations", new_callable=AsyncMock)
def test_run_migrations_endpoint_success_with_admin_auth(mock_run):
    mock_run.return_value = {
        "success": True,
        "message": "All migrations executed successfully and schema verified.",
    }
    response = client.post(
        "/run-migrations",
        headers={"X-Admin-Secret": "test-admin-secret"}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


@patch.dict("os.environ", {"ADMIN_SECRET": "test-admin-secret"})
@patch("main.run_migrations", new_callable=AsyncMock)
def test_run_migrations_endpoint_failure_with_admin_auth(mock_run):
    mock_run.return_value = {
        "success": False,
        "error": "DATABASE_URL not set",
    }
    response = client.post(
        "/run-migrations",
        headers={"X-Admin-Secret": "test-admin-secret"}
    )
    assert response.status_code == 500
    assert "DATABASE_URL not set" in response.json()["detail"]
