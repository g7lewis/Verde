import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown, Search, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { HeroScoreCard } from "./HeroScoreCard";
import type { AnalysisResponse } from "@shared/schema";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "detecting" | "done">("idle");

  // Auto-detect geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoStatus("done");
        runAnalysis(latitude, longitude);
      },
      () => {
        // Denied or error — just show search box
        setGeoStatus("done");
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const runAnalysis = async (lat: number, lng: number) => {
    // Validate coordinate ranges
    if (!isFinite(lat) || !isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    setIsLoading(true);
    setCoords({ lat, lng });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysisData(data);
      // Cache in sessionStorage for the map page
      try {
        sessionStorage.setItem(
          "verde-hero-analysis",
          JSON.stringify({ lat, lng, data, ts: Date.now() })
        );
      } catch {}
    } catch {
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setAnalysisData(null);

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat);
        const lng = parseFloat(geoData[0].lon);
        await runAnalysis(lat, lng);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 font-display">
            What's your neighborhood's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-lime-300">
              environmental grade?
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Get your free environmental score card in seconds — powered by EPA, Climate TRACE, and CalEnviroScreen data.
        </motion.p>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg mx-auto mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your zip code or city..."
                className="pl-10 h-12 rounded-full bg-white/95 border-0 text-gray-800 placeholder:text-gray-400 text-base shadow-xl"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !query.trim()}
              className="rounded-full bg-white text-emerald-800 hover:bg-emerald-50 shadow-2xl shadow-black/20 px-6 h-12 text-base font-semibold gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Check My Grade
                </>
              )}
            </Button>
          </form>

          {/* Score card result */}
          <AnimatePresence>
            {(isLoading || analysisData) && coords && (
              <div className="flex justify-center mb-6">
                <HeroScoreCard
                  data={analysisData}
                  isLoading={isLoading}
                  lat={coords.lat}
                  lng={coords.lng}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/map">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold gap-2"
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
          </div>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 flex items-center justify-center gap-8 text-emerald-300/50 text-xs font-medium tracking-wider uppercase"
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
