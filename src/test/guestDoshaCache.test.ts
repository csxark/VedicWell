/**
 * Tests for the guest dosha cache library.
 *
 * Uses Vitest's localStorage mock (available via jsdom environment) to exercise
 * all cache operations without needing a browser.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  readGuestCache,
  writeGuestCache,
  clearGuestCache,
  markGuestCacheSynced,
  markGuestCachePendingClaim,
  hasPendingGuestAssessment,
  GUEST_CACHE_KEY,
} from "../lib/guestDoshaCache";
import type { AssessmentAnswers } from "../lib/doshaAssessment";

// ─── Shared test data ────────────────────────────────────────────────────────

const VATA_ANSWERS: AssessmentAnswers = {
  bodyFrame: "Thin and Lean",
  paceOfWork: "Fast",
  bodyEnergy: "Low",
  hungerPattern: "Skips Meals",
  hairType: "Dry",
  sleepPattern: "Light Sleeper",
  mentalActivity: "Restless",
  voiceQuality: "Fast",
  jointStructure: "Light",
  skinType: "Dry",
  bodyOdor: "Mild",
};

const SAMPLE_CACHE_PARAMS = {
  primaryDosha: "Vata" as const,
  confidence: 0.82,
  secondaryDosha: "Pitta" as const,
  secondaryConfidence: 0.13,
  keyTraits: ["Lean Body Frame", "Restless Mind"],
  answers: VATA_ANSWERS,
  vataScore: 9,
  pittaScore: 1,
  kaphaScore: 1,
};

// ─── Test suite ──────────────────────────────────────────────────────────────

describe("guestDoshaCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── readGuestCache ────────────────────────────────────────────────────────

  describe("readGuestCache", () => {
    it("returns null when cache is empty", () => {
      expect(readGuestCache()).toBeNull();
    });

    it("returns null for malformed JSON and clears the key", () => {
      localStorage.setItem(GUEST_CACHE_KEY, "not-valid-json");
      expect(readGuestCache()).toBeNull();
    });

    it("returns null for wrong version and clears the key", () => {
      const stale = { version: 999, timestamp: new Date().toISOString(), guestSessionId: "x" };
      localStorage.setItem(GUEST_CACHE_KEY, JSON.stringify(stale));
      expect(readGuestCache()).toBeNull();
      expect(localStorage.getItem(GUEST_CACHE_KEY)).toBeNull();
    });

    it("returns null for expired cache (older than 7 days)", () => {
      const old = {
        version: 1,
        guestSessionId: "old-session",
        assessmentId: null,
        primaryDosha: "Vata",
        confidence: 0.8,
        secondaryDosha: "Pitta",
        secondaryConfidence: 0.1,
        answers: VATA_ANSWERS,
        vataScore: 9,
        pittaScore: 1,
        kaphaScore: 1,
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        synced: false,
        pendingClaim: false,
      };
      localStorage.setItem(GUEST_CACHE_KEY, JSON.stringify(old));
      expect(readGuestCache()).toBeNull();
    });
  });

  // ─── writeGuestCache ───────────────────────────────────────────────────────

  describe("writeGuestCache", () => {
    it("writes a valid cache entry with all required fields", () => {
      const written = writeGuestCache(SAMPLE_CACHE_PARAMS);

      expect(written.version).toBe(1);
      expect(written.primaryDosha).toBe("Vata");
      expect(written.confidence).toBe(0.82);
      expect(written.secondaryDosha).toBe("Pitta");
      expect(written.secondaryConfidence).toBe(0.13);
      expect(written.keyTraits).toEqual(["Lean Body Frame", "Restless Mind"]);
      expect(written.vataScore).toBe(9);
      expect(written.pittaScore).toBe(1);
      expect(written.kaphaScore).toBe(1);
      expect(written.assessmentId).toBeNull();
      expect(written.synced).toBe(false);
      expect(written.pendingClaim).toBe(false);
      expect(typeof written.guestSessionId).toBe("string");
      expect(written.guestSessionId.length).toBeGreaterThan(10);
    });

    it("persists the entry so readGuestCache returns it", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      const read = readGuestCache();

      expect(read).not.toBeNull();
      expect(read?.primaryDosha).toBe("Vata");
      expect(read?.confidence).toBe(0.82);
    });

    it("generates unique guestSessionIds across calls", () => {
      const a = writeGuestCache(SAMPLE_CACHE_PARAMS);
      const b = writeGuestCache(SAMPLE_CACHE_PARAMS);
      expect(a.guestSessionId).not.toBe(b.guestSessionId);
    });

    it("overwrites an existing cache entry", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      writeGuestCache({ ...SAMPLE_CACHE_PARAMS, primaryDosha: "Kapha" as const });
      const read = readGuestCache();
      expect(read?.primaryDosha).toBe("Kapha");
    });
  });

  // ─── clearGuestCache ───────────────────────────────────────────────────────

  describe("clearGuestCache", () => {
    it("removes the cache entry", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      clearGuestCache();
      expect(readGuestCache()).toBeNull();
    });

    it("does not throw when called on an empty cache", () => {
      expect(() => clearGuestCache()).not.toThrow();
    });
  });

  // ─── markGuestCacheSynced ─────────────────────────────────────────────────

  describe("markGuestCacheSynced", () => {
    it("updates synced flag and assessmentId", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      markGuestCacheSynced("assessment-uuid-123");

      const cache = readGuestCache();
      expect(cache?.synced).toBe(true);
      expect(cache?.assessmentId).toBe("assessment-uuid-123");
    });

    it("is a no-op when cache is empty", () => {
      expect(() => markGuestCacheSynced("some-id")).not.toThrow();
    });
  });

  // ─── markGuestCachePendingClaim ───────────────────────────────────────────

  describe("markGuestCachePendingClaim", () => {
    it("sets pendingClaim to true", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      markGuestCachePendingClaim(true);
      expect(readGuestCache()?.pendingClaim).toBe(true);
    });

    it("sets pendingClaim to false", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      markGuestCachePendingClaim(true);
      markGuestCachePendingClaim(false);
      expect(readGuestCache()?.pendingClaim).toBe(false);
    });

    it("is a no-op when cache is empty", () => {
      expect(() => markGuestCachePendingClaim(true)).not.toThrow();
    });
  });

  // ─── hasPendingGuestAssessment ────────────────────────────────────────────

  describe("hasPendingGuestAssessment", () => {
    it("returns false when cache is empty", () => {
      expect(hasPendingGuestAssessment()).toBe(false);
    });

    it("returns true for a fresh, non-pending cache entry", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      expect(hasPendingGuestAssessment()).toBe(true);
    });

    it("returns false when pendingClaim is true", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      markGuestCachePendingClaim(true);
      expect(hasPendingGuestAssessment()).toBe(false);
    });

    it("returns false after clearGuestCache", () => {
      writeGuestCache(SAMPLE_CACHE_PARAMS);
      clearGuestCache();
      expect(hasPendingGuestAssessment()).toBe(false);
    });
  });
});
