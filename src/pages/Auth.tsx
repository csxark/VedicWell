import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, KeyRound, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LotusIcon, MandalaIcon } from "@/components/icons/SacredIcons";
import { readGuestCache, type GuestDoshaCache } from "@/lib/guestDoshaCache";
import {
  SignUpFormSchema,
  SignInFormSchema,
  PasswordResetRequestSchema,
  sanitizeText,
} from "@/lib/validation/schemas";
import { supabase } from "@/integrations/supabase/client";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY_FAILED_ATTEMPTS = "vedic_auth_failed_attempts";

function getRecentFailedAttempts(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAILED_ATTEMPTS);
    if (!raw) return [];
    const timestamps: number[] = JSON.parse(raw);
    const now = Date.now();
    return timestamps.filter((t) => now - t < LOCKOUT_WINDOW_MS);
  } catch {
    return [];
  }
}

function recordFailedAttempt() {
  const current = getRecentFailedAttempts();
  current.push(Date.now());
  localStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, JSON.stringify(current));
}

function clearFailedAttempts() {
  localStorage.removeItem(STORAGE_KEY_FAILED_ATTEMPTS);
}

const Auth = () => {
  type AuthMode = "signin" | "signup" | "forgot_password";
  const [mode, setMode] = useState<AuthMode>("signin");
  const [guestCache, setGuestCache] = useState<GuestDoshaCache | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lockoutRemainingSecs, setLockoutRemainingSecs] = useState<number>(0);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Check rate limit lockout on mount and interval
  useEffect(() => {
    const checkLockout = () => {
      const recent = getRecentFailedAttempts();
      if (recent.length >= MAX_FAILED_ATTEMPTS) {
        const oldest = recent[0];
        const remaining = Math.max(0, Math.ceil((oldest + LOCKOUT_WINDOW_MS - Date.now()) / 1000));
        setLockoutRemainingSecs(remaining);
      } else {
        setLockoutRemainingSecs(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const validate = (): boolean => {
    setErrors({});
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      const result = SignUpFormSchema.safeParse({
        email: normalizedEmail,
        password,
        fullName: sanitizeText(fullName),
      });

      if (!result.success) {
        const newErrors: Record<string, string> = {};
        for (const err of result.error.errors) {
          const field = err.path[0]?.toString() || "form";
          newErrors[field] = err.message;
        }
        setErrors(newErrors);
        return false;
      }
    } else if (mode === "signin") {
      const result = SignInFormSchema.safeParse({
        email: normalizedEmail,
        password,
      });

      if (!result.success) {
        const newErrors: Record<string, string> = {};
        for (const err of result.error.errors) {
          const field = err.path[0]?.toString() || "form";
          newErrors[field] = err.message;
        }
        setErrors(newErrors);
        return false;
      }
    } else if (mode === "forgot_password") {
      const result = PasswordResetRequestSchema.safeParse({
        email: normalizedEmail,
      });

      if (!result.success) {
        setErrors({ email: result.error.errors[0]?.message || "Invalid email" });
        return false;
      }
    }

    return true;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });

      // Generic message to prevent account enumeration
      setResetEmailSent(true);
      toast({
        title: "Password reset link sent",
        description: "If an account exists with this email, you will receive instructions shortly.",
      });
    } catch {
      // Intentionally show generic message even on unexpected error
      setResetEmailSent(true);
      toast({
        title: "Password reset link sent",
        description: "If an account exists with this email, you will receive instructions shortly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutRemainingSecs > 0) {
      toast({
        title: "Too many failed attempts",
        description: `Please wait ${Math.ceil(lockoutRemainingSecs / 60)} minute(s) before attempting to sign in again.`,
        variant: "destructive",
      });
      return;
    }

    if (mode === "forgot_password") {
      return handleForgotPassword(e);
    }

    if (!validate()) return;

    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "signup") {
        const sanitized = sanitizeText(fullName);
        const { data, error } = await signUp(normalizedEmail, password, sanitized || undefined);

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setMode("signin");
          } else {
            throw error;
          }
        } else if (data?.session) {
          clearFailedAttempts();
          toast({
            title: "Account created!",
            description: "Welcome to VedicWell. Entering your dashboard...",
          });
          navigate("/dashboard", { replace: true });
        } else {
          // Attempt immediate sign in to establish session (deferred email verification)
          const { error: signInError } = await signIn(normalizedEmail, password);
          if (!signInError) {
            clearFailedAttempts();
            toast({
              title: "Account created!",
              description: "Welcome to VedicWell. Entering your dashboard...",
            });
            navigate("/dashboard", { replace: true });
          } else {
            setIsVerificationSent(true);
            toast({
              title: "Account created",
              description: "Please check your inbox if email confirmation is required, or sign in directly.",
            });
          }
        }
      } else {
        // Sign In
        const { error } = await signIn(normalizedEmail, password);
        if (error) {
          recordFailedAttempt();
          const recent = getRecentFailedAttempts();
          if (recent.length >= MAX_FAILED_ATTEMPTS) {
            setLockoutRemainingSecs(LOCKOUT_WINDOW_MS / 1000);
          }

          // Generic error message prevents account enumeration
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
        } else {
          clearFailedAttempts();
          toast({
            title: "Welcome back!",
            description: "Entering your dashboard...",
          });
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
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
                  You can verify whenever convenient, or sign in now.
                </p>
                <div className="p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground mb-6">
                  Didn't receive it? Check your spam folder or return to sign in.
                </div>
                <div className="space-y-3">
                  <Button
                    variant="saffron"
                    className="w-full"
                    onClick={() => {
                      setIsVerificationSent(false);
                      setMode("signin");
                    }}
                  >
                    Go to Sign In
                  </Button>
                </div>
              </motion.div>
            ) : resetEmailSent ? (
              <motion.div
                key="reset_sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-2"
              >
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="font-display text-2xl text-foreground mb-2">Reset Link Sent</h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  If an account exists with <strong className="text-foreground">{email}</strong>, a password reset link has been dispatched. Please check your inbox and spam folder.
                </p>
                <Button
                  variant="saffron"
                  className="w-full"
                  onClick={() => {
                    setResetEmailSent(false);
                    setMode("signin");
                  }}
                >
                  Back to Sign In
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl text-foreground mb-2">
                    {mode === "signup"
                      ? "Begin Your Journey"
                      : mode === "forgot_password"
                      ? "Reset Password"
                      : "Welcome Back"}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {mode === "signup"
                      ? "Create an account to discover your Ayurvedic path"
                      : mode === "forgot_password"
                      ? "Enter your email to receive recovery instructions"
                      : "Sign in to continue your wellness journey"}
                  </p>
                </div>

                {guestCache && mode !== "forgot_password" && (
                  <div className="mb-6 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="text-left text-xs leading-relaxed">
                      <p className="font-semibold text-foreground">
                        {guestCache.primaryDosha} Assessment Ready to Sync
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {mode === "signup" ? "Create an account" : "Sign in"} to link your assessment results, recommendations, and traits to your permanent profile.
                      </p>
                    </div>
                  </div>
                )}

                {lockoutRemainingSecs > 0 && (
                  <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="text-left text-xs leading-relaxed">
                      <p className="font-semibold text-destructive">
                        Sign In Temporarily Locked
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        Too many failed sign in attempts. Please wait {Math.ceil(lockoutRemainingSecs / 60)} minute(s) before trying again.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="e.g. Maya Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 bg-background/50"
                          maxLength={60}
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
                        maxLength={254}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {mode !== "forgot_password" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-foreground">
                          Password
                        </Label>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setMode("forgot_password");
                              setErrors({});
                            }}
                            className="text-xs text-secondary hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-background/50"
                          maxLength={72}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
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
                  )}

                  {/* Cloudflare Turnstile CAPTCHA container fallback */}
                  {turnstileSiteKey && (
                    <div className="flex justify-center my-2">
                      <div
                        className="cf-turnstile"
                        data-sitekey={turnstileSiteKey}
                        data-theme="auto"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="saffron"
                    className="w-full"
                    size="lg"
                    disabled={isLoading || lockoutRemainingSecs > 0}
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                        {mode === "signup"
                          ? "Creating account..."
                          : mode === "forgot_password"
                          ? "Sending link..."
                          : "Signing in..."}
                      </>
                    ) : (
                      <>
                        {mode === "signup"
                          ? "Create Account"
                          : mode === "forgot_password"
                          ? "Send Reset Link"
                          : "Sign In"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  {mode === "forgot_password" ? (
                    <p className="text-muted-foreground text-sm">
                      Remember your password?{" "}
                      <button
                        onClick={() => {
                          setMode("signin");
                          setErrors({});
                        }}
                        className="text-secondary hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                      <button
                        onClick={() => {
                          setMode(mode === "signup" ? "signin" : "signup");
                          setErrors({});
                        }}
                        className="text-secondary hover:underline font-medium"
                      >
                        {mode === "signup" ? "Sign in" : "Sign up"}
                      </button>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
