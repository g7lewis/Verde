import { useEffect, useRef, useState } from "react";
import { MapPin, Globe, Users, ThumbsUp } from "lucide-react";
import { useCommunityStats } from "@/hooks/use-community-stats";
import { motion } from "framer-motion";

const PIN_TYPE_COLORS: Record<string, { color: string; label: string }> = {
  pollution: { color: "#ef4444", label: "Pollution" },
  animal: { color: "#f97316", label: "Wildlife" },
  trail: { color: "#22c55e", label: "Trail/Park" },
  other: { color: "#3b82f6", label: "Other" },
};

function AnimatedCounter({ target, label, icon: Icon }: { target: number; label: string; icon: any }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!ref.current || animated.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-emerald-300" />
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
        {count.toLocaleString()}
      </p>
      <p className="text-sm text-emerald-200/70">{label}</p>
    </div>
  );
}

export function CommunityStatsSection() {
  const { data: stats } = useCommunityStats();

  const statItems = [
    { icon: MapPin, label: "Seeds Planted", value: stats?.totalSeeds ?? 0 },
    { icon: Globe, label: "Locations Explored", value: stats?.locationsExplored ?? 0 },
    { icon: Users, label: "Community Members", value: stats?.totalMembers ?? 0 },
    { icon: ThumbsUp, label: "Upvotes Given", value: stats?.totalUpvotes ?? 0 },
  ];

  const distribution = stats?.pinTypeDistribution ?? {};
  const totalPins = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {statItems.map((item) => (
              <AnimatedCounter key={item.label} target={item.value} label={item.label} icon={item.icon} />
            ))}
          </div>

          {/* Pin type distribution bar */}
          {totalPins > 1 && (
            <div className="max-w-2xl mx-auto">
              <div className="flex rounded-full overflow-hidden h-3 bg-white/10">
                {Object.entries(distribution).map(([type, count]) => {
                  const pct = (count / totalPins) * 100;
                  const cfg = PIN_TYPE_COLORS[type];
                  if (!cfg || pct < 1) return null;
                  return (
                    <div
                      key={type}
                      className="transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                      title={`${cfg.label}: ${count}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-center gap-5 mt-3">
                {Object.entries(PIN_TYPE_COLORS).map(([type, cfg]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-xs text-emerald-200/60">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
