import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Download,
  ChefHat,
  Clock,
  Flame,
  Leaf,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  dosha: "vata" | "pitta" | "kapha" | "tridosha";
  prepTime: string;
  calories: number;
  image: string;
}

const sampleMeals: Meal[] = [
  { id: "1", name: "Cooling Cucumber Raita", type: "breakfast", dosha: "pitta", prepTime: "10 min", calories: 120, image: "🥒" },
  { id: "2", name: "Coconut Mango Lassi", type: "breakfast", dosha: "pitta", prepTime: "5 min", calories: 180, image: "🥭" },
  { id: "3", name: "Quinoa Vegetable Bowl", type: "lunch", dosha: "tridosha", prepTime: "25 min", calories: 420, image: "🥗" },
  { id: "4", name: "Mint Coriander Chutney", type: "snack", dosha: "pitta", prepTime: "10 min", calories: 45, image: "🌿" },
  { id: "5", name: "Basmati Rice with Ghee", type: "lunch", dosha: "tridosha", prepTime: "20 min", calories: 350, image: "🍚" },
  { id: "6", name: "Steamed Vegetables", type: "dinner", dosha: "pitta", prepTime: "15 min", calories: 180, image: "🥦" },
  { id: "7", name: "Golden Milk", type: "dinner", dosha: "tridosha", prepTime: "10 min", calories: 150, image: "🥛" },
  { id: "8", name: "Rose Petal Tea", type: "snack", dosha: "pitta", prepTime: "5 min", calories: 10, image: "🌹" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;

const doshaColors = {
  vata: "bg-sky-500/10 text-sky-700 dark:text-sky-300 dark:bg-card border-sky-500/30 dark:border-sky-700/30",
  pitta: "bg-orange-500/10 text-orange-700 dark:text-orange-300 dark:bg-card border-orange-500/30 dark:border-orange-800/30",
  kapha: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 dark:bg-card border-emerald-500/30 dark:border-emerald-700/30",
  tridosha: "bg-accent/10 text-accent-foreground dark:bg-card border-accent/30 dark:border-border/40",
};

const Nutrition = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, Meal | null>>>(() => {
    const plan: Record<string, Record<string, Meal | null>> = {};
    weekDays.forEach((day) => {
      plan[day] = {
        breakfast: sampleMeals.find((m) => m.type === "breakfast") || null,
        lunch: sampleMeals.find((m) => m.type === "lunch") || null,
        dinner: sampleMeals.find((m) => m.type === "dinner") || null,
        snack: sampleMeals.find((m) => m.type === "snack") || null,
      };
    });
    return plan;
  });

  const [selectedMealSlot, setSelectedMealSlot] = useState<{ day: string; type: string } | null>(null);

  const handleSelectMeal = (meal: Meal) => {
    if (selectedMealSlot) {
      setMealPlan((prev) => ({
        ...prev,
        [selectedMealSlot.day]: {
          ...prev[selectedMealSlot.day],
          [selectedMealSlot.type]: meal,
        },
      }));
      setSelectedMealSlot(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
          >
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
                Nutrition Planner
              </h1>
              <p className="text-muted-foreground">
                Personalized meal plans based on your Pitta dosha
              </p>
            </div>
            <Button variant="default" className="gap-2">
              <Download className="w-4 h-4" />
              Export Grocery List
            </Button>
          </motion.div>

          {/* Week Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-6"
          >
            <Button variant="ghost" size="sm" onClick={() => setCurrentWeek((w) => w - 1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Previous Week
            </Button>
            <h2 className="font-display text-xl text-foreground">
              Week of Jan {20 + currentWeek * 7}, 2025
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentWeek((w) => w + 1)} className="gap-2">
              Next Week
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Meal Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-6 overflow-x-auto"
          >
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-3 text-left font-display text-foreground w-24">Meal</th>
                  {weekDays.map((day) => (
                    <th key={day} className="p-3 text-center font-display text-foreground">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mealTypes.map((mealType) => (
                  <tr key={mealType} className="border-t border-border">
                    <td className="p-3 capitalize font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {mealType === "breakfast" && <Flame className="w-4 h-4 text-secondary" />}
                        {mealType === "lunch" && <Utensils className="w-4 h-4 text-primary" />}
                        {mealType === "dinner" && <ChefHat className="w-4 h-4 text-accent" />}
                        {mealType === "snack" && <Leaf className="w-4 h-4 text-muted-foreground" />}
                        {mealType}
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const meal = mealPlan[day][mealType];
                      return (
                        <td key={day} className="p-2">
                          {meal ? (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`p-3 rounded-xl border-2 ${doshaColors[meal.dosha]} cursor-pointer`}
                              onClick={() => setSelectedMealSlot({ day, type: mealType })}
                            >
                              <div className="text-2xl mb-1">{meal.image}</div>
                              <div className="text-xs font-medium truncate">{meal.name}</div>
                              <div className="flex items-center gap-1 text-xs mt-1 opacity-70">
                                <Clock className="w-3 h-3" />
                                {meal.prepTime}
                              </div>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => setSelectedMealSlot({ day, type: mealType })}
                              className="w-full h-24 border-2 border-dashed border-muted rounded-xl flex items-center justify-center text-muted-foreground hover:border-secondary hover:text-secondary transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Meal Selector Modal */}
          {selectedMealSlot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMealSlot(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-2xl text-foreground mb-4">
                  Choose a Meal for {selectedMealSlot.day} - {selectedMealSlot.type}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {sampleMeals
                    .filter((m) => m.type === selectedMealSlot.type)
                    .map((meal) => (
                      <motion.button
                        key={meal.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border-2 text-left ${doshaColors[meal.dosha]}`}
                        onClick={() => handleSelectMeal(meal)}
                      >
                        <div className="text-3xl mb-2">{meal.image}</div>
                        <div className="font-medium">{meal.name}</div>
                        <div className="flex items-center gap-3 text-sm mt-2 opacity-70">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.prepTime}
                          </span>
                          <span>{meal.calories} cal</span>
                        </div>
                      </motion.button>
                    ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={() => setSelectedMealSlot(null)}>
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Dosha Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <span className="text-muted-foreground text-sm">Dosha Balance:</span>
            {Object.entries(doshaColors).map(([dosha, color]) => (
              <span key={dosha} className={`px-3 py-1 rounded-full text-sm capitalize ${color}`}>
                {dosha}
              </span>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Nutrition;
