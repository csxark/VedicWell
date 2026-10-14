import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleAuth = async () => {
      try {
        // Check for error parameters in URL (from Supabase email confirmation failure)
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

        // Check if there is already an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

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

        // If no session yet, listen for auth state change from token exchange
        const { data } = supabase.auth.onAuthStateChange(
          (event, session) => {
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
          }
        );
        subscription = data.subscription;

        // Safety timeout — if nothing happens in 4 seconds, redirect to auth or dashboard
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
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [navigate]);

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
              Confirming your email and taking you directly to your VedicWell dashboard...
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

        {status === "error" && (
          <div>
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-2xl text-foreground mb-2">Verification Issue</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {error || "We couldn't verify your email link. It may have expired or already been used."}
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
