import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { LotusIcon, SunIcon, LeafIcon } from "@/components/icons/SacredIcons";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchLatestUserDosha, type UserDoshaRecord } from "@/lib/doshaService";
import {
  Sun,
  Moon,
  Droplets,
  Wind,
  Flame,
  Heart,
  Brain,
  Utensils,
  CheckCircle2,
  Circle,
  TrendingUp,
  Calendar,
  MessageCircle,
  Snowflake,
  Leaf,
} from "lucide-react";

// Dosha-specific recommendations
const doshaRecommendations = {
  vata: {
    icon: Wind,
    color: "from-sky-400 to-blue-300",
    rituals: [
      { title: "Grounding Meditation", time: "6:00 AM", duration: "15 min", icon: Brain, color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
      { title: "Warm Oil Abhyanga", time: "6:15 AM", duration: "15 min", icon: Heart, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
      { title: "Ginger-Lemon Tea", time: "6:30 AM", duration: "5 min", icon: Droplets, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
      { title: "Nadi Shodhana Pranayama", time: "7:00 AM", duration: "10 min", icon: Wind, color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
      { title: "Warm Vata-Balancing Breakfast", time: "7:30 AM", duration: "20 min", icon: Utensils, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
      { title: "Midday Warm Soup", time: "12:00 PM", duration: "15 min", icon: Utensils, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
      { title: "Calming Yoga Nidra", time: "6:00 PM", duration: "20 min", icon: LeafIcon, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
      { title: "Warm Milk & Nutmeg", time: "9:00 PM", duration: "5 min", icon: Moon, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
    ],
    tip: "Embrace warmth, routine, and nourishment. Favor cooked foods, warm beverages, and calming activities. Avoid cold, dry, and raw foods.",
    foods: ["Sweet potatoes", "Ghee", "Warm soups", "Sesame oil", "Cinnamon"],
  },
  pitta: {
    icon: Flame,
    color: "from-orange-400 to-amber-300",
    rituals: [
      { title: "Cooling Meditation", time: "6:00 AM", duration: "15 min", icon: Brain, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
      { title: "Coconut Oil Abhyanga", time: "6:15 AM", duration: "15 min", icon: Heart, color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
      { title: "Mint & Cucumber Water", time: "6:30 AM", duration: "5 min", icon: Droplets, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
      { title: "Sheetali Pranayama", time: "7:00 AM", duration: "10 min", icon: Wind, color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
      { title: "Pitta-Cooling Breakfast", time: "7:30 AM", duration: "20 min", icon: Utensils, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
      { title: "Rose Water Eye Wash", time: "12:00 PM", duration: "5 min", icon: Droplets, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
      { title: "Moonlight Walk", time: "7:00 PM", duration: "20 min", icon: Moon, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
      { title: "Cooling Aloe Vera Drink", time: "9:00 PM", duration: "5 min", icon: Leaf, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
    ],
    tip: "Stay cool and balanced. Favor sweet, bitter, and astringent tastes. Avoid spicy, sour, and fermented foods. Spend time near water.",
    foods: ["Cucumber", "Coconut", "Mint", "Sweet fruits", "Leafy greens"],
  },
  kapha: {
    icon: Snowflake,
    color: "from-emerald-400 to-green-300",
    rituals: [
      { title: "Energizing Meditation", time: "5:30 AM", duration: "15 min", icon: Brain, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
      { title: "Dry Brushing (Garshana)", time: "5:45 AM", duration: "10 min", icon: Heart, color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
      { title: "Warm Honey-Lemon Water", time: "6:00 AM", duration: "5 min", icon: Droplets, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
      { title: "Kapalabhati Pranayama", time: "6:15 AM", duration: "10 min", icon: Wind, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
      { title: "Light Kapha Breakfast", time: "7:00 AM", duration: "15 min", icon: Utensils, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
      { title: "Vigorous Sun Salutations", time: "12:00 PM", duration: "20 min", icon: Sun, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
      { title: "Spiced Herbal Tea", time: "4:00 PM", duration: "5 min", icon: Utensils, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
      { title: "Early Light Dinner", time: "6:30 PM", duration: "15 min", icon: Moon, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
    ],
    tip: "Stay active and light. Rise early, exercise vigorously, and favor pungent, bitter, and astringent tastes. Avoid heavy, oily, and sweet foods.",
    foods: ["Ginger", "Turmeric", "Honey", "Leafy greens", "Millet"],
  },
};

const quickActions = [
  { title: "Meal Plan", icon: Utensils, href: "/nutrition", color: "bg-primary" },
  { title: "Meditate", icon: Brain, href: "/mindfulness", color: "bg-accent" },
  { title: "AI Chat", icon: MessageCircle, href: "/symptom-checker", color: "bg-secondary" },
  { title: "Calendar", icon: Calendar, href: "#", color: "bg-muted-foreground" },
];

const weeklyProgress = [
  { day: "Mon", completed: 8, total: 8 },
  { day: "Tue", completed: 7, total: 8 },
  { day: "Wed", completed: 8, total: 8 },
  { day: "Thu", completed: 6, total: 8 },
  { day: "Fri", completed: 8, total: 8 },
  { day: "Sat", completed: 7, total: 8 },
  { day: "Sun", completed: 4, total: 8 },
];

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const [latestAssessment, setLatestAssessment] = useState<UserDoshaRecord | null>(null);
  const [isCheckingAssessment, setIsCheckingAssessment] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      if (!loading) {
        setIsCheckingAssessment(false);
      }
      return;
    }

    let isCurrent = true;
    setIsCheckingAssessment(true);

    fetchLatestUserDosha(user.id)
      .then((record) => {
        if (isCurrent) {
          setLatestAssessment(record);
          setIsCheckingAssessment(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch assessment for dashboard:", err);
        if (isCurrent) {
          setIsCheckingAssessment(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, loading]);

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show clean loading state while verifying auth & completed assessment
  if (loading || isCheckingAssessment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <LotusIcon className="w-16 h-16 text-secondary animate-pulse mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Verifying your wellness profile...</p>
      </div>
    );
  }

  // Derive current dosha dynamically from completed assessment or confirmed profile
  const dominant = latestAssessment?.dominantDosha || profile?.dominant_dosha?.toLowerCase();
  const hasCompletedAssessment = Boolean(
    dominant && (latestAssessment?.status === "completed" || profile?.assessment_completed || profile?.dominant_dosha)
  );

  // Issue 2 Gate: If no completed assessment exists, redirect immediately to /assessment
  if (!hasCompletedAssessment || !dominant) {
    return <Navigate to="/assessment" replace state={{ reason: "assessment_required" }} />;
  }

  const doshaType = dominant as "vata" | "pitta" | "kapha";
  const doshaData = doshaRecommendations[doshaType] || doshaRecommendations.vata;
  const DoshaIcon = doshaData.icon;

  const initialRituals = useMemo(
    () => doshaData.rituals.map((r, i) => ({ ...r, id: i + 1, completed: false })),
    [doshaType, doshaData]
  );

  const [rituals, setRituals] = useState(initialRituals);

  // Reset rituals when dosha changes
  useMemo(() => setRituals(initialRituals), [initialRituals]);

  const toggleRitual = (id: number) => {
    setRituals(prev =>
      prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const completedCount = rituals.filter(r => r.completed).length;
  const progress = (completedCount / rituals.length) * 100;
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Friend";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
                  Namaste, {displayName} 🙏
                </h1>
                <p className="text-muted-foreground">
                  Your personalized {doshaType.charAt(0).toUpperCase() + doshaType.slice(1)} wellness journey
                </p>
              </div>

              {/* Dosha Badge */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${doshaData.color} text-white font-semibold shadow-soft flex items-center gap-2`}>
                  <DoshaIcon className="w-5 h-5" />
                  <span>{doshaType.charAt(0).toUpperCase() + doshaType.slice(1)} Dosha</span>
                  {latestAssessment?.confidence && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal ml-1">
                      {Math.round(latestAssessment.confidence * 100)}% Match
                    </span>
                  )}
                </div>
                {latestAssessment?.secondaryDosha && (
                  <div className="glass-card px-4 py-3 rounded-xl text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="text-xs uppercase tracking-wider">Secondary:</span>
                    <span className="font-semibold text-foreground capitalize">
                      {latestAssessment.secondaryDosha}
                    </span>
                    {latestAssessment.secondaryConfidence && (
                      <span className="text-xs">
                        ({Math.round(latestAssessment.secondaryConfidence * 100)}%)
                      </span>
                    )}
                  </div>
                )}
                {profile?.vata_percentage != null && !latestAssessment?.secondaryDosha && (
                  <div className="hidden md:flex glass-card px-4 py-3 rounded-xl gap-3 text-sm text-muted-foreground">
                    <span>V:{profile.vata_percentage}%</span>
                    <span>P:{profile.pitta_percentage}%</span>
                    <span>K:{profile.kapha_percentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-3xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-foreground">Today's Progress</h2>
                  <span className="text-muted-foreground">
                    {completedCount}/{rituals.length} completed
                  </span>
                </div>

                <div className="h-4 bg-muted rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <p className="text-muted-foreground">
                  {progress === 100
                    ? "🌟 Amazing! You've completed all your rituals today!"
                    : `Keep going! ${rituals.length - completedCount} more rituals to complete.`}
                </p>
              </motion.div>

              {/* Daily Rituals List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-foreground">
                    {doshaType.charAt(0).toUpperCase() + doshaType.slice(1)} Daily Rituals
                  </h2>
                  <Link to="/assessment">
                    <Button variant="ghost" size="sm">Retake Quiz</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {rituals.map((ritual, index) => (
                    <motion.div
                      key={ritual.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => toggleRitual(ritual.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        ritual.completed
                          ? "bg-primary/5 border-2 border-primary/20"
                          : "bg-card hover:bg-muted border-2 border-transparent"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${ritual.color} flex items-center justify-center`}>
                        <ritual.icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <h3 className={`font-semibold ${ritual.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {ritual.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {ritual.time} • {ritual.duration}
                        </p>
                      </div>

                      <div>
                        {ritual.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Weekly Progress Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-3xl p-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl text-foreground">Weekly Overview</h2>
                </div>

                <div className="flex items-end justify-between gap-3 h-40">
                  {weeklyProgress.map((day, index) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-muted rounded-lg overflow-hidden relative" style={{ height: "120px" }}>
                        <motion.div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/60 rounded-lg"
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.completed / day.total) * 100}%` }}
                          transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground mt-2">{day.day}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl p-6"
              >
                <h2 className="font-display text-xl text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.href}
                      className={`${action.color} text-primary-foreground p-4 rounded-xl text-center hover:opacity-90 transition-opacity`}
                    >
                      <action.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{action.title}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Dosha Wisdom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-3xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <LotusIcon className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="font-display text-xl text-foreground">Daily Wisdom</h2>
                </div>
                <p className="text-foreground italic leading-relaxed">
                  "{doshaData.tip}"
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  — Ayurvedic Tip for {doshaType.charAt(0).toUpperCase() + doshaType.slice(1)}
                </div>
              </motion.div>

              {/* Recommended Foods */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card rounded-3xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="font-display text-xl text-foreground">Top Foods Today</h2>
                </div>
                <ul className="space-y-2">
                  {doshaData.foods.map((food) => (
                    <li key={food} className="flex items-center gap-2 text-foreground">
                      <LeafIcon className="w-4 h-4 text-accent" />
                      {food}
                    </li>
                  ))}
                </ul>
                <Link to="/nutrition" className="block mt-4">
                  <Button variant="outline" className="w-full" size="sm">
                    View Full Meal Plan
                  </Button>
                </Link>
              </motion.div>

              {/* AI Assistant Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-3xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center animate-pulse-glow">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-foreground">AI Symptom Checker</h2>
                    <p className="text-xs text-muted-foreground">Ayurvedic Wisdom</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Get personalized advice for symptoms, diet, and lifestyle based on your {doshaType} dosha.
                </p>
                <Link to="/symptom-checker">
                  <Button variant="saffron" className="w-full">
                    Check Symptoms
                  </Button>
                </Link>
              </motion.div>

              {/* Upgrade Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-3xl p-6"
              >
                <h2 className="font-display text-xl mb-2">Unlock Premium</h2>
                <ul className="text-primary-foreground/80 text-sm space-y-2 mb-4">
                  <li>✦ Unlimited AI consultations</li>
                  <li>✦ Advanced meal planning</li>
                  <li>✦ Family sharing</li>
                  <li>✦ Practitioner Q&A</li>
                </ul>
                <Button variant="hero" className="w-full">
                  Upgrade Now
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
