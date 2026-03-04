import { motion } from "framer-motion";
import { getLetterGrade, getVibeLabel, computeAverage } from "@shared/grades";
import type { AnalysisResponse } from "@shared/schema";

interface HeroScoreCardProps {
  data: AnalysisResponse | null;
  isLoading: boolean;
  lat: number;
  lng: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  airQuality: "Air Quality",
  waterQuality: "Water Quality",
  climateEmissions: "Climate",
  greenSpace: "Green Space",
  pollution: "Pollution",
};

function getGradeColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 65) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 30) return "#f97316";
  return "#ef4444";
}

const LOADING_MESSAGES = [
  "Checking air quality...",
  "Scanning EPA data...",
  "Analyzing land use...",
  "Reading water reports...",
  "Computing your grade...",
];

function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-full max-w-md border border-white/20"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-white/15 rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-20 bg-white/15 rounded animate-pulse" />
            <div className="flex-1 h-2 bg-white/10 rounded-full">
              <div
                className="h-2 bg-white/25 rounded-full animate-pulse"
                style={{ width: `${30 + i * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-emerald-200/80 text-sm mt-4 text-center animate-pulse">
        {LOADING_MESSAGES[Math.floor(Date.now() / 2000) % LOADING_MESSAGES.length]}
      </p>
    </motion.div>
  );
}

export function HeroScoreCard({ data, isLoading, lat, lng }: HeroScoreCardProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return null;

  const average = computeAverage(data.scores);
  const grade = getLetterGrade(average);
  const vibe = getVibeLabel(average);
  const gradeColor = getGradeColor(average);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-full max-w-md border border-white/20"
    >
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg"
          style={{ backgroundColor: gradeColor }}
        >
          <span className="text-white font-bold text-2xl leading-none">
            {grade.letter}{grade.modifier}
          </span>
          <span className="text-white/80 text-[10px] font-medium mt-0.5">
            {average}/100
          </span>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{data.location}</h3>
          <p className="text-emerald-200/80 text-sm">{vibe} Environmental Score</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {Object.entries(data.scores).map(([key, value]) => {
          const catGrade = getLetterGrade(value);
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-emerald-100/70 text-xs w-20 truncate">
                {CATEGORY_LABELS[key] || key}
              </span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getGradeColor(value) }}
                />
              </div>
              <span className="text-white/90 text-xs font-semibold w-6 text-right">
                {catGrade.letter}{catGrade.modifier}
              </span>
            </div>
          );
        })}
      </div>

      <a
        href={`/map?lat=${lat}&lng=${lng}`}
        className="mt-4 block text-center text-sm font-semibold text-emerald-300 hover:text-white transition-colors"
      >
        See Full Report &rarr;
      </a>
    </motion.div>
  );
}
