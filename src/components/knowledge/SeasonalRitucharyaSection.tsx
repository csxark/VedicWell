import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, CloudRain, Snowflake, Wind, Sparkles, CheckCircle2, AlertTriangle, Calendar, Layers } from "lucide-react";
import { seasonalData } from "@/data/knowledge/seasonalData";
import { SeasonalGuide } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SeasonalRitucharyaSection: React.FC = () => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("vasanta");

  const currentSeason = seasonalData.find((s) => s.id === selectedSeasonId) || seasonalData[0];

  const getSeasonIcon = (id: string) => {
    switch (id) {
      case "shishira":
      case "hemanta":
        return <Snowflake className="w-4 h-4 text-sky-400" />;
      case "grishma":
        return <Sun className="w-4 h-4 text-orange-400" />;
      case "varsha":
        return <CloudRain className="w-4 h-4 text-teal-400" />;
      case "vasanta":
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case "sharad":
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div id="seasonal" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs">
          Circannual Biology & Seasons
        </Badge>
        <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
          Seasonal Dietetics & Ritucharya
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Nature's external environmental cycles continuously shift internal doshic balance. 
          Discover the six traditional Indian seasons and how to adjust your diet to prevent seasonal illness.
        </p>
      </div>

      {/* Season Selector Tabs */}
      <Tabs
        value={selectedSeasonId}
        onValueChange={setSelectedSeasonId}
        className="w-full space-y-6"
      >
        <div className="flex justify-center">
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/80 h-auto flex-wrap gap-1 justify-center">
            {seasonalData.map((season) => (
              <TabsTrigger
                key={season.id}
                value={season.id}
                className="px-3.5 py-2 rounded-xl text-xs font-medium gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all"
              >
                {getSeasonIcon(season.id)}
                <span>{season.season}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Selected Season Card */}
        <Card className="border border-border/80 shadow-sm backdrop-blur overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-600 via-secondary to-amber-600" />
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-xs border-secondary/40 text-secondary">
                    {currentSeason.englishMonths}
                  </Badge>
                </div>
                <CardTitle className="font-display text-2xl md:text-3xl text-foreground flex items-center gap-2">
                  {getSeasonIcon(currentSeason.id)}
                  {currentSeason.season} ({currentSeason.sanskritName})
                </CardTitle>
                <CardDescription className="text-xs md:text-sm font-medium text-foreground/80 mt-1">
                  <strong>Dosha Dynamics:</strong> {currentSeason.doshaDynamic}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Dietary Guidance Overview */}
            <div className="p-4 md:p-5 rounded-xl bg-secondary/10 border border-secondary/20 space-y-2 text-xs md:text-sm">
              <span className="font-semibold text-secondary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Traditional Seasonal Dietary Strategy
              </span>
              <ul className="space-y-1.5 text-foreground/90">
                {currentSeason.dietaryGuidance.map((guideline, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Foods to Favor vs Foods to Moderate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Foods to Favor */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Foods to Favor During {currentSeason.season}:
                </span>
                <ul className="space-y-1.5 text-muted-foreground">
                  {currentSeason.foodsToFavor.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Foods to Moderate */}
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/25 space-y-2">
                <span className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Foods to Moderate or Avoid:
                </span>
                <ul className="space-y-1.5 text-muted-foreground">
                  {currentSeason.foodsToModerate.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lifestyle and Behavioral Guidelines */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-secondary" />
                Recommended Lifestyle Practices (Vihara) for {currentSeason.season}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-muted-foreground">
                {currentSeason.lifestyleTips.map((tip, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

