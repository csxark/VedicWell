/**
 * Dosha Recommendation Model
 *
 * Downstream service providing personalized Ayurvedic wellness guidance,
 * dietary guidelines, dinacharya rituals, and yoga/pranayama remedies
 * derived dynamically from the user's authoritative DOSA.
 */

export interface DoshaRecommendations {
  dominantDosha: "Vata" | "Pitta" | "Kapha";
  secondaryDosha?: string | null;
  tagline: string;
  element: string;
  description: string;
  dietGuidance: string[];
  lifestyleRituals: { title: string; time: string; description: string }[];
  herbalSupport: { herb: string; purpose: string }[];
  yogaAndPranayama: string[];
  foodsToFavor: string[];
  foodsToAvoid: string[];
}

const DOSHA_KNOWLEDGE: Record<"vata" | "pitta" | "kapha", Omit<DoshaRecommendations, "dominantDosha" | "secondaryDosha">> = {
  vata: {
    tagline: "Air & Ether — Governs Movement, Communication & Change",
    element: "Air & Space",
    description: "Vata energy is light, quick, dry, and cool. When balanced you are creative, energetic, and intuitive. When imbalanced, you may experience anxiety, irregular digestion, coldness, or sleep disturbances.",
    dietGuidance: [
      "Favor warm, freshly cooked, grounding foods with healthy oils (ghee, sesame oil, olive oil).",
      "Incorporate sweet, sour, and salty tastes to pacify dry and light qualities.",
      "Enjoy nourishing soups, stews, warm porridges, and cooked root vegetables.",
      "Minimize cold, dry, light, and raw foods like iced drinks, dry crackers, and raw salads.",
    ],
    lifestyleRituals: [
      { title: "Grounding Morning Meditation", time: "6:00 AM", description: "Sit in quiet stillness for 10-15 minutes to center restless mind." },
      { title: "Warm Sesame Oil Abhyanga", time: "6:30 AM", description: "Warm self-massage before showering to calm the nervous system." },
      { title: "Nourishing Warm Breakfast", time: "7:30 AM", description: "Warm spiced oatmeal or stewed apples with cinnamon and ghee." },
      { title: "Calming Evening Routine", time: "9:00 PM", description: "Warm milk or almond milk with nutmeg and cinnamon before sleep." },
    ],
    herbalSupport: [
      { herb: "Ashwagandha", purpose: "Rejuvenates the nervous system and fosters deep, restorative sleep." },
      { herb: "Brahmi", purpose: "Calms mental restlessness and enhances mental clarity." },
      { herb: "Triphala", purpose: "Maintains regular, gentle digestion and bowel regularity." },
    ],
    yogaAndPranayama: [
      "Nadi Shodhana (Alternate Nostril Breathing) — 5-10 minutes to balance right and left brain hemispheres.",
      "Slow, grounding yoga: Mountain Pose, Warrior I, Tree Pose, Child's Pose, and Savasana.",
      "Maintain consistent, steady transitions rather than rapid or erratic movements.",
    ],
    foodsToFavor: ["Sweet potatoes", "Cooked apples", "Basmati rice", "Ghee", "Avocados", "Almonds (soaked)", "Warm soups"],
    foodsToAvoid: ["Raw kale/salads", "Iced beverages", "Dry crackers", "Carbonated drinks", "Excessive caffeine"],
  },
  pitta: {
    tagline: "Fire & Water — Governs Digestion, Metabolism & Intellect",
    element: "Fire & Water",
    description: "Pitta energy is hot, sharp, light, and oily. When balanced, you are focused, articulate, brave, and ambitious. When imbalanced, you may experience irritability, inflammation, hyperacidity, or skin flare-ups.",
    dietGuidance: [
      "Favor cooling, sweet, bitter, and astringent foods to pacify internal heat.",
      "Eat at consistent meal times; avoid skipping lunch when the digestive fire (Agni) peaks.",
      "Stay hydrated with room-temperature water, coconut water, mint teas, and sweet fruit juices.",
      "Limit spicy, pungent, fermented, salty, and sour foods.",
    ],
    lifestyleRituals: [
      { title: "Cooling Morning Meditation", time: "6:00 AM", description: "Cultivate compassion, patience, and non-judgmental presence." },
      { title: "Coconut Oil Self-Massage", time: "6:30 AM", description: "Gentle massage with organic coconut oil to cool and soothe skin." },
      { title: "Pitta-Balancing Lunch", time: "12:30 PM", description: "Substantial lunch with grains, steamed greens, and cooling cucumber raita." },
      { title: "Moonlight Stroll", time: "8:00 PM", description: "Walk outdoors under cool moonlight or near water to release accumulated heat." },
    ],
    herbalSupport: [
      { herb: "Shatavari", purpose: "Nourishes vital fluids and cools inflammatory heat throughout the body." },
      { herb: "Amalaki (Amla)", purpose: "Cooling antioxidant fruit rich in natural Vitamin C." },
      { herb: "Neem", purpose: "Purifies the blood and supports clear, glowing skin." },
    ],
    yogaAndPranayama: [
      "Sheetali & Sheetkari Pranayama (Cooling Breath) to lower core body temperature and soothe anger.",
      "Moon Salutations (Chandra Namaskar), Camel Pose, Cobra, and Forward Folds.",
      "Exercise with relaxed joy, releasing perfectionism and competition.",
    ],
    foodsToFavor: ["Cucumbers", "Watermelon", "Coconut water", "Fennel tea", "Sweet berries", "Leafy greens", "Ghee"],
    foodsToAvoid: ["Chili peppers", "Fermented cheeses", "Deep-fried foods", "Vinegar", "Hard alcohol", "Excess garlic"],
  },
  kapha: {
    tagline: "Earth & Water — Governs Structure, Immunity & Stability",
    element: "Earth & Water",
    description: "Kapha energy is heavy, slow, cool, and moist. When balanced, you are calm, loving, loyal, and physically strong. When imbalanced, you may experience sluggishness, weight gain, congestion, or attachment to routine.",
    dietGuidance: [
      "Favor light, warm, dry, and spicy foods that kindle metabolism and digestive fire.",
      "Embrace pungent, bitter, and astringent tastes with abundant warming spices.",
      "Incorporate raw honey in moderation with warm herbal teas (never boiled).",
      "Reduce heavy, oily, sugary, dairy-laden, and cold refrigerated foods.",
    ],
    lifestyleRituals: [
      { title: "Early Rise Routine", time: "5:30 AM", description: "Wake before sunrise to prevent morning heaviness and stagnation." },
      { title: "Garshana (Dry Silk Brushing)", time: "6:00 AM", description: "Dry body brushing to awaken lymphatic circulation." },
      { title: "Invigorating Exercise", time: "6:30 AM", description: "Brisk cardio, fast-paced vinyasa yoga, or strength building to work up a sweat." },
      { title: "Light Early Dinner", time: "6:30 PM", description: "Light spiced lentil broth or steamed vegetables; avoid late-night eating." },
    ],
    herbalSupport: [
      { herb: "Trikatu", purpose: "Blend of ginger, black pepper, and pippali to ignite sluggish digestion." },
      { herb: "Guggulu", purpose: "Supports healthy lipid balance, metabolism, and joint comfort." },
      { herb: "Tulsi (Holy Basil)", purpose: "Uplifts mood and cleanses respiratory passages." },
    ],
    yogaAndPranayama: [
      "Kapalabhati & Bhastrika (Breath of Fire) — invigorates mind and cleanses respiratory congestion.",
      "Sun Salutations (Surya Namaskar) practiced with vigorous, continuous rhythm.",
      "Dynamic postures: Warrior II, Chair Pose, Backbends, and Bow Pose.",
    ],
    foodsToFavor: ["Steamed vegetables", "Ginger tea", "Lentils", "Millet", "Quinoa", "Bitter greens", "Apples", "Pomegranates"],
    foodsToAvoid: ["Ice cream", "Heavy cheeses", "Deep-fried foods", "Excess wheat/bread", "Cold milk", "Daytime naps"],
  },
};

/**
 * Generates personalized recommendations from the user's verified DOSA.
 */
export function getRecommendationsForDosha(
  dominantDosha: "vata" | "pitta" | "kapha",
  secondaryDosha?: string | null
): DoshaRecommendations {
  const normKey = (dominantDosha?.toLowerCase() || "vata") as "vata" | "pitta" | "kapha";
  const base = DOSHA_KNOWLEDGE[normKey] || DOSHA_KNOWLEDGE.vata;

  const titleCaseDosha = (normKey.charAt(0).toUpperCase() + normKey.slice(1)) as "Vata" | "Pitta" | "Kapha";

  return {
    dominantDosha: titleCaseDosha,
    secondaryDosha: secondaryDosha ? secondaryDosha.charAt(0).toUpperCase() + secondaryDosha.slice(1) : null,
    tagline: base.tagline,
    element: base.element,
    description: base.description,
    dietGuidance: base.dietGuidance,
    lifestyleRituals: base.lifestyleRituals,
    herbalSupport: base.herbalSupport,
    yogaAndPranayama: base.yogaAndPranayama,
    foodsToFavor: base.foodsToFavor,
    foodsToAvoid: base.foodsToAvoid,
  };
}
