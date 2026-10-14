import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LotusIcon, MandalaIcon } from "@/components/icons/SacredIcons";
import { readGuestCache, type GuestDoshaCache } from "@/lib/guestDoshaCache";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters").optional();

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [guestCache, setGuestCache] = useState<GuestDoshaCache | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      const cached = readGuestCache();
      if (cached) {
        setGuestCache(cached);
      }
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (isSignUp && fullName) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password, fullName || undefined);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else if (data?.session) {
          toast({
            title: "Account created!",
            description: "Welcome to VedicWell. Entering your dashboard...",
          });
          navigate("/dashboard", { replace: true });
        } else {
          setIsVerificationSent(true);
          toast({
            title: "Verification email sent",
            description: "Please check your inbox. Clicking the link will take you directly to your dashboard.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Invalid credentials",
              description: "The email or password you entered is incorrect.",
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email not verified",
              description: "Please verify your email before signing in.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-secondary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <MandalaIcon className="w-64 h-64" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-primary/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <MandalaIcon className="w-80 h-80" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <LotusIcon className="w-10 h-10 text-secondary" />
          <span className="font-display text-2xl text-foreground">VedicWell</span>
        </Link>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 shadow-glow">
          <AnimatePresence mode="wait">
            {isVerificationSent ? (
              <motion.div
                key="verification"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-2"
              >
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="font-display text-2xl text-foreground mb-2">Check Your Email</h2>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  We've sent a verification link to <strong className="text-foreground">{email}</strong>.
                  Click the link in your email and you will be taken directly to your dashboard.
                </p>
                <div className="p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground mb-6">
                  Can't find the email? Check your spam folder or return to sign in once confirmed.
                </div>
                <div className="space-y-3">
                  <Button
                    variant="saffron"
                    className="w-full"
                    onClick={() => {
                      setIsVerificationSent(false);
                      setIsSignUp(false);
                    }}
                  >
                    Go to Sign In
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => setIsVerificationSent(false)}
                  >
                    Use a different email
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={isSignUp ? "signup" : "signin"}
                initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                transition={{ duration: 0.3 }}
              >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl text-foreground mb-2">
                  {isSignUp ? "Begin Your Journey" : "Welcome Back"}
                </h1>
                <p className="text-muted-foreground">
                  {isSignUp
                    ? "Create an account to discover your Ayurvedic path"
                    : "Sign in to continue your wellness journey"}
                </p>
              </div>

              {guestCache && (
                <div className="mb-6 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div className="text-left text-xs leading-relaxed">
                    <p className="font-semibold text-foreground">
                      {guestCache.primaryDosha} Assessment Ready to Sync
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      {isSignUp ? "Create an account" : "Sign in"} to automatically link your assessment results, recommendations, and traits to your permanent profile.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-background/50"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="saffron"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </>
                  ) : (
                    <>
                      {isSignUp ? "Create Account" : "Sign In"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrors({});
                    }}
                    className="text-secondary hover:underline font-medium"
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
