import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import Nutrition from "./pages/Nutrition";
import Mindfulness from "./pages/Mindfulness";
import SymptomChecker from "./pages/SymptomChecker";
import Profile from "./pages/Profile";
import Knowledge from "./pages/Knowledge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/assessment" element={<PageTransition><Assessment /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/nutrition" element={<PageTransition><Nutrition /></PageTransition>} />
        <Route path="/mindfulness" element={<PageTransition><Mindfulness /></PageTransition>} />
        <Route path="/symptom-checker" element={<PageTransition><SymptomChecker /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/knowledge" element={<PageTransition><Knowledge /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
