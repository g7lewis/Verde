interface LandCoverClass {
  classId: number;
  name: string;
  color: string;
  count: number;
  percentage: number;
}

interface LandCoverResult {
  classes: LandCoverClass[];
  totalPixels: number;
  dominantClass: string;
  treePercentage: number;
  builtPercentage: number;
  waterPercentage: number;
  cropPercentage: number;
  vegetationPercentage: number;
}

const LAND_COVER_CLASSES: Record<number, { name: string; color: string; category: string }> = {
  0: { name: "No Data", color: "#ffffff", category: "other" },
  1: { name: "Water", color: "#1a5bab", category: "water" },
  2: { name: "Trees", color: "#358221", category: "vegetation" },
  3: { name: "Grass", color: "#a7d282", category: "vegetation" },
  4: { name: "Flooded Vegetation", color: "#87d19e", category: "vegetation" },
  5: { name: "Crops", color: "#ffdb5c", category: "crops" },
  6: { name: "Scrub/Shrub", color: "#eecfa8", category: "vegetation" },
  7: { name: "Built Area", color: "#ed022a", category: "built" },
  8: { name: "Bare Ground", color: "#ede9e4", category: "bare" },
  9: { name: "Snow/Ice", color: "#f2faff", category: "other" },
  10: { name: "Clouds", color: "#c8c8c8", category: "other" },
  11: { name: "Rangeland", color: "#c6ad8d", category: "vegetation" },
};

function emptyResult(): LandCoverResult {
  return {
    classes: [],
    totalPixels: 0,
    dominantClass: "Unknown",
    treePercentage: 0,
    builtPercentage: 0,
    waterPercentage: 0,
    cropPercentage: 0,
    vegetationPercentage: 0,
  };
}

export async function queryLandCover(
  lat: number,
  lng: number,
  radiusMeters: number = 1000
): Promise<LandCoverResult> {
  try {
    const baseUrl = "https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/computeStatisticsHistograms";
    
    const xMin = lng - (radiusMeters / 111320) / Math.cos(lat * Math.PI / 180);
    const xMax = lng + (radiusMeters / 111320) / Math.cos(lat * Math.PI / 180);
    const yMin = lat - (radiusMeters / 110574);
    const yMax = lat + (radiusMeters / 110574);
    
    const geometry = {
      xmin: xMin,
      ymin: yMin,
      xmax: xMax,
      ymax: yMax,
      spatialReference: { wkid: 4326 }
    };
    
    const params = new URLSearchParams({
      geometry: JSON.stringify(geometry),
      geometryType: "esriGeometryEnvelope",
      mosaicRule: JSON.stringify({
        mosaicMethod: "esriMosaicAttribute",
        sortField: "Year",
        sortValue: "2023",
        ascending: false
      }),
      f: "json"
    });

    console.log("Sentinel 2 Land Cover query for:", lat, lng, "radius:", radiusMeters, "m");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Verde/1.0 (environmental mapping app)',
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error("Sentinel 2 API error:", response.status);
      return emptyResult();
    }

    const data = await response.json();
    
    if (!data.histograms || data.histograms.length === 0) {
      console.log("Sentinel 2: No histogram data returned");
      return emptyResult();
    }
    
    const histogram = data.histograms[0];
    const counts = histogram.counts || [];
    
    if (counts.length === 0) {
      console.log("Sentinel 2: Empty histogram counts");
      return emptyResult();
    }
    
    const totalPixels = counts.reduce((sum: number, c: number) => sum + c, 0);
    if (totalPixels === 0) {
      return emptyResult();
    }
    
    const classes: LandCoverClass[] = [];
    let treeCount = 0;
    let builtCount = 0;
    let waterCount = 0;
    let cropCount = 0;
    let vegetationCount = 0;
    
    for (let i = 0; i < counts.length && i <= 11; i++) {
      const count = counts[i] || 0;
      if (count === 0) continue;
      
      const classInfo = LAND_COVER_CLASSES[i] || { name: `Class ${i}`, color: "#888888", category: "other" };
      const percentage = Math.round((count / totalPixels) * 1000) / 10;
      
      classes.push({
        classId: i,
        name: classInfo.name,
        color: classInfo.color,
        count: count,
        percentage: percentage,
      });
      
      if (i === 2) treeCount = count;
      if (i === 7) builtCount = count;
      if (i === 1) waterCount = count;
      if (i === 5) cropCount = count;
      if (classInfo.category === "vegetation") vegetationCount += count;
    }
    
    classes.sort((a, b) => b.percentage - a.percentage);
    
    const significantClasses = classes.filter(c => c.percentage >= 1 && c.classId !== 0 && c.classId !== 10);
    const dominantClass = significantClasses.length > 0 ? significantClasses[0].name : "Unknown";
    
    console.log(`Sentinel 2: ${totalPixels} pixels, dominant: ${dominantClass}, classes:`, significantClasses.map(c => `${c.name}:${c.percentage}%`).join(", "));
    
    return {
      classes: significantClasses,
      totalPixels,
      dominantClass,
      treePercentage: Math.round((treeCount / totalPixels) * 1000) / 10,
      builtPercentage: Math.round((builtCount / totalPixels) * 1000) / 10,
      waterPercentage: Math.round((waterCount / totalPixels) * 1000) / 10,
      cropPercentage: Math.round((cropCount / totalPixels) * 1000) / 10,
      vegetationPercentage: Math.round((vegetationCount / totalPixels) * 1000) / 10,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log("Sentinel 2 query timed out after 10 seconds");
    } else {
      console.error("Sentinel 2 Land Cover query failed:", error);
    }
    return emptyResult();
  }
}
