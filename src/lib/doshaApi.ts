/**
 * Dosha Prediction & Backend API Client
 *
 * Calls the FastAPI backend for XGBoost model inference, authenticated
 * assessment persistence, dynamic current DOSA retrieval, and recommendation models.
 * Automatically attaches Supabase access tokens when available.
 * Falls back to local scoring when the backend is unavailable.
 */

import type { AssessmentAnswers, PredictionResult } from "./doshaAssessment";
import { scoreLocally } from "./doshaAssessment";
import { getRecommendationsForDosha, type DoshaRecommendations } from "./doshaRecommendations";

const DOSHA_API_URL = (
  import.meta.env.VITE_DOSHA_API_URL as string | undefined
)?.replace(/\/$/, "") ?? "";

export interface PredictResponse {
  result: PredictionResult;
  source: "api" | "local";
  saved?: boolean;
  assessmentId?: string;
  error?: string;
}

export interface BackendCurrentDosha {
  userId: string;
  dominantDosha: "Vata" | "Pitta" | "Kapha";
  confidence?: number;
  secondaryDosha?: string;
  secondaryConfidence?: number;
  vataScore?: number;
  pittaScore?: number;
  kaphaScore?: number;
  keyTraits?: string[];
  assessmentId?: string;
  assessedAt?: string;
}

/**
 * Wake Railway from cold sleep by polling the health endpoint.
 * Retries up to `maxRetries` times with increasing delays.
 */
async function wakeBackend(maxRetries = 3): Promise<boolean> {
  if (!DOSHA_API_URL) return false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(`${DOSHA_API_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(8_000),
      });
      if (res.ok) return true;
    } catch {
      // Network error or timeout — container is spinning up
    }
    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  return false;
}

/**
 * Call the backend to predict the user's dosha.
 * If token is provided, the backend validates the user identity and persists
 * the assessment record to Supabase.
 */
export async function predictDosha(
  answers: AssessmentAnswers,
  token?: string
): Promise<PredictResponse> {
  if (!DOSHA_API_URL) {
    return {
      result: scoreLocally(answers),
      source: "local",
      saved: false,
      error: "VITE_DOSHA_API_URL not configured",
    };
  }

  // Wake backend if cold
  const alive = await wakeBackend();
  if (!alive) {
    return {
      result: scoreLocally(answers),
      source: "local",
      saved: false,
      error: "Backend did not respond after retries",
    };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${DOSHA_API_URL}/predict`, {
      method: "POST",
      headers,
      body: JSON.stringify(answers),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      result: {
        primaryDosha: data.primaryDosha,
        confidence: data.confidence,
        secondaryDosha: data.secondaryDosha,
        secondaryConfidence: data.secondaryConfidence,
        keyTraits: data.keyTraits,
      },
      source: "api",
      saved: data.saved || false,
      assessmentId: data.assessmentId,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return {
      result: scoreLocally(answers),
      source: "local",
      saved: false,
      error: message,
    };
  }
}

/**
 * Retrieves the current authenticated user's authoritative latest DOSA.
 */
export async function getCurrentDosha(token?: string): Promise<BackendCurrentDosha | null> {
  if (!DOSHA_API_URL || !token) return null;

  try {
    const res = await fetch(`${DOSHA_API_URL}/current-dosha`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (res.status === 200) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend getCurrentDosha error, using fallback:", err);
  }
  return null;
}

/**
 * Retrieves personalized recommendations for the authenticated user from backend.
 * Falls back to client-side recommendation engine if backend is unavailable.
 */
export async function getRecommendations(
  token?: string,
  fallbackDosha: "vata" | "pitta" | "kapha" = "vata",
  fallbackSecondary?: string | null
): Promise<DoshaRecommendations> {
  if (DOSHA_API_URL && token) {
    try {
      const res = await fetch(`${DOSHA_API_URL}/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(8_000),
      });

      if (res.status === 200) {
        const data = await res.json();
        return {
          dominantDosha: data.dominantDosha,
          secondaryDosha: data.secondaryDosha,
          tagline: data.tagline,
          element: data.element,
          description: data.description,
          dietGuidance: data.dietGuidance,
          lifestyleRituals: data.lifestyleRituals.map((r: any) =>
            typeof r === "string" ? { title: r, time: "", description: "" } : r
          ),
          herbalSupport: data.herbalSupport.map((h: any) =>
            typeof h === "string" ? { herb: h, purpose: "" } : h
          ),
          yogaAndPranayama: data.yogaAndPranayama,
          foodsToFavor: data.foodsToFavor,
          foodsToAvoid: data.foodsToAvoid,
        };
      }
    } catch (err) {
      console.warn("Backend getRecommendations error, using local engine:", err);
    }
  }

  // Fallback to local recommendation engine
  return getRecommendationsForDosha(fallbackDosha, fallbackSecondary);
}

/**
 * Health check endpoint for FastAPI backend.
 */
export async function checkHealth(): Promise<{
  ok: boolean;
  modelLoaded?: boolean;
}> {
  if (!DOSHA_API_URL) return { ok: false };
  try {
    const res = await fetch(`${DOSHA_API_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: data.status === "ok", modelLoaded: data.model_loaded };
  } catch {
    return { ok: false };
  }
}
