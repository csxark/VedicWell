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
  status?: string;
  createdAt: string;
  updatedAt?: string;
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

    if (!guestSessionId) {
      throw new Error("guestSessionId is required for guest assessment persistence");
    }

    const assessmentId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const safeTraits = Array.isArray(keyTraits) ? keyTraits : [];
    const safeConfidence = typeof confidence === "number" && !isNaN(confidence) ? confidence : 0.75;
    const safeSecondaryConfidence =
      typeof secondaryConfidence === "number" && !isNaN(secondaryConfidence) ? secondaryConfidence : null;

    const answersPayload = {
      ...answers,
      _ml_prediction: {
        dominantDosha,
        confidence: safeConfidence,
        secondaryDosha: secondaryDosha?.toLowerCase() || null,
        secondaryConfidence: safeSecondaryConfidence,
        keyTraits: safeTraits,
        source: predictionSource,
        status: "completed",
        persistedAt: new Date().toISOString(),
      },
    };

    const payload: any = {
      id: assessmentId,
      user_id: null,
      guest_session_id: guestSessionId,
      dominant_dosha: dominantDosha.toLowerCase(),
      vata_score: vataScore ?? 0,
      pitta_score: pittaScore ?? 0,
      kapha_score: kaphaScore ?? 0,
      answers: answersPayload,
      confidence: safeConfidence,
      secondary_dosha: secondaryDosha?.toLowerCase() || null,
      secondary_confidence: safeSecondaryConfidence,
      prediction_source: predictionSource,
      key_traits: safeTraits,
      status: "completed",
    };

    const { data, error } = await supabase
      .from("dosha_assessments")
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("saveGuestAssessmentToSupabase insert error:", error);
      return { error: new Error(error.message) };
    }
    return { id: data?.id || assessmentId, error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Persists an assessment and updates the user's profile in Supabase.
 * Validates all required ML fields to prevent unexpected null columns,
 * sets status = 'completed', and updates profile assessment_completed.
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

    if (!userId) {
      throw new Error("userId is required to persist an authenticated assessment");
    }
    if (!dominantDosha) {
      throw new Error("dominantDosha is required to persist an assessment");
    }

    const safeTraits = Array.isArray(keyTraits) ? keyTraits : [];
    const safeConfidence = typeof confidence === "number" && !isNaN(confidence) ? confidence : 0.75;
    const safeSecondaryConfidence =
      typeof secondaryConfidence === "number" && !isNaN(secondaryConfidence) ? secondaryConfidence : null;

    // Rich answers payload including embedded ML prediction
    const answersPayload = {
      ...answers,
      _ml_prediction: {
        dominantDosha,
        confidence: safeConfidence,
        secondaryDosha: secondaryDosha?.toLowerCase() || null,
        secondaryConfidence: safeSecondaryConfidence,
        keyTraits: safeTraits,
        source: predictionSource,
        status: "completed",
        persistedAt: new Date().toISOString(),
      },
    };

    // 1. Insert into dosha_assessments with all required ML prediction columns
    const payload: any = {
      user_id: userId,
      dominant_dosha: dominantDosha.toLowerCase(),
      vata_score: vataScore ?? 0,
      pitta_score: pittaScore ?? 0,
      kapha_score: kaphaScore ?? 0,
      answers: answersPayload,
      confidence: safeConfidence,
      secondary_dosha: secondaryDosha?.toLowerCase() || null,
      secondary_confidence: safeSecondaryConfidence,
      prediction_source: predictionSource,
      key_traits: safeTraits,
      status: "completed",
    };

    const { data: insertData, error: insertError } = await supabase
      .from("dosha_assessments")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) {
      console.error("Supabase assessment insert failed:", insertError);
      return { error: new Error(insertError.message) };
    }

    const insertedId = insertData?.id;

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
        assessment_completed: true,
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
 * Gated on status = 'completed' so incomplete or pending assessments are never returned.
 */
export async function fetchLatestUserDosha(userId: string): Promise<UserDoshaRecord | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("dosha_assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
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
      status: (data as any).status || "completed",
      createdAt: data.created_at,
      updatedAt: (data as any).updated_at,
      answers,
    };
  } catch (err) {
    console.error("fetchLatestUserDosha error:", err);
    return null;
  }
}

/**
 * Queries all historical assessments for a user, ordered from newest to oldest.
 * Returns only completed assessments.
 */
export async function fetchUserDoshaHistory(userId: string): Promise<UserDoshaRecord[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("dosha_assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
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
        status: (row as any).status || "completed",
        createdAt: row.created_at,
        updatedAt: (row as any).updated_at,
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
