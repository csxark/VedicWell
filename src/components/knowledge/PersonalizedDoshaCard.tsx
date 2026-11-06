import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Wind, 
  Flame, 
  Mountain, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Utensils,
  BookOpen
} from "lucide-react";
import { DoshaType } from "@/types/knowledge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PersonalizedDoshaCardProps {
  dominantDosha: DoshaType;
  secondaryDosha?: string | null;
  vataPct?: number;
  pittaPct?: number;
  kaphaPct?: number;
  onExploreFoodGuide: (dosha: DoshaType) => void;
  onOpenRecipe: (recipeId: string) => void;
}

const personalizedSummaries = {
  vata: {
    title: "Vata Balancing Blueprint",
    tagline: "Air & Space — Favor Warmth, Moisture & Grounding Nourishment",
    icon: Wind,
    color: "from-sky-500 to-indigo-600",
    textColor: "text-sky-600 dark:text-sky-400",
    bgTint: "bg-sky-500/10 border-sky-500/30",
    favoredFoods: ["Basmati rice", "Sweet potatoes", "Ghee", "Warm moong dal", "Sesame oil", "Cooked carrots"],
    foodsToModerate: ["Raw salads", "Iced drinks", "Dry crackers", "Excessive caffeine"],
    suggestedRecipeId: "vata-moong-khichdi",
    suggestedRecipeTitle: "Grounding Moong Dal Khichdi with Ghee",
    quickGuidance: "Because your dominant dosha is Vata, your biological tendency leans toward lightness, dryness, and coldness. Prioritize freshly cooked, warm, soupy meals with generous unctuous fats to ground your nervous system.",
  },
  pitta: {
    title: "Pitta Balancing Blueprint",
    tagline: "Fire & Water — Favor Cooling, Refreshing & Moderately Spiced Foods",
    icon: Flame,
    color: "from-orange-500 to-amber-600",
    textColor: "text-orange-600 dark:text-orange-400",
    bgTint: "bg-orange-500/10 border-orange-500/30",
    favoredFoods: ["Cucumber", "Coconut", "Sweet apples", "Bottle gourd (Lauki)", "Ghee", "Basmati rice"],
    foodsToModerate: ["Chilies & hot peppers", "Sour pickles", "Deep-fried foods", "Excessive alcohol"],
    suggestedRecipeId: "pitta-cooling-khichdi",
    suggestedRecipeTitle: "Cooling Cilantro & Coconut Khichdi",
    quickGuidance: "Because your dominant dosha is Pitta, your biological fire burns hot and sharp. Soothe internal heat and prevent acidity by enjoying cooling sweet grains, refreshing gourds, sweet fruits, and mild aromatic spices like coriander and fennel.",
  },
  kapha: {
    title: "Kapha Balancing Blueprint",
    tagline: "Earth & Water — Favor Light, Warm, Stimulating & Dry Foods",
    icon: Mountain,
    color: "from-emerald-600 to-teal-700",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgTint: "bg-emerald-500/10 border-emerald-500/30",
    favoredFoods: ["Barley (Yava)", "Foxtail millet", "Ginger", "Bitter gourd", "Yellow moong dal", "Mustard seeds"],
    foodsToModerate: ["Heavy cold dairy", "Deep-fried snacks", "Excess sweets", "Late night dinners"],
    suggestedRecipeId: "kapha-millet-khichdi",
    suggestedRecipeTitle: "Vegetable Millet Khichdi with Mustard Seeds",
    quickGuidance: "Because your dominant dosha is Kapha, your biological nature is naturally stable, heavy, and moist. Kindle your digestive fire with light grains, abundant warming spices, bitter greens, and lighter dinner portions before sunset.",
  },
};

export const PersonalizedDoshaCard: React.FC<PersonalizedDoshaCardProps> = ({
  dominantDosha,
  secondaryDosha,
  vataPct,
  pittaPct,
  kaphaPct,
  onExploreFoodGuide,
  onOpenRecipe,
}) => {
  const summary = personalizedSummaries[dominantDosha] || personalizedSummaries.vata;
  const DoshaIcon = summary.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <Card className={`overflow-hidden border ${summary.bgTint} shadow-sm backdrop-blur relative`}>
        <div className={`h-2 bg-gradient-to-r ${summary.color}`} />
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-secondary text-white text-xs gap-1">
                  <Sparkles className="w-3 h-3" /> Personalized Assessment Match
                </Badge>
                {secondaryDosha && (
                  <Badge variant="outline" className="text-xs">
                    Dual Constitution: {dominantDosha.toUpperCase()}-{secondaryDosha.toUpperCase()}
                  </Badge>
                )}
                {typeof vataPct === "number" && typeof pittaPct === "number" && typeof kaphaPct === "number" && (
                  <span className="text-xs text-muted-foreground font-mono">
                    (V: {vataPct}% | P: {pittaPct}% | K: {kaphaPct}%)
                  </span>
                )}
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl bg-card border flex items-center justify-center shrink-0 ${summary.textColor}`}>
                  <DoshaIcon className="w-5 h-5" />
                </div>
                {summary.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                {summary.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                onClick={() => onExploreFoodGuide(dominantDosha)}
                className="bg-secondary hover:bg-secondary/90 text-white text-xs gap-1.5"
              >
                <Utensils className="w-3.5 h-3.5" />
                Open {dominantDosha.toUpperCase()} Food Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenRecipe(summary.suggestedRecipeId)}
                className="text-xs gap-1.5 border-border"
              >
                <BookOpen className="w-3.5 h-3.5 text-secondary" />
                View Suggested Recipe
              </Button>
            </div>
          </div>

          <p className="text-xs md:text-sm text-foreground/90 leading-relaxed bg-background/60 p-4 rounded-xl border border-border/60">
            {summary.quickGuidance}
          </p>

          {/* Quick Favored & Moderated Chips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/25">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Top Ingredients to Favor for You:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {summary.favoredFoods.map((f, i) => (
                  <Badge key={i} variant="outline" className="bg-background/80 text-foreground border-emerald-500/30 text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/25">
              <span className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Ingredients to Moderate for You:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {summary.foodsToModerate.map((f, i) => (
                  <Badge key={i} variant="outline" className="bg-background/80 text-foreground border-rose-500/30 text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

