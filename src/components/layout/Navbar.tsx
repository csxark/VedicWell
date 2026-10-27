import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/assessment", label: "Dosha Quiz" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/mindfulness", label: "Mindfulness" },
  { href: "/symptom-checker", label: "AI Checker" },
  { href: "/knowledge", label: "Knowledge" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(() => {
    try {
      return sessionStorage.getItem("dismiss_unverified_banner") === "true";
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isUnverified = Boolean(user && !user.email_confirmed_at);

  // Only use transparent hero-style navbar on the homepage
  const isHeroPage = location.pathname === "/";
  const useHeroStyle = isHeroPage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        useHeroStyle
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-md shadow-soft"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isUnverified && !dismissBanner && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs px-4 py-1.5 flex items-center justify-between backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-center gap-2 text-center">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Your email is unverified.{" "}
              <Link to="/profile" className="font-semibold underline hover:opacity-80">
                Verify now in Settings →
              </Link>
            </span>
          </div>
          <button
            onClick={() => {
              setDismissBanner(true);
              try {
                sessionStorage.setItem("dismiss_unverified_banner", "true");
              } catch {}
            }}
            className="p-1 hover:opacity-70 text-amber-700 dark:text-amber-300 ml-2"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <LotusIcon className="w-8 h-8 text-saffron transition-colors" />
          <span className={`font-display text-xl transition-colors ${useHeroStyle ? "text-white" : "text-foreground"}`}>
            VedicWell
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`font-body text-sm transition-colors animated-underline ${
                useHeroStyle
                  ? "text-white/90 hover:text-white"
                  : "text-foreground hover:text-secondary"
              } ${location.pathname === link.href ? "font-semibold" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle className={useHeroStyle ? "text-white" : ""} />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={useHeroStyle ? "hero" : "ghost"}
                  size="sm" 
                  className="gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="max-w-24 truncate">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/knowledge" className="cursor-pointer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Knowledge
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant={useHeroStyle ? "hero" : "ghost"} size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/assessment">
                <Button variant="saffron" size="sm">
                  Start Journey
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2"
        >
          {isOpen ? (
            <X className={useHeroStyle ? "text-white" : "text-foreground"} />
          ) : (
            <Menu className={useHeroStyle ? "text-white" : "text-foreground"} />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block font-body text-foreground hover:text-secondary transition-colors py-2 ${
                    location.pathname === link.href ? "font-semibold text-secondary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border space-y-3">
                {user ? (
                  <>
                    <Link to="/profile">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="w-4 h-4" />
                        My Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/assessment">
                      <Button variant="saffron" className="w-full">
                        Start Journey
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
