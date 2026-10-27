import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { PasswordUpdateSchema } from "@/lib/validation/schemas";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"verifying" | "success" | "error" | "recovery">("verifying");

  // State for password recovery
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleAuth = async () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;
        const params = new URLSearchParams(search || hash.replace(/^#/, "?"));

        const errorDesc = params.get("error_description") || params.get("error");
        if (errorDesc) {
          if (isMounted) {
            setError(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
            setStatus("error");
          }
          return;
        }

        const type = params.get("type");
        if (type === "recovery") {
          if (isMounted) {
            setStatus("recovery");
          }
          return;
        }

        // Check if there is already an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          if (isMounted) {
            setStatus("success");
            setTimeout(() => {
              if (isMounted) {
                navigate("/dashboard", { replace: true });
              }
            }, 600);
          }
          return;
        }

        if (!isMounted) return;

        // Listen for auth state change from token exchange
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            if (isMounted) setStatus("recovery");
            return;
          }

          if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
            if (isMounted) {
              setStatus("success");
              setTimeout(() => {
                if (isMounted) {
                  navigate("/dashboard", { replace: true });
                }
              }, 600);
            }
          }
        });
        subscription = data.subscription;

        // Safety timeout
        timeout = setTimeout(async () => {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!isMounted) return;
          if (sessionData.session) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/auth", { replace: true });
          }
        }, 4000);
      } catch (err) {
        console.error("Auth callback error:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to verify authentication");
          setStatus("error");
        }
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const validation = PasswordUpdateSchema.safeParse({
      password: newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      const errs: Record<string, string> = {};
      for (const err of validation.error.errors) {
        const field = err.path[0]?.toString() || "form";
        errs[field] = err.message;
      }
      setPasswordErrors(errs);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated successfully",
        description: "Your password has been changed. Taking you to your dashboard...",
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);
    } catch (err) {
      toast({
        title: "Failed to update password",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 max-w-md w-full text-center shadow-glow"
      >
        {status === "verifying" && (
          <div>
            <LotusIcon className="w-16 h-16 text-secondary mx-auto mb-4 animate-pulse" />
            <h2 className="font-display text-2xl text-foreground mb-2">Verifying Your Account</h2>
            <p className="text-muted-foreground text-sm">
              Confirming your link and preparing your VedicWell dashboard...
            </p>
          </div>
        )}

        {status === "success" && (
          <div>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-foreground mb-2">Account Verified!</h2>
            <p className="text-muted-foreground text-sm">Welcome to VedicWell. Entering your dashboard...</p>
          </div>
        )}

        {status === "recovery" && (
          <div className="text-left">
            <div className="text-center mb-6">
              <LotusIcon className="w-12 h-12 text-secondary mx-auto mb-2" />
              <h2 className="font-display text-2xl text-foreground">Set New Password</h2>
              <p className="text-muted-foreground text-xs mt-1">
                Enter your new password below (minimum 8 characters, maximum 72 bytes).
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-9"
                    maxLength={72}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.password && (
                  <p className="text-xs text-destructive">{passwordErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    maxLength={72}
                    required
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="saffron"
                className="w-full mt-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password & Sign In"
                )}
              </Button>
            </form>
          </div>
        )}

        {status === "error" && (
          <div>
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-2xl text-foreground mb-2">Verification Issue</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {error || "We couldn't verify your link. It may have expired or already been used."}
            </p>
            <Button variant="saffron" className="w-full" onClick={() => navigate("/auth")}>
              Go to Sign In
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
