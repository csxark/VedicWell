import React from "react";
import { FoodItem } from "@/types/knowledge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Layers,
  Wind, 
  Flame, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BookOpen, 
  Utensils, 
  Info,
} from "lucide-react";

interface FoodDetailModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const DOSHA_CONFIG: Record<string, { name: string; element: string; icon: React.ElementType; color: string }> = {
  vata: { name: "Vata", element: "Air & Space", icon: Wind, color: "text-sky-600 dark:text-sky-400" },
  pitta: { name: "Pitta", element: "Fire & Water", icon: Flame, color: "text-orange-600 dark:text-orange-400" },
  kapha: { name: "Kapha", element: "Earth & Water", icon: Mountain, color: "text-emerald-600 dark:text-emerald-400" },
};

const PLAIN_LABEL: Record<string, { label: string; note: string; variant: "suitable" | "moderation" | "less" }> = {
  favored: { label: "Traditionally suitable", note: "Supports balance for this dosha.", variant: "suitable" },
  moderation: { label: "Use in moderation", note: "Enjoy occasionally and in small portions.", variant: "moderation" },
  less_favored: { label: "Traditionally less suitable", note: "Best limited; traditional preparation can change its effect.", variant: "less" },
};

const PROPERTY_EXPLANATIONS: Record<string, string> = {
  Rasa: "The flavor the food brings — sweet, sour, salty, pungent, bitter, or astringent.",
  Guna: "The natural qualities of the food, such as heavy or light, dry or unctuous.",
  Virya: "Whether the food has a heating or cooling effect on the body.",
  Vipaka: "The taste effect that remains after digestion is complete.",
  Prabhava: "A special, unique traditional action beyond taste and potency.",
};

const PROPERTY_ORDER = ["Rasa", "Guna", "Virya", "Vipaka", "Prabhava"];

