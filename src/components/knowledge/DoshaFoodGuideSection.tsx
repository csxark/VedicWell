import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wind, 
  Flame, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Leaf, 
  Utensils, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DoshaType, FoodItem } from "@/types/knowledge";
import { LotusIcon } from "@/components/icons/SacredIcons";

interface DoshaFoodGuideSectionProps {
  initialDosha?: DoshaType;
  onSelectFoodByName: (foodName: string) => void;
}

interface CategoryList {
  category: string;
  items: string[];
  description?: string;
}

const vataFoodGuide = {
  name: "Vata Dosha",
  element: "Air & Space (Ether)",
  icon: Wind,
  color: "from-sky-500 to-indigo-600",
  textColor: "text-sky-600 dark:text-sky-400",
  borderColor: "border-sky-500/30",
  bgColor: "bg-sky-500/10",
  dietaryEmphasis: "Warm, nourishing, moist, grounding, and appropriately cooked foods with healthy fats.",
  traditionalRationale: 
    "In classical Ayurveda (Charaka Samhita Sutrasthana 1/59), Vata is defined by the qualities of Ruksha (Dry), Sheeta (Cold), Laghu (Light), Sukshma (Subtle), Chala (Mobile), Vishada (Clear), and Khara (Rough). According to the foundational principle 'Sarvada Sarva Bhavanam Samanyam Vriddhi Karanam, Hrasa Hetur Visheshashcha' (Like increases like; opposites create balance), Vata is pacified by foods that provide opposing qualities: Ushna (Warm), Snigdha (Unctuous/Moist), Guru (Nourishing/Grounding), and Sthira (Stable). Therefore, warm soups, well-cooked grains, root vegetables, pure cow's ghee, and sweet grounding fruits directly anchor erratic Vata energy and prevent dry intestinal spasms.",
  categories: [
    {
      category: "Grains",
      items: ["Basmati rice", "White rice", "Oats (warm porridge)", "Whole wheat", "Quinoa (cooked with ghee)", "Amaranth"],
      description: "Grains should be cooked until soft and moist, prepared with ghee or healthy oils.",
    },
    {
      category: "Vegetables",
      items: ["Carrots", "Sweet potatoes", "Yellow pumpkin", "Beetroot", "Zucchini", "Bottle gourd (Lauki)", "Green beans", "Asparagus", "Cooked spinach"],
      description: "Root vegetables and gourds are supreme. Must be cooked and well-seasoned; avoid raw cold salads.",
    },
    {
      category: "Fruits",
      items: ["Ripe bananas", "Sweet mangoes", "Papaya", "Sweet grapes / raisins (soaked)", "Dates", "Fresh figs", "Stewed apples", "Sweet pears", "Ripe peaches"],
      description: "Favor naturally sweet, ripe, heavy fruits. Crisp raw apples or unripe fruits increase Vata gas.",
    },
    {
      category: "Legumes",
      items: ["Yellow moong dal (split & skinned)", "Green whole moong (well-cooked)", "Red lentils (masoor)", "Well-cooked urad dal in appropriate portions"],
      description: "Split yellow moong dal is the safest pulse. Always cook with cumin, ginger, and asafoetida (hing) to prevent flatulence.",
    },
    {
      category: "Dairy",
      items: ["Warm cow's milk (boiled with cardamom)", "Pure cow's ghee", "Fresh paneer", "Fresh buttermilk (Takra) / Fresh yogurt in suitable preparations"],
      description: "Dairy should be consumed warm and spiced. Cold milk straight from the fridge aggravates Vata.",
    },
    {
      category: "Nuts and Seeds",
      items: ["Soaked & peeled almonds", "Walnuts", "Sesame seeds", "Pumpkin seeds", "Cashews in moderate quantities"],
      description: "Always soak nuts in water overnight and peel skins to optimize digestive assimilation.",
    },
    {
      category: "Oils",
      items: ["Unrefined sesame oil (king of oils for Vata)", "Pure cow's ghee", "Cold-pressed olive oil"],
      description: "Generous use of healthy unctuous fats lubricates the dry colon and calms nervous tension.",
    },
    {
      category: "Herbs and Spices",
      items: ["Fresh ginger", "Cumin", "Fennel", "Cardamom", "Ceylon cinnamon", "Turmeric", "Ajwain (carom seeds)", "Asafoetida (hing)"],
      description: "Gentle warming and carminative spices dispel intestinal colic and kindle digestive fire.",
    },
  ] as CategoryList[],
  moderatedFoods: [
    "Excessively dry snacks: popcorn, dry crackers, puffed rice",
    "Very cold beverages, iced water, and frozen desserts",
    "Large raw salads and raw cruciferous vegetables (raw broccoli, raw kale)",
    "Excessively bitter foods and unbuffered astringent tastes",
    "Very spicy preparations with hot red chilies",
    "Excessive caffeine and carbonated sodas",
  ],
};

