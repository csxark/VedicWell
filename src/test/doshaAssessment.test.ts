import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  DOSHA_META,
  scoreLocally,
  topTraits,
  type AssessmentAnswers,
} from "../lib/doshaAssessment";
import { predictDosha, checkHealth } from "../lib/doshaApi";

describe("Dosha Assessment Integration", () => {
  it("should have exactly 11 questions matching the ML model schema", () => {
    expect(QUESTIONS).toHaveLength(11);

    const expectedIds: (keyof AssessmentAnswers)[] = [
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
    ];

    const actualIds = QUESTIONS.map((q) => q.id);
    expect(actualIds).toEqual(expectedIds);
  });

  it("should ensure every option has valid value, label, and dosha", () => {
    for (const q of QUESTIONS) {
      expect(q.title).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      for (const opt of q.options) {
        expect(opt.value).toBeTruthy();
        expect(opt.label).toBeTruthy();
        expect(["Vata", "Pitta", "Kapha"]).toContain(opt.dosha);
      }
    }
  });

  it("should calculate local score accurately for pure Vata answers", () => {
    const vataAnswers: AssessmentAnswers = {
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

    const result = scoreLocally(vataAnswers);
    expect(result.primaryDosha).toBe("Vata");
    expect(result.confidence).toBe(1.0);
    expect(result.secondaryConfidence).toBe(0.0);
  });

  it("should calculate local score accurately for mixed answers", () => {
    const mixedAnswers: Partial<AssessmentAnswers> = {
      bodyFrame: "Well Built", // Kapha
      paceOfWork: "Slow", // Kapha
      bodyEnergy: "High", // Pitta
      hungerPattern: "Regular", // Pitta
      hairType: "Normal", // Pitta
    };

    const result = scoreLocally(mixedAnswers);
    expect(result.primaryDosha).toBe("Pitta");
    expect(result.confidence).toBeCloseTo(3 / 5, 2);
    expect(result.secondaryDosha).toBe("Kapha");
    expect(result.secondaryConfidence).toBeCloseTo(2 / 5, 2);
  });

  it("should extract top traits for a dosha", () => {
    const answers: Partial<AssessmentAnswers> = {
      bodyFrame: "Thin and Lean",
      paceOfWork: "Fast",
      bodyEnergy: "High", // Pitta
    };

    const traits = topTraits(answers, "Vata", 2);
    expect(traits).toHaveLength(2);
    expect(traits[0].label).toBe("Thin and Lean");
    expect(traits[1].label).toBe("Fast");
  });

  it("should have metadata for all 3 doshas", () => {
    expect(DOSHA_META.Vata).toBeDefined();
    expect(DOSHA_META.Pitta).toBeDefined();
    expect(DOSHA_META.Kapha).toBeDefined();

    expect(DOSHA_META.Vata.recommendations.length).toBeGreaterThanOrEqual(4);
    expect(DOSHA_META.Pitta.recommendations.length).toBeGreaterThanOrEqual(4);
    expect(DOSHA_META.Kapha.recommendations.length).toBeGreaterThanOrEqual(4);
  });

  it("should fall back gracefully to local scoring when API is not configured", async () => {
    const testAnswers: AssessmentAnswers = {
      bodyFrame: "Medium",
      paceOfWork: "Medium",
      bodyEnergy: "High",
      hungerPattern: "Regular",
      hairType: "Normal",
      sleepPattern: "Normal",
      mentalActivity: "Active",
      voiceQuality: "Rough",
      jointStructure: "Medium",
      skinType: "Oily",
      bodyOdor: "Strong",
    };

    const response = await predictDosha(testAnswers);
    expect(response.source).toBe("local");
    expect(response.result.primaryDosha).toBe("Pitta");
    expect(response.result.confidence).toBeGreaterThan(0.5);
  });

  it("should report checkHealth as false when API is not configured", async () => {
    const health = await checkHealth();
    expect(health.ok).toBe(false);
  });

  it("should generate personalized recommendations dynamically for each dosha", async () => {
    const { getRecommendationsForDosha } = await import("../lib/doshaRecommendations");

    const vataRecs = getRecommendationsForDosha("vata");
    expect(vataRecs.dominantDosha).toBe("Vata");
    expect(vataRecs.element).toBe("Air & Space");
    expect(vataRecs.dietGuidance.length).toBeGreaterThanOrEqual(3);
    expect(vataRecs.lifestyleRituals.length).toBeGreaterThanOrEqual(3);
    expect(vataRecs.foodsToFavor).toContain("Sweet potatoes");

    const pittaRecs = getRecommendationsForDosha("pitta", "Vata");
    expect(pittaRecs.dominantDosha).toBe("Pitta");
    expect(pittaRecs.secondaryDosha).toBe("Vata");
    expect(pittaRecs.element).toBe("Fire & Water");
    expect(pittaRecs.foodsToFavor).toContain("Cucumbers");

    const kaphaRecs = getRecommendationsForDosha("kapha");
    expect(kaphaRecs.dominantDosha).toBe("Kapha");
    expect(kaphaRecs.element).toBe("Earth & Water");
    expect(kaphaRecs.foodsToFavor).toContain("Ginger tea");
  });

  it("should handle predictDosha with optional token parameter gracefully", async () => {
    const testAnswers: AssessmentAnswers = {
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

    const responseWithToken = await predictDosha(testAnswers, "dummy_test_token_123");
    expect(responseWithToken.result.primaryDosha).toBe("Vata");
    expect(responseWithToken.source).toBe("local");
  });
});
