import { getLetterGrade, getVibeLabel, computeAverage } from "@shared/grades";
import type { AnalysisResponse } from "@shared/schema";

const CATEGORY_LABELS: Record<string, string> = {
  airQuality: "Air Quality",
  waterQuality: "Water Quality",
  climateEmissions: "Climate & Emissions",
  greenSpace: "Green Space",
  pollution: "Pollution Risk",
};

function getGradeHex(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 65) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 30) return "#f97316";
  return "#ef4444";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export async function generateEnvironmentalReport(
  data: AnalysisResponse,
  lat: number,
  lng: number
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" }); // 612 x 792

  const pageW = 612;
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = 0;

  // --- Header Bar ---
  doc.setFillColor(6, 78, 59); // emerald-900
  doc.rect(0, 0, pageW, 60, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("VERDE", margin, 38);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(dateStr, pageW - margin, 25, { align: "right" });
  doc.setFontSize(9);
  doc.text(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, pageW - margin, 40, {
    align: "right",
  });

  y = 60;

  // --- Location + Overall Grade ---
  y += 30;
  const average = computeAverage(data.scores);
  const grade = getLetterGrade(average);
  const vibe = getVibeLabel(average);
  const gradeHex = getGradeHex(average);

  // Grade circle
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b] as const;
  };
  const [gr, gg, gb] = hexToRgb(gradeHex);
  doc.setFillColor(gr, gg, gb);
  doc.circle(margin + 30, y + 25, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(`${grade.letter}${grade.modifier}`, margin + 30, y + 28, {
    align: "center",
  });
  doc.setFontSize(8);
  doc.text(`${average}/100`, margin + 30, y + 40, { align: "center" });

  // Location name + vibe
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.location, margin + 70, y + 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(gr, gg, gb);
  doc.text(`${vibe} Environmental Score`, margin + 70, y + 32);
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.text("Overall assessment based on 5 environmental categories", margin + 70, y + 46);

  y += 70;

  // --- Divider ---
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // --- Category Scores ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Category Scores", margin, y);
  y += 18;

  const barH = 10;
  const barW = contentW - 130;
  const barX = margin + 110;

  for (const [key, value] of Object.entries(data.scores)) {
    const label = CATEGORY_LABELS[key] || key;
    const catGrade = getLetterGrade(value);
    const [cr, cg, cb] = hexToRgb(getGradeHex(value));

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y + 8);

    // Background bar
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(barX, y, barW, barH, 3, 3, "F");

    // Score bar
    doc.setFillColor(cr, cg, cb);
    const filled = Math.max((value / 100) * barW, 6);
    doc.roundedRect(barX, y, filled, barH, 3, 3, "F");

    // Grade + score text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(cr, cg, cb);
    doc.text(
      `${catGrade.letter}${catGrade.modifier}  ${value}`,
      barX + barW + 8,
      y + 8
    );

    y += 22;
  }

  y += 10;

  // --- AI Summary ---
  if (data.summary) {
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("AI Summary", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(data.summary, contentW);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 12 + 10;
  }

  // --- EPA Facilities (conditional) ---
  if (data.epaContext) {
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("EPA Facilities (50km radius)", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const epaItems = [
      `Total Facilities: ${data.epaContext.totalFacilities}`,
      `Major Emitters: ${data.epaContext.majorEmitters}`,
      `With Violations: ${data.epaContext.facilitiesWithViolations}`,
    ];
    for (const item of epaItems) {
      doc.text(item, margin + 10, y);
      y += 14;
    }
    if (data.epaContext.topIndustries.length > 0) {
      doc.text(
        `Top Industries: ${data.epaContext.topIndustries.slice(0, 3).join(", ")}`,
        margin + 10,
        y
      );
      y += 14;
    }
    y += 6;
  }

  // --- CalEnviroScreen (conditional, CA only) ---
  if (data.cesContext) {
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("CalEnviroScreen 4.0", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    doc.text(`Census Tract: ${data.cesContext.censusTract}`, margin + 10, y);
    y += 14;
    if (data.cesContext.overallPercentile != null) {
      doc.text(
        `Overall Percentile: ${data.cesContext.overallPercentile}th`,
        margin + 10,
        y
      );
      y += 14;
    }
    if (data.cesContext.pollutionBurden.percentile != null) {
      doc.text(
        `Pollution Burden: ${data.cesContext.pollutionBurden.percentile}th percentile`,
        margin + 10,
        y
      );
      y += 14;
    }
    y += 6;
  }

  // --- Land Cover ---
  if (data.landCoverContext) {
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Land Use (3km radius)", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const landItems = [
      `Vegetation: ${data.landCoverContext.vegetationPercentage}%`,
      `Built Area: ${data.landCoverContext.builtPercentage}%`,
      `Water: ${data.landCoverContext.waterPercentage}%`,
      `Cropland: ${data.landCoverContext.cropPercentage}%`,
    ];
    doc.text(landItems.join("   |   "), margin + 10, y);
    y += 20;
  }

  // --- Footer ---
  const footerY = 750;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Data sources: US EPA ECHO, WAQI, CalEnviroScreen 4.0, Climate TRACE, Copernicus WorldCover",
    margin,
    footerY + 12
  );
  doc.text(
    `Generated by Verde (verdemap.com) on ${dateStr}. Scores are estimates and should not replace professional environmental assessments.`,
    margin,
    footerY + 22
  );

  // --- Save ---
  const slug = slugify(data.location);
  doc.save(`verde-report-${slug}.pdf`);
}