const pittaFoodGuide = {
  name: "Pitta Dosha",
  element: "Fire & Water",
  icon: Flame,
  color: "from-orange-500 to-amber-600",
  textColor: "text-orange-600 dark:text-orange-400",
  borderColor: "border-orange-500/30",
  bgColor: "bg-orange-500/10",
  dietaryEmphasis: "Cooling, refreshing, moderately nourishing, and less intensely spiced foods with sweet, bitter, and astringent tastes.",
  traditionalRationale:
    "In classical Ayurveda, Pitta possesses qualities that are Sasneha (Slightly oily), Tikshna (Sharp/Penetrating), Ushna (Hot), Laghu (Light), Visra (Fleshy odor), Sara (Flowing/Spreading), and Drava (Liquid). Pitta governs digestion, gastric acid, bile, enzymes, liver metabolism, and body temperature. Foods that are inherently hot (Ushna), sharp (Tikshna), sour (Amla), salty (Lavana), or excessively pungent (Katu) inflame Pitta, leading to acid reflux, heartburn, skin eruptions, and irritability. To maintain harmony, Pitta requires foods with Sheeta (Cooling) potency, Madhura (Sweet), Tikta (Bitter), and Kashaya (Astringent) tastes, such as cucumbers, coconut, sweet grains, and soothing ghee.",
  categories: [
    {
      category: "Grains",
      items: ["Basmati rice", "Barley (Yava)", "Oats", "Whole wheat", "Quinoa", "Amaranth"],
      description: "Cooling and sweet grains provide sustained fuel without generating internal metabolic heat.",
    },
    {
      category: "Vegetables",
      items: ["Cucumber", "Bottle gourd (Lauki)", "Ash gourd (Kushmanda)", "Zucchini", "Pumpkin", "Bitter gourd (Karela)", "Green beans", "Asparagus", "Leafy greens", "Okra (Bhindi)", "Broccoli"],
      description: "Bitter and sweet vegetables cool the liver and extinguish gastric fire.",
    },
    {
      category: "Fruits",
      items: ["Sweet grapes", "Sweet pears", "Sweet apples", "Pomegranate (Dadima)", "Ripe mango in moderation", "Sweet melons", "Ripe papaya", "Fresh coconut", "Sweet berries"],
      description: "Pomegranate and coconut are premier Pitta pacifiers. Avoid unripe sour fruits.",
    },
    {
      category: "Legumes",
      items: ["Green whole moong", "Yellow moong dal", "Chickpeas in suitable mild preparations", "Red lentils"],
      description: "Legumes naturally offer cooling, astringent qualities that absorb excess bile and heat.",
    },
    {
      category: "Dairy",
      items: ["Cow's milk (where tolerated, cooled)", "Pure cow's ghee", "Fresh sweet paneer", "Unsweetened churned buttermilk (Takra) in suitable preparations"],
      description: "Ghee is the ultimate antidote to Pitta inflammation; avoid sour aged cheeses and sour curd.",
    },
    {
      category: "Nuts and Seeds",
      items: ["Fresh coconut & coconut flakes", "Sunflower seeds", "Pumpkin seeds", "Soaked & peeled almonds in moderation"],
      description: "Seeds are cooler and lighter than heavy tree nuts for Pitta.",
    },
    {
      category: "Oils",
      items: ["Cold-pressed coconut oil", "Sunflower oil", "Pure cow's ghee"],
      description: "Coconut oil and ghee are cooling to bodily tissues and do not produce acid reflux.",
    },
    {
      category: "Herbs and Spices",
      items: ["Coriander (seeds & cilantro)", "Fennel seeds", "Fresh mint leaves", "Green cardamom", "Turmeric in appropriate quantities", "Fresh cilantro", "Mild roasted cumin"],
      description: "Aromatic cooling spices support digestive enzyme flow without burning the stomach lining.",
    },
  ] as CategoryList[],
  moderatedFoods: [
    "Excessively spicy curries with cayenne, habanero, or green/red chilies",
    "Very sour pickles, vinegar, and fermented hot sauces",
    "Excessively salty snacks and cured meats",
    "Deep-fried foods and rancid oils",
    "Excessively fermented foods and aged cheeses",
    "Excessive raw garlic, raw onions, and mustard seeds",
    "Hard alcohol, red wine, and excessive black coffee",
  ],
};

