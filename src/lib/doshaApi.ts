/**
 * Dosha Prediction API Client
 *
 * Calls the Railway-hosted FastAPI backend for XGBoost model inference.
 * Falls back to local scoring when the backend is unavailable.
 */

import type { AssessmentAnswers, PredictionResult } from "./doshaAssessment";
import { scoreLocally } from "./doshaAssessment";

const DOSHA_API_URL = (
  import.meta.env.VITE_DOSHA_API_URL as string | undefined
)?.replace(/\/$/, "") ?? "";

/**
 * Wake Railway from cold sleep by polling the health endpoint.
 * Retries up to `maxRetries` times with increasing delays.
 * Returns true when the backend is confirmed alive.
 */
async function wakeBackend(maxRetries = 3): Promise<boolean> {
  if (!DOSHA_API_URL) return false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(`${DOSHA_API_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return true;
      // 502/503 = Railway proxy responding while container boots — keep retrying
    } catch {
      // Network error or timeout — container is still spinning up
    }
    // Wait before retrying (1s, 2s, 3s)
    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  return false;
}

/**
 * Call the Railway backend to predict the user's dosha.
 *
 * Returns the prediction result plus metadata about the source.
 * If the backend is unreachable, falls back to local rule-based scoring.
 */
export async function predictDosha(answers: AssessmentAnswers): Promise<{
  result: PredictionResult;
  source: "api" | "local";
  error?: string;
}> {
  if (!DOSHA_API_URL) {
    return {
      result: scoreLocally(answers),
      source: "local",
      error: "VITE_DOSHA_API_URL not set",
    };
  }

  // Wake the backend — only attempt predict if it responds
  const alive = await wakeBackend();
  if (!alive) {
    return {
      result: scoreLocally(answers),
      source: "local",
      error: "Backend did not respond after retries",
    };
  }

  try {
    const res = await fetch(`${DOSHA_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }

    const data: PredictionResult = await res.json();
    return { result: data, source: "api" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return { result: scoreLocally(answers), source: "local", error: message };
  }
}

/**
 * Check whether the Railway backend is healthy and the model is loaded.
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
