/**
 * Dosha Supabase Persistence and Query Service
 *
 * Provides authoritative persistence, dynamic latest DOSA derivation,
 * and assessment history retrieval directly against the Supabase database.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Dosha, AssessmentAnswers, PredictionResult } from "./doshaAssessment";

export interface PersistAssessmentParams {
  userId: string;
  dominantDosha: "vata" | "pitta" | "kapha";
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  answers: AssessmentAnswers;
  confidence: number;
  secondaryDosha?: string;
  secondaryConfidence?: number;
  keyTraits?: string[];
  predictionSource?: "api" | "local";
}

export interface UserDoshaRecord {
  id: string;
  userId: string;
  dominantDosha: "vata" | "pitta" | "kapha";
  confidence: number;
  secondaryDosha?: string | null;
  secondaryConfidence?: number | null;
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  keyTraits?: string[];
  createdAt: string;
  answers: any;
}

export interface PersistGuestAssessmentParams {
  guestSessionId: string;
  dominantDosha: "vata" | "pitta" | "kapha";
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  answers: AssessmentAnswers;
  confidence: number;
  secondaryDosha?: string;
  secondaryConfidence?: number;
  keyTraits?: string[];
  predictionSource?: "api" | "local";
}

/**
 * Persists an unauthenticated guest assessment directly to Supabase if the
 * migration allowing nullable user_id + guest_session_id is in place.
 * Fails gracefully and silently if RLS or schema doesn't yet support guest inserts.
 */
export async function saveGuestAssessmentToSupabase(
  params: PersistGuestAssessmentParams
): Promise<{ id?: string; error: Error | null }> {
  try {
    const {
      guestSessionId,
      dominantDosha,
      vataScore,
      pittaScore,
      kaphaScore,
      answers,
      confidence,
      secondaryDosha,
      secondaryConfidence,
      keyTraits,
      predictionSource = "api",
    } = params;

    const assessmentId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const answersPayload = {
      ...answers,
      _ml_prediction: {
        dominantDosha,
        confidence,
        secondaryDosha,
        secondaryConfidence,
        keyTraits,
        source: predictionSource,
        persistedAt: new Date().toISOString(),
      },
    };

    const payload: any = {
      id: assessmentId,
      user_id: null,
      guest_session_id: guestSessionId,
      dominant_dosha: dominantDosha,
      vata_score: vataScore,
      pitta_score: pittaScore,
      kapha_score: kaphaScore,
      answers: answersPayload,
      confidence,
      secondary_dosha: secondaryDosha || null,
      secondary_confidence: secondaryConfidence || null,
      prediction_source: predictionSource,
      key_traits: keyTraits || null,
    };

    const { error } = await supabase
      .from("dosha_assessments")
      .insert(payload);

    if (error) {
      return { error: new Error(error.message) };
    }
    return { id: assessmentId, error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Persists an assessment and updates the user's profile in Supabase.
 * Uses a resilient double-strategy:
 * 1. Embeds full ML prediction inside answers JSONB (which exists on all Supabase schemas).
 * 2. Attempts insert with extended ML columns, gracefully falling back to base columns if needed.
 * 3. Updates the user's profile with computed percentages.
 */
export async function saveAssessmentToSupabase(
  params: PersistAssessmentParams
): Promise<{ id?: string; error: Error | null }> {
  try {
    const {
      userId,
      dominantDosha,
      vataScore,
      pittaScore,
      kaphaScore,
      answers,
      confidence,
      secondaryDosha,
      secondaryConfidence,
      keyTraits,
      predictionSource = "api",
    } = params;

    // Rich answers payload including embedded ML prediction
    const answersPayload = {
      ...answers,
      _ml_prediction: {
        dominantDosha,
        confidence,
        secondaryDosha,
        secondaryConfidence,
        keyTraits,
        source: predictionSource,
        persistedAt: new Date().toISOString(),
      },
    };

    // 1. Insert into dosha_assessments
    let insertedId: string | undefined;

    // Try extended insert with all columns first
    const extendedPayload: any = {
      user_id: userId,
      dominant_dosha: dominantDosha,
      vata_score: vataScore,
      pitta_score: pittaScore,
      kapha_score: kaphaScore,
      answers: answersPayload,
      confidence,
      secondary_dosha: secondaryDosha || null,
      secondary_confidence: secondaryConfidence || null,
      prediction_source: predictionSource,
      key_traits: keyTraits || null,
    };

    const { data: extData, error: extError } = await supabase
      .from("dosha_assessments")
      .insert(extendedPayload)
      .select("id")
      .maybeSingle();

    if (extError) {
      console.warn("Extended columns insert notice, retrying with base schema:", extError.message);
      // Fallback to base table schema in case migration is not yet applied
      const basePayload: any = {
        user_id: userId,
        dominant_dosha: dominantDosha,
        vata_score: vataScore,
        pitta_score: pittaScore,
        kapha_score: kaphaScore,
        answers: answersPayload,
      };

      const { data: baseData, error: baseError } = await supabase
        .from("dosha_assessments")
        .insert(basePayload)
        .select("id")
        .maybeSingle();

      if (baseError) {
        console.error("Supabase assessment insert failed:", baseError);
        return { error: new Error(baseError.message) };
      }
      insertedId = baseData?.id;
    } else {
      insertedId = extData?.id;
    }

    // 2. Compute percentages for profile update
    const primaryShare = typeof confidence === "number" ? confidence : 1;
    const secKey = secondaryDosha?.toLowerCase() as "vata" | "pitta" | "kapha" | undefined;
    const hasValidSecondary = Boolean(
      secKey &&
      secKey in { vata: 0, pitta: 0, kapha: 0 } &&
      secKey !== dominantDosha
    );
    const secShare = hasValidSecondary ? (secondaryConfidence || 0) : 0;
    const remainingShare = Math.max(0, 1 - (primaryShare + secShare));

    const confMap: Record<"vata" | "pitta" | "kapha", number> = { vata: 0, pitta: 0, kapha: 0 };
    confMap[dominantDosha] = primaryShare;

    if (hasValidSecondary && secKey) {
      confMap[secKey] = secShare;
      // Single remaining third dosha receives the full remaining share
      for (const d of ["vata", "pitta", "kapha"] as const) {
        if (d !== dominantDosha && d !== secKey) {
          confMap[d] = remainingShare;
        }
      }
    } else {
      // When no secondary dosha exists, split the remaining share evenly (50/50)
      // between the two other doshas so the remaining share is assigned once in total
      const halfShare = remainingShare / 2;
      for (const d of ["vata", "pitta", "kapha"] as const) {
        if (d !== dominantDosha) {
          confMap[d] = halfShare;
        }
      }
    }

    const sum = confMap.vata + confMap.pitta + confMap.kapha || 1;
    const vataPct = Math.round((confMap.vata / sum) * 100);
    const pittaPct = Math.round((confMap.pitta / sum) * 100);
    const kaphaPct = Math.max(0, 100 - vataPct - pittaPct);

    // 3. Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        dominant_dosha: dominantDosha,
        vata_percentage: vataPct,
        pitta_percentage: pittaPct,
        kapha_percentage: kaphaPct,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (profileError) {
      console.warn("Profile update notice:", profileError.message);
    }

    return { id: insertedId, error: null };
  } catch (err) {
    console.error("saveAssessmentToSupabase unexpected error:", err);
    return { error: err instanceof Error ? err : new Error("Failed to save assessment") };
  }
}

/**
 * Dynamically queries the latest valid DOSA assessment for a given user from Supabase.
 * Order: created_at DESC, limit 1.
 */
export async function fetchLatestUserDosha(userId: string): Promise<UserDoshaRecord | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("dosha_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const answers = data.answers as any;
    const mlMeta = answers?._ml_prediction || {};

    const dominantDosha = (data.dominant_dosha?.toLowerCase() || "vata") as "vata" | "pitta" | "kapha";
    const confidence = (data as any).confidence ?? mlMeta.confidence ?? 0.75;
    const secondaryDosha = (data as any).secondary_dosha ?? mlMeta.secondaryDosha ?? null;
    const secondaryConfidence = (data as any).secondary_confidence ?? mlMeta.secondaryConfidence ?? null;
    const keyTraits = (data as any).key_traits ?? mlMeta.keyTraits ?? [];

    return {
      id: data.id,
      userId: data.user_id,
      dominantDosha,
      confidence,
      secondaryDosha,
      secondaryConfidence,
      vataScore: data.vata_score,
      pittaScore: data.pitta_score,
      kaphaScore: data.kapha_score,
      keyTraits,
      createdAt: data.created_at,
      answers,
    };
  } catch (err) {
    console.error("fetchLatestUserDosha error:", err);
    return null;
  }
}

/**
 * Queries all historical assessments for a user, ordered from newest to oldest.
 */
export async function fetchUserDoshaHistory(userId: string): Promise<UserDoshaRecord[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("dosha_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => {
      const answers = row.answers as any;
      const mlMeta = answers?._ml_prediction || {};
      return {
        id: row.id,
        userId: row.user_id,
        dominantDosha: (row.dominant_dosha?.toLowerCase() || "vata") as "vata" | "pitta" | "kapha",
        confidence: (row as any).confidence ?? mlMeta.confidence ?? null,
        secondaryDosha: (row as any).secondary_dosha ?? mlMeta.secondaryDosha ?? null,
        secondaryConfidence: (row as any).secondary_confidence ?? mlMeta.secondaryConfidence ?? null,
        vataScore: row.vata_score,
        pittaScore: row.pitta_score,
        kaphaScore: row.kapha_score,
        keyTraits: (row as any).key_traits ?? mlMeta.keyTraits ?? [],
        createdAt: row.created_at,
        answers,
      };
    });
  } catch (err) {
    console.error("fetchUserDoshaHistory error:", err);
    return [];
  }
}

