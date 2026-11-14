import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Utensils, 
  Clock, 
  Users, 
  Sparkles, 
  Wind, 
  Flame, 
  Mountain, 
  ArrowRight,
  Filter 
} from "lucide-react";
import { recipesData } from "@/data/knowledge/recipesData";
import { Recipe, DoshaType } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecipeDetailModal } from "./RecipeDetailModal";

interface RecipeLibrarySectionProps {
  initialDosha?: DoshaType;
  initialRecipeId?: string;
}

export const RecipeLibrarySection: React.FC<RecipeLibrarySectionProps> = ({
  initialDosha,
  initialRecipeId,
}) => {
  const [selectedDosha, setSelectedDosha] = useState<string>(initialDosha || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(() => {
    if (initialRecipeId) {
      return recipesData.find((r) => r.id === initialRecipeId) || null;
    }
    return null;
  });

  useEffect(() => {
    setSelectedDosha(initialDosha || "all");
  }, [initialDosha]);

  useEffect(() => {
    if (initialRecipeId) {
      const found = recipesData.find((r) => r.id === initialRecipeId);
      if (found) {
        setActiveRecipe(found);
      }
    }
  }, [initialRecipeId]);

  const filteredRecipes = useMemo(() => {
    return recipesData.filter((recipe) => {
      if (selectedDosha !== "all") {
        if (recipe.targetDosha !== selectedDosha && recipe.targetDosha !== "tridoshic") {
          return false;
        }
      }
      if (selectedCategory !== "all" && recipe.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [selectedDosha, selectedCategory]);

  const getDoshaBadge = (target: string) => {
    switch (target) {
      case "vata":
        return (
          <Badge className="bg-sky-500/10 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300 border border-sky-500/20 dark:border-sky-700/30 gap-1 text-xs">
            <Wind className="w-3 h-3" /> Vata
          </Badge>
        );
      case "pitta":
        return (
          <Badge className="bg-orange-500/10 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 border border-orange-500/20 dark:border-orange-800/30 gap-1 text-xs">
            <Flame className="w-3 h-3" /> Pitta
          </Badge>
        );
      case "kapha":
        return (
          <Badge className="bg-emerald-500/10 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-800/30 gap-1 text-xs">
            <Mountain className="w-3 h-3" /> Kapha
          </Badge>
        );
      case "tridoshic":
      default:
        return (
          <Badge className="bg-amber-500/10 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 border border-amber-500/20 dark:border-amber-800/30 gap-1 text-xs">
            <Sparkles className="w-3 h-3" /> Tridoshic
          </Badge>
        );
    }
  };

  return (
    <div id="recipes" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs mb-2">
            Ayurvedic Kitchen
          </Badge>
          <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
            Ayurvedic Recipe Collection & Meal Ideas
          </h2>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">
            Practical Indian dishes designed according to Ayurvedic dietary wisdom. 
            Filtered by constitution, meal time, and doshic purpose.
          </p>
        </div>

        {/* Dosha Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start md:self-auto">
          {["all", "vata", "pitta", "kapha", "tridoshic"].map((d) => (
            <Button
              key={d}
              variant={selectedDosha === d ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedDosha(d)}
              className="text-xs capitalize h-8 px-3"
            >
              {d === "all" ? "All Recipes" : d}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className="h-full flex flex-col justify-between hover:border-secondary/50 hover:shadow-md transition-all group bg-card overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    {recipe.category}
                  </Badge>
                  {getDoshaBadge(recipe.targetDosha)}
                </div>
                <CardTitle className="font-display text-xl text-foreground group-hover:text-secondary transition-colors">
                  {recipe.title}
                </CardTitle>
                {recipe.sanskritTitle && (
                  <CardDescription className="text-xs text-muted-foreground font-serif italic">
                    {recipe.sanskritTitle}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {recipe.summary}
                </p>

                {/* Timing & Servings Info */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground py-2 border-y border-border/60">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>{recipe.prepTime} prep + {recipe.cookTime} cook</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-secondary" />
                    <span>{recipe.servings}</span>
                  </div>
                </div>

                {/* Dietary Tags Preview */}
                <div className="flex flex-wrap gap-1">
                  {recipe.dietaryTags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveRecipe(recipe)}
                  className="w-full text-xs gap-1.5 border-secondary/30 hover:bg-secondary hover:text-white transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  View Step-by-Step Recipe
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recipe Modal */}
      <RecipeDetailModal
        recipe={activeRecipe}
        isOpen={Boolean(activeRecipe)}
        onClose={() => setActiveRecipe(null)}
      />
    </div>
  );
};

