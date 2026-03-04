export const PIN_TYPES = {
  wildlife: { label: "Wildlife", color: "#f97316", bgClass: "bg-orange-100 text-orange-600 border-orange-200" },
  trail: { label: "Trail/Park", color: "#22c55e", bgClass: "bg-green-100 text-green-600 border-green-200" },
  pollution: { label: "Concern", color: "#ef4444", bgClass: "bg-red-100 text-red-600 border-red-200" },
  water: { label: "Water", color: "#3b82f6", bgClass: "bg-blue-100 text-blue-600 border-blue-200" },
  restoration: { label: "Restoration", color: "#8b5cf6", bgClass: "bg-purple-100 text-purple-600 border-purple-200" },
  other: { label: "Other", color: "#6b7280", bgClass: "bg-gray-100 text-gray-600 border-gray-200" },
} as const;

export type PinType = keyof typeof PIN_TYPES;
