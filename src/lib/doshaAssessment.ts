/**
 * Dosha Assessment — Questions, Types, Local Scoring & Metadata
 *
 * Transplanted from the Dosha-Predictor feature project.
 * Question values MUST match the backend ENCODING_MAPS keys exactly
 * so the Railway XGBoost model receives correct one-hot encoded input.
 */

export type Dosha = "Vata" | "Pitta" | "Kapha";

// Field names MUST match the backend AssessmentInput schema exactly.
export interface AssessmentAnswers {
  bodyFrame: string;
  paceOfWork: string;
  bodyEnergy: string;
  hungerPattern: string;
  hairType: string;
  sleepPattern: string;
  mentalActivity: string;
  voiceQuality: string;
  jointStructure: string;
  skinType: string;
  bodyOdor: string;
}

export interface QuestionOption {
  value: string;
  label: string;
  dosha: Dosha;
}

export interface Question {
  id: keyof AssessmentAnswers;
  title: string;
  hint?: string;
  options: QuestionOption[];
}

// Option `value`s MUST match the backend ENCODING_MAPS keys exactly.
export const QUESTIONS: Question[] = [
  {
    id: "bodyFrame",
    title: "How would you describe your body frame?",
    hint: "Think about your natural build, not current weight.",
    options: [
      { value: "Thin and Lean", label: "Thin and Lean", dosha: "Vata" },
      { value: "Medium", label: "Medium", dosha: "Pitta" },
      { value: "Well Built", label: "Well Built", dosha: "Kapha" },
    ],
  },
  {
    id: "paceOfWork",
    title: "What pace do you usually work at?",
    options: [
      { value: "Fast", label: "Fast", dosha: "Vata" },
      { value: "Medium", label: "Medium", dosha: "Pitta" },
      { value: "Slow", label: "Slow & Steady", dosha: "Kapha" },
    ],
  },
  {
    id: "bodyEnergy",
    title: "How is your body's energy through the day?",
    options: [
      { value: "Low", label: "Comes in bursts, then dips", dosha: "Vata" },
      { value: "High", label: "Intense and focused", dosha: "Pitta" },
      { value: "Medium", label: "Steady and enduring", dosha: "Kapha" },
    ],
  },
  {
    id: "hungerPattern",
    title: "How regular is your hunger?",
    options: [
      { value: "Skips Meals", label: "I often skip meals", dosha: "Vata" },
      { value: "Regular", label: "Sharp & regular, must eat on time", dosha: "Pitta" },
      { value: "Irregular", label: "Mild, can wait to eat", dosha: "Kapha" },
    ],
  },
  {
    id: "hairType",
    title: "What's your hair like?",
    options: [
      { value: "Dry", label: "Dry & frizzy", dosha: "Vata" },
      { value: "Normal", label: "Fine, normal", dosha: "Pitta" },
      { value: "Greasy", label: "Thick & oily", dosha: "Kapha" },
    ],
  },
  {
    id: "sleepPattern",
    title: "How do you sleep?",
    options: [
      { value: "Light Sleeper", label: "Light sleeper, easily disturbed", dosha: "Vata" },
      { value: "Normal", label: "Moderate, 6–7 hrs", dosha: "Pitta" },
      { value: "Sleepy", label: "Deep, hard to wake", dosha: "Kapha" },
    ],
  },
  {
    id: "mentalActivity",
    title: "How is your mind most days?",
    options: [
      { value: "Restless", label: "Restless, lots of ideas", dosha: "Vata" },
      { value: "Active", label: "Sharp and driven", dosha: "Pitta" },
      { value: "Stable", label: "Calm and stable", dosha: "Kapha" },
    ],
  },
  {
    id: "voiceQuality",
    title: "What's your voice like?",
    options: [
      { value: "Fast", label: "Fast & light", dosha: "Vata" },
      { value: "Rough", label: "Clear & assertive", dosha: "Pitta" },
      { value: "Deep", label: "Deep & slow", dosha: "Kapha" },
    ],
  },
  {
    id: "jointStructure",
    title: "How do your joints feel?",
    options: [
      { value: "Light", label: "Light, sometimes cracking", dosha: "Vata" },
      { value: "Medium", label: "Medium, flexible", dosha: "Pitta" },
      { value: "Heavy", label: "Heavy and sturdy", dosha: "Kapha" },
    ],
  },
  {
    id: "skinType",
    title: "How would you describe your skin?",
    options: [
      { value: "Dry", label: "Dry", dosha: "Vata" },
      { value: "Rough", label: "Warm, prone to redness", dosha: "Pitta" },
      { value: "Oily", label: "Oily & warm", dosha: "Pitta" },
      { value: "Soft", label: "Soft, smooth & cool", dosha: "Kapha" },
    ],
  },
  {
    id: "bodyOdor",
    title: "How is your natural body odor?",
    options: [
      { value: "Mild", label: "Mild / barely any", dosha: "Vata" },
      { value: "Strong", label: "Strong / sharp", dosha: "Pitta" },
      { value: "Moderate", label: "Moderate / earthy", dosha: "Kapha" },
    ],
  },
];

