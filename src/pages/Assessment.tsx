import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LotusIcon, MandalaIcon } from "@/components/icons/SacredIcons";
import { ChevronLeft, ChevronRight, Lock, Sparkles, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  QUESTIONS,
  DOSHA_META,
  topTraits,
  scoreLocally,
  type AssessmentAnswers,
  type PredictionResult,
  type Dosha,
} from "@/lib/doshaAssessment";
import { predictDosha } from "@/lib/doshaApi";
import { saveAssessmentToSupabase, saveGuestAssessmentToSupabase } from "@/lib/doshaService";
import { writeGuestCache, markGuestCacheSynced } from "@/lib/guestDoshaCache";
import { AssessmentAnswersSchema } from "@/lib/validation/schemas";


const Assessment = () => {
  const navigate = useNavigate();
  const { user, session, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predictionSource, setPredictionSource] = useState<"api" | "local">("local");

  const total = QUESTIONS.length;
  const question = QUESTIONS[currentQuestion];
  const currentValue = answers[question.id];

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < total - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    // Validate all 11 questions with strict Zod schema
    const validation = AssessmentAnswersSchema.safeParse(answers);
    if (!validation.success) {
      toast({
        title: "Incomplete Assessment",
        description: "Please complete all 11 questions with valid choices before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const fullAnswers = validation.data as AssessmentAnswers;

      // 1. Call the ML prediction endpoint, securely sending user's session token if authenticated
      const token = session?.access_token;
      const { result, source, saved, error: apiError } = await predictDosha(fullAnswers, token);

      if (source === "local" || apiError) {
        console.warn("ML API notice:", apiError || "Using local heuristic fallback");
        toast({
          title: "ML Service Offline",
          description: "Calculated your Dosha using traditional Ayurvedic principles.",
        });
      }

      setPredictionResult(result);
      setPredictionSource(source);

      // Compute simple count scores
      const vataCount = QUESTIONS.filter(
        (q) => q.options.find((o) => o.value === fullAnswers[q.id])?.dosha === "Vata",
      ).length;
      const pittaCount = QUESTIONS.filter(
        (q) => q.options.find((o) => o.value === fullAnswers[q.id])?.dosha === "Pitta",
      ).length;
      const kaphaCount = QUESTIONS.filter(
        (q) => q.options.find((o) => o.value === fullAnswers[q.id])?.dosha === "Kapha",
      ).length;

      // 2. Persist or cache depending on auth state
      if (user) {
        // ── Authenticated: persist to Supabase ──────────────────────────────
        const dominantDosha = result.primaryDosha.toLowerCase() as "vata" | "pitta" | "kapha";

        // If the backend already saved it via token, just notify and refresh
        if (saved) {
          toast({
            title: "Assessment saved!",
            description: `Your dosha profile has been updated — ${result.primaryDosha} dominant.`,
          });
          if (refreshProfile) {
            await refreshProfile();
          }
        } else {
          // Double-safety: persist directly to Supabase through doshaService
          const { error: saveError } = await saveAssessmentToSupabase({
            userId: user.id,
            dominantDosha,
            vataScore: vataCount,
            pittaScore: pittaCount,
            kaphaScore: kaphaCount,
            answers: fullAnswers,
            confidence: result.confidence,
            secondaryDosha: result.secondaryDosha,
            secondaryConfidence: result.secondaryConfidence,
            keyTraits: result.keyTraits,
            predictionSource: source,
          });

          if (saveError) {
            console.error("Failed to save assessment to Supabase:", saveError);
            toast({
              title: "Assessment complete",
              description: "Could not save to your profile. Please check your connection.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Assessment saved!",
              description: `Your dosha profile has been updated — ${result.primaryDosha} dominant.`,
            });
            if (refreshProfile) {
              await refreshProfile();
            }
          }
        }
      } else {
        // ── Guest: cache result in localStorage + attempt Supabase insert ──
        const cached = writeGuestCache({
          primaryDosha: result.primaryDosha,
          confidence: result.confidence,
          secondaryDosha: result.secondaryDosha,
          secondaryConfidence: result.secondaryConfidence,
          keyTraits: result.keyTraits,
          answers: fullAnswers,
          vataScore: vataCount,
          pittaScore: pittaCount,
          kaphaScore: kaphaCount,
        });

        // Fire background persistence to Supabase (guest_session_id)
        const guestDom = result.primaryDosha.toLowerCase() as "vata" | "pitta" | "kapha";
        saveGuestAssessmentToSupabase({
          guestSessionId: cached.guestSessionId,
          dominantDosha: guestDom,
          vataScore: vataCount,
          pittaScore: pittaCount,
          kaphaScore: kaphaCount,
          answers: fullAnswers,
          confidence: result.confidence,
          secondaryDosha: result.secondaryDosha,
          secondaryConfidence: result.secondaryConfidence,
          keyTraits: result.keyTraits,
          predictionSource: source,
        }).then(({ id }) => {
          if (id) {
            markGuestCacheSynced(id);
          }
        }).catch((err) => {
          console.warn("Guest background persistence notice:", err);
        });
        // Result is shown immediately; user can sign up below to persist it
      }
    } catch (error) {
      console.error("Assessment submission failed:", error);
      // Even if everything fails, show local fallback results
      const fallback = scoreLocally(answers);
      setPredictionResult(fallback);
      setPredictionSource("local");
    }

    setIsSaving(false);
    setShowResults(true);
  };

  const progress = ((currentQuestion + 1) / total) * 100;

  // ─── Results View ───────────────────────────────────────────────

  if (showResults && predictionResult) {
    const primary = predictionResult.primaryDosha;
    const secondary = predictionResult.secondaryDosha;
    const meta = DOSHA_META[primary];
    const secondaryMeta = DOSHA_META[secondary];
    const primaryPct = Math.round(predictionResult.confidence * 100);
    const secondaryPct = Math.round(predictionResult.secondaryConfidence * 100);
    const apiTraits = predictionResult.keyTraits;
    const localTraits = topTraits(answers, primary, 4);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Result Header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="relative inline-block mb-4"
                >
                  <LotusIcon className="w-20 h-20 text-secondary mx-auto" />
                  <motion.div
                    className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                  Your AI Dosha Profile
                </h1>
                <p className="text-muted-foreground text-lg">
                  {predictionSource === "api"
                    ? "Predicted by our XGBoost ML model"
                    : "Based on Ayurvedic scoring heuristics"}
                </p>
              </div>

              {/* Informative Banner when ML Service is Offline */}
              {predictionSource === "local" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start sm:items-center gap-3.5 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="text-sm leading-relaxed">
                    <strong className="font-semibold text-amber-950 dark:text-amber-100">Ayurvedic Heuristics Active:</strong> Our XGBoost ML service is currently offline or unreachable. Your Dosha profile was successfully calculated using traditional Ayurvedic heuristic scoring rules rather than the ML model.
                  </div>
                </motion.div>
              )}

              {/* Primary + Secondary Dosha Cards */}
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mb-10">
                {/* Primary Dosha Hero Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card rounded-3xl p-8 md:p-10"
                >
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Your Primary Dosha
                  </div>
                  <div className="flex items-end gap-4 flex-wrap mb-1">
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${meta.gradientClass} flex items-center justify-center shadow-glow`}
                    >
                      <span className="font-display text-4xl text-white">{primary[0]}</span>
                    </div>
                    <div>
                      <h2 className={`font-display text-4xl md:text-5xl ${meta.textColorClass}`}>
                        {primary}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {meta.tagline} · {meta.element}
                      </p>
                    </div>
                    <div className={`text-3xl font-display ${meta.textColorClass} ml-auto`}>
                      {primaryPct}%
                    </div>
                  </div>
                  <p className="text-foreground mt-4 leading-relaxed">{meta.description}</p>

                  {/* Confidence bar */}
                  <div className="mt-6 h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${meta.gradientClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${primaryPct}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>

                {/* Secondary Dosha Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="glass-card rounded-3xl p-8 flex flex-col"
                >
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Secondary Influence
                  </div>
                  <div className="flex items-end gap-3 mb-1">
                    <h3 className={`font-display text-3xl ${secondaryMeta.textColorClass}`}>
                      {secondary}
                    </h3>
                    <span
                      className={`text-xl font-display ${secondaryMeta.textColorClass}`}
                    >
                      {secondaryPct}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{secondaryMeta.tagline}</p>
                  <p className="mt-3 text-sm text-foreground leading-relaxed">
                    {secondaryMeta.description}
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${secondaryMeta.gradientClass}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${secondaryPct}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Detailed Insights — Auth-Gated */}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid lg:grid-cols-2 gap-6 mb-10"
                >
                  {/* Wellness Recommendations */}
                  <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                      <Sparkles className="h-4 w-4" />
                      Wellness Recommendations
                    </div>
                    <h3 className="font-display text-2xl text-foreground mb-6">
                      For your {primary} constitution
                    </h3>
                    <ul className="space-y-3">
                      {meta.recommendations.map((rec, i) => (
                        <motion.li
                          key={rec}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + 0.05 * i }}
                          className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"
                        >
                          <span
                            className={`mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-gradient-to-br ${meta.gradientClass}`}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </span>
                          <span className="text-sm text-foreground">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Traits */}
                  <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                      <Sparkles className="h-4 w-4" />
                      Why this prediction?
                    </div>
                    <h3 className="font-display text-2xl text-foreground mb-2">
                      Key traits identified
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      {apiTraits
                        ? "Traits identified by the ML model for your dominant Dosha."
                        : `These are the answers that pointed most strongly toward ${primary}.`}
                    </p>
                    <ul className="space-y-2.5">
                      {apiTraits
                        ? apiTraits.map((trait) => (
                            <li
                              key={trait}
                              className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"
                            >
                              <span
                                className={`mt-0.5 grid place-items-center h-5 w-5 rounded-full shrink-0 bg-gradient-to-br ${meta.gradientClass}`}
                              >
                                <Check className="h-3 w-3 text-white" />
                              </span>
                              <span className="text-sm font-medium text-foreground">{trait}</span>
                            </li>
                          ))
                        : localTraits.map((t) => (
                            <li key={t.question} className="rounded-xl bg-muted/50 p-3">
                              <div className="text-xs text-muted-foreground">{t.question}</div>
                              <div className="text-sm font-medium text-foreground">✓ {t.label}</div>
                            </li>
                          ))}
                      {!apiTraits && localTraits.length === 0 && (
                        <li className="text-sm text-muted-foreground">
                          Mixed signals — your constitution is balanced.
                        </li>
                      )}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                /* Unauthenticated — teaser with sign-up prompt */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass-card rounded-3xl p-8 mb-10 text-center"
                >
                  <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-2xl text-foreground mb-2">
                    Unlock Detailed Insights
                  </h3>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                    Sign up to see personalized wellness recommendations, key trait analysis,
                    assessment history, and save your dosha profile for future reference.
                  </p>
                  <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
                    Sign Up to Unlock
                  </Button>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button variant="hero" size="xl" onClick={() => navigate("/dashboard")}>
                    Continue to Dashboard
                  </Button>
                ) : (
                  <Button variant="ghost" size="lg" onClick={() => navigate("/")}>
                    Back to Home
                  </Button>
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center mt-8 max-w-lg mx-auto">
                Dosha Prediction AI is an educational wellness tool. It does not provide medical
                diagnosis or treatment. Consult a qualified practitioner for health concerns.
              </p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Question Flow View ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              AI Dosha Assessment
            </h1>
            <p className="text-muted-foreground text-lg">
              Answer these questions to discover your unique Ayurvedic constitution
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              11 questions · ~90 seconds · powered by ML
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Question {currentQuestion + 1} of {total}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-secondary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl p-8 md:p-10 relative"
            >
              {/* Mandala decoration */}
              <div className="absolute top-4 right-4 text-accent/10">
                <MandalaIcon className="w-20 h-20" />
              </div>

              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
                {question.title}
              </h2>
              {question.hint && (
                <p className="text-sm text-muted-foreground mb-6">{question.hint}</p>
              )}
              {!question.hint && <div className="mb-6" />}

              <div className="space-y-4">
                {question.options.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                      currentValue === option.value
                        ? "border-secondary bg-secondary/10"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-foreground font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant="saffron"
              onClick={handleNext}
              disabled={!currentValue || isSaving}
              className="gap-2"
            >
              {isSaving
                ? "Analyzing…"
                : currentQuestion === total - 1
                  ? "Reveal my Dosha"
                  : "Next"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
