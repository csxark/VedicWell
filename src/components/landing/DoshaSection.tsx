import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const doshas = [
  {
    name: "Vata",
    element: "Air & Space",
    description: "Creative, quick-thinking, and energetic. When balanced, Vata types are lively and enthusiastic.",
    traits: ["Creative", "Energetic", "Quick learner", "Flexible"],
    gradient: "from-sky-400 to-blue-300",
    textColor: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  {
    name: "Pitta",
    element: "Fire & Water",
    description: "Ambitious, focused, and determined. Pitta types are natural leaders with sharp intellect.",
    traits: ["Focused", "Ambitious", "Strong digestion", "Warm"],
    gradient: "from-orange-400 to-amber-300",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    name: "Kapha",
    element: "Earth & Water",
    description: "Calm, grounded, and nurturing. Kapha types are steady, loyal, and compassionate.",
    traits: ["Calm", "Strong", "Compassionate", "Patient"],
    gradient: "from-emerald-400 to-green-300",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
];

export const DoshaSection = () => {
  return (
    <section className="py-24 bg-forest dark:bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 mandala-bg opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-4">
            The Three Doshas
          </h2>
          <p className="text-cream/70 text-lg max-w-2xl mx-auto">
            Ayurveda recognizes three fundamental energies that govern our physical and mental processes.
          </p>
        </motion.div>

        {/* Dosha Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {doshas.map((dosha, index) => (
            <motion.div
              key={dosha.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-8 h-full shadow-medium hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                {/* Gradient Circle */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${dosha.gradient} mx-auto mb-6 flex items-center justify-center shadow-soft`}>
                  <span className="font-display text-2xl text-white">
                    {dosha.name[0]}
                  </span>
                </div>

                {/* Content */}
                <h3 className={`font-display text-2xl ${dosha.textColor} text-center mb-2`}>
                  {dosha.name}
                </h3>
                <p className="text-muted-foreground text-center text-sm mb-4">
                  {dosha.element}
                </p>
                <p className="text-foreground text-center mb-6 leading-relaxed">
                  {dosha.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {dosha.traits.map((trait) => (
                    <span 
                      key={trait}
                      className={`${dosha.bgColor} ${dosha.textColor} px-3 py-1 rounded-full text-sm dark:bg-card dark:border-border/40`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/assessment">
            <Button variant="hero" size="xl">
              Discover Your Dosha Type
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
