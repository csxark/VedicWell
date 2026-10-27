import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Leaf, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const DOSHA_INFO = {
  vata: {
    color: "from-blue-500 to-purple-500",
    description: "Air & Space - Creative, quick-thinking, adaptable",
  },
  pitta: {
    color: "from-orange-500 to-red-500",
    description: "Fire & Water - Determined, intelligent, focused",
  },
  kapha: {
    color: "from-green-500 to-teal-500",
    description: "Earth & Water - Calm, steady, nurturing",
  },
};

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [doshaType, setDoshaType] = useState<string>("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Auto-set dosha from profile if available
  useState(() => {
    if (profile?.dominant_dosha && !doshaType) {
      setDoshaType(profile.dominant_dosha);
    }
  });

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "We need to know what you're experiencing to provide recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");
    setShowResults(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/symptom-checker`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            symptoms,
            doshaType: doshaType || "Unknown",
            additionalContext,
          }),
        }
      );

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.error || "Failed to get recommendations");
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save to history if user is logged in
      if (user && fullResponse) {
        const { error: insertError } = await supabase.from("symptom_history").insert({
          user_id: user.id,
          symptoms,
          dosha_type: doshaType || null,
          additional_context: additionalContext || null,
          ai_response: fullResponse,
        });

        if (insertError) {
          console.error("Failed to save symptom history:", insertError.message);
        }
      }
    } catch (error) {
      console.error("Symptom checker error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms("");
    setAdditionalContext("");
    setResponse("");
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Dosha Selection */}
            <Card className="glass-card border-sacred-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LotusIcon className="w-5 h-5 text-sacred-gold" />
                  Your Dosha Type
                </CardTitle>
                <CardDescription>
                  Select your primary dosha for personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={doshaType} onValueChange={setDoshaType}>
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select your dosha type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vata">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${DOSHA_INFO.vata.color}`} />
                        <span>Vata - {DOSHA_INFO.vata.description}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pitta">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${DOSHA_INFO.pitta.color}`} />
                        <span>Pitta - {DOSHA_INFO.pitta.description}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="kapha">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${DOSHA_INFO.kapha.color}`} />
                        <span>Kapha - {DOSHA_INFO.kapha.description}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!doshaType && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Not sure? <a href="/assessment" className="text-sacred-saffron hover:underline">Take the Dosha Quiz</a>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Symptoms Input */}
            <Card className="glass-card border-sacred-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="w-5 h-5 text-sacred-saffron" />
                  Describe Your Symptoms
                </CardTitle>
                <CardDescription>
                  Share what you're experiencing in detail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., I've been experiencing digestive issues, feeling bloated after meals, and having trouble sleeping at night..."
                  className="min-h-[120px] bg-background/50"
                />
                <Textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Additional context (optional): lifestyle, diet, stress levels, recent changes..."
                  className="min-h-[80px] bg-background/50"
                />
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-sacred-saffron/10 border border-sacred-saffron/20">
              <AlertCircle className="w-5 h-5 text-sacred-saffron shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Important:</strong> This AI-powered tool provides educational 
                Ayurvedic guidance based on traditional wisdom. It is not a substitute for professional medical 
                advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !symptoms.trim()}
              className="w-full"
              variant="saffron"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing your symptoms...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Get Ayurvedic Recommendations
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Results Card */}
            <Card className="glass-card border-sacred-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-forest" />
                    Ayurvedic Recommendations
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Analysis
                  </Button>
                </div>
                {doshaType && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${DOSHA_INFO[doshaType as keyof typeof DOSHA_INFO]?.color}`} />
                    <span className="text-sm text-muted-foreground capitalize">
                      {doshaType} Constitution
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isLoading && !response && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <LotusIcon className="w-12 h-12 text-sacred-gold mx-auto animate-pulse" />
                      <p className="text-muted-foreground">
                        Consulting ancient wisdom...
                      </p>
                    </div>
                  </div>
                )}
                {response && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-foreground mt-6 mb-3 first:mt-0">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-semibold text-foreground mt-5 mb-2 flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-forest" />
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-medium text-foreground mt-4 mb-2">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-muted-foreground mb-3 leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-muted-foreground">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-foreground font-semibold">{children}</strong>
                        ),
                      }}
                    >
                      {response}
                    </ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-sacred-saffron/10 border border-sacred-saffron/20">
              <AlertCircle className="w-5 h-5 text-sacred-saffron shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                These recommendations are based on traditional Ayurvedic principles. Always consult 
                a qualified healthcare provider before making changes to your health regimen.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
