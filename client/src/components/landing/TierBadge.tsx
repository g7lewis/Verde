import { getTierDef, type TierName } from "@/lib/leaderboard";
import clsx from "clsx";

interface TierBadgeProps {
  tier: TierName;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TierBadge({ tier, size = "md", showLabel = true }: TierBadgeProps) {
  const def = getTierDef(tier);
  const Icon = def.icon;

  const sizeClasses = {
    sm: "w-5 h-5 text-xs",
    md: "w-7 h-7 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={clsx(
          "rounded-full flex items-center justify-center bg-gradient-to-br shadow-sm",
          def.gradientClass,
          sizeClasses[size],
        )}
      >
        <Icon className={clsx("text-white", iconSizes[size])} />
      </div>
      {showLabel && (
        <span className={clsx("font-semibold", def.colorClass, size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base")}>
          {def.label}
        </span>
      )}
    </div>
  );
}
