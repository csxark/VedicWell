import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Wind, Flame, Mountain, Leaf, 
  Brain, Moon, Sun, Sparkles, Compass, Utensils, CheckCircle2, AlertTriangle, Info
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LotusIcon, MandalaIcon } from "@/components/icons/SacredIcons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { fetchLatestUserDosha, UserDoshaRecord } from "@/lib/doshaService";
import { readGuestCache, GuestDoshaCache } from "@/lib/guestDoshaCache";
import { DoshaType, FoodItem, Recipe, AyurvedicArticle } from "@/types/knowledge";
import { foodsData } from "@/data/knowledge/foodsData";
import { recipesData } from "@/data/knowledge/recipesData";
import { articlesData } from "@/data/knowledge/articlesData";

// Knowledge Components
import { KnowledgeHero } from "@/components/knowledge/KnowledgeHero";
import { PersonalizedDoshaCard } from "@/components/knowledge/PersonalizedDoshaCard";
import { DoshaFoodGuideSection } from "@/components/knowledge/DoshaFoodGuideSection";
import { FoodExplorer } from "@/components/knowledge/FoodExplorer";
import { SixTastesSection } from "@/components/knowledge/SixTastesSection";
import { HerbsSpicesSection } from "@/components/knowledge/HerbsSpicesSection";
import { RecipeLibrarySection } from "@/components/knowledge/RecipeLibrarySection";
import { AgniAndDigestionSection } from "@/components/knowledge/AgniAndDigestionSection";
import { SeasonalRitucharyaSection } from "@/components/knowledge/SeasonalRitucharyaSection";
import { FoodCombinationsSection } from "@/components/knowledge/FoodCombinationsSection";
import { ArticlesLibrarySection } from "@/components/knowledge/ArticlesLibrarySection";
import { KnowledgeFaqSection } from "@/components/knowledge/KnowledgeFaqSection";
import { FoodDetailModal } from "@/components/knowledge/FoodDetailModal";
import { RecipeDetailModal } from "@/components/knowledge/RecipeDetailModal";
import { ArticleReaderModal } from "@/components/knowledge/ArticleReaderModal";

