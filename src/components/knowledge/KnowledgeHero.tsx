import React from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  Utensils, 
  Flame, 
  Wind, 
  Mountain, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Compass
} from "lucide-react";
import { MandalaIcon, LotusIcon } from "@/components/icons/SacredIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { DoshaType } from "@/types/knowledge";

interface KnowledgeHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  userDosha: DoshaType | null;
  secondaryDosha?: string | null;
  hasAssessment: boolean;
  filterByPersonalized: boolean;
  onTogglePersonalized: () => void;
  userName?: string | null;
}

const sectionLinks = [
  { id: "fundamentals", label: "Ayurveda 101", icon: BookOpen },
  { id: "doshas", label: "Three Doshas", icon: Compass },
  { id: "food-guides", label: "Dosha Food Guides", icon: Utensils },
  { id: "food-explorer", label: "Food Explorer & Matrix", icon: Filter },
  { id: "six-tastes", label: "Six Tastes (Shad Rasa)", icon: Sparkles },
  { id: "recipes", label: "Recipes Library", icon: Utensils },
  { id: "herbs-spices", label: "Herbs & Spices", icon: Sparkles },
  { id: "agni-digestion", label: "Agni & Digestion", icon: Flame },
  { id: "seasonal", label: "Seasonal (Ritucharya)", icon: Mountain },
  { id: "food-combos", label: "Viruddha Ahara", icon: BookOpen },
  { id: "articles", label: "Articles Library", icon: BookOpen },
  { id: "faq", label: "FAQ", icon: BookOpen },
];

export const KnowledgeHero: React.FC<KnowledgeHeroProps> = ({
  searchQuery,
  onSearchChange,
  activeSection,
  onSectionClick,
  userDosha,
  secondaryDosha,
  hasAssessment,
  filterByPersonalized,
  onTogglePersonalized,
  userName,
}) => {
  const getDoshaTheme = (dosha: DoshaType | null) => {
    switch (dosha) {
      case "vata":
        return {
          name: "Vata",
          icon: Wind,
          color: "text-sky-600 dark:text-sky-400",
          border: "border-sky-500/30",
          bg: "bg-sky-500/10",
        };
      case "pitta":
        return {
          name: "Pitta",
          icon: Flame,
          color: "text-orange-600 dark:text-orange-400",
          border: "border-orange-500/30",
          bg: "bg-orange-500/10",
        };
      case "kapha":
        return {
          name: "Kapha",
          icon: Mountain,
          color: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-500/30",
          bg: "bg-emerald-500/10",
        };
      default:
        return null;
    }
  };

  const currentTheme = getDoshaTheme(userDosha);

  return (
    <div className="relative pt-6 pb-8 md:pb-12 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Sacred Header Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <div className="relative inline-block mb-3">
            <MandalaIcon className="w-16 h-16 md:w-20 md:h-20 text-secondary mx-auto" />
            <motion.div
              className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
          </div>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground font-bold tracking-tight mb-3">
            Ayurvedic Knowledge Hub
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            The comprehensive classical library of food wisdom, constitutional nutrition, 
            medicinal spices, recipes, and seasonal dietetics.
          </p>
        </motion.div>

        {/* Assessment / Personalization Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          {hasAssessment && userDosha && currentTheme ? (
            <div className={`p-4 md:p-5 rounded-2xl border ${currentTheme.border} ${currentTheme.bg} backdrop-blur-sm shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-4`}>
              <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
                <div className={`w-12 h-12 rounded-xl bg-card shadow-sm flex items-center justify-center shrink-0 ${currentTheme.color}`}>
                  <currentTheme.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm md:text-base">
                      {userName ? `Welcome back, ${userName}!` : "Personalized for your constitution"}
                    </span>
                    <Badge variant="outline" className={`${currentTheme.color} border-current text-xs font-semibold uppercase tracking-wider`}>
                      {userDosha} Dominant {secondaryDosha ? `(${secondaryDosha} secondary)` : ""}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Showing tailored food recommendations and recipes optimized for your {userDosha} constitution.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Button
                  variant={filterByPersonalized ? "default" : "outline"}
                  size="sm"
                  onClick={onTogglePersonalized}
                  className="text-xs gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {filterByPersonalized ? `Personalized (${userDosha})` : "Viewing All Doshas"}
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground">
                  <Link to="/assessment">Retake Quiz</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-5 rounded-2xl border border-secondary/30 bg-gradient-to-r from-secondary/10 via-card to-accent/10 backdrop-blur-sm shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-left">
                <LotusIcon className="w-10 h-10 text-secondary shrink-0 hidden sm:block" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm md:text-base">
                    Discover Your Personalized Ayurvedic Diet
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Take the 3-minute Dosha Assessment to customize this entire knowledge hub to your unique Vata, Pitta, or Kapha constitution.
                  </p>
                </div>
              </div>
              <Button size="sm" asChild className="bg-secondary hover:bg-secondary/90 text-white shadow-sm shrink-0 gap-1.5 text-xs">
                <Link to="/assessment">
                  Take Dosha Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Global Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search for a food, such as rice, wheat or barley..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-10 py-6 text-sm md:text-base rounded-2xl bg-card/80 border-border/80 shadow-md backdrop-blur focus-visible:ring-secondary"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground bg-muted px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Quick-Jump Section Navigation Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center flex-nowrap"
        >
          {sectionLinks.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onSectionClick(sec.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-secondary text-white shadow-sm scale-105"
                    : "bg-card/70 hover:bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <sec.icon className="w-3.5 h-3.5" />
                {sec.label}
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

