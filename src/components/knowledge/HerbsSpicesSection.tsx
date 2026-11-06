import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, AlertCircle, BookOpen, Layers, Wind, Flame, Mountain } from "lucide-react";
import { herbsSpicesData } from "@/data/knowledge/herbsSpicesData";
import { HerbSpice } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const HerbsSpicesSection: React.FC = () => {
  const [selectedHerb, setSelectedHerb] = useState<HerbSpice>(herbsSpicesData[0]);

  return (
    <div id="herbs-spices" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs">
          Herbal Materia Medica (Dravyaguna)
        </Badge>
        <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
          Herbs & Spices Encyclopedia
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Sacred adaptogens, carminatives, and Rasayanas used in classical Ayurveda 
          to kindle digestive Agni, eliminate metabolic toxins, and restore tissue vitality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Herb List Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Featured Herbs & Adaptogens ({herbsSpicesData.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {herbsSpicesData.map((herb) => {
              const isSelected = selectedHerb.id === herb.id;
              return (
                <button
                  key={herb.id}
                  onClick={() => setSelectedHerb(herb)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-secondary text-white border-secondary shadow-sm scale-[1.01]"
                      : "bg-card hover:bg-muted/50 border-border/80 text-foreground"
                  }`}
                >
                  <div>
                    <div className="font-display font-semibold text-sm">{herb.name}</div>
                    <div className={`text-xs ${isSelected ? "text-white/80" : "text-muted-foreground"} font-serif italic`}>
                      {herb.sanskritName}
                    </div>
                  </div>
                  <Badge variant={isSelected ? "outline" : "secondary"} className={`text-[10px] shrink-0 ${isSelected ? "border-white/40 text-white" : ""}`}>
                    {herb.virya.split(" ")[0]}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Herb Profile Card */}
        <div className="lg:col-span-8">
          <Card className="border border-border/80 shadow-sm backdrop-blur overflow-hidden sticky top-24">
            <div className="h-2 bg-gradient-to-r from-secondary via-accent to-primary" />
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-xs border-secondary/40 text-secondary">
                      Classical Dravyaguna
                    </Badge>
                    <span className="text-xs text-muted-foreground font-serif italic">
                      {selectedHerb.botanicalName}
                    </span>
                  </div>
                  <CardTitle className="font-display text-2xl md:text-3xl text-foreground">
                    {selectedHerb.name}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-foreground/80 mt-1">
                    {selectedHerb.sanskritName} | Hindi: {selectedHerb.hindiName}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Energetics Quick Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-muted-foreground font-medium">Taste (Rasa)</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedHerb.rasa.join(", ")}</div>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-muted-foreground font-medium">Potency (Virya)</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedHerb.virya}</div>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-muted-foreground font-medium">Post-Digestive (Vipaka)</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedHerb.vipaka}</div>
                </div>
              </div>

              {/* Doshic Action Breakdown */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Action on the Three Doshas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-card border border-sky-500/25">
                    <div className="flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-300 mb-1">
                      <Wind className="w-3.5 h-3.5" /> Vata
                    </div>
                    <p className="text-muted-foreground">{selectedHerb.doshaEffects.vata}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-orange-500/25">
                    <div className="flex items-center gap-1 font-semibold text-orange-700 dark:text-orange-300 mb-1">
                      <Flame className="w-3.5 h-3.5" /> Pitta
                    </div>
                    <p className="text-muted-foreground">{selectedHerb.doshaEffects.pitta}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-emerald-500/25">
                    <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                      <Mountain className="w-3.5 h-3.5" /> Kapha
                    </div>
                    <p className="text-muted-foreground">{selectedHerb.doshaEffects.kapha}</p>
                  </div>
                </div>
              </div>

              {/* Key Therapeutic Uses */}
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-secondary" />
                  Key Therapeutic Indications
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {selectedHerb.keyTherapeuticUses.map((use, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-card p-2.5 rounded-lg border border-border/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Traditional Home Preparations */}
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  Traditional Home Preparation Ideas
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {selectedHerb.homeRemedies.map((remedy, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-secondary/5 border border-secondary/20 text-foreground/90">
                      • {remedy}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Precautions & Reference */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Traditional Precautions & Contraindications
                </div>
                <p className="text-amber-800 dark:text-amber-300 pl-5">
                  {selectedHerb.precautions}
                </p>
              </div>

              <div className="text-xs text-muted-foreground italic flex items-center gap-1.5 pt-1">
                <BookOpen className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>Reference: {selectedHerb.classicalReferences}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