export interface DatabaseReadinessReport {
  isReady: boolean;
  profilesTableExists: boolean;
  assessmentsTableExists: boolean;
  guestSupportEnabled: boolean;
  error?: string;
}

/**
 * Checks if the required Supabase tables are present before attempting operations.
 * Returns a readiness report. If tables are missing, logs diagnostic instructions.
 */
export async function checkDatabaseReadiness(): Promise<DatabaseReadinessReport> {
  const report: DatabaseReadinessReport = {
    isReady: true,
    profilesTableExists: false,
    assessmentsTableExists: false,
    guestSupportEnabled: false,
  };

  try {
    // 1. Check profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .limit(0);

    report.profilesTableExists = !profileError || profileError.code !== "42P01";

    // 2. Check dosha_assessments table
    const { error: assessError } = await supabase
      .from("dosha_assessments")
      .select("id")
      .limit(0);

    report.assessmentsTableExists = !assessError || assessError.code !== "42P01";

    // 3. Check guest support (guest_session_id column)
    const { error: guestColError } = await supabase
      .from("dosha_assessments")
      .select("guest_session_id")
      .limit(0);

    report.guestSupportEnabled = !guestColError;

    report.isReady = report.profilesTableExists && report.assessmentsTableExists;

    if (!report.isReady) {
      console.warn(
        "⚠️ Supabase tables missing! Run `supabase/migrations/all_in_one_setup.sql` in your Supabase SQL Editor."
      );
    }
  } catch (err) {
    report.isReady = false;
    report.error = err instanceof Error ? err.message : String(err);
  }

  return report;
}
