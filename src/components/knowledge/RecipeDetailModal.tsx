import React from "react";
import { Recipe } from "@/types/knowledge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  Users, 
  Sparkles, 
  Utensils, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Flame, 
  Wind, 
  Mountain 
} from "lucide-react";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose,
}) => {
  if (!recipe) return null;

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case "vata":
        return <Wind className="w-4 h-4 text-sky-400" />;
      case "pitta":
        return <Flame className="w-4 h-4 text-orange-400" />;
      case "kapha":
        return <Mountain className="w-4 h-4 text-emerald-400" />;
      case "tridoshic":
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/knowledge?recipe=${recipe.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Recipe link copied to clipboard!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-background border-border">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-forest to-amber-900 text-white p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="border-white/30 text-white bg-white/10 uppercase tracking-wider text-xs">
                  {recipe.category}
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-300/30 gap-1.5 capitalize text-xs">
                  {getDoshaIcon(recipe.targetDosha)}
                  {recipe.targetDosha === "tridoshic" ? "Tridosha Balancing" : `${recipe.targetDosha} Balancing`}
                </Badge>
              </div>
              <DialogTitle className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                {recipe.title}
              </DialogTitle>
              {recipe.sanskritTitle && (
                <DialogDescription className="text-emerald-100 font-serif italic text-sm">
                  {recipe.sanskritTitle}
                </DialogDescription>
              )}
            </div>
            <LotusIcon className="w-16 h-16 text-white/20 shrink-0 hidden sm:block" />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/20 text-xs text-white/90">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary" />
              <span>Prep: {recipe.prepTime} | Cook: {recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-secondary" />
              <span>Servings: {recipe.servings}</span>
            </div>
            {recipe.recommendedSeason && (
              <div className="flex items-center gap-1.5 text-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Season: {recipe.recommendedSeason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Recipe Body */}
        <ScrollArea className="max-h-[calc(90vh-160px)] p-6">
          <div className="space-y-6">
            {/* Summary */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recipe.summary}
            </p>

            {/* Ayurvedic Rationale Box */}
            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-xs md:text-sm text-foreground space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-secondary">
                <Sparkles className="w-4 h-4" />
                Ayurvedic Nutritional Rationale
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {recipe.ayurvedicRationale}
              </p>
            </div>

            {/* Ingredients & Quantities */}
            <div>
              <h4 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-secondary" />
                Ingredients & Doshic Purpose
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-card border border-border flex items-start justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{ing.name}</span>
                      {ing.purpose && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ing.purpose}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs font-mono">
                      {ing.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Step-by-Step Instructions */}
            <div>
              <h4 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                Preparation & Cooking Steps
              </h4>
              <ol className="space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5 text-foreground/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Dietary Tags & Substitutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5">
                <span className="font-semibold text-foreground">Dietary Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.dietaryTags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5">
                <span className="font-semibold text-foreground">Possible Substitutions:</span>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {recipe.substitutions.map((sub, idx) => (
                    <li key={idx}>{sub}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer & Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Traditional Ayurvedic food preparation. Not intended to diagnose or treat illness.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button size="sm" onClick={onClose} className="text-xs">
                  Done
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