// Classical 3 Doshas details (Preserved and expanded from original page)
const doshaDetails = {
  vata: {
    name: "Vata",
    element: "Air & Space (Ether)",
    color: "from-sky-500 to-indigo-600",
    textColor: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-500/10",
    icon: Wind,
    simpleDescription:
      "Vata is the energy of movement. It governs your breath, circulation, thoughts, and nervous system. When balanced, Vata makes you creative, energetic, and adaptable. When out of balance, it can bring anxiety, dryness, and irregular digestion.",
    qualities: ["Laghu (Light)", "Sheeta (Cold)", "Ruksha (Dry)", "Khara (Rough)", "Chala (Mobile)", "Sukshma (Subtle)", "Vishada (Clear)"],
    characteristics: [
      "Quick, creative, inventive, and imaginative mind",
      "Fast learner with rapid ideation, but may forget quickly",
      "Enthusiastic, talkative, and vibrant personality",
      "Flexible and highly adaptable to new situations",
      "Light and slender bone structure and body frame",
      "Tendency toward dry skin, cool extremities, and irregular appetite",
    ],
    imbalanceSigns: [
      "Anxiety, excessive worry, and racing thoughts",
      "Insomnia, light or broken sleep, and restless dreams",
      "Constipation, intestinal gas, and abdominal bloating",
      "Dry, cracking skin, brittle nails, and dry hair",
      "Joint popping, stiffness, or neuromuscular tension",
      "Difficulty staying focused, scattered energy, and chronic fatigue",
    ],
    balancingTips: [
      "Follow a steady, grounding daily routine (Dinacharya)",
      "Eat warm, freshly cooked, moist, and nourishing foods",
      "Favor sweet, sour, and salty tastes with healthy unctuous fats (ghee, sesame oil)",
      "Practice calming, slow yoga and alternate nostril breathing (Nadi Shodhana)",
      "Keep body warmly dressed and avoid cold, windy drafts",
      "Prioritize regular sleep before 10:00 PM and warm oil self-massage (Abhyanga)",
    ],
    bestFoods: ["Basmati rice", "Warm moong dal", "Sweet potatoes", "Ghee", "Sesame oil", "Cooked carrots", "Soaked almonds", "Warm spiced milk"],
    avoidFoods: ["Dry cold crackers", "Iced drinks", "Large raw salads", "Excessive bitter greens", "Excessive caffeine"],
  },
  pitta: {
    name: "Pitta",
    element: "Fire & Water",
    color: "from-orange-500 to-amber-600",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    icon: Flame,
    simpleDescription:
      "Pitta is the energy of transformation. It governs digestion, metabolism, body temperature, and your sharpness of mind. When balanced, Pitta makes you focused, confident, and courageous. When out of balance, it can bring irritability, heartburn, and skin inflammation.",
    qualities: ["Sasneha (Slightly Oily)", "Tikshna (Sharp)", "Ushna (Hot)", "Laghu (Light)", "Visra (Fleshy odor)", "Sara (Spreading)", "Drava (Liquid)"],
    characteristics: [
      "Sharp, penetrating intellect, logical mind, and focused precision",
      "Natural decisive leadership, courage, and executive capability",
      "Robust appetite, strong metabolism, and consistent digestion",
      "Medium athletic build, good muscular symmetry",
      "Warm body temperature, warm hands, and prone to flushing",
      "Goal-oriented, ambitious, articulate, and organized",
    ],
    imbalanceSigns: [
      "Irritability, impatience, anger, and hypercritical perfectionism",
      "Acid reflux, heartburn, gastritis, and burning indigestion",
      "Skin inflammation, rashes, acne, hives, or eczema",
      "Excessive sweating and sensitivity to heat or midday sun",
      "Loose, frequent, yellowish bowel movements with burning",
      "Bloodshot or burning eyes after visual strain",
    ],
    balancingTips: [
      "Stay in cool environments and avoid prolonged midday summer sun",
      "Eat cooling, fresh, sweet, bitter, and astringent foods",
      "Embrace pure cow's ghee, coconut oil, cucumbers, and sweet fruits",
      "Practice moderation, release competitiveness, and enjoy leisure time",
      "Spend tranquil time in nature, near water bodies, or under evening moonlight",
      "Practice cooling Sheetali pranayama and gentle moon salutations",
    ],
    bestFoods: ["Cucumbers", "Bottle gourd (Lauki)", "Sweet melons", "Fresh coconut", "Pomegranate", "Basmati rice", "Cow's ghee", "Fennel & coriander"],
    avoidFoods: ["Hot red chilies", "Sour vinegar pickles", "Deep-fried foods", "Excessively fermented foods", "Alcohol and black coffee"],
  },
  kapha: {
    name: "Kapha",
    element: "Earth & Water",
    color: "from-emerald-600 to-teal-700",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: Mountain,
    simpleDescription:
      "Kapha is the energy of structure and stability. It governs your strength, immunity, joints, and emotional steadiness. When balanced, Kapha makes you calm, loving, and resilient. When out of balance, it can bring sluggishness, congestion, and weight gain.",
    qualities: ["Guru (Heavy)", "Manda (Slow)", "Sheeta (Cold)", "Snigdha (Unctuous)", "Shlakshna (Smooth)", "Mritsna (Sticky)", "Sthira (Stable)", "Sandra (Dense)"],
    characteristics: [
      "Calm, loving, forgiving, grounded, and loyal disposition",
      "Strong, sturdy, well-developed bone structure and high endurance",
      "Excellent long-term memory, steady retention, and emotional poise",
      "Thick, lustrous hair, large expressive eyes, and soft smooth skin",
      "Deep, sound sleep and sustained physical stamina",
      "Graceful, steady movement and stable emotional resilience",
    ],
    imbalanceSigns: [
      "Weight gain, sluggish metabolism, and difficulty waking in the morning",
      "Sinus congestion, excessive mucus, chest heaviness, and seasonal allergies",
      "Mental lethargy, apathy, brain fog, and depression",
      "Possessiveness, greed, stubborn attachment, and resistance to change",
      "Water retention, swollen feet or fingers, and puffy face",
      "Sluggish digestion (Manda Agni) and post-meal drowsiness",
    ],
    balancingTips: [
      "Maintain active physical movement and vigorous cardiovascular workouts",
      "Eat light, warm, dry, and stimulating meals with abundant spices",
      "Favor pungent, bitter, and astringent tastes to scrape excess fat (Lekhana)",
      "Rise early before 6:00 AM and strictly avoid daytime naps",
      "Embrace spontaneous new experiences, travel, and creative challenges",
      "Practice dry body brushing (Garshana) and invigorating Kapalabhati breath",
    ],
    bestFoods: ["Barley (Yava)", "Foxtail millet", "Ginger", "Bitter gourd (Karela)", "Yellow moong dal", "Apples & pears", "Mustard seeds & black pepper"],
    avoidFoods: ["Heavy dairy sweets", "Deep-fried foods", "Cold iced desserts", "Excess refined sugar", "Heavy late-night dinners"],
  },
};

