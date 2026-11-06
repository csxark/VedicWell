import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, CheckCircle2, AlertTriangle, Info, Wind, Mountain, Droplets, Layers } from "lucide-react";
import { agniTypesData } from "@/data/knowledge/agniCombinationsFaqData";
import { AgniType } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AgniAndDigestionSection: React.FC = () => {
  const [selectedAgniId, setSelectedAgniId] = useState<string>("sama-agni");

  const currentAgni = agniTypesData.find((a) => a.id === selectedAgniId) || agniTypesData[0];

  return (
    <div id="agni-digestion" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs">
          Phase 10 Metabolic Science
        </Badge>
        <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
          Digestion and Agni (The Internal Fire)
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          In Ayurveda, health is determined not simply by what you eat, but by what you cleanly 
          digest and assimilate without producing metabolic toxins (Ama).
        </p>
      </div>

      {/* The 4 States of Agni Tabs */}
      <Tabs
        value={selectedAgniId}
        onValueChange={setSelectedAgniId}
        className="w-full space-y-6"
      >
        <div className="flex justify-center">
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/80 h-auto flex-wrap gap-1 justify-center">
            {agniTypesData.map((agni) => (
              <TabsTrigger
                key={agni.id}
                value={agni.id}
                className="px-4 py-2 rounded-xl text-xs font-medium data-[state=active]:bg-secondary data-[state=active]:text-white transition-all"
              >
                {agni.name.split(" ")[0]} {agni.name.split(" ")[1]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Selected Agni Display */}
        <Card className="border border-border/80 shadow-sm backdrop-blur overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 via-secondary to-amber-500" />
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <CardTitle className="font-display text-2xl md:text-3xl text-foreground flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                  {currentAgni.name}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-foreground/80 mt-1">
                  {currentAgni.sanskritName} | Associated With: <strong>{currentAgni.associatedDosha}</strong>
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs border-secondary/40 text-secondary self-start sm:self-auto">
                {currentAgni.state}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Characteristics */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-secondary" />
                  Primary Digestive Characteristics
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {currentAgni.characteristics.map((char, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Physical Signs */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Physical Diagnostic Signs
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {currentAgni.physicalSigns.map((sign, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ayurvedic Balancing Protocol */}
            <div className="p-5 rounded-xl bg-secondary/10 border border-secondary/25 space-y-3">
              <h4 className="font-semibold text-sm text-secondary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ayurvedic Strategy to Balance This Digestive State
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground/90">
                {currentAgni.remedies.map((rem, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-card/80 border border-border/60 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                    <span>{rem}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Stomach Division Rule (Ahara Matra) Visual Infographic */}
      <Card className="p-6 rounded-2xl bg-gradient-to-br from-card via-card to-muted/50 border border-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Droplets className="w-5 h-5 text-secondary" />
              The Classical Rule of Stomach Division (Ahara Matra)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Charaka Samhita Vimanasthana 2/3 dictates the golden geometric ratio for meal volume:
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-secondary/40 text-secondary self-start md:self-auto">
            Optimal Digestion Ratio
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1 text-center">
            <div className="font-bold text-lg text-emerald-700 dark:text-emerald-300">50% (Two Quarters)</div>
            <div className="font-semibold text-foreground">Solid Nourishing Food</div>
            <p className="text-muted-foreground text-[11px]">Whole grains, steamed vegetables, moong dal, root vegetables.</p>
          </div>

          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 space-y-1 text-center">
            <div className="font-bold text-lg text-sky-700 dark:text-sky-300">25% (One Quarter)</div>
            <div className="font-semibold text-foreground">Warm Liquid / Broth</div>
            <p className="text-muted-foreground text-[11px]">Sipped warm water, digestive CCF tea, or light soupy dal to churn food.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-center">
            <div className="font-bold text-lg text-amber-700 dark:text-amber-300">25% (One Quarter)</div>
            <div className="font-semibold text-foreground">Empty Space for Vata</div>
            <p className="text-muted-foreground text-[11px]">Left completely empty to allow digestive gases (Samana Vayu) to circulate freely.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

