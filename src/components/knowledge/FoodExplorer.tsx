import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  Wind, 
  Flame, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Table, 
  LayoutGrid, 
  Info 
} from "lucide-react";
import { foodsData } from "@/data/knowledge/foodsData";
import { FoodItem, FoodCategory, DoshaType, Suitability } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodDetailModal } from "./FoodDetailModal";

interface FoodExplorerProps {
  initialSearch?: string;
  initialDosha?: DoshaType;
}

export const FoodExplorer: React.FC<FoodExplorerProps> = ({
  initialSearch = "",
  initialDosha,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDosha, setSelectedDosha] = useState<string>(initialDosha || "all");
  const [selectedSuitability, setSelectedSuitability] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"cards" | "matrix">("cards");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return foodsData.filter((food) => {
      // Category filter
      if (selectedCategory !== "all" && food.category !== selectedCategory) {
        return false;
      }

      // Dosha & Suitability filter
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
        // If no specific dosha selected, check if matches any dosha suitability
        const hasMatch =
          food.vataSuitability === selectedSuitability ||
          food.pittaSuitability === selectedSuitability ||
          food.kaphaSuitability === selectedSuitability;
        if (!hasMatch) return false;
      }

      // Search query
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

  const getSuitabilityIcon = (suitability: Suitability) => {
    switch (suitability) {
      case "favored":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "moderation":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case "less_favored":
      default:
        return <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getSuitabilityColor = (suitability: Suitability) => {
    switch (suitability) {
      case "favored":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25";
      case "moderation":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25";
      case "less_favored":
      default:
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25";
    }
  };

  return (
    <div id="food-explorer" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs mb-2">
            Interactive Encyclopedia & Matrix
          </Badge>
          <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
            Individual Food Encyclopedia & Comparison
          </h2>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">
            Explore 40+ traditional foods with complete Ayurvedic energetics (Rasa, Gunas, Virya, Vipaka), 
            dosha suitabilities, and classical Samhita citations.
          </p>
        </div>

        {/* View Switcher Button Group */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start md:self-auto shrink-0">
          <Button
            variant={activeTab === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("cards")}
            className="text-xs gap-1.5 h-8"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View
          </Button>
          <Button
            variant={activeTab === "matrix" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("matrix")}
            className="text-xs gap-1.5 h-8"
          >
            <Table className="w-3.5 h-3.5" />
            Comparison Matrix
          </Button>
        </div>
      </div>

      {/* Control Bar: Search + Category + Dosha + Suitability */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search food by name, Hindi, or Sanskrit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs rounded-xl h-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="text-xs rounded-xl h-10">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="grains">Grains & Millets</SelectItem>
              <SelectItem value="vegetables">Vegetables & Gourds</SelectItem>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="legumes">Legumes & Dals</SelectItem>
              <SelectItem value="dairy">Dairy Preparations</SelectItem>
              <SelectItem value="nuts_seeds">Nuts & Seeds</SelectItem>
              <SelectItem value="oils">Oils & Healthy Fats</SelectItem>
              <SelectItem value="herbs_spices">Herbs & Spices</SelectItem>
            </SelectContent>
          </Select>

          {/* Dosha Filter */}
          <Select value={selectedDosha} onValueChange={setSelectedDosha}>
            <SelectTrigger className="text-xs rounded-xl h-10">
              <SelectValue placeholder="Filter by Dosha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doshas</SelectItem>
              <SelectItem value="vata">Vata Perspective</SelectItem>
              <SelectItem value="pitta">Pitta Perspective</SelectItem>
              <SelectItem value="kapha">Kapha Perspective</SelectItem>
            </SelectContent>
          </Select>

          {/* Suitability Filter */}
          <Select value={selectedSuitability} onValueChange={setSelectedSuitability}>
            <SelectTrigger className="text-xs rounded-xl h-10">
              <SelectValue placeholder="All Suitability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suitability Levels</SelectItem>
              <SelectItem value="favored">Traditionally Favored</SelectItem>
              <SelectItem value="moderation">Used in Moderation</SelectItem>
              <SelectItem value="less_favored">Traditionally Less Favored</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
          <span>
            Showing <strong>{filteredFoods.length}</strong> of {foodsData.length} encyclopedia entries
          </span>
          {(search || selectedCategory !== "all" || selectedDosha !== "all" || selectedSuitability !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSelectedDosha("all");
                setSelectedSuitability("all");
              }}
              className="text-secondary hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid Cards View */}
      {activeTab === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.map((food) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <Card className="h-full flex flex-col justify-between hover:border-secondary/50 hover:shadow-md transition-all group bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
                      {food.category.replace("_", " & ")}
                    </Badge>
                    {food.prabhava && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Special Action
                      </span>
                    )}
                  </div>
                  <CardTitle className="font-display text-xl text-foreground group-hover:text-secondary transition-colors">
                    {food.name}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                    <span><strong>Sanskrit:</strong> {food.sanskritName}</span>
                    <span>•</span>
                    <span><strong>Hindi:</strong> {food.hindiName}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Energetics Tags */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80">
                      Rasa: {food.tastes[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80">
                      Virya: {food.virya.split(" ")[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80">
                      Vipaka: {food.vipaka.split(" ")[0]}
                    </span>
                  </div>

                  {/* Dosha Badges Row */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Constitutional Suitability:
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      {/* Vata */}
                      <div className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center ${getSuitabilityColor(food.vataSuitability)}`}>
                        <div className="flex items-center gap-1 font-semibold">
                          <Wind className="w-3 h-3" /> Vata
                        </div>
                        <span className="text-[9px] capitalize mt-0.5">
                          {food.vataSuitability.replace("_", " ")}
                        </span>
                      </div>

                      {/* Pitta */}
                      <div className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center ${getSuitabilityColor(food.pittaSuitability)}`}>
                        <div className="flex items-center gap-1 font-semibold">
                          <Flame className="w-3 h-3" /> Pitta
                        </div>
                        <span className="text-[9px] capitalize mt-0.5">
                          {food.pittaSuitability.replace("_", " ")}
                        </span>
                      </div>

                      {/* Kapha */}
                      <div className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center ${getSuitabilityColor(food.kaphaSuitability)}`}>
                        <div className="flex items-center gap-1 font-semibold">
                          <Mountain className="w-3 h-3" /> Kapha
                        </div>
                        <span className="text-[9px] capitalize mt-0.5">
                          {food.kaphaSuitability.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Button to open Modal */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFood(food)}
                    className="w-full text-xs gap-1.5 border-secondary/30 hover:bg-secondary hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Full Ayurvedic Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Cross-Dosha Comparison Matrix Table */
        <Card className="overflow-hidden border border-border/80 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/80 border-b border-border text-foreground font-semibold">
                <tr>
                  <th className="p-3.5 min-w-[160px]">Food Ingredient</th>
                  <th className="p-3.5 min-w-[120px]">Category & Rasa</th>
                  <th className="p-3.5 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                      <Wind className="w-3.5 h-3.5" /> Vata Perspective
                    </div>
                  </th>
                  <th className="p-3.5 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-300">
                      <Flame className="w-3.5 h-3.5" /> Pitta Perspective
                    </div>
                  </th>
                  <th className="p-3.5 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                      <Mountain className="w-3.5 h-3.5" /> Kapha Perspective
                    </div>
                  </th>
                  <th className="p-3.5 text-right min-w-[90px]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-muted/30 transition-colors">
                    {/* Food Name */}
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground text-sm">{food.name}</div>
                      <div className="text-[11px] text-muted-foreground font-serif italic">
                        {food.sanskritName} ({food.hindiName})
                      </div>
                    </td>

                    {/* Category & Rasa */}
                    <td className="p-3.5 space-y-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {food.category}
                      </Badge>
                      <div className="text-[11px] text-muted-foreground">
                        {food.tastes[0]}
                      </div>
                    </td>

                    {/* Vata */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getSuitabilityIcon(food.vataSuitability)}
                        <span className="font-medium capitalize text-[11px]">
                          {food.vataSuitability.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {food.vataPerspective}
                      </p>
                    </td>

                    {/* Pitta */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getSuitabilityIcon(food.pittaSuitability)}
                        <span className="font-medium capitalize text-[11px]">
                          {food.pittaSuitability.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {food.pittaPerspective}
                      </p>
                    </td>

                    {/* Kapha */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getSuitabilityIcon(food.kaphaSuitability)}
                        <span className="font-medium capitalize text-[11px]">
                          {food.kaphaSuitability.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {food.kaphaPerspective}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFood(food)}
                        className="h-8 px-2 text-xs text-secondary hover:text-secondary hover:bg-secondary/10"
                      >
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal for Details */}
      <FoodDetailModal
        food={selectedFood}
        isOpen={Boolean(selectedFood)}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  );
};

