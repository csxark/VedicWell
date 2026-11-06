import React from "react";
import { motion } from "framer-motion";
import { AlertOctagon, CheckCircle2, Info, Sparkles, Utensils, BookOpen } from "lucide-react";
import { incompatibleCombinationsData } from "@/data/knowledge/agniCombinationsFaqData";
import { IncompatibleCombination } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const FoodCombinationsSection: React.FC = () => {
  return (
    <div id="food-combos" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs">
          Phase 11 Incompatible Food Combinations
        </Badge>
        <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
          Viruddha Ahara: Incompatible Food Combinations
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Charaka Samhita warns that certain foods, while wholesome when eaten separately, 
          become antagonistic when combined, creating toxic intermediate waste (Ama) that disrupts cellular receptors.
        </p>
      </div>

      {/* Grid of Incompatible Combinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {incompatibleCombinationsData.map((combo) => (
          <Card key={combo.id} className="border border-rose-500/25 bg-card hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 text-[10px] uppercase">
                  {combo.traditionalClassification}
                </Badge>
                <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
              </div>
              <CardTitle className="font-display text-lg text-foreground flex items-center gap-1.5">
                <span className="text-rose-600 dark:text-rose-400 font-bold">{combo.item1}</span>
                <span className="text-muted-foreground text-xs">+</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{combo.item2}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3.5 text-xs pt-0">
              {/* Traditional Explanation */}
              <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/20 space-y-1">
                <span className="font-semibold text-rose-800 dark:text-rose-300">Traditional Ayurvedic Reason:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {combo.traditionalExplanation}
                </p>
              </div>

              {/* Modern Digestive Rationale */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                <span className="font-semibold text-foreground">Modern Physiological Rationale:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {combo.modernDigestiveRationale}
                </p>
              </div>

              {/* Remedy / Correction */}
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Ayurvedic Remedy / Correction:
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {combo.remedyOrCorrection}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traditional Food Preparation Rules Card */}
      <Card className="p-6 rounded-2xl bg-gradient-to-r from-secondary/10 via-card to-primary/10 border border-border space-y-4">
        <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Utensils className="w-5 h-5 text-secondary" />
          Traditional Ayurvedic Cooking Methods (Samskara)
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In Ayurveda, Samskara is the transformation of food qualities through preparation. 
          Proper culinary techniques alter the energetics of ingredients, rendering difficult foods easily assimilable:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
            <div className="font-semibold text-foreground">1. Tempering in Ghee / Oil (Tadka)</div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Heating whole spices (cumin, mustard, hing, ginger) in warm ghee or oil extracts fat-soluble essential oils, transforming sharp spices into gentle bio-available digestive tonics.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
            <div className="font-semibold text-foreground">2. Prolonged Soaking of Grains & Dals</div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Soaking legumes and millets for 4 to 12 hours prior to cooking leaches out gas-forming phytic acids and oligosaccharides, dramatically lightening their heaviness on Vata digestion.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
            <div className="font-semibold text-foreground">3. Slow Moist Simmering</div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Slowly cooking grains and vegetables with ample water until tender breaks down tough plant cellulose walls, effectively pre-digesting food before it ever reaches Jatharagni.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

