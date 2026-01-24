interface EpaFacility {
  name: string;
  type: string;
  majorFlag: boolean;
  hasViolation: boolean;
  distance: number;
}

interface EpaQueryResult {
  totalFacilities: number;
  majorFacilities: number;
  facilitiesWithViolations: number;
  nearbyFacilities: EpaFacility[];
  industryBreakdown: Record<string, number>;
}

const NAICS_LABELS: Record<string, string> = {
  "324": "Petroleum/Refinery",
  "562": "Waste Management",
  "325": "Chemical Manufacturing",
  "221": "Utilities/Power",
  "331": "Metal Manufacturing",
  "332": "Fabricated Metal",
};

function getNaicsLabel(naics: string | null): string {
  if (!naics) return "Other";
  const prefix = naics.substring(0, 3);
  return NAICS_LABELS[prefix] || "Industrial";
}

export async function queryNearbyEpaFacilities(
  lat: number,
  lng: number,
  radiusMiles: number = 10
): Promise<EpaQueryResult> {
  const radiusMeters = radiusMiles * 1609.34;
  
  const baseUrl = "https://echogeo.epa.gov/arcgis/rest/services/ECHO/Facilities/MapServer/0/query";
  
  // Use URLSearchParams for proper encoding
  // Field names verified from EPA ECHO MapServer schema
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
    distance: radiusMeters.toString(),
    units: "esriSRUnit_Meter",
    outFields: "FAC_NAME,FAC_NAICS_CODES,FAC_MAJOR_FLAG,FAC_CURR_SNC_FLG,FAC_QTRS_IN_NC",
    where: "1=1",
    returnGeometry: "false",  // Must be false - API rejects large geometry responses
    f: "json",
  });

  try {
    const url = `${baseUrl}?${params.toString()}`;
    console.log("EPA query for:", lat, lng, "radius:", radiusMiles, "mi");
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("EPA API error:", response.status);
      return emptyResult();
    }

    const data = await response.json();
    console.log("EPA response:", data.features?.length || 0, "features", data.error ? `Error: ${JSON.stringify(data.error)}` : "");
    
    if (!data.features || data.features.length === 0) {
      return emptyResult();
    }

    const facilities: EpaFacility[] = [];
    const industryBreakdown: Record<string, number> = {};
    let majorCount = 0;
    let violationCount = 0;

    for (const feature of data.features) {
      const attrs = feature.attributes;
      
      const isMajor = attrs.FAC_MAJOR_FLAG === "Y";
      const hasViolation = 
        attrs.FAC_CURR_SNC_FLG === "Y" ||
        (attrs.FAC_QTRS_IN_NC && attrs.FAC_QTRS_IN_NC > 0);
      
      if (isMajor) majorCount++;
      if (hasViolation) violationCount++;

      // FAC_NAICS_CODES can be a comma-separated list, use first code
      const naicsCode = attrs.FAC_NAICS_CODES?.split(",")[0]?.trim() || null;
      const industryType = getNaicsLabel(naicsCode);
      industryBreakdown[industryType] = (industryBreakdown[industryType] || 0) + 1;

      facilities.push({
        name: attrs.FAC_NAME || "Unknown Facility",
        type: industryType,
        majorFlag: isMajor,
        hasViolation,
        distance: radiusMiles, // All facilities are within radius
      });
    }

    // Sort by violation status and major flag (most concerning first)
    facilities.sort((a, b) => {
      if (a.hasViolation !== b.hasViolation) return a.hasViolation ? -1 : 1;
      if (a.majorFlag !== b.majorFlag) return a.majorFlag ? -1 : 1;
      return 0;
    });

    return {
      totalFacilities: facilities.length,
      majorFacilities: majorCount,
      facilitiesWithViolations: violationCount,
      nearbyFacilities: facilities.slice(0, 10),
      industryBreakdown,
    };
  } catch (error) {
    console.error("EPA query failed:", error);
    return emptyResult();
  }
}

function emptyResult(): EpaQueryResult {
  return {
    totalFacilities: 0,
    majorFacilities: 0,
    facilitiesWithViolations: 0,
    nearbyFacilities: [],
    industryBreakdown: {},
  };
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
