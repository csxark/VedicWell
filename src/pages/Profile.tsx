import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Settings, LogOut, Calendar, Activity, 
  Heart, Brain, Leaf, TrendingUp, Clock, MessageSquare, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DoshaAssessment {
  id: string;
  dominant_dosha: string;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  confidence?: number | null;
  secondary_dosha?: string | null;
  secondary_confidence?: number | null;
  prediction_source?: string | null;
  created_at: string;
}

interface SymptomRecord {
  id: string;
  symptoms: string;
  dosha_type: string | null;
  created_at: string;
}

interface EngagementStats {
  totalAssessments: number;
  totalSymptomChecks: number;
  memberSince: string;
  lastActivity: string;
}

const Profile = () => {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [assessments, setAssessments] = useState<DoshaAssessment[]>([]);
  const [symptomHistory, setSymptomHistory] = useState<SymptomRecord[]>([]);
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    const { data: assessmentData } = await supabase
      .from("dosha_assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (assessmentData) {
      setAssessments(assessmentData);
    }

    const { data: symptomData } = await supabase
      .from("symptom_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (symptomData) {
      setSymptomHistory(symptomData);
    }

    const { count: engagementCount } = await supabase
      .from("user_engagement")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setEngagementStats({
      totalAssessments: assessmentData?.length || 0,
      totalSymptomChecks: symptomData?.length || 0,
      memberSince: user.created_at || "",
      lastActivity: assessmentData?.[0]?.created_at || symptomData?.[0]?.created_at || user.created_at || "",
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({ full_name: fullName });
    
    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    }
    setIsSaving(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setIsResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
      if (error) {
        toast({
          title: "Could not send verification",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDoshaColor = (dosha: string) => {
    switch (dosha) {
      case "vata": return "from-blue-500 to-purple-500";
      case "pitta": return "from-orange-500 to-red-500";
      case "kapha": return "from-green-500 to-teal-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const getDoshaTextColor = (dosha: string) => {
    switch (dosha) {
      case "vata": return "text-blue-500 dark:text-blue-400";
      case "pitta": return "text-orange-500 dark:text-orange-400";
      case "kapha": return "text-emerald-500 dark:text-emerald-400";
      default: return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LotusIcon className="w-12 h-12 text-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white shadow-glow">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <h1 className="font-display text-3xl text-foreground">
                    {profile?.full_name || "Wellness Seeker"}
                  </h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Email Verification Warning Banner */}
          {user && !user.email_confirmed_at && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Email not verified</p>
                  <p className="text-xs text-muted-foreground">
                    Please verify your email address (<span className="text-foreground font-medium">{user.email}</span>) to secure your account.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isResendingEmail}
                onClick={handleResendVerification}
              >
                {isResendingEmail ? "Sending..." : "Resend Verification Email"}
              </Button>
            </motion.div>
          )}

          {/* Dosha Profile Card */}
          {profile?.dominant_dosha && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="glass-card overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getDoshaColor(profile.dominant_dosha)}`} />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getDoshaColor(profile.dominant_dosha)} flex items-center justify-center shadow-lg`}>
                      <span className="font-display text-4xl text-white capitalize">
                        {profile.dominant_dosha[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className={`font-display text-2xl capitalize ${getDoshaTextColor(profile.dominant_dosha)} mb-1`}>
                        {profile.dominant_dosha} Dominant
                      </h2>
                      <p className="text-muted-foreground mb-4">Your Ayurvedic Constitution</p>
                      <div className="flex gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-display text-blue-500 dark:text-blue-400">{profile.vata_percentage}%</div>
                          <div className="text-sm text-muted-foreground">Vata</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-display text-orange-500 dark:text-orange-400">{profile.pitta_percentage}%</div>
                          <div className="text-sm text-muted-foreground">Pitta</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-display text-emerald-500 dark:text-emerald-400">{profile.kapha_percentage}%</div>
                          <div className="text-sm text-muted-foreground">Kapha</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Overview */}
          {engagementStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="neomorphic">
                <CardContent className="pt-6 text-center">
                  <Activity className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-display text-foreground">{engagementStats.totalAssessments}</div>
                  <div className="text-sm text-muted-foreground">Assessments</div>
                </CardContent>
              </Card>
              <Card className="neomorphic">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-display text-foreground">{engagementStats.totalSymptomChecks}</div>
                  <div className="text-sm text-muted-foreground">AI Consults</div>
                </CardContent>
              </Card>
              <Card className="neomorphic">
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-lg font-display text-foreground">
                    {engagementStats.memberSince ? format(new Date(engagementStats.memberSince), "MMM yyyy") : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                </CardContent>
              </Card>
              <Card className="neomorphic">
                <CardContent className="pt-6 text-center">
                  <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="text-lg font-display text-foreground">
                    {engagementStats.lastActivity ? format(new Date(engagementStats.lastActivity), "MMM d") : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Active</div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="history" className="space-y-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="history" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="symptoms" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Symptom Log
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-secondary" />
                      Dosha Assessment History
                    </CardTitle>
                    <CardDescription>Track your constitution over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assessments.length > 0 ? (
                      <div className="space-y-4">
                        {assessments.map((assessment) => (
                          <div
                            key={assessment.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getDoshaColor(assessment.dominant_dosha)} flex items-center justify-center`}>
                                <span className="font-display text-xl text-white capitalize">
                                  {assessment.dominant_dosha[0]}
                                </span>
                              </div>
                              <div>
                                <div className={`font-semibold capitalize ${getDoshaTextColor(assessment.dominant_dosha)} flex items-center gap-2`}>
                                  <span>{assessment.dominant_dosha} Dominant</span>
                                  {assessment.confidence != null && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
                                      {Math.round(assessment.confidence * 100)}% Match
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {assessment.secondary_dosha ? (
                                    <span>Secondary: {assessment.secondary_dosha} {assessment.secondary_confidence ? `(${Math.round(assessment.secondary_confidence * 100)}%)` : ""}</span>
                                  ) : (
                                    (() => {
                                      const total = (assessment.vata_score + assessment.pitta_score + assessment.kapha_score) || 12;
                                      return `V: ${Math.round((assessment.vata_score / total) * 100)}% | P: ${Math.round((assessment.pitta_score / total) * 100)}% | K: ${Math.round((assessment.kapha_score / total) * 100)}%`;
                                    })()
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(assessment.created_at), "MMM d, yyyy")}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Leaf className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No assessments yet</p>
                        <Button variant="saffron" onClick={() => navigate("/assessment")}>
                          Take Dosha Quiz
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="symptoms" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-secondary" />
                      Symptom Check History
                    </CardTitle>
                    <CardDescription>Your AI consultation records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {symptomHistory.length > 0 ? (
                      <div className="space-y-4">
                        {symptomHistory.map((record) => (
                          <div
                            key={record.id}
                            className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {record.dosha_type && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize bg-gradient-to-r ${getDoshaColor(record.dosha_type)} text-white`}>
                                    {record.dosha_type}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(record.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                            <p className="text-foreground line-clamp-2">{record.symptoms}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No symptom checks yet</p>
                        <Button variant="saffron" onClick={() => navigate("/symptom-checker")}>
                          AI Symptom Checker
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-secondary" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="max-w-md bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="max-w-md bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <Button 
                      variant="saffron" 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