const kaphaFoodGuide = {
  name: "Kapha Dosha",
  element: "Earth & Water",
  icon: Mountain,
  color: "from-emerald-600 to-teal-700",
  textColor: "text-emerald-600 dark:text-emerald-400",
  borderColor: "border-emerald-500/30",
  bgColor: "bg-emerald-500/10",
  dietaryEmphasis: "Lighter, warm, varied, appropriately dry, and moderately spiced foods with pungent, bitter, and astringent tastes.",
  traditionalRationale:
    "In classical Ayurveda, Kapha is characterized by the qualities of Guru (Heavy), Sheeta (Cold), Mridu (Soft), Snigdha (Unctuous/Oily), Manda (Slow), Sandra (Dense), and Sthira (Static). Kapha governs bodily structure, mucosal membranes, synovial lubrication, and lymphatic fluids. When an individual consumes heavy, oily, cold, sweet, and dairy-rich foods, Kapha increases rapidly, manifesting as sinus congestion, lethargy, fluid retention, weight gain, and sluggish digestive fire (Manda Agni). Kapha is restored to balance by foods that provide opposing qualities: Laghu (Light), Ushna (Warm), Ruksha (Dry), and Tikshna (Sharp/Stimulating), accented by warming spices like ginger, black pepper, and mustard.",
  categories: [
    {
      category: "Grains",
      items: ["Barley (Yava - supreme)", "Foxtail millet", "Pearl millet (Bajra)", "Buckwheat (Kuttu)", "Quinoa", "Corn", "Smaller portions of aged basmati rice"],
      description: "Dry, light, scraping grains (Lekhana) prevent fluid retention and burn through sluggishness.",
    },
    {
      category: "Vegetables",
      items: ["Bitter gourd (Karela)", "Bottle gourd", "Cabbage", "Cauliflower", "Broccoli", "White radish (Mooli)", "Spinach", "Fenugreek leaves (Methi)", "Green beans", "Asparagus", "Okra", "Cooked carrots"],
      description: "Pungent and bitter vegetables kindle digestive fire and reduce mucus production.",
    },
    {
      category: "Fruits",
      items: ["Apples", "Pears", "Pomegranate (Dadima)", "Berries (amla, cranberries)", "Papaya", "Guava", "Grapefruit where locally available"],
      description: "Favor astringent and light fruits. Avoid heavy, dense, juicy fruits like bananas or sweet figs.",
    },
    {
      category: "Legumes",
      items: ["Green whole moong", "Chickpeas (Chana)", "Lentils (Masoor)", "Toor dal (Arhar)", "Other appropriately prepared legumes"],
      description: "Legumes' dry and astringent properties are tailor-made for drying out excess Kapha dampness.",
    },
    {
      category: "Dairy",
      items: ["Moderate quantities of light goat milk", "Spiced, churned buttermilk (Takra)", "Avoid heavy rich dairy as universally appropriate"],
      description: "Dairy is naturally heavy and mucus-forming; keep portions small and always temper with ginger.",
    },
    {
      category: "Nuts and Seeds",
      items: ["Pumpkin seeds", "Sunflower seeds", "Flaxseeds (Alsi)", "Smaller portions of soaked nuts"],
      description: "Light seeds are superior to heavy oily tree nuts for Kapha metabolism.",
    },
    {
      category: "Oils",
      items: ["Mustard oil (Sarshapa Taila)", "Small amounts of sesame oil"],
      description: "Use minimal cooking oils; mustard oil has heating, pungent qualities that dissolve fat.",
    },
    {
      category: "Herbs and Spices",
      items: ["Fresh & dry ginger", "Black pepper (Maricha)", "Turmeric", "Ceylon cinnamon", "Fenugreek seeds (Methi)", "Mustard seeds", "Cumin", "Ajwain", "Garlic (Lashuna)"],
      description: "Generous use of warming, pungent spices ignites sluggish metabolism and clears respiratory passages.",
    },
  ] as CategoryList[],
  moderatedFoods: [
    "Heavy deep-fried foods and greasy preparations",
    "Excessively oily meals and rich restaurant sauces",
    "Large quantities of sweets, pastries, and refined sugar",
    "Heavy dairy preparations: ice cream, thick cream, cold cow's milk, dense paneer",
    "Excessively cold foods, iced drinks, and frozen desserts",
    "Very large late-night meals (after 7:30 PM)",
    "Excessive refined carbohydrates, white flour (maida), and pasta",
  ],
};

