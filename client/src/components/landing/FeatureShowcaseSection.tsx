import { BarChart3, Layers, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Environmental Scores",
    description:
      "Get letter grades from A+ to F across five key metrics: air quality, water quality, green space, pollution, and climate emissions. Powered by EPA, WAQI, and CalEnviroScreen data.",
    color: "from-blue-500 to-cyan-500",
    image: "scores",
  },
  {
    icon: Layers,
    title: "Data Layers",
    description:
      "Toggle EPA facility overlays, air quality heatmaps, water quality data, and Climate TRACE emissions sources. See the full environmental picture at a glance.",
    color: "from-emerald-500 to-green-600",
    image: "layers",
  },
  {
    icon: MessageCircle,
    title: "AI Environmental Chat",
    description:
      "Ask questions about any location and get instant answers powered by AI. 'What's the air quality like here?' 'Are there any pollution concerns nearby?'",
    color: "from-violet-500 to-purple-600",
    image: "chat",
  },
];

export function FeatureShowcaseSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display mb-3">
            Powerful Environmental Intelligence
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to understand the environmental health of any location.
          </p>
        </motion.div>

        <div className="space-y-20">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-10`}
            >
              {/* Text */}
              <div className="flex-1">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 font-display">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Visual placeholder */}
              <div className="flex-1 w-full">
                <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl h-64 flex items-center justify-center border border-border/50 shadow-sm">
                  <feature.icon className="w-16 h-16 text-muted-foreground/30" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
