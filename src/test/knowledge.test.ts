import { describe, it, expect } from "vitest";
import { foodsData } from "@/data/knowledge/foodsData";
import { recipesData } from "@/data/knowledge/recipesData";
import { tastesData } from "@/data/knowledge/tastesData";
import { herbsSpicesData } from "@/data/knowledge/herbsSpicesData";
import { seasonalData } from "@/data/knowledge/seasonalData";
import { agniTypesData, incompatibleCombinationsData, faqData } from "@/data/knowledge/agniCombinationsFaqData";
import { articlesData } from "@/data/knowledge/articlesData";

describe("Ayurvedic Knowledge Hub Data Integrity", () => {
  it("contains extensive foods with complete Ayurvedic energetics", () => {
    expect(foodsData.length).toBeGreaterThanOrEqual(15);

    // Verify key foods mentioned in user request exist
    const foodIds = foodsData.map((f) => f.id);
    expect(foodIds).toContain("basmati-rice");
    expect(foodIds).toContain("barley");
    expect(foodIds).toContain("cucumber");
    expect(foodIds).toContain("bottle-gourd");
    expect(foodIds).toContain("bitter-gourd");
    expect(foodIds).toContain("banana");
    expect(foodIds).toContain("pomegranate");
    expect(foodIds).toContain("yellow-moong-dal");
    expect(foodIds).toContain("ghee");
    expect(foodIds).toContain("turmeric");
    expect(foodIds).toContain("ginger");

    // Verify each food item has valid required fields
    foodsData.forEach((food) => {
      expect(food.name).toBeTruthy();
      expect(food.sanskritName).toBeTruthy();
      expect(food.hindiName).toBeTruthy();
      expect(food.tastes.length).toBeGreaterThan(0);
      expect(food.qualities.length).toBeGreaterThan(0);
      expect(food.virya).toMatch(/(Sheeta|Ushna|Anushna|Neutral)/);
      expect(food.vipaka).toMatch(/(Madhura|Amla|Katu)/);
      expect(["favored", "moderation", "less_favored"]).toContain(food.vataSuitability);
      expect(["favored", "moderation", "less_favored"]).toContain(food.pittaSuitability);
      expect(["favored", "moderation", "less_favored"]).toContain(food.kaphaSuitability);
      expect(food.recommendedPreparation).toBeTruthy();
      expect(food.commonRecipes.length).toBeGreaterThan(0);
      expect(food.classicalReference).toBeTruthy();
    });
  });

  it("contains recipes for Vata, Pitta, Kapha, and Tridoshic balance", () => {
    expect(recipesData.length).toBeGreaterThanOrEqual(8);

    const vataRecipes = recipesData.filter((r) => r.targetDosha === "vata");
    const pittaRecipes = recipesData.filter((r) => r.targetDosha === "pitta");
    const kaphaRecipes = recipesData.filter((r) => r.targetDosha === "kapha");
    const tridoshicRecipes = recipesData.filter((r) => r.targetDosha === "tridoshic");

    expect(vataRecipes.length).toBeGreaterThan(0);
    expect(pittaRecipes.length).toBeGreaterThan(0);
    expect(kaphaRecipes.length).toBeGreaterThan(0);
    expect(tridoshicRecipes.length).toBeGreaterThan(0);

    recipesData.forEach((r) => {
      expect(r.title).toBeTruthy();
      expect(r.ingredients.length).toBeGreaterThan(0);
      expect(r.instructions.length).toBeGreaterThan(0);
      expect(r.ayurvedicRationale).toBeTruthy();
      expect(r.prepTime).toBeTruthy();
      expect(r.cookTime).toBeTruthy();
    });
  });

  it("contains all six tastes (Shad Rasa) with elements and doshic actions", () => {
    expect(tastesData.length).toBe(6);
    const tasteNames = tastesData.map((t) => t.id);
    expect(tasteNames).toEqual(["madhura", "amla", "lavana", "katu", "tikta", "kashaya"]);

    tastesData.forEach((t) => {
      expect(t.elements).toBeTruthy();
      expect(t.primaryFoods.length).toBeGreaterThan(0);
      expect(["pacifies", "increases"]).toContain(t.doshaImpact.vata);
      expect(["pacifies", "increases"]).toContain(t.doshaImpact.pitta);
      expect(["pacifies", "increases"]).toContain(t.doshaImpact.kapha);
    });
  });

  it("contains the four states of Agni and signs of Ama", () => {
    expect(agniTypesData.length).toBe(4);
    const agniIds = agniTypesData.map((a) => a.id);
    expect(agniIds).toContain("sama-agni");
    expect(agniIds).toContain("vishama-agni");
    expect(agniIds).toContain("tikshna-agni");
    expect(agniIds).toContain("manda-agni");

    agniTypesData.forEach((a) => {
      expect(a.characteristics.length).toBeGreaterThan(0);
      expect(a.physicalSigns.length).toBeGreaterThan(0);
      expect(a.remedies.length).toBeGreaterThan(0);
    });
  });

  it("contains classical incompatible food combinations (Viruddha Ahara)", () => {
    expect(incompatibleCombinationsData.length).toBeGreaterThanOrEqual(6);
    incompatibleCombinationsData.forEach((combo) => {
      expect(combo.item1).toBeTruthy();
      expect(combo.item2).toBeTruthy();
      expect(combo.traditionalExplanation).toBeTruthy();
      expect(combo.modernDigestiveRationale).toBeTruthy();
      expect(combo.remedyOrCorrection).toBeTruthy();
    });
  });

  it("contains six seasons for Ritucharya", () => {
    expect(seasonalData.length).toBe(6);
    const seasonIds = seasonalData.map((s) => s.id);
    expect(seasonIds).toContain("shishira");
    expect(seasonIds).toContain("vasanta");
    expect(seasonIds).toContain("grishma");
    expect(seasonIds).toContain("varsha");
    expect(seasonIds).toContain("sharad");
    expect(seasonIds).toContain("hemanta");
  });

  it("contains comprehensive educational articles with Samhita citations", () => {
    expect(articlesData.length).toBeGreaterThanOrEqual(6);
    articlesData.forEach((art) => {
      expect(art.title).toBeTruthy();
      expect(art.summary).toBeTruthy();
      expect(art.sections.length).toBeGreaterThan(0);
      expect(art.classicalReferences.length).toBeGreaterThan(0);
      expect(art.readTime).toMatch(/min read/);
    });
  });

  it("contains FAQ items covering key Ayurvedic dietary questions", () => {
    expect(faqData.length).toBeGreaterThanOrEqual(6);
    faqData.forEach((item) => {
      expect(item.question).toBeTruthy();
      expect(item.answer).toBeTruthy();
      expect(item.category).toBeTruthy();
    });
  });
});
