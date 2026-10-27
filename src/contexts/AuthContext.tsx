import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  readGuestCache,
  clearGuestCache,
} from "@/lib/guestDoshaCache";
import { saveAssessmentToSupabase } from "@/lib/doshaService";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  dominant_dosha: "vata" | "pitta" | "kapha" | null;
  vata_percentage: number;
  pitta_percentage: number;
  kapha_percentage: number;
  assessment_completed?: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Attempts to claim a pending guest assessment after a user signs in.
 * Uses the Supabase DB function claim_guest_assessment() which runs SECURITY
 * DEFINER — the client cannot forge or manipulate the ownership transfer.
 *
 * Silently ignores failures so the sign-in flow is never blocked.
 */
let activeClaimPromise: Promise<void> | null = null;
let activeClaimKey: string | null = null;

/**
 * Attempts to claim a pending guest assessment after a user signs in.
 * Dual-resilience strategy:
 * 1. If an assessment row exists in Supabase with guest_session_id, uses the
 *    SECURITY DEFINER DB function claim_guest_assessment() to safely reassign ownership.
 * 2. If no DB row exists (cache.assessmentId is absent),
 *    persists the cached assessment directly to Supabase with the authenticated userId
 *    and refreshes the profile so no assessment is ever lost.
 *
 * Each claim is associated with its guest cache entry and account. If another claim
 * is currently in-flight, subsequent claims await completion rather than being discarded.
 * Before clearGuestCache runs, verifies that the cache still contains the entry claimed
 * by that operation.
 */
async function tryClaimGuestAssessment(userId: string): Promise<void> {
  const cache = readGuestCache();
  if (!cache) return;

  const claimKey = `${cache.guestSessionId}:${userId}`;

  // If the exact same claim is already running, wait for it rather than duplicating
  if (activeClaimPromise && activeClaimKey === claimKey) {
    await activeClaimPromise;
    return;
  }

  // If another claim is currently in-flight, await its completion so this new claim is not discarded
  if (activeClaimPromise) {
    try {
      await activeClaimPromise;
    } catch {
      // Ignore errors from the previous claim
    }
  }

  // Re-read cache after waiting to check if it's still present and unclaimed
  const currentCache = readGuestCache();
  if (!currentCache) return;

  const targetSessionId = currentCache.guestSessionId;
  const currentClaimKey = `${targetSessionId}:${userId}`;

  activeClaimKey = currentClaimKey;
  activeClaimPromise = (async () => {
    try {
      let claimed = false;

      // 1. Try DB RPC claim if assessmentId exists
      if (currentCache.assessmentId && currentCache.guestSessionId) {
        const { data, error } = await supabase.rpc("claim_guest_assessment", {
          p_guest_session_id: currentCache.guestSessionId,
          p_assessment_id: currentCache.assessmentId,
        });

        if (!error && (data as any)?.success) {
          claimed = true;
          console.info("Guest assessment successfully claimed via RPC:", currentCache.assessmentId);
        } else {
          console.warn("Guest RPC claim returned:", error?.message || (data as any)?.reason);
        }
      }

      // 2. Direct persistence fallback if not yet claimed and no DB row exists
      if (!claimed && !currentCache.assessmentId && currentCache.answers && currentCache.primaryDosha) {
        const dominantDosha = currentCache.primaryDosha.toLowerCase() as "vata" | "pitta" | "kapha";
        const { error: saveError } = await saveAssessmentToSupabase({
          userId,
          dominantDosha,
          vataScore: currentCache.vataScore,
          pittaScore: currentCache.pittaScore,
          kaphaScore: currentCache.kaphaScore,
          answers: currentCache.answers,
          confidence: currentCache.confidence,
          secondaryDosha: currentCache.secondaryDosha,
          secondaryConfidence: currentCache.secondaryConfidence,
          keyTraits: currentCache.keyTraits,
          predictionSource: "api",
        });

        if (!saveError) {
          claimed = true;
          console.info("Guest assessment directly persisted for authenticated user:", userId);
        } else {
          console.warn("Direct guest assessment persistence notice:", saveError.message);
        }
      }

      // Before clearGuestCache runs, verify that the cache still contains the entry claimed by that operation
      if (claimed) {
        const latestCache = readGuestCache();
        if (latestCache && latestCache.guestSessionId === targetSessionId) {
          clearGuestCache();
        }
      }
    } catch (err) {
      console.warn("Unexpected error during guest claim:", err);
    } finally {
      if (activeClaimKey === currentClaimKey) {
        activeClaimPromise = null;
        activeClaimKey = null;
      }
    }
  })();

  await activeClaimPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer profile fetch and guest claim with setTimeout to avoid
          // Supabase deadlocks during the token exchange phase
          setTimeout(async () => {
            // Attempt to claim a pending guest assessment before loading profile
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              await tryClaimGuestAssessment(session.user.id);
            }
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        tryClaimGuestAssessment(session.user.id).then(() => {
          fetchProfile(session.user.id).then((profileData) => {
            setProfile(profileData);
            setLoading(false);
          });
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { data, error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Claim is triggered via onAuthStateChange SIGNED_IN event — no need to
    // call tryClaimGuestAssessment() here explicitly.

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    // Clear guest cache on sign-out so a different user's session is not leaked
    clearGuestCache();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (!error) {
      await refreshProfile();
    }

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