const categoryLabels: Record<string, string> = {
  grains: "Grains & Millets",
  vegetables: "Vegetables & Gourds",
  fruits: "Fruits",
  legumes: "Legumes & Dals",
  dairy: "Dairy Preparations",
  nuts_seeds: "Nuts & Seeds",
  oils: "Oils & Healthy Fats",
  herbs_spices: "Herbs & Spices",
  sweeteners: "Sweeteners",
};

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  isOpen,
  onClose,
}) => {
  if (!food) return null;

  const getChip = (suitability: string) => {
    const { label, variant } = PLAIN_LABEL[suitability as keyof typeof PLAIN_LABEL] || PLAIN_LABEL.less_favored;
    const base = "px-2.5 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1.5";
    const styles: Record<string, string> = {
      suitable: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
      moderation: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
      less: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
    };
    const icons: Record<string, React.ElementType> = {
      suitable: CheckCircle2,
      moderation: AlertTriangle,
      less: XCircle,
    };
    const Icon = icons[variant];
    return (
      <span className={`${base} ${styles[variant]}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 flex w-full max-w-full sm:max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background p-0 shadow-lg max-h-[92vh] overflow-hidden flex-col sm:rounded-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 flex flex-col gap-3 bg-background/95 backdrop-blur-md border-b border-border/40 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-[10px]">
                {categoryLabels[food.category]}
              </Badge>
              {food.prabhava && (
                <Badge variant="outline" className="border-amber-300/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 text-[10px] gap-1">
                  <Sparkles className="w-3 h-3" />
                  Special traditional action
                </Badge>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close food details"
              className="w-10 h-10 rounded-xl border border-border/60 bg-card flex items-center justify-center text-foreground hover:bg-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <XCircle className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <DialogTitle className="font-display text-2xl md:text-3xl text-foreground font-bold leading-tight mb-1">
            {food.name}
          </DialogTitle>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground leading-relaxed">
            <span><strong>Sanskrit:</strong> {food.sanskritName}</span>
            <span className="px-1">•</span>
            <span><strong>Hindi:</strong> {food.hindiName}</span>
            {food.botanicalName && (
              <>
                <span className="px-1">•</span>
                <span><strong>Botanical:</strong> <em className="italic">{food.botanicalName}</em></span>
              </>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 overflow-y-auto p-5 md:p-6">
          <div className="space-y-6">
            {/* About this food */}
            <section className="space-y-2">
              <h2 className="font-display text-lg md:text-xl text-foreground font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                About this food
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed max-w-2xl">
                {food.name} is a {categoryLabels[food.category]}. In the Ayurvedic tradition it is known by its
                Sanskrit name "{food.sanskritName}" and its Hindi name "{food.hindiName}". It carries a
                {food.tastes[0].toLowerCase()} taste and has a {food.virya.toLowerCase()} nature.
              </p>
            </section>

            <Separator className="my-1" />

            {/* Who may find it suitable */}
            <section className="space-y-2">
              <h2 className="font-display text-lg md:text-xl text-foreground font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-secondary" />
                Who may find it suitable?
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Traditional Ayurvedic guidance across the three doshas. Suitability depends on your unique
                constitution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                {[
                  { key: "vata", field: "vataSuitability", perspective: "vataPerspective" },
                  { key: "pitta", field: "pittaSuitability", perspective: "pittaPerspective" },
                  { key: "kapha", field: "kaphaSuitability", perspective: "kaphaPerspective" },
                ].map((d) => {
                  const cfg = DOSHA_CONFIG[d.key];
                  const s = food[d.field as keyof FoodItem] as string;
                  const plain = PLAIN_LABEL[s as keyof typeof PLAIN_LABEL] || PLAIN_LABEL.less_favored;
                  return (
                    <Card
                      key={d.key}
                      className="border border-border/80 shadow-sm p-3 md:p-4 flex flex-col h-full"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <cfg.icon className="w-5 h-5 shrink-0" />
                        <div>
                          <div className={`font-display font-bold text-sm ${cfg.color} leading-tight`}>{cfg.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{cfg.element}</div>
                        </div>
                      </div>
                      <div className="mb-2">{getChip(s)}</div>
                      <p className="text-xs text-foreground/90 leading-relaxed flex-1">
                        {food[d.perspective as keyof FoodItem]}
                      </p>
                    </Card>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground italic mt-2">
                These are traditional Ayurvedic descriptions shared for education. They are not a medical
                diagnosis — consult a qualified healthcare practitioner for personal health decisions.
              </p>
            </section>

            <Separator className="my-1" />

            {/* Ayurvedic properties */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-secondary" />
                <h2 className="font-display text-lg md:text-xl text-foreground font-bold">
                  Ayurvedic Properties (Dravyaguna)
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Traditional terms are shown alongside their plain English meaning and this food's value.
              </p>
              <div className="space-y-2 mt-3">
                {PROPERTY_ORDER.map((term) => {
                  const valueMap: Record<string, string | string[] | undefined> = {
                    Rasa: food.tastes,
                    Guna: food.qualities,
                    Virya: food.virya,
                    Vipaka: food.vipaka,
                    Prabhava: food.prabhava,
                  };
                  const value = valueMap[term];
                  const valueText = Array.isArray(value) ? value.join(", ") : value || "—";
                  return (
                    <div
                      key={term}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg border border-border/80 bg-card/50"
                    >
                      <div className="col-span-1 sm:col-span-3 text-sm font-semibold text-foreground">
                        {term}
                      </div>
                      <div className="col-span-1 sm:col-span-4 text-sm text-muted-foreground italic">
                        {PROPERTY_EXPLANATIONS[term]}
                      </div>
                      <div className="col-span-1 sm:col-span-5 text-sm text-foreground/90 font-medium break-words">
                        {valueText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <Separator className="my-1" />

            {/* Preparation & everyday usage */}
            <section className="space-y-2">
              <h2 className="font-display text-lg md:text-xl text-foreground font-bold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-secondary" />
                Preparation & everyday usage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border/80 bg-card">
                  <h3 className="font-semibold text-sm text-foreground mb-2">How it is traditionally prepared</h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">{food.recommendedPreparation}</p>
                </div>
                <div className="p-4 rounded-lg border border-border/80 bg-card">
                  <h3 className="font-semibold text-sm text-foreground mb-2">Common recipes</h3>
                  <ul className="text-sm text-foreground/90 space-y-1 leading-relaxed">
                    {food.commonRecipes.map((recipe, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                        {recipe}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Secondary technical info - collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-auto text-sm">
                  Show combinations, moderation notes & sources
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                      <span className="w-3 h-3 text-emerald-500 shrink-0" />
                      Harmonious combinations
                    </h3>
                    <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                      {food.compatibleCombinations.join(", ")}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      Combinations to moderate
                    </h3>
                    <p className="text-xs text-rose-900 dark:text-rose-100 leading-relaxed">
                      {food.incompatibleCombinations.join(", ")}
                    </p>
                  </div>
                </div>
                {food.moderationNotes && (
                  <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-amber-500 shrink-0" />
                      Important considerations
                    </h3>
                    <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                      {food.moderationNotes}
                    </p>
                  </div>
                )}
                <div className="p-4 rounded-lg border border-border/80 bg-muted/50">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-secondary shrink-0" />
                    Classical source & modern context
                  </h3>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    {food.classicalReference}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    <strong>Modern context: </strong> {food.modernNutritionalContext}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/50 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
              <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong>Traditional perspective only. </strong>
                These descriptions come from classical Ayurveda and are shared for educational purposes. They are
                not a medical diagnosis and do not replace professional medical advice. If you have a health
                condition or concern, consult a qualified healthcare practitioner.
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
