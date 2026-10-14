/**
 * Guest Dosha Cache
 *
 * Manages a versioned localStorage cache for guest (unauthenticated) Dosha
 * assessment results. The cache is the sole source of truth for a guest's
 * current Dosha until they sign in and the DB claim succeeds.
 *
 * Security model:
 * - guestSessionId is a random UUID generated at assessment time.
 * - It is used (together with assessmentId) to securely claim the DB row
 *   server-side via the claim_guest_assessment() Supabase function.
 * - The cache is NOT treated as authoritative proof of ownership — only the
 *   DB claim function result is trusted.
 */

import type { AssessmentAnswers, Dosha } from "./doshaAssessment";

export const GUEST_CACHE_KEY = "dosha_guest_cache";
const CACHE_VERSION = 1;
/** Milliseconds before a guest cache entry is considered stale (7 days) */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface GuestDoshaCache {
  version: number;
  /** Random UUID generated once per assessment session — used for secure DB claiming */
  guestSessionId: string;
  /** Supabase row UUID — null until DB persistence succeeds */
  assessmentId: string | null;
  primaryDosha: Dosha;
  confidence: number;
  secondaryDosha: Dosha;
  secondaryConfidence: number;
  keyTraits?: string[];
  answers: AssessmentAnswers;
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  /** ISO timestamp of the assessment */
  timestamp: string;
  /** True after the assessment was persisted to Supabase */
  synced: boolean;
  /** True while a claim operation is in-flight to prevent double-claims */
  pendingClaim: boolean;
}

/** Generates a random UUID v4 compatible string without a crypto dependency. */
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Read the current guest cache from localStorage.
 * Returns null if nothing is cached, the cache is invalid, or it has expired.
 */
export function readGuestCache(): GuestDoshaCache | null {
  try {
    const raw = localStorage.getItem(GUEST_CACHE_KEY);
    if (!raw) return null;

    const parsed: GuestDoshaCache = JSON.parse(raw);

    // Version guard
    if (parsed.version !== CACHE_VERSION) {
      clearGuestCache();
      return null;
    }

    // Staleness check
    const age = Date.now() - new Date(parsed.timestamp).getTime();
    if (age > CACHE_TTL_MS) {
      clearGuestCache();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Write a new guest cache entry, generating a fresh guestSessionId.
 * Always call this immediately after a successful ML prediction for a guest.
 */
export function writeGuestCache(params: {
  primaryDosha: Dosha;
  confidence: number;
  secondaryDosha: Dosha;
  secondaryConfidence: number;
  keyTraits?: string[];
  answers: AssessmentAnswers;
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
}): GuestDoshaCache {
  const cache: GuestDoshaCache = {
    version: CACHE_VERSION,
    guestSessionId: generateSessionId(),
    assessmentId: null,
    ...params,
    timestamp: new Date().toISOString(),
    synced: false,
    pendingClaim: false,
  };

  try {
    localStorage.setItem(GUEST_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn("Failed to write guest dosha cache:", err);
  }

  return cache;
}

/**
 * Update an existing cache entry with the Supabase assessmentId after a
 * successful DB insert (for post-Migration-3 guest persistence).
 */
export function markGuestCacheSynced(assessmentId: string): void {
  const cache = readGuestCache();
  if (!cache) return;

  try {
    const updated: GuestDoshaCache = {
      ...cache,
      assessmentId,
      synced: true,
    };
    localStorage.setItem(GUEST_CACHE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to update guest dosha cache:", err);
  }
}

/**
 * Mark the cache as having a pending claim so concurrent login events
 * do not trigger a second claim attempt.
 */
export function markGuestCachePendingClaim(pending: boolean): void {
  const cache = readGuestCache();
  if (!cache) return;

  try {
    const updated: GuestDoshaCache = { ...cache, pendingClaim: pending };
    localStorage.setItem(GUEST_CACHE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to update guest dosha cache:", err);
  }
}

/**
 * Remove the guest cache after a successful claim or explicit sign-out.
 */
export function clearGuestCache(): void {
  try {
    localStorage.removeItem(GUEST_CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * True if there is a non-expired guest cache entry that has not yet been
 * claimed and is not currently being claimed.
 */
export function hasPendingGuestAssessment(): boolean {
  const cache = readGuestCache();
  return cache !== null && !cache.pendingClaim;
}