const ayurvedaPrinciples = [
  {
    title: "The Science of Life (Ayurveda)",
    icon: BookOpen,
    what: "A 5,000-year-old system of natural health from India.",
    why: "It sees health as harmony between mind, body, senses, and environment — not just the absence of disease.",
    everyday: "It offers gentle, personal guidance for daily routines, food, and rest that fits your unique body.",
  },
  {
    title: "The Five Elements (Pancha Mahabhutas)",
    icon: Leaf,
    what: "Everything in nature is built from Space, Air, Fire, Water, and Earth.",
    why: "These elements pair up to form the three doshas that shape your body and mind.",
    everyday: "You can feel them in the warmth of food, the coolness of water, and the steadiness of the ground.",
  },
  {
    title: "Mind-Body Connection",
    icon: Brain,
    what: "Your thoughts and emotions directly affect your physical health.",
    why: "Ayurveda treats mental stress and emotional strain as root causes of physical illness.",
    everyday: "A calm mind supports good digestion, sound sleep, and steady energy.",
  },
  {
    title: "Daily Rhythm (Dinacharya)",
    icon: Sun,
    what: "Nature moves through 4-hour cycles of Kapha, Pitta, and Vata energy each day.",
    why: "Aligning meals, activity, and sleep with this natural clock supports digestion and vitality.",
    everyday: "Simple habits like waking early and eating at regular times keep your rhythm steady.",
  },
  {
    title: "Digestive Fire (Agni)",
    icon: Flame,
    what: "Agni is the digestive fire that breaks down food and absorbs nourishment.",
    why: "Strong digestion creates energy; weak digestion leaves behind residue (Ama) that weighs you down.",
    everyday: "Eating warm, freshly cooked meals and avoiding ice-cold drinks keeps your digestion comfortable.",
  },
  {
    title: "Seasonal Routines (Ritucharya)",
    icon: Moon,
    what: "Adjust food and daily habits across the six Indian seasons.",
    why: "Changing with the seasons prevents seasonal imbalance and protects your immunity (Ojas).",
    everyday: "Favor warming soups in winter and light, hydrating foods in summer.",
  },
];

// Helper to normalize dosha strings safely
function normalizeDosha(val: unknown): DoshaType | null {
  if (typeof val !== "string") return null;
  const lower = val.trim().toLowerCase();
  if (lower === "vata" || lower === "pitta" || lower === "kapha") {
    return lower as DoshaType;
  }
  return null;
}

