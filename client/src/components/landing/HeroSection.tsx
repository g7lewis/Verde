import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
      {/* Floating leaf particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-emerald-400/20 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 font-display">
            See Your World.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-lime-300">
              Protect Our Planet.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Verde puts real environmental data at your fingertips. Drop seeds, earn
          your rank, and help build the world's community environmental atlas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="/map">
            <Button
              size="lg"
              className="rounded-full bg-white text-emerald-800 hover:bg-emerald-50 shadow-2xl shadow-black/20 px-8 py-6 text-lg font-semibold gap-2"
            >
              Explore the Map
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a href="#canopy">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
            >
              See The Canopy
            </Button>
          </a>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 text-emerald-300/50 text-xs font-medium tracking-wider uppercase"
        >
          <span>EPA Data</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
          <span>Climate TRACE</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
          <span>WAQI</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
          <span>CalEnviroScreen</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-white/40 animate-bounce" />
      </motion.div>
    </section>
  );
}
