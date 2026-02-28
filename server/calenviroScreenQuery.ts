export interface CalEnviroScreenData {
  censusTract: string;
  overallPercentile: number | null;
  pollutionBurden: {
    score: number | null;
    percentile: number | null;
  };
  indicators: {
    ozone: { value: number | null; percentile: number | null };
    pm25: { value: number | null; percentile: number | null };
    dieselPM: { value: number | null; percentile: number | null };
    pesticides: { value: number | null; percentile: number | null };
    toxicReleases: { value: number | null; percentile: number | null };
    traffic: { value: number | null; percentile: number | null };
    drinkingWater: { value: number | null; percentile: number | null };
    cleanups: { value: number | null; percentile: number | null };
    groundwaterThreats: { value: number | null; percentile: number | null };
    hazardousWaste: { value: number | null; percentile: number | null };
    impairedWaterBodies: { value: number | null; percentile: number | null };
    solidWaste: { value: number | null; percentile: number | null };
  };
  populationCharacteristics: {
    asthma: { value: number | null; percentile: number | null };
    cardiovascular: { value: number | null; percentile: number | null };
    lowBirthWeight: { value: number | null; percentile: number | null };
    poverty: { value: number | null; percentile: number | null };
    unemployment: { value: number | null; percentile: number | null };
    linguisticIsolation: { value: number | null; percentile: number | null };
    education: { value: number | null; percentile: number | null };
    housingBurden: { value: number | null; percentile: number | null };
  };
}

export function isCaliforniaLocation(lat: number, lng: number): boolean {
  return lat >= 32.5 && lat <= 42.0 && lng >= -124.5 && lng <= -114.1;
}

export async function queryCalEnviroScreen(
  lat: number,
  lng: number
): Promise<CalEnviroScreenData | null> {
  if (!isCaliforniaLocation(lat, lng)) {
    return null;
  }

  const baseUrl =
    "https://services1.arcgis.com/PCHfdHz4GlDNAhBb/arcgis/rest/services/CalEnviroScreen_4_0_Results_/FeatureServer/0/query";

  const delta = 0.0001;
  const params = new URLSearchParams({
    where: "1=1",
    geometry: `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: [
      "tract", "CIscore", "CIscoreP",
      "Pollution", "PollutionScore", "PollutionP",
      "ozone", "ozoneP",
      "pm", "pmP",
      "diesel", "dieselP",
      "pest", "pestP",
      "RSEIhaz", "RSEIhazP",
      "traffic", "trafficP",
      "drink", "drinkP",
      "cleanups", "cleanupsP",
      "gwthreats", "gwthreatsP",
      "haz", "hazP",
      "iwb", "iwbP",
      "swis", "swisP",
      "lead", "leadP",
      "asthma", "asthmaP",
      "cvd", "cvdP",
      "lbw", "lbwP",
      "pov", "povP",
      "unemp", "unempP",
      "ling", "lingP",
      "edu", "eduP",
      "housingB", "housingBP",
    ].join(","),
    returnGeometry: "false",
    resultRecordCount: "1",
    f: "json",
  });

  try {
    console.log("CalEnviroScreen query for:", lat, lng);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("CalEnviroScreen API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error("CalEnviroScreen API returned error:", JSON.stringify(data.error));
      return null;
    }

    if (!data.features || data.features.length === 0) {
      console.log("CalEnviroScreen: No census tract found for coordinates");
      return null;
    }

    const attrs = data.features[0].attributes;
    console.log(
      "CalEnviroScreen: Found tract",
      attrs.tract,
      "CES percentile:",
      attrs.CIscoreP
    );

    return {
      censusTract: String(attrs.tract || ""),
      overallPercentile: toNum(attrs.CIscoreP),
      pollutionBurden: {
        score: toNum(attrs.PollutionScore),
        percentile: toNum(attrs.PollutionP),
      },
      indicators: {
        ozone: { value: toNum(attrs.ozone), percentile: toNum(attrs.ozoneP) },
        pm25: { value: toNum(attrs.pm), percentile: toNum(attrs.pmP) },
        dieselPM: { value: toNum(attrs.diesel), percentile: toNum(attrs.dieselP) },
        pesticides: { value: toNum(attrs.pest), percentile: toNum(attrs.pestP) },
        toxicReleases: { value: toNum(attrs.RSEIhaz), percentile: toNum(attrs.RSEIhazP) },
        traffic: { value: toNum(attrs.traffic), percentile: toNum(attrs.trafficP) },
        drinkingWater: { value: toNum(attrs.drink), percentile: toNum(attrs.drinkP) },
        cleanups: { value: toNum(attrs.cleanups), percentile: toNum(attrs.cleanupsP) },
        groundwaterThreats: { value: toNum(attrs.gwthreats), percentile: toNum(attrs.gwthreatsP) },
        hazardousWaste: { value: toNum(attrs.haz), percentile: toNum(attrs.hazP) },
        impairedWaterBodies: { value: toNum(attrs.iwb), percentile: toNum(attrs.iwbP) },
        solidWaste: { value: toNum(attrs.swis), percentile: toNum(attrs.swisP) },
      },
      populationCharacteristics: {
        asthma: { value: toNum(attrs.asthma), percentile: toNum(attrs.asthmaP) },
        cardiovascular: { value: toNum(attrs.cvd), percentile: toNum(attrs.cvdP) },
        lowBirthWeight: { value: toNum(attrs.lbw), percentile: toNum(attrs.lbwP) },
        poverty: { value: toNum(attrs.pov), percentile: toNum(attrs.povP) },
        unemployment: { value: toNum(attrs.unemp), percentile: toNum(attrs.unempP) },
        linguisticIsolation: { value: toNum(attrs.ling), percentile: toNum(attrs.lingP) },
        education: { value: toNum(attrs.edu), percentile: toNum(attrs.eduP) },
        housingBurden: { value: toNum(attrs.housingB), percentile: toNum(attrs.housingBP) },
      },
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("CalEnviroScreen query timed out after 8 seconds");
    } else {
      console.error("CalEnviroScreen query failed:", error);
    }
    return null;
  }
}

function toNum(val: unknown): number | null {
  if (val === null || val === undefined || val === -999) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}