const Knowledge = () => {
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();

  // Assessment & Personalization State
  const [latestAssessment, setLatestAssessment] = useState<UserDoshaRecord | null>(null);
  const [guestCache, setGuestCache] = useState<GuestDoshaCache | null>(null);
  const [isCheckingAssessment, setIsCheckingAssessment] = useState(true);
  const [filterByPersonalized, setFilterByPersonalized] = useState(true);
  const hasInitializedTabRef = React.useRef(false);

  // Global UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("doshas");
  const [selectedDoshaTab, setSelectedDoshaTab] = useState<string>("vata");

  // Direct modal triggers for URL params
  const [urlFoodModal, setUrlFoodModal] = useState<FoodItem | null>(null);
  const [urlRecipeModal, setUrlRecipeModal] = useState<Recipe | null>(null);
  const [urlArticleModal, setUrlArticleModal] = useState<AyurvedicArticle | null>(null);

  // 1. Fetch Authoritative Assessment
  useEffect(() => {
    let isCurrent = true;
    setIsCheckingAssessment(true);
    // Reset assessment state to prevent showing prior-user data during fetch or failure
    setLatestAssessment(null);
    setGuestCache(readGuestCache());

    if (user?.id) {
      fetchLatestUserDosha(user.id)
        .then((record) => {
          if (isCurrent) {
            setLatestAssessment(record);
            setIsCheckingAssessment(false);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch user assessment:", err);
          if (isCurrent) {
            setIsCheckingAssessment(false);
          }
        });
    } else {
      if (isCurrent) {
        setIsCheckingAssessment(false);
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [user?.id]);

  // Derive User's Dominant & Secondary Dosha without hardcoding Pitta
  const userDoshaInfo = useMemo(() => {
    if (user?.id) {
      const dbDominant = normalizeDosha(latestAssessment?.dominantDosha);
      if (dbDominant) {
        return {
          hasAssessment: true,
          dominantDosha: dbDominant,
          secondaryDosha: normalizeDosha(latestAssessment?.secondaryDosha) || latestAssessment?.secondaryDosha || null,
          vataScore: latestAssessment?.vataScore ?? 0,
          pittaScore: latestAssessment?.pittaScore ?? 0,
          kaphaScore: latestAssessment?.kaphaScore ?? 0,
        };
      }
      const profileDominant = normalizeDosha(profile?.dominant_dosha);
      if (profileDominant) {
        return {
          hasAssessment: true,
          dominantDosha: profileDominant,
          secondaryDosha: null,
          vataScore: profile?.vata_percentage ?? 0,
          pittaScore: profile?.pitta_percentage ?? 0,
          kaphaScore: profile?.kapha_percentage ?? 0,
        };
      }
      const guestDominant = normalizeDosha(guestCache?.primaryDosha);
      if (guestDominant) {
        return {
          hasAssessment: true,
          dominantDosha: guestDominant,
          secondaryDosha: normalizeDosha(guestCache?.secondaryDosha) || guestCache?.secondaryDosha || null,
          vataScore: guestCache?.vataScore ?? 0,
          pittaScore: guestCache?.pittaScore ?? 0,
          kaphaScore: guestCache?.kaphaScore ?? 0,
        };
      }
    } else if (guestCache) {
      const guestDominant = normalizeDosha(guestCache.primaryDosha);
      if (guestDominant) {
        return {
          hasAssessment: true,
          dominantDosha: guestDominant,
          secondaryDosha: normalizeDosha(guestCache.secondaryDosha) || guestCache.secondaryDosha || null,
          vataScore: guestCache.vataScore ?? 0,
          pittaScore: guestCache.pittaScore ?? 0,
          kaphaScore: guestCache.kaphaScore ?? 0,
        };
      }
    }

    return {
      hasAssessment: false,
      dominantDosha: null,
      secondaryDosha: null,
      vataScore: 0,
      pittaScore: 0,
      kaphaScore: 0,
    };
  }, [user?.id, latestAssessment, profile, guestCache]);

  // Set default dosha tab when personalization loads without overwriting URL params or manual selections
  useEffect(() => {
    const doshaParam = searchParams.get("dosha");
    if (doshaParam) {
      return; // Do not overwrite explicit URL parameter
    }
    if (
      !hasInitializedTabRef.current &&
      userDoshaInfo.hasAssessment &&
      userDoshaInfo.dominantDosha &&
      filterByPersonalized
    ) {
      setSelectedDoshaTab(userDoshaInfo.dominantDosha);
      hasInitializedTabRef.current = true;
    }
  }, [userDoshaInfo.hasAssessment, userDoshaInfo.dominantDosha, filterByPersonalized, searchParams]);

  // 2. Handle URL Query Parameters (Deep Linking)
  useEffect(() => {
    // Check ?food=
    const foodParam = searchParams.get("food");
    if (foodParam) {
      const found = foodsData.find(
        (f) =>
          f.id === foodParam.toLowerCase() ||
          f.name.toLowerCase() === foodParam.toLowerCase()
      );
      if (found) setUrlFoodModal(found);
    }

    // Check ?recipe=
    const recipeParam = searchParams.get("recipe");
    if (recipeParam) {
      const found = recipesData.find(
        (r) =>
          r.id === recipeParam.toLowerCase() ||
          r.title.toLowerCase().includes(recipeParam.toLowerCase())
      );
      if (found) setUrlRecipeModal(found);
    }

    // Check ?article=
    const articleParam = searchParams.get("article");
    if (articleParam) {
      const found = articlesData.find(
        (a) =>
          a.id === articleParam.toLowerCase() ||
          a.title.toLowerCase().includes(articleParam.toLowerCase())
      );
      if (found) setUrlArticleModal(found);
    }

    // Check ?section=
    const sectionParam = searchParams.get("section");
    if (sectionParam) {
      setActiveSection(sectionParam);
      const el = document.getElementById(sectionParam);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }
    }

    // Check ?dosha=
    const doshaParam = searchParams.get("dosha");
    if (doshaParam && ["vata", "pitta", "kapha"].includes(doshaParam.toLowerCase())) {
      setSelectedDoshaTab(doshaParam.toLowerCase());
    }
  }, [searchParams]);

  // Quick-Jump Navigation Handler
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handler to open Food Modal by exact, partial, plural, or multi-item name
  const handleSelectFoodByName = (foodName: string) => {
    const toSingular = (str: string) => {
      const trimmed = str.trim();
      if (trimmed.endsWith("ies")) return trimmed.slice(0, -3) + "y";
      if (trimmed.endsWith("es")) return trimmed.slice(0, -2);
      if (trimmed.endsWith("s") && !trimmed.endsWith("ss")) return trimmed.slice(0, -1);
      return trimmed;
    };

    const inputClean = foodName.split("(")[0].trim().toLowerCase();
    const inputSingular = toSingular(inputClean);
    const inputParts = foodName
      .toLowerCase()
      .split(/[,&/+]|\band\b/)
      .map((p) => p.split("(")[0].trim())
      .filter((p) => p.length > 1);

    const found = foodsData.find((f) => {
      const fNameLower = f.name.toLowerCase();
      const catClean = f.name.split("(")[0].trim().toLowerCase();
      const catSingular = toSingular(catClean);
      const hindi = f.hindiName.toLowerCase();
      const sanskrit = f.sanskritName.toLowerCase();

      // 1. Direct or reciprocal substring match on food name
      if (
        fNameLower.includes(inputClean) ||
        inputClean.includes(catClean) ||
        catClean.includes(inputClean)
      ) {
        return true;
      }

      // 2. Singular / Plural match
      if (
        inputSingular.length > 2 &&
        (catSingular.includes(inputSingular) ||
          inputSingular.includes(catSingular) ||
          catClean.includes(inputSingular) ||
          inputClean.includes(catSingular))
      ) {
        return true;
      }

      // 3. Multi-item parts match (e.g. "Dates & figs", "Soaked almonds")
      for (const part of inputParts) {
        const partSingular = toSingular(part);
        if (
          part.includes(catClean) ||
          catClean.includes(part) ||
          (partSingular.length > 2 &&
            (catSingular.includes(partSingular) || partSingular.includes(catSingular)))
        ) {
          return true;
        }
      }

      // 4. Hindi & Sanskrit match
      if (
        hindi.includes(inputClean) ||
        inputClean.includes(hindi) ||
        sanskrit.includes(inputClean) ||
        inputClean.includes(sanskrit)
      ) {
        return true;
      }

      return false;
    });

    if (found) {
      setUrlFoodModal(found);
    } else {
      // If not in specific catalog foods, filter the explorer
      setSearchQuery(inputClean);
      handleSectionClick("food-explorer");
    }
  };

  // Handler to open Recipe by ID
  const handleOpenRecipe = (recipeId: string) => {
    const found = recipesData.find((r) => r.id === recipeId);
    if (found) {
      setUrlRecipeModal(found);
    }
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Knowledge Hero with Personalization Banner & Quick Jumps */}
        <KnowledgeHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          userDosha={userDoshaInfo.dominantDosha}
          secondaryDosha={userDoshaInfo.secondaryDosha}
          hasAssessment={userDoshaInfo.hasAssessment}
          filterByPersonalized={filterByPersonalized}
          onTogglePersonalized={() => setFilterByPersonalized((prev) => !prev)}
          userName={displayName}
        />

        <div className="container mx-auto px-4 max-w-6xl space-y-20 mt-4">
          {/* Personalized Dosha Card (if assessed and personalized mode is on) */}
          {userDoshaInfo.hasAssessment && userDoshaInfo.dominantDosha && filterByPersonalized && (
            <PersonalizedDoshaCard
              dominantDosha={userDoshaInfo.dominantDosha}
              secondaryDosha={userDoshaInfo.secondaryDosha}
              vataPct={userDoshaInfo.vataScore}
              pittaPct={userDoshaInfo.pittaScore}
              kaphaPct={userDoshaInfo.kaphaScore}
              onExploreFoodGuide={(dosha) => {
                setSelectedDoshaTab(dosha);
                handleSectionClick("food-guides");
              }}
              onOpenRecipe={handleOpenRecipe}
            />
          )}

          {/* SECTION 1: AYURVEDIC FUNDAMENTALS */}
          <motion.section
            id="fundamentals"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="scroll-mt-24 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs mb-1.5">
                  Section 1 • Ancient Foundations
                </Badge>
                <h2 className="font-display text-2xl md:text-3xl text-foreground font-bold flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-secondary" />
                  Foundations of Ayurveda
                </h2>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Core philosophical pillars governing human balance, natural elements, and vitality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ayurvedaPrinciples.map((principle) => (
                <Card
                  key={principle.title}
                  className="border border-border/80 shadow-sm flex flex-col h-full"
                >
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3 text-secondary shadow-sm">
                      <principle.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-display leading-tight">
                      {principle.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 flex-1">
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
                          What it is
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">{principle.what}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
                          Why it matters
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">{principle.why}</p>
                      </div>
                      <div className="flex items-start gap-2 pt-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
                          In everyday life
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">{principle.everyday}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* SECTION 2: UNDERSTANDING THE THREE DOSHAS */}
          <motion.section
            id="doshas"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="scroll-mt-24 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs mb-1.5">
                  Section 2 • Constitutional Bio-Energies
                </Badge>
                <h2 className="font-display text-2xl md:text-3xl text-foreground font-bold flex items-center gap-2.5">
                  <LotusIcon className="w-7 h-7 text-secondary" />
                  Understanding the Three Doshas
                </h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                Vata, Pitta, and Kapha are the three doshas — natural body energies described in Ayurveda.
                A dosha is simply your unique blend of elements that shapes your digestion, mood, and energy.
                Learn what each one means, how to recognize balance, and which foods traditionally suit you.
              </p>
            </div>

            {/* Plain-language Dosha introduction */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  key: "vata",
                  name: "Vata",
                  elements: "Air & Space",
                  icon: Wind,
                  color: "text-sky-600 dark:text-sky-400",
                  bg: "bg-sky-500/10",
                  border: "border-sky-500/20",
                  plain: "The energy of movement — governs breathing, circulation, and the nervous system.",
                  sign: "When balanced: creative, energetic, and flexible.",
                },
                {
                  key: "pitta",
                  name: "Pitta",
                  elements: "Fire & Water",
                  icon: Flame,
                  color: "text-orange-600 dark:text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20",
                  plain: "The energy of transformation — governs digestion, metabolism, and body temperature.",
                  sign: "When balanced: sharp, focused, and confident.",
                },
                {
                  key: "kapha",
                  name: "Kapha",
                  elements: "Earth & Water",
                  icon: Mountain,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                  plain: "The energy of structure — governs strength, stability, and immunity.",
                  sign: "When balanced: calm, steady, and loving.",
                },
              ].map((d) => (
                <Card
                  key={d.key}
                  className={cn(
                    "border border-border/80 shadow-sm p-5 md:p-6 flex flex-col h-full",
                    d.border,
                    d.bg,
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.color} shadow-sm`}>
                      <d.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-display text-xl font-bold ${d.color} leading-tight`}>
                        {d.name} Dosha
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground">{d.elements}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                    {d.plain}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-auto">
                    {d.sign}
                  </p>
                </Card>
              ))}
            </div>

            <Tabs
              value={selectedDoshaTab}
              onValueChange={(val) => {
                hasInitializedTabRef.current = true;
                setSelectedDoshaTab(val);
              }}
              className="space-y-6"
            >
              <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/80 w-full sm:w-auto justify-start flex-wrap h-auto gap-1">
                {Object.entries(doshaDetails).map(([key, dosha]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="gap-2 px-5 py-2.5 rounded-xl text-xs font-medium data-[state=active]:bg-card transition-all"
                  >
                    <dosha.icon className="w-4 h-4" />
                    {dosha.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(doshaDetails).map(([key, dosha]) => (
                <TabsContent key={key} value={key} className="space-y-6 mt-4">
                  {/* Dosha Header Card: name, elements, simple explanation */}
                  <Card className={cn("overflow-hidden border border-border/80 shadow-sm", dosha.bgColor)}>
                    <div className={`h-2.5 bg-gradient-to-r ${dosha.color}`} />
                    <CardContent className="pt-6 pb-8">
                      <div className="flex items-start gap-6 md:gap-8 flex-wrap">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${dosha.color} flex items-center justify-center shadow-md shrink-0`}>
                          <dosha.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-display text-2xl md:text-3xl font-bold ${dosha.textColor} leading-tight`}>
                              {dosha.name} Dosha
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${dosha.textColor} border border-current/40`}>
                              {dosha.element}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {dosha.simpleDescription}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Traditional characteristics (Sanskrit + English) */}
                    <Card className="border border-border/80 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-display">
                          <BookOpen className="w-5 h-5 text-secondary" />
                          Traditional Characteristics
                        </CardTitle>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                          Sanskrit term → Plain meaning
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        {dosha.qualities.map((quality) => {
                          const [term, meaning] = quality.split(" (");
                          return (
                            <div key={term} className="flex items-start gap-2 text-sm leading-relaxed">
                              <span className="text-muted-foreground/70 shrink-0">{term}</span>
                              <span className="text-foreground">
                                → {meaning?.replace(")", "") || ""}
                              </span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* What balance looks like */}
                    <Card className="border border-border/80 shadow-sm bg-emerald-50/40 dark:bg-emerald-950/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <CardTitle className="text-base font-display">When Balanced</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <ul className="text-sm text-foreground/90 leading-relaxed space-y-2">
                          {dosha.characteristics.map((char, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                              <span>{char}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Signs of imbalance */}
                    <Card className="border border-border/80 shadow-sm bg-rose-50/40 dark:bg-rose-950/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                          <CardTitle className="text-base font-display">Signs of Imbalance</CardTitle>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mt-1">
                          Traditional Ayurvedic descriptions, not a medical diagnosis
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <ul className="text-sm text-foreground/90 leading-relaxed space-y-2">
                          {dosha.imbalanceSigns.map((sign, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="text-rose-500 shrink-0 mt-0.5">!</span>
                              <span>{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Balancing tips */}
                    <Card className="border border-border/80 shadow-sm bg-amber-50/40 dark:bg-amber-950/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <CardTitle className="text-base font-display">Everyday Balancing Tips</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <ul className="text-sm text-foreground/90 leading-relaxed space-y-2">
                          {dosha.balancingTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Foods to favor */}
                    <Card className="border border-border/80 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-secondary" />
                          <CardTitle className="text-base font-display">Foods to Favor</CardTitle>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                          Traditionally supportive choices
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex flex-wrap gap-2">
                          {dosha.bestFoods.map((food) => (
                            <button
                              key={food}
                              onClick={() => handleSelectFoodByName(food)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            >
                              {food}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Foods to moderate */}
                    <Card className="border border-border/80 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                          <CardTitle className="text-base font-display">Foods to Moderate</CardTitle>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                          Best enjoyed occasionally and in small portions
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex flex-wrap gap-2">
                          {dosha.avoidFoods.map((food) => (
                            <span key={food} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                              {food}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-4 rounded-xl border border-border/80 bg-muted/50 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                    <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <strong>Traditional perspective only. </strong>
                      These descriptions come from classical Ayurveda and are shared for educational purposes. They
                      are not a medical diagnosis and do not replace professional medical advice. If you have a health
                      condition or concern, consult a qualified healthcare practitioner.
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.section>

          {/* SECTION 3: DOSHA-SPECIFIC FOOD GUIDE (PHASE 2 - MOST IMPORTANT PART) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <DoshaFoodGuideSection
              initialDosha={userDoshaInfo.dominantDosha || "vata"}
              onSelectFoodByName={handleSelectFoodByName}
            />
          </motion.section>

          {/* SECTION 4: INDIVIDUAL FOOD ENCYCLOPEDIA & COMPARISON MATRIX (PHASE 3 & 4) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FoodExplorer
              initialSearch={searchQuery}
              initialDosha={userDoshaInfo.dominantDosha || undefined}
            />
          </motion.section>

          {/* SECTION 5: SIX TASTES (SHAD RASA) (PHASE 6) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SixTastesSection />
          </motion.section>

          {/* SECTION 6: AYURVEDIC RECIPES & MEAL IDEAS (PHASE 7) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <RecipeLibrarySection
              initialDosha={userDoshaInfo.dominantDosha || undefined}
              initialRecipeId={searchParams.get("recipe") || undefined}
            />
          </motion.section>

          {/* SECTION 7: HERBS AND SPICES ENCYCLOPEDIA (PHASE 6 & 8) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <HerbsSpicesSection />
          </motion.section>

          {/* SECTION 8: DIGESTION AND AGNI (PHASE 10) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AgniAndDigestionSection />
          </motion.section>

          {/* SECTION 9: SEASONAL RITUCHARYA (PHASE 9) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SeasonalRitucharyaSection />
          </motion.section>

          {/* SECTION 10: FOOD COMBINATIONS & VIRUDDHA AHARA (PHASE 11) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FoodCombinationsSection />
          </motion.section>

          {/* SECTION 11: ARTICLES LIBRARY (PHASE 8) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ArticlesLibrarySection
              initialArticleId={searchParams.get("article") || undefined}
            />
          </motion.section>

          {/* SECTION 12: FREQUENTLY ASKED QUESTIONS (PHASE 12) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <KnowledgeFaqSection />
          </motion.section>
        </div>
      </main>

      <Footer />

      {/* Direct modals opened via URL query parameters */}
      <FoodDetailModal
        food={urlFoodModal}
        isOpen={Boolean(urlFoodModal)}
        onClose={() => setUrlFoodModal(null)}
      />

      <RecipeDetailModal
        recipe={urlRecipeModal}
        isOpen={Boolean(urlRecipeModal)}
        onClose={() => setUrlRecipeModal(null)}
      />

      <ArticleReaderModal
        article={urlArticleModal}
        isOpen={Boolean(urlArticleModal)}
        onClose={() => setUrlArticleModal(null)}
      />
    </div>
  );
};

export default Knowledge;