export const DoshaFoodGuideSection: React.FC<DoshaFoodGuideSectionProps> = ({
  initialDosha = "vata",
  onSelectFoodByName,
}) => {
  const [selectedDosha, setSelectedDosha] = useState<DoshaType>(initialDosha);

  useEffect(() => {
    if (initialDosha) {
      setSelectedDosha(initialDosha);
    }
  }, [initialDosha]);

  const getGuide = (dosha: DoshaType) => {
    switch (dosha) {
      case "pitta":
        return pittaFoodGuide;
      case "kapha":
        return kaphaFoodGuide;
      case "vata":
      default:
        return vataFoodGuide;
    }
  };

  const currentGuide = getGuide(selectedDosha);

  return (
    <div id="food-guides" className="scroll-mt-24 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs">
          Dietary Wisdom by Constitution
        </Badge>
        <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
          Dosha-Specific Food Recommendation Library
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Comprehensive, ingredient-by-ingredient dietary wisdom for Vata, Pitta, and Kapha. 
          Discover specific grains, legumes, vegetables, fruits, dairy, and spices backed by classical Samhita rationales.
        </p>
      </div>

      {/* Dosha Selector Tabs */}
      <Tabs
        value={selectedDosha}
        onValueChange={(val) => setSelectedDosha(val as DoshaType)}
        className="w-full space-y-6"
      >
        <div className="flex justify-center">
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/80 h-auto gap-1">
            <TabsTrigger
              value="vata"
              className="gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all"
            >
              <Wind className="w-4 h-4" />
              Vata Food Guide
            </TabsTrigger>
            <TabsTrigger
              value="pitta"
              className="gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all"
            >
              <Flame className="w-4 h-4" />
              Pitta Food Guide
            </TabsTrigger>
            <TabsTrigger
              value="kapha"
              className="gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
            >
              <Mountain className="w-4 h-4" />
              Kapha Food Guide
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Display */}
        <TabsContent value={selectedDosha} className="space-y-6 mt-4">
          {/* Header Card */}
          <Card className={`overflow-hidden border ${currentGuide.borderColor} shadow-sm backdrop-blur`}>
            <div className={`h-2.5 bg-gradient-to-r ${currentGuide.color}`} />
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentGuide.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <currentGuide.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl md:text-3xl text-foreground">
                      {currentGuide.name} Food Guide
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                      {currentGuide.element} | Traditional Dietary Emphasis: {currentGuide.dietaryEmphasis}
                    </CardDescription>
                  </div>
                </div>
                <LotusIcon className="w-12 h-12 text-secondary/30 hidden md:block" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Classical Rationale Box */}
              <div className={`p-4 md:p-5 rounded-xl border ${currentGuide.borderColor} ${currentGuide.bgColor} space-y-2`}>
                <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  Classical Ayurvedic Rationale (Why These Foods Work)
                </h4>
                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {currentGuide.traditionalRationale}
                </p>
              </div>

              {/* Categorized Food Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentGuide.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-card border border-border/80 shadow-xs hover:border-secondary/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-secondary" />
                          {cat.category}
                        </h5>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {cat.items.length} items
                        </Badge>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-muted-foreground italic mb-3">
                          {cat.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((item, iIdx) => (
                          <button
                            key={iIdx}
                            onClick={() => onSelectFoodByName(item)}
                            className="px-2 py-1 rounded-md text-xs bg-muted/50 hover:bg-secondary/15 hover:text-secondary text-foreground/80 transition-colors border border-border/40 text-left flex items-center gap-1 group"
                          >
                            <span>{item}</span>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-secondary transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Foods Traditionally Moderated Card */}
              <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Foods Traditionally Moderated or Avoided for {currentGuide.name}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  {currentGuide.moderatedFoods.map((modItem, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{modItem}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mandatory Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
        <div>
          <strong>Educational Notice & Context: </strong>
          These food lists represent starting points synthesized from classical Ayurvedic dietary texts 
          (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya). They are educational descriptions of traditional 
          qualities and should not be treated as universally rigid medical or clinical nutritional prescriptions. 
          Individual tolerances, seasonal climates, and medical conditions must always be respected.
        </div>
      </div>
    </div>
  );
};

