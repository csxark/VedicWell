import React from "react";
import { FoodItem } from "@/types/knowledge";
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
  Sparkles, 
  Wind, 
  Flame, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BookOpen, 
  Utensils, 
  Info,
  Layers,
  Heart
} from "lucide-react";
import { LotusIcon } from "@/components/icons/SacredIcons";

interface FoodDetailModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  isOpen,
  onClose,
}) => {
  if (!food) return null;

  const getSuitabilityBadge = (suitability: string) => {
    switch (suitability) {
      case "favored":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Traditionally Favored
          </Badge>
        );
      case "moderation":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Use in Moderation
          </Badge>
        );
      case "less_favored":
      default:
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 gap-1 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            Traditionally Less Favored
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-background border-border">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700/90 via-teal-800 to-amber-700/80 text-white p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-white/30 text-white bg-white/10 uppercase tracking-wider text-xs">
                  {food.category.replace("_", " & ")}
                </Badge>
                {food.prabhava && (
                  <Badge variant="outline" className="border-amber-300/40 text-amber-200 bg-amber-500/20 text-xs gap-1">
                    <Sparkles className="w-3 h-3" /> Special Action
                  </Badge>
                )}
              </div>
              <DialogTitle className="font-display text-3xl font-bold tracking-tight text-white mb-1">
                {food.name}
              </DialogTitle>
              <DialogDescription className="text-emerald-100 text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span><strong>Sanskrit:</strong> {food.sanskritName}</span>
                <span><strong>Hindi:</strong> {food.hindiName}</span>
                {food.botanicalName && <span><strong>Botanical:</strong> <em>{food.botanicalName}</em></span>}
              </DialogDescription>
            </div>
            <LotusIcon className="w-14 h-14 text-white/30 shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-6">
            {/* Ayurvedic Energetics Cards */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-secondary" />
                Ayurvedic Energetics (Dravyaguna Profile)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border/80">
                  <div className="text-xs text-muted-foreground font-medium">Taste (Rasa)</div>
                  <div className="font-semibold text-sm text-foreground mt-0.5">
                    {food.tastes.join(", ")}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/80">
                  <div className="text-xs text-muted-foreground font-medium">Qualities (Guna)</div>
                  <div className="font-semibold text-sm text-foreground mt-0.5">
                    {food.qualities.join(", ")}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/80">
                  <div className="text-xs text-muted-foreground font-medium">Potency (Virya)</div>
                  <div className="font-semibold text-sm text-foreground mt-0.5">
                    {food.virya}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border/80">
                  <div className="text-xs text-muted-foreground font-medium">Post-Digestive (Vipaka)</div>
                  <div className="font-semibold text-sm text-foreground mt-0.5">
                    {food.vipaka}
                  </div>
                </div>
              </div>

              {food.prabhava && (
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                  <strong>Prabhava (Special Potency):</strong> {food.prabhava}
                </div>
              )}
            </div>

            <Separator />

            {/* Dosha Suitability & Perspectives */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-secondary" />
                Suitability by Constitutional Dosha
              </h4>
              <div className="space-y-3">
                {/* Vata */}
                <div className="p-3.5 rounded-lg border border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-display font-semibold text-sky-700 dark:text-sky-300">
                      <Wind className="w-4 h-4" />
                      Vata Dosha (Air & Space)
                    </div>
                    {getSuitabilityBadge(food.vataSuitability)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {food.vataPerspective}
                  </p>
                </div>

                {/* Pitta */}
                <div className="p-3.5 rounded-lg border border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-display font-semibold text-orange-700 dark:text-orange-300">
                      <Flame className="w-4 h-4" />
                      Pitta Dosha (Fire & Water)
                    </div>
                    {getSuitabilityBadge(food.pittaSuitability)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {food.pittaPerspective}
                  </p>
                </div>

                {/* Kapha */}
                <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-display font-semibold text-emerald-700 dark:text-emerald-300">
                      <Mountain className="w-4 h-4" />
                      Kapha Dosha (Earth & Water)
                    </div>
                    {getSuitabilityBadge(food.kaphaSuitability)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {food.kaphaPerspective}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Preparation & Common Indian Recipes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <h5 className="font-semibold text-sm flex items-center gap-1.5 text-foreground mb-2">
                  <Utensils className="w-4 h-4 text-secondary" />
                  Traditional Preparation Method
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {food.recommendedPreparation}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <h5 className="font-semibold text-sm flex items-center gap-1.5 text-foreground mb-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  Common Indian Recipes
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {food.commonRecipes.map((recipe, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                      {recipe}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Food Combinations & Moderation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/20">
                <h5 className="font-semibold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
                  Harmonious Combinations
                </h5>
                <p className="text-xs text-muted-foreground">
                  {food.compatibleCombinations.join(", ")}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-rose-50/40 dark:bg-rose-950/20 border border-rose-500/20">
                <h5 className="font-semibold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300 mb-2">
                  Combinations to Moderate (Viruddha Ahara)
                </h5>
                <p className="text-xs text-muted-foreground">
                  {food.incompatibleCombinations.join(", ")}
                </p>
              </div>
            </div>

            {/* Moderation Notes */}
            {food.moderationNotes && (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong>Important Considerations: </strong>
                  {food.moderationNotes}
                </div>
              </div>
            )}

            {/* References & Modern Nutritional Note */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-muted-foreground">
                <BookOpen className="w-4 h-4 shrink-0 text-secondary mt-0.5" />
                <div>
                  <strong>Classical Samhita Source: </strong>
                  <span className="italic">{food.classicalReference}</span>
                </div>
              </div>
              <div className="text-muted-foreground/90 pl-6">
                <strong>Modern Nutritional Context: </strong>
                {food.modernNutritionalContext}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

