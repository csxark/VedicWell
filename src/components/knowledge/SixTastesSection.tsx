import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Layers, Info, Wind, Flame, Mountain, ArrowUpRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { tastesData } from "@/data/knowledge/tastesData";
import { TasteDetail } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SixTastesSection: React.FC = () => {
  const [selectedTasteId, setSelectedTasteId] = useState<string>("madhura");

  const currentTaste = tastesData.find((t) => t.id === selectedTasteId) || tastesData[0];

  return (
    <div id="six-tastes" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs">
          Classical Nutrition & Energetics
        </Badge>
        <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
          Six Tastes (Shad Rasa) & Nutritional Energetics
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          In Ayurveda, taste (Rasa) is not merely flavor—it is a physiological instruction code 
          composed of the five Mahabhutas that directs enzymatic secretions, organ metabolism, and doshic equilibrium.
        </p>
      </div>

      {/* Interactive Tabs for the Six Tastes */}
      <Tabs
        value={selectedTasteId}
        onValueChange={setSelectedTasteId}
        className="w-full space-y-6"
      >
        <div className="flex justify-center">
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/80 h-auto flex-wrap gap-1 justify-center">
            {tastesData.map((taste) => (
              <TabsTrigger
                key={taste.id}
                value={taste.id}
                className="px-3.5 py-2 rounded-xl text-xs font-medium data-[state=active]:bg-secondary data-[state=active]:text-white transition-all"
              >
                {taste.taste.split(" ")[0]} ({taste.taste.split(" ")[1]?.replace("(", "").replace(")", "")})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Selected Taste Card */}
        <Card className="border border-border/80 shadow-sm backdrop-blur overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-secondary via-accent to-primary" />
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-2xl md:text-3xl text-foreground flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  {currentTaste.taste}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-foreground/80 mt-1">
                  {currentTaste.sanskrit} | Elements: <strong>{currentTaste.elements}</strong>
                </CardDescription>
              </div>

              {/* Qualities Pills */}
              <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
                {currentTaste.qualities.map((q, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {q}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Action and Physiological Impact */}
            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 space-y-1.5 text-xs md:text-sm">
              <span className="font-semibold text-secondary flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Primary Therapeutic Action
              </span>
              <p className="text-foreground/90 leading-relaxed">
                {currentTaste.action}
              </p>
            </div>

            {/* Dosha Impact Matrix Row */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Doshic Impact on Body:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Vata */}
                <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
                  currentTaste.doshaImpact.vata === "pacifies"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200"
                }`}>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Wind className="w-4 h-4" /> Vata
                  </div>
                  <span className="capitalize font-bold text-[11px]">
                    {currentTaste.doshaImpact.vata === "pacifies" ? "✓ Pacifies" : "↑ Increases"}
                  </span>
                </div>

                {/* Pitta */}
                <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
                  currentTaste.doshaImpact.pitta === "pacifies"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200"
                }`}>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Flame className="w-4 h-4" /> Pitta
                  </div>
                  <span className="capitalize font-bold text-[11px]">
                    {currentTaste.doshaImpact.pitta === "pacifies" ? "✓ Pacifies" : "↑ Increases"}
                  </span>
                </div>

                {/* Kapha */}
                <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
                  currentTaste.doshaImpact.kapha === "pacifies"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200"
                }`}>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Mountain className="w-4 h-4" /> Kapha
                  </div>
                  <span className="capitalize font-bold text-[11px]">
                    {currentTaste.doshaImpact.kapha === "pacifies" ? "✓ Pacifies" : "↑ Increases"}
                  </span>
                </div>
              </div>
            </div>

            {/* Food Sources & Indian Dishes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <span className="font-semibold text-foreground">Common Food Examples:</span>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  {currentTaste.primaryFoods.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <span className="font-semibold text-foreground">Common Indian Dishes & Ingredients:</span>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  {currentTaste.indianDishes.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Overconsumption Warning */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-900/20 border border-amber-500/20 dark:border-amber-700/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong>Consequences of Overconsumption: </strong>
                {currentTaste.overconsumptionEffect}
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Complete Six Tastes vs Dosha Matrix Table */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/40 pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-secondary" />
            Interactive Dosha vs. Taste Master Matrix
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            A comprehensive side-by-side overview of how all six tastes impact Vata, Pitta, and Kapha.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/80 border-b border-border text-foreground font-semibold">
              <tr>
                <th className="p-3">Taste (Rasa)</th>
                <th className="p-3">Elements</th>
                <th className="p-3 text-sky-600 dark:text-sky-400">Vata Action</th>
                <th className="p-3 text-orange-600 dark:text-orange-400">Pitta Action</th>
                <th className="p-3 text-emerald-600 dark:text-emerald-400">Kapha Action</th>
                <th className="p-3">Primary Qualities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tastesData.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="p-3 font-semibold text-foreground">{t.taste}</td>
                  <td className="p-3 text-muted-foreground">{t.elements}</td>
                  <td className="p-3 font-medium">
                    <span className={t.doshaImpact.vata === "pacifies" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                      {t.doshaImpact.vata === "pacifies" ? "↓ Pacifies" : "↑ Increases"}
                    </span>
                  </td>
                  <td className="p-3 font-medium">
                    <span className={t.doshaImpact.pitta === "pacifies" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                      {t.doshaImpact.pitta === "pacifies" ? "↓ Pacifies" : "↑ Increases"}
                    </span>
                  </td>
                  <td className="p-3 font-medium">
                    <span className={t.doshaImpact.kapha === "pacifies" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                      {t.doshaImpact.kapha === "pacifies" ? "↓ Pacifies" : "↑ Increases"}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{t.qualities.slice(0, 2).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Holistic Taste Philosophy Note */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
        <div>
          <strong>Ayurvedic Principle of the Complete Meal: </strong>
          While individuals tailor their food toward tastes that pacify their dominant dosha, classical Ayurveda 
          counsels that every principal meal should ideally contain a subtle touch of all six tastes. Experiencing all 
          six tastes triggers complete neurochemical satiety, prevents emotional cravings, and ensures balanced enzymatic activation.
        </div>
      </div>
    </div>
  );
};

