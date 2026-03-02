export function getLetterGrade(score: number): { letter: string; modifier: string } {
  if (score >= 93) return { letter: "A", modifier: "+" };
  if (score >= 85) return { letter: "A", modifier: "" };
  if (score >= 80) return { letter: "A", modifier: "-" };
  if (score >= 77) return { letter: "B", modifier: "+" };
  if (score >= 70) return { letter: "B", modifier: "" };
  if (score >= 65) return { letter: "B", modifier: "-" };
  if (score >= 60) return { letter: "C", modifier: "+" };
  if (score >= 50) return { letter: "C", modifier: "" };
  if (score >= 45) return { letter: "C", modifier: "-" };
  if (score >= 40) return { letter: "D", modifier: "+" };
  if (score >= 30) return { letter: "D", modifier: "" };
  if (score >= 20) return { letter: "D", modifier: "-" };
  return { letter: "F", modifier: "" };
}

export function getVibeLabel(average: number): string {
  if (average >= 80) return "Excellent";
  if (average >= 70) return "Good";
  if (average >= 50) return "Moderate";
  if (average >= 30) return "Poor";
  return "Critical";
}

export function computeAverage(scores: Record<string, number>): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
