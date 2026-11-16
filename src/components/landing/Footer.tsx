import { Link } from "react-router-dom";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-forest dark:bg-background text-cream py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <LotusIcon className="w-10 h-10 text-saffron" />
              <span className="font-display text-2xl">VedicWell</span>
            </div>
            <p className="text-cream/70 mb-6 max-w-sm">
              Bringing the ancient wisdom of Ayurveda to modern life. 
              Discover balance, vitality, and inner peace.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-saffron transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-saffron transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-saffron transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-saffron transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4 text-saffron">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/assessment" className="text-cream/70 hover:text-cream transition-colors">Dosha Quiz</Link></li>
              <li><Link to="/dashboard" className="text-cream/70 hover:text-cream transition-colors">Dashboard</Link></li>
              <li><Link to="/nutrition" className="text-cream/70 hover:text-cream transition-colors">Nutrition</Link></li>
              <li><Link to="/mindfulness" className="text-cream/70 hover:text-cream transition-colors">Mindfulness</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg mb-4 text-saffron">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Help Center</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/10 mt-12 pt-8 text-center text-cream/50 text-sm">
          <p>© 2025 VedicWell. Ancient Wisdom, Modern Wellness.</p>
        </div>
      </div>
    </footer>
  );
};
