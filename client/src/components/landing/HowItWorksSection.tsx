import { Compass, MapPin, Trophy, Trees } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Compass,
    title: "Explore",
    description: "Tap anywhere for an instant environmental health report",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MapPin,
    title: "Plant a Seed",
    description: "Report wildlife, pollution, trails, or anything noteworthy",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Trophy,
    title: "Earn & Grow",
    description: "Quality seeds with upvotes earn bonus points",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Trees,
    title: "Reach The Canopy",
    description: "Climb from Sprout to Old Growth each month",
    color: "from-teal-500 to-emerald-700",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">Four steps to making a difference</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="text-center"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                Step {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-display">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