export interface PredictionResult {
  primaryDosha: Dosha;
  confidence: number;
  secondaryDosha: Dosha;
  secondaryConfidence: number;
  keyTraits?: string[];
}

/**
 * Local fallback scoring so the app stays useful when the backend is
 * unreachable. Tallies each answer's dosha tag and normalizes to [0, 1].
 */
export function scoreLocally(answers: Partial<AssessmentAnswers>): PredictionResult {
  const tally: Record<Dosha, number> = { Vata: 0, Pitta: 0, Kapha: 0 };
  for (const q of QUESTIONS) {
    const picked = answers[q.id];
    const opt = q.options.find((o) => o.value === picked);
    if (opt) tally[opt.dosha] += 1;
  }
  const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
  const ranked = (Object.entries(tally) as [Dosha, number][])
    .map(([d, n]) => ({ d, p: n / total }))
    .sort((a, b) => b.p - a.p);
  return {
    primaryDosha: ranked[0].d,
    confidence: ranked[0].p,
    secondaryDosha: ranked[1].d,
    secondaryConfidence: ranked[1].p,
  };
}

export const DOSHA_META: Record<
  Dosha,
  {
    tagline: string;
    element: string;
    color: string;
    gradientClass: string;
    textColorClass: string;
    description: string;
    recommendations: string[];
  }
> = {
  Vata: {
    tagline: "Air & Ether",
    element: "Movement, creativity, change",
    color: "from-sky-400 to-blue-300",
    gradientClass: "from-sky-400 to-blue-300",
    textColorClass: "text-sky-500 dark:text-sky-400",
    description:
      "Vata energy is light, quick, and creative. When balanced you're imaginative and adaptable; when aggravated, anxious and scattered.",
    recommendations: [
      "Keep a consistent daily routine",
      "Favor warm, cooked, grounding meals",
      "Prioritize a steady sleep schedule",
      "Practice meditation and gentle yoga",
    ],
  },
  Pitta: {
    tagline: "Fire & Water",
    element: "Transformation, focus, drive",
    color: "from-orange-400 to-amber-300",
    gradientClass: "from-orange-400 to-amber-300",
    textColorClass: "text-orange-500 dark:text-orange-400",
    description:
      "Pitta energy is sharp, focused, and ambitious. When balanced you're a confident leader; when aggravated, irritable and overheated.",
    recommendations: [
      "Favor cooling foods (cucumber, mint, leafy greens)",
      "Reduce spicy, fried, and fermented foods",
      "Build stress-management rituals into the day",
      "Stay well hydrated, especially in heat",
    ],
  },
  Kapha: {
    tagline: "Earth & Water",
    element: "Stability, strength, calm",
    color: "from-emerald-400 to-green-300",
    gradientClass: "from-emerald-400 to-green-300",
    textColorClass: "text-emerald-500 dark:text-emerald-400",
    description:
      "Kapha energy is steady, strong, and grounded. When balanced you're calm and loving; when aggravated, sluggish and resistant to change.",
    recommendations: [
      "Get regular, energetic exercise",
      "Favor light, warm, spiced meals",
      "Keep an active, varied lifestyle",
      "Avoid oversleeping and daytime naps",
    ],
  },
};

/**
 * Extract the top N traits from the user's answers that match the given dosha.
 */
export function topTraits(
  answers: Partial<AssessmentAnswers>,
  dosha: Dosha,
  n = 4,
) {
  const out: { question: string; label: string }[] = [];
  for (const q of QUESTIONS) {
    const picked = answers[q.id];
    const opt = q.options.find((o) => o.value === picked);
    if (opt && opt.dosha === dosha) {
      out.push({ question: q.title, label: opt.label });
    }
    if (out.length >= n) break;
  }
  return out;
}
