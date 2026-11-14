import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Wind, 
  Flame, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Table, 
  LayoutGrid, 
  ChevronDown,
} from "lucide-react";
import { foodsData } from "@/data/knowledge/foodsData";
import { FoodItem, FoodCategory, DoshaType, Suitability } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FoodDetailModal } from "./FoodDetailModal";

interface FoodExplorerProps {
  initialSearch?: string;
  initialDosha?: DoshaType;
}

const DOSHA_LABELS: Record<DoshaType, { name: string; icon: React.ElementType }> = {
  vata: { name: "Vata", icon: Wind },
  pitta: { name: "Pitta", icon: Flame },
  kapha: { name: "Kapha", icon: Mountain },
};

const PLAIN_SUITABILITY: Record<Suitability, { label: string; variant: "suitable" | "moderation" | "less" }> = {
  favored: { label: "Traditionally suitable", variant: "suitable" },
  moderation: { label: "Use in moderation", variant: "moderation" },
  less_favored: { label: "Traditionally less suitable", variant: "less" },
};

const categoryLabels: Record<FoodCategory, string> = {
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

export const FoodExplorer: React.FC<FoodExplorerProps> = ({
  initialSearch = "",
  initialDosha,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [selectedDosha, setSelectedDosha] = useState<DoshaType | "all">(initialDosha || "all");
  const [selectedSuitability, setSelectedSuitability] = useState<Suitability | "all">("all");
  const [activeTab, setActiveTab] = useState<"cards" | "matrix">("cards");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedDosha(initialDosha || "all");
  }, [initialDosha]);

  const filteredFoods = useMemo(() => {
    return foodsData.filter((food) => {
      if (selectedCategory !== "all" && food.category !== selectedCategory) {
        return false;
      }

      if (selectedDosha !== "all") {
        const suitability =
          selectedDosha === "vata"
            ? food.vataSuitability
            : selectedDosha === "pitta"
              ? food.pittaSuitability
              : food.kaphaSuitability;

        if (selectedSuitability !== "all" && suitability !== selectedSuitability) {
          return false;
        }
      } else if (selectedSuitability !== "all") {
        const hasMatch =
          food.vataSuitability === selectedSuitability ||
          food.pittaSuitability === selectedSuitability ||
          food.kaphaSuitability === selectedSuitability;
        if (!hasMatch) return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(query);
        const matchesSanskrit = food.sanskritName.toLowerCase().includes(query);
        const matchesHindi = food.hindiName.toLowerCase().includes(query);
        const matchesCategory = food.category.toLowerCase().includes(query);
        const matchesTaste = food.tastes.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesSanskrit && !matchesHindi && !matchesCategory && !matchesTaste) {
          return false;
        }
      }

      return true;
    });
  }, [search, selectedCategory, selectedDosha, selectedSuitability]);

  const isEmpty = filteredFoods.length === 0;

  const getSuitabilityChip = (suitability: Suitability) => {
    const { label, variant } = PLAIN_SUITABILITY[suitability];
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
    <div id="food-explorer" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs mb-2">
            Food Encyclopedia
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl text-foreground font-bold">
            Individual Food Encyclopedia
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mt-2 leading-relaxed">
            Browse traditional foods with their Ayurvedic properties, dosha suitability, and simple 
            preparation guidance. Pick a food to see its full profile.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start md:self-auto shrink-0">
          <Button
            variant={activeTab === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("cards")}
            className="text-xs gap-1.5 h-9"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Card View
          </Button>
          <Button
            variant={activeTab === "matrix" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("matrix")}
            className="text-xs gap-1.5 h-9"
          >
            <Table className="w-3.5 h-3.5" />
            Comparison Table
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mx-auto max-w-3xl">
        <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search for a food, such as rice, wheat or barley..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 pr-10 py-3.5 text-base md:text-lg rounded-2xl bg-card border border-border/80 shadow-sm focus-visible:ring-2 focus-visible:ring-secondary"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Category */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="text-sm rounded-xl h-11">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(Object.keys(categoryLabels) as FoodCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Dosha suitability (primary) */}
          <Select value={selectedDosha} onValueChange={setSelectedDosha}>
            <SelectTrigger className="text-sm rounded-xl h-11">
              <SelectValue placeholder="Suitable for any dosha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Suitable for any dosha</SelectItem>
              <SelectItem value="vata">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Suitable for Vata
                </div>
              </SelectItem>
              <SelectItem value="pitta">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Suitable for Pitta
                </div>
              </SelectItem>
              <SelectItem value="kapha">
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Suitable for Kapha
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* More filters trigger */}
          <Collapsible open={moreFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMoreFiltersOpen((o) => !o)}
                className="w-full text-sm gap-2 h-11 justify-between"
              >
                More filters
                <ChevronDown className={`w-4 h-4 transition-transform ${moreFiltersOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3 border-t border-border/40">
              <Select value={selectedSuitability} onValueChange={setSelectedSuitability}>
                <SelectTrigger className="text-sm rounded-xl h-11">
                  <SelectValue placeholder="Any suitability level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any suitability level</SelectItem>
                  <SelectItem value="favored">Traditionally suitable</SelectItem>
                  <SelectItem value="moderation">Use in moderation</SelectItem>
                  <SelectItem value="less_favored">Traditionally less suitable</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Filter by the traditional Ayurvedic suitability classification for the dosha selected above.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Results counter & reset */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-1 border-t border-border/40">
          <span>
            Showing <strong>{filteredFoods.length}</strong> of {foodsData.length} foods
          </span>
          {(search || selectedCategory !== "all" || selectedDosha !== "all" || selectedSuitability !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSelectedDosha("all");
                setSelectedSuitability("all");
                setMoreFiltersOpen(false);
              }}
              className="text-secondary hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {isEmpty && (<div className="border border-border/80 shadow-sm text-center p-10 md:p-14">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Search className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="font-display text-xl text-foreground font-bold mb-2">No foods found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            Try adjusting your search words or filters. You can search by food name, Hindi name, Sanskrit name, 
            or category.
          </p>
          <Button variant="outline" size="sm" onClick={() => {
            setSearch("");
            setSelectedCategory("all");
            setSelectedDosha("all");
            setSelectedSuitability("all");
            setMoreFiltersOpen(false);
          }}>
            Show all foods
          </Button>
        </div>
      )}
      {activeTab === "cards" && !isEmpty && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.map((food) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="h-full flex flex-col justify-between border border-border/80 shadow-sm hover:border-secondary/50 hover:shadow-medium transition-all group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
                      {categoryLabels[food.category]}
                    </Badge>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        food.vataSuitability === "favored" || food.pittaSuitability === "favored" || food.kaphaSuitability === "favored"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border/60"
                      }`}
                    >
                      Ayurvedic profile
                    </span>
                  </div>
                  <CardTitle className="font-display text-lg md:text-xl text-foreground leading-tight group-hover:text-secondary transition-colors">
                    {food.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="text-secondary/60 font-serif italic">{food.sanskritName}</span>
                    <span>•</span>
                    <span>{food.hindiName}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Dosha suitability indicators */}
                  <div className="space-y-1.5">
                    {[
                      { dosha: "vata" as const, label: "Vata" },
                      { dosha: "pitta" as const, label: "Pitta" },
                      { dosha: "kapha" as const, label: "Kapha" },
                    ].map((d) => {
                      const s = food[`${d.dosha}Suitability` as keyof FoodItem];
                      const DoshaIcon = DOSHA_LABELS[d.dosha].icon;
                      return (
                        <div key={d.dosha} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground/90">
                            <DoshaIcon className="w-3.5 h-3.5 shrink-0" />
                            {d.label}
                          </span>
                          {getSuitabilityChip(s)}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-border/40">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-sm gap-1.5 border-secondary/30 hover:bg-secondary hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View full details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {activeTab === "matrix" && !isEmpty && (<Card className="overflow-hidden border border-border/80 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 border-b border-border text-foreground font-semibold">
                <tr>
                  <th className="p-4 min-w-[150px]">Food</th>
                  <th className="p-4 min-w-[120px]">Category</th>
                  <th className="p-4 min-w-[170px]">
                    <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                      <Wind className="w-3.5 h-3.5" /> Vata
                    </div>
                  </th>
                  <th className="p-4 min-w-[170px]">
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                      <Flame className="w-3.5 h-3.5" /> Pitta
                    </div>
                  </th>
                  <th className="p-4 min-w-[170px]">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <Mountain className="w-3 h-3" /> Kapha
                    </div>
                  </th>
                  <th className="p-4 text-right min-w-[100px]">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{food.name}</div>
                      <div className="text-[11px] text-muted-foreground font-serif italic">
                        {food.sanskritName} ({food.hindiName})
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {categoryLabels[food.category]}
                      </Badge>
                    </td>
                    <td className="p-4">{getSuitabilityChip(food.vataSuitability)}</td>
                    <td className="p-4">{getSuitabilityChip(food.pittaSuitability)}</td>
                    <td className="p-4">{getSuitabilityChip(food.kaphaSuitability)}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFood(food)} className="h-9 px-3 text-xs text-secondary hover:text-secondary">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {selectedFood && (
          <FoodDetailModal
            food={selectedFood}
            isOpen={true}
            onClose={() => setSelectedFood(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
