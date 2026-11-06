import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Wind, Flame, Mountain, Leaf, Heart, 
  Brain, Moon, Sun, Droplets, ChevronDown, ChevronUp,
  Sparkles, Compass, Utensils, CheckCircle2, AlertTriangle
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
    content: "Originating in India over 5,000 years ago, Ayurveda ('Ayu' = life, 'Veda' = science) views health as dynamic harmony between mind, body, senses, and environment, rather than mere symptom management.",
  },
  {
    title: "The Five Elements (Pancha Mahabhutas)",
    icon: Leaf,
    content: "Everything in the universe is composed of Space (Akasha), Air (Vayu), Fire (Tejas), Water (Jala), and Earth (Prithvi). These elemental building blocks pair to construct the three doshas.",
  },
  {
    title: "Mind-Body Nexus",
    icon: Brain,
    content: "Ayurveda recognizes mental stress and emotional toxins (Manasika Ama) as direct root causes of physical illness, treating psychological and somatic health as inseparable.",
  },
  {
    title: "Circadian Rhythms (Dinacharya)",
    icon: Sun,
    content: "Nature operates in 4-hour doshic waves: Kapha (6-10), Pitta (10-2), and Vata (2-6). Syncing meals, workouts, and sleep to this biological clock optimizes metabolic efficiency.",
  },
  {
    title: "Digestive Fire (Agni)",
    icon: Flame,
    content: "Central to Ayurveda is Agni, the biological fire governing digestion, enzymatic breakdown, and cellular assimilation. Weak Agni leads to toxic intermediate waste (Ama).",
  },
  {
    title: "Seasonal Routines (Ritucharya)",
    icon: Moon,
    content: "Adapting nutrition and daily habits across the six Indian seasons prevents seasonal doshic aggravation and preserves immune vitality (Ojas) throughout the year.",
  },
];

const Knowledge = () => {
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();

  // Assessment & Personalization State
  const [latestAssessment, setLatestAssessment] = useState<UserDoshaRecord | null>(null);
  const [guestCache, setGuestCache] = useState<GuestDoshaCache | null>(null);
  const [isCheckingAssessment, setIsCheckingAssessment] = useState(true);
  const [filterByPersonalized, setFilterByPersonalized] = useState(true);

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

    // Read local guest cache as an immediate baseline
    const guest = readGuestCache();
    if (isCurrent && guest) {
      setGuestCache(guest);
    }

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
      if (latestAssessment?.dominantDosha) {
        return {
          hasAssessment: true,
          dominantDosha: latestAssessment.dominantDosha as DoshaType,
          secondaryDosha: latestAssessment.secondaryDosha || null,
          vataScore: latestAssessment.vataScore,
          pittaScore: latestAssessment.pittaScore,
          kaphaScore: latestAssessment.kaphaScore,
        };
      }
      if (profile?.dominant_dosha) {
        return {
          hasAssessment: true,
          dominantDosha: profile.dominant_dosha.toLowerCase() as DoshaType,
          secondaryDosha: null,
          vataScore: profile.vata_percentage,
          pittaScore: profile.pitta_percentage,
          kaphaScore: profile.kapha_percentage,
        };
      }
      if (guestCache) {
        return {
          hasAssessment: true,
          dominantDosha: guestCache.primaryDosha as DoshaType,
          secondaryDosha: guestCache.secondaryDosha || null,
          vataScore: guestCache.vataScore,
          pittaScore: guestCache.pittaScore,
          kaphaScore: guestCache.kaphaScore,
        };
      }
    } else if (guestCache) {
      return {
        hasAssessment: true,
        dominantDosha: guestCache.primaryDosha as DoshaType,
        secondaryDosha: guestCache.secondaryDosha || null,
        vataScore: guestCache.vataScore,
        pittaScore: guestCache.pittaScore,
        kaphaScore: guestCache.kaphaScore,
      };
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

  // Set default dosha tab when personalization loads
  useEffect(() => {
    if (userDoshaInfo.hasAssessment && userDoshaInfo.dominantDosha && filterByPersonalized) {
      setSelectedDoshaTab(userDoshaInfo.dominantDosha);
    }
  }, [userDoshaInfo, filterByPersonalized]);

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

  // Handler to open Food Modal by exact or partial name
  const handleSelectFoodByName = (foodName: string) => {
    const cleanName = foodName.split("(")[0].trim().toLowerCase();
    const found = foodsData.find(
      (f) =>
        f.name.toLowerCase().includes(cleanName) ||
        f.hindiName.toLowerCase().includes(cleanName) ||
        f.sanskritName.toLowerCase().includes(cleanName)
    );
    if (found) {
      setUrlFoodModal(found);
    } else {
      // If not in specific 40 foods, filter the explorer
      setSearchQuery(cleanName);
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ayurvedaPrinciples.map((principle, index) => (
                <Card key={principle.title} className="glass-card hover:shadow-lg transition-all border border-border/80 flex flex-col justify-between">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-2 shadow-sm text-white">
                      <principle.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-display">{principle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                      {principle.content}
                    </p>
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
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Explore the traits, imbalance signs, balancing tips, and essential foods for Vata, Pitta, and Kapha.
              </p>
            </div>

            <Tabs value={selectedDoshaTab} onValueChange={setSelectedDoshaTab} className="space-y-6">
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
                  {/* Dosha Header Card */}
                  <Card className={cn("overflow-hidden border border-border/80 shadow-sm", dosha.bgColor)}>
                    <div className={`h-2.5 bg-gradient-to-r ${dosha.color}`} />
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${dosha.color} flex items-center justify-center shadow-md shrink-0`}>
                          <dosha.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div className="space-y-1">
                          <h3 className={`font-display text-2xl md:text-3xl font-bold ${dosha.textColor}`}>
                            {dosha.name} Dosha
                          </h3>
                          <p className="text-muted-foreground text-sm font-medium">{dosha.element}</p>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {dosha.qualities.map((quality) => (
                              <span
                                key={quality}
                                className="px-2.5 py-1 rounded-lg text-xs bg-card/90 text-foreground border border-border/60 shadow-2xs"
                              >
                                {quality}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Characteristics */}
                    <Card className="glass-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-display">
                          <Heart className="w-5 h-5 text-secondary" />
                          Key Characteristics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-xs md:text-sm">
                          {dosha.characteristics.map((char, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-muted-foreground">
                              <Leaf className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{char}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Imbalance Signs */}
                    <Card className="glass-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-display">
                          <Droplets className="w-5 h-5 text-secondary" />
                          Signs of Imbalance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-xs md:text-sm">
                          {dosha.imbalanceSigns.map((sign, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-muted-foreground">
                              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Balancing Tips */}
                    <Card className="glass-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-display">
                          <Sun className="w-5 h-5 text-secondary" />
                          Balancing Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-xs md:text-sm">
                          {dosha.balancingTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Quick Food Snapshot */}
                    <Card className="glass-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-display">
                          <Utensils className="w-5 h-5 text-secondary" />
                          Dietary Guidance Snapshot
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-xs">
                        <div>
                          <p className="font-semibold text-foreground mb-1.5">Top Foods to Favor:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {dosha.bestFoods.map((food) => (
                              <button
                                key={food}
                                onClick={() => handleSelectFoodByName(food)}
                                className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                              >
                                {food}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1.5">Foods to Moderate:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {dosha.avoidFoods.map((food) => (
                              <span
                                key={food}
                                className="px-2.5 py-1 rounded-md text-xs bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                              >
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
            <ArticlesLibrarySection />
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
