export type DoshaType = "vata" | "pitta" | "kapha";

export type Suitability = "favored" | "moderation" | "less_favored";

export type FoodCategory =
  | "grains"
  | "vegetables"
  | "fruits"
  | "legumes"
  | "dairy"
  | "nuts_seeds"
  | "oils"
  | "herbs_spices"
  | "sweeteners";

export interface FoodItem {
  id: string;
  name: string;
  sanskritName: string;
  hindiName: string;
  botanicalName?: string;
  category: FoodCategory;
  tastes: string[]; // Rasa: Madhura (Sweet), Amla (Sour), Lavana (Salty), Katu (Pungent), Tikta (Bitter), Kashaya (Astringent)
  qualities: string[]; // Guna: Guru (Heavy), Laghu (Light), Snigdha (Unctuous), Ruksha (Dry), Sheeta (Cooling), Ushna (Heating)
  virya: string; // Thermal potency: Sheeta (Cooling), Ushna (Heating), or Anushna-sheeta (Neutral)
  vipaka: string; // Post-digestive transformation: Madhura (Sweet), Amla (Sour), or Katu (Pungent)
  prabhava?: string; // Special non-linear metabolic effect
  vataSuitability: Suitability;
  vataPerspective: string;
  pittaSuitability: Suitability;
  pittaPerspective: string;
  kaphaSuitability: Suitability;
  kaphaPerspective: string;
  recommendedPreparation: string;
  commonRecipes: string[];
  moderationNotes: string;
  compatibleCombinations: string[];
  incompatibleCombinations: string[];
  classicalReference: string;
  modernNutritionalContext: string;
  featured?: boolean;
}

export interface ArticleSection {
  heading: string;
  content: string;
  bulletPoints?: string[];
}

export interface AyurvedicArticle {
  id: string;
  title: string;
  subtitle: string;
  category: "fundamentals" | "nutrition" | "lifestyle" | "digestion";
  readTime: string;
  targetDosha?: DoshaType | "all";
  summary: string;
  sections: ArticleSection[];
  classicalReferences: string[];
  modernContextNote?: string;
  tags: string[];
  featured?: boolean;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  purpose?: string;
}

export interface Recipe {
  id: string;
  title: string;
  sanskritTitle?: string;
  category: "breakfast" | "lunch" | "dinner" | "beverage" | "soup" | "side";
  targetDosha: DoshaType | "tridoshic";
  prepTime: string;
  cookTime: string;
  servings: string;
  summary: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  ayurvedicRationale: string;
  substitutions: string[];
  dietaryTags: string[];
  moderationWarning?: string;
  recommendedSeason?: string;
}

export interface HerbSpice {
  id: string;
  name: string;
  sanskritName: string;
  hindiName: string;
  botanicalName: string;
  rasa: string[];
  virya:
    | "Ushna (Heating)"
    | "Sheeta (Cooling)"
    | "Neutral"
    | "Anushna (Balanced / Mild)"
    | "Sheeta (Cooling) / Neutral";
  vipaka: "Katu (Pungent)" | "Madhura (Sweet)" | "Amla (Sour)";
  doshaEffects: {
    vata: string;
    pitta: string;
    kapha: string;
  };
  keyTherapeuticUses: string[];
  homeRemedies: string[];
  precautions: string;
  classicalReferences: string;
}

export interface TasteDetail {
  id: string;
  taste: string; // e.g. Madhura (Sweet)
  sanskrit: string;
  elements: string;
  qualities: string[];
  doshaImpact: {
    vata: "pacifies" | "increases";
    pitta: "pacifies" | "increases";
    kapha: "pacifies" | "increases";
  };
  primaryFoods: string[];
  action: string;
  overconsumptionEffect: string;
  indianDishes: string[];
}

export interface SeasonalGuide {
  id: string;
  season: string;
  sanskritName: string;
  englishMonths: string;
  doshaDynamic: string;
  dominantElements: string;
  dietaryGuidance: string[];
  foodsToFavor: string[];
  foodsToModerate: string[];
  lifestyleTips: string[];
}

export interface IncompatibleCombination {
  id: string;
  item1: string;
  item2: string;
  traditionalClassification: string;
  traditionalExplanation: string;
  modernDigestiveRationale: string;
  remedyOrCorrection: string;
}

export interface AgniType {
  id: string;
  name: string;
  sanskritName: string;
  associatedDosha: string;
  state: string;
  characteristics: string[];
  physicalSigns: string[];
  remedies: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  category: "general" | "diet" | "doshas" | "preparation" | "lifestyle";
  answer: string;
}
