/**
 * Seed ~400 pins across California with real coordinates and descriptions.
 * Run: npx tsx scripts/seed-california-pins.ts
 *
 * Also migrates existing 'animal' pins to 'wildlife'.
 */

import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

// --- Helpers ---
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function jitter(val: number, range = 0.005) {
  return val + (Math.random() - 0.5) * range * 2;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randInt(6, 22), randInt(0, 59), randInt(0, 59));
  return d.toISOString();
}

// --- Pin Data ---

interface SeedPin {
  lat: number;
  lng: number;
  type: string;
  description: string;
  upvotes: number;
  createdAt: string;
}

// POLLUTION (~100 pins)
const pollutionSites: [number, number, string][] = [
  // Wilmington / Carson / Long Beach refineries
  [33.7866, -118.2639, "Wilmington"],
  [33.8311, -118.2620, "Carson"],
  [33.7701, -118.1937, "Long Beach harbor"],
  [33.7955, -118.2215, "Dominguez Channel"],
  [33.8100, -118.2400, "Watson refinery area"],
  // Commerce / Vernon / East LA industrial
  [33.9967, -118.1519, "Commerce industrial zone"],
  [33.9831, -118.2296, "Vernon meatpacking district"],
  [34.0236, -118.1695, "East LA rail yards"],
  [34.0040, -118.1870, "Bandini industrial"],
  [33.9750, -118.2100, "Slauson corridor"],
  // Central Valley agriculture
  [36.7378, -119.7871, "Fresno industrial"],
  [36.3302, -119.2921, "Visalia dairy ops"],
  [35.3733, -119.0187, "Bakersfield oil fields"],
  [35.3900, -119.1300, "Kern County refinery"],
  [36.9741, -120.0769, "Madera ag runoff"],
  [37.2502, -120.2600, "Merced dairy belt"],
  [36.6002, -119.7600, "Selma ag chemicals"],
  [37.6624, -120.9988, "Modesto industrial"],
  [37.9577, -121.2908, "Stockton port"],
  [37.9400, -121.3200, "Stockton waterfront industry"],
  // Richmond / Bay Area
  [37.9358, -122.3477, "Richmond Chevron refinery"],
  [37.9200, -122.3800, "Point Richmond industrial"],
  [37.9100, -122.3600, "Richmond rail yards"],
  [37.7850, -122.3950, "Oakland port emissions"],
  [37.7680, -122.2250, "East Oakland industry"],
  // Inland Empire
  [33.9425, -117.2297, "Riverside cement plants"],
  [34.1064, -117.2897, "San Bernardino rail hub"],
  [33.8752, -117.5664, "Corona warehouse district"],
  [34.0633, -117.6509, "Ontario distribution center"],
  [34.0500, -117.4300, "Fontana steel mills"],
  // San Joaquin Valley
  [36.2077, -119.3473, "Tulare dairies"],
  [35.1264, -118.4459, "Tehachapi wind corridor impact"],
  [36.8469, -119.7206, "Fresno Yosemite Intl area"],
  [36.4900, -119.5200, "Dinuba ag processing"],
  [35.7400, -119.2500, "Delano ag operations"],
  // San Diego border
  [32.5527, -117.0492, "Otay Mesa border crossing"],
  [32.6401, -117.0842, "Chula Vista industrial"],
  [32.7157, -117.1611, "Barrio Logan shipyards"],
  // Sacramento
  [38.5816, -121.4944, "Sacramento rail yards"],
  [38.5400, -121.4200, "South Sacramento industrial"],
  // Smaller sites
  [34.4208, -119.6982, "Santa Barbara offshore platform"],
  [34.1725, -118.5440, "Woodland Hills Superfund area"],
  [34.2564, -118.5560, "Chatsworth chemical storage"],
  [33.8886, -118.0090, "Cerritos power plant"],
  [34.0195, -118.4912, "Culver City MGM runoff"],
  [34.1478, -118.1445, "Glendale industrial"],
  [36.0629, -118.9500, "Porterville ag waste"],
  [37.4419, -122.1430, "Palo Alto Superfund"],
  [37.3382, -121.8863, "San Jose Alviso marshes"],
  [33.1959, -117.3795, "Oceanside Camp Pendleton buffer"],
];

const pollutionDescriptions = [
  "Strong chemical odor detected near the facility fence line. Residents have reported headaches.",
  "Visible emissions from refinery stacks, darker than usual. Reported to AQMD.",
  "Illegal dumping of construction waste along the road shoulder. Notified city code enforcement.",
  "Oil sheen observed on drainage canal surface. Likely runoff from adjacent industrial yard.",
  "Excessive truck traffic creating diesel particulate cloud. Air quality visibly degraded.",
  "Agricultural pesticide spraying observed near residential neighborhood with no buffer zone.",
  "Large pile of uncovered industrial waste producing foul odor in the area.",
  "Wastewater discharge into creek from facility pipe. Water discolored and foamy.",
  "Flaring event at refinery lasted over 2 hours. Orange glow visible for miles.",
  "Dust clouds from unpaved lot operations affecting nearby school. No mitigation measures.",
  "Groundwater contamination signs — dead vegetation in a line following underground plume.",
  "Abandoned drums with chemical residue found near hiking trail. Potentially hazardous.",
];

// WILDLIFE (~100 pins)
const wildlifeSites: [number, number, string][] = [
  // State parks & reserves
  [38.0404, -122.7983, "Point Reyes National Seashore"],
  [37.1862, -122.2039, "Año Nuevo elephant seal colony"],
  [34.0054, -119.7723, "Channel Islands NP — Anacapa"],
  [34.0175, -119.3662, "Channel Islands — Santa Cruz"],
  [37.8651, -119.5383, "Yosemite Valley"],
  [36.4864, -118.5658, "Sequoia National Park"],
  [36.7178, -118.7692, "Kings Canyon NP"],
  [41.7116, -122.3173, "Mount Shasta meadows"],
  [41.2125, -124.0048, "Prairie Creek redwoods"],
  [39.3712, -123.7535, "Mendocino coast"],
  [35.2720, -120.8524, "Montaña de Oro"],
  [33.4672, -117.6981, "San Onofre beach hawks"],
  [34.1492, -116.1620, "Joshua Tree NP"],
  [36.2470, -116.8177, "Death Valley pupfish"],
  [32.8328, -116.8377, "Anza-Borrego bighorn sheep"],
  [38.8979, -120.0374, "Lake Tahoe osprey nests"],
  [37.7349, -119.5646, "Yosemite — Mariposa Grove"],
  [36.6056, -118.3166, "Mineral King marmots"],
  [41.5906, -124.0825, "Jedediah Smith redwoods"],
  [40.2171, -123.7644, "King Range elk herd"],
  // Marine sanctuaries
  [36.6225, -121.9050, "Monterey Bay whale watching"],
  [37.4960, -122.5143, "Half Moon Bay seabirds"],
  [34.3959, -119.8415, "Santa Barbara Channel dolphins"],
  [33.4484, -118.4853, "Catalina Island bison"],
  [38.3144, -123.0660, "Bodega Head seals"],
  [35.3606, -121.0892, "San Simeon elephant seals"],
  [38.9953, -123.6528, "Point Arena lighthouse seabirds"],
  // Wildlife corridors
  [34.0889, -118.9010, "Santa Monica Mountains lions"],
  [33.7475, -116.9711, "San Jacinto corridor"],
  [34.3381, -118.1427, "Angeles Crest migration route"],
  [37.4275, -122.1697, "Baylands wildlife corridor"],
  [37.5100, -121.9700, "Coyote Hills marsh birds"],
  [33.0731, -117.2583, "San Elijo lagoon"],
  [32.9253, -117.2578, "Torrey Pines reserve"],
  [38.5300, -121.7600, "Yolo Bypass wildlife area"],
  [39.1600, -121.7600, "Gray Lodge waterfowl"],
  [41.3900, -122.3100, "McCloud River trout"],
  [40.4500, -121.5100, "Lassen volcanic meadows"],
  [39.5900, -121.9600, "Sutter Buttes raptors"],
  [36.9500, -121.9200, "Elkhorn Slough otters"],
  [35.9700, -121.5000, "Big Sur condors"],
  [34.4600, -119.0500, "Figueroa Mountain flowers"],
  [37.8800, -122.2500, "Lake Merritt herons"],
  [38.1900, -122.1300, "Grizzly Island waterfowl"],
  [33.7200, -116.3700, "Coachella Valley fringe-toed lizard"],
  [34.7300, -118.3500, "Antelope Valley poppy hawks"],
  [37.3400, -121.6400, "Anderson Lake coyotes"],
  [33.3800, -117.2500, "San Luis Rey river birds"],
  [35.6500, -121.2000, "Piedras Blancas seals"],
];

const wildlifeDescriptions = [
  "Spotted a family of deer grazing at dawn near the meadow edge. Fawns still had spots!",
  "Bald eagle perched on snag overlooking the creek. Incredible wingspan.",
  "Pod of ~12 dolphins surfing the waves just offshore. Amazing to witness.",
  "Red-tailed hawk circling above the canyon thermals. Beautiful flight pattern.",
  "Great blue heron standing perfectly still in the marsh. Caught a fish while I watched!",
  "Coyote trotting along the ridge at sunset. Paused to look at us before continuing.",
  "Sea otters floating on their backs in the kelp bed. At least 8 individuals.",
  "Monarch butterfly cluster on eucalyptus trees. Hundreds in a single grove.",
  "Gray whale spout spotted from the bluff trail. Appears to be a mother-calf pair.",
  "Western bluebird nesting in the fence post cavity. Male's plumage is stunning.",
  "Elephant seals hauled out on the beach, molting season. Maybe 200+ animals.",
  "Barn owl observed hunting at dusk along the field edge. Silent flight.",
  "Mountain lion tracks in the mud along the creek. Fresh from overnight.",
  "California quail family — two adults and at least 12 chicks crossing the trail.",
];

// TRAIL (~80 pins)
const trailSites: [number, number, string][] = [
  [34.1184, -118.3004, "Griffith Park — Mt Hollywood"],
  [34.1128, -118.3495, "Runyon Canyon"],
  [37.8977, -122.5349, "Mt Tam — Steep Ravine"],
  [37.5585, -122.0652, "Mission Peak summit"],
  [36.5785, -118.2923, "Mt Whitney trailhead"],
  [37.7462, -119.5931, "Yosemite — Mist Trail"],
  [34.2274, -118.0569, "Eaton Canyon Falls"],
  [34.2594, -117.6111, "Mt Baldy summit"],
  [33.9700, -118.4700, "Ballona Creek trail"],
  [34.0606, -118.5250, "Temescal Gateway"],
  [37.8268, -122.4225, "Golden Gate Bridge walk"],
  [34.0900, -118.5700, "Topanga State Park"],
  [36.2858, -121.7880, "Big Sur — McWay Falls"],
  [33.7880, -116.5650, "Palm Springs aerial tram"],
  [38.9340, -119.9840, "Tahoe Rim Trail — Spooner"],
  [34.2106, -118.5579, "Old Boney trail"],
  [37.2334, -122.0180, "Black Mountain trail"],
  [33.6390, -117.8432, "Crystal Cove tide pools"],
  [34.4535, -119.7208, "Inspiration Point SB"],
  [37.4342, -122.3229, "Sawyer Camp trail"],
  [34.0572, -117.1968, "San Bernardino Peak trail"],
  [37.0082, -122.0608, "Nisene Marks redwoods"],
  [32.8890, -117.2440, "Torrey Pines Guy Fleming"],
  [33.9800, -117.3900, "Box Springs Mountain"],
  [37.9011, -121.9145, "Mt Diablo summit"],
  [34.1850, -119.2200, "Gaviota Peak"],
  [38.5500, -119.8200, "Carson Pass wildflowers"],
  [40.4200, -121.5500, "Bumpass Hell — Lassen"],
  [37.7505, -119.5333, "Nevada Falls trail"],
  [36.5100, -117.5200, "Telescope Peak"],
  [35.1900, -118.6000, "PCT — Walker Pass"],
  [39.0900, -120.2300, "Granite Chief wilderness"],
  [34.3800, -117.6800, "Phelan overlook"],
  [33.5400, -117.7800, "San Clemente beach trail"],
  [37.5800, -118.9000, "Mammoth Mountain summit"],
  [34.3300, -119.9300, "Gaviota Wind Caves"],
  [33.9400, -118.3900, "Kenneth Hahn park"],
  [34.0900, -118.2000, "Debs Park trails"],
  [37.7600, -122.4100, "Twin Peaks overlook"],
  [37.8100, -122.4700, "Lands End trail"],
];

const trailDescriptions = [
  "Beautiful morning hike — wildflowers blooming along the trail. Moderate difficulty, bring water!",
  "Trail is well-maintained with great signage. Saw several other hikers enjoying the views.",
  "Stunning panoramic views from the summit. Clear day — could see all the way to the ocean.",
  "Peaceful walk through old-growth forest. The canopy blocks most sunlight, cool even in summer.",
  "Creek crossing is a bit tricky after rain. Recommend waterproof boots.",
  "Great trail for families — mostly flat with shaded rest areas. Picnic tables at the halfway point.",
  "Sunset hike was magical. The golden hour light on the canyon walls is unreal.",
  "Trail recently cleared of fallen trees from winter storms. Park service doing great work.",
  "Early morning run on this trail — very quiet, just birdsong. Perfect for meditation walks.",
  "Steep switchbacks for the first mile, then levels out. Worth the effort for the vista.",
  "Tide pools at the end of the trail are incredible. Starfish, anemones, hermit crabs.",
  "Wildflower super bloom! Fields of poppies, lupines, and goldfields as far as you can see.",
];

// WATER (~50 pins)
const waterSites: [number, number, string][] = [
  [39.0968, -120.0324, "Lake Tahoe — Sand Harbor"],
  [34.0100, -118.4960, "Santa Monica Beach"],
  [38.5816, -121.5064, "Sacramento River confluence"],
  [37.8175, -122.4783, "Baker Beach"],
  [36.9522, -122.0246, "Santa Cruz boardwalk beach"],
  [33.8568, -118.3989, "Hermosa Beach"],
  [36.6163, -121.9018, "Monterey Bay"],
  [33.7200, -118.2800, "San Pedro tide pools"],
  [34.4042, -119.6934, "Santa Barbara Leadbetter"],
  [37.5330, -122.3129, "Foster City lagoon"],
  [37.4520, -122.4480, "Pillar Point Harbor"],
  [33.9510, -118.4510, "Dockweiler Beach"],
  [39.1700, -120.1400, "Tahoe — Kings Beach"],
  [38.7600, -120.5200, "South Fork American River"],
  [33.6600, -117.9200, "Newport Beach"],
  [35.1650, -120.7400, "Pismo Beach"],
  [34.5750, -120.6500, "Jalama Beach"],
  [41.0500, -124.1200, "Trinidad Head beach"],
  [36.9600, -121.9600, "Capitola Beach"],
  [37.8900, -122.0700, "Lafayette Reservoir"],
  [33.2400, -117.3900, "Moonlight Beach Encinitas"],
  [33.9600, -117.5600, "Lake Perris"],
  [34.1800, -117.3200, "Glen Helen park lake"],
  [37.4800, -121.9300, "Alviso salt flats"],
  [38.0500, -122.5100, "Drakes Estero"],
];

const waterDescriptions = [
  "Crystal-clear water today. Visibility must be 20+ feet. Perfect for snorkeling.",
  "River levels are healthy after recent rains. Good flow, aquatic plants thriving.",
  "Beach cleanup organized — removed 3 bags of plastic. Water quality seems improved.",
  "Tested water clarity — excellent. No algae bloom signs this season.",
  "Storm drain outfall is flowing murky after rain. Monitoring for contaminants.",
  "Lake level is lower than last year. Shoreline has receded about 15 feet.",
  "Surfing conditions great but watch for rip current near the jetty.",
  "Kayaked the estuary — water pristine, saw rays and leopard sharks.",
  "Creek is running clear and cold. Good sign for salmon spawning season ahead.",
  "Reservoir at 78% capacity. Boat ramp fully accessible. Water looks clean.",
];

// RESTORATION (~40 pins)
const restorationSites: [number, number, string][] = [
  [34.0765, -118.2540, "LA River revitalization — Glendale Narrows"],
  [37.8022, -122.4650, "Crissy Field wetland restoration"],
  [37.4300, -122.1200, "Baylands nature preserve — Palo Alto"],
  [34.0180, -118.4000, "Baldwin Hills greenhouse garden"],
  [34.0590, -118.2340, "Echo Park Lake restored"],
  [33.9500, -118.4100, "Playa Vista wetlands"],
  [37.7700, -122.5100, "Ocean Beach dune restoration"],
  [32.7600, -117.2500, "Mission Bay marsh planting"],
  [38.5600, -121.5200, "Sacramento urban forest project"],
  [36.9700, -122.0300, "Santa Cruz forest recovery"],
  [34.0600, -117.7500, "Pomona community garden expansion"],
  [37.3700, -121.9300, "San Jose riparian restoration"],
  [33.9700, -118.2500, "Compton creek greenway"],
  [34.0200, -118.1400, "Maywood community garden"],
  [37.5500, -122.0700, "Fremont urban orchard"],
  [33.8900, -117.9300, "Fullerton pollinator garden"],
  [34.1600, -118.5200, "Topanga watershed rehab"],
  [34.0100, -118.3600, "Culver City rain garden"],
  [37.8500, -122.2700, "Oakland redwood reforestation"],
  [38.5800, -121.4700, "Sac tree canopy initiative"],
  [33.0700, -117.2600, "Batiquitos Lagoon enhancement"],
  [36.9600, -121.9700, "Natural Bridges monarch habitat"],
  [35.2800, -120.6600, "SLO Creek bank stabilization"],
  [34.0400, -118.2600, "Boyle Heights green alley"],
  [37.7800, -122.4000, "SF civic center urban farm"],
  [34.4200, -119.7000, "SB creeks council planting"],
  [38.5300, -121.7800, "Davis greenway corridor"],
  [37.3300, -121.8900, "Guadalupe River restoration"],
  [33.7300, -116.4500, "Coachella Valley native planting"],
  [40.5800, -122.3900, "Redding watershed project"],
];

const restorationDescriptions = [
  "Community planting day — we put in 50 native oak seedlings along the creek bank.",
  "Wetland restoration progressing nicely. New cattails and sedges are establishing.",
  "Invasive ice plant removed from 2 acres. Native dune grass plugs planted.",
  "Rain garden installed at the community center. Captures runoff from the parking lot.",
  "Tree planting event — 30 volunteers, 100 trees planted in 4 hours. Great turnout!",
  "Monarch butterfly waystation established with native milkweed and nectar plants.",
  "Stream bank erosion control using willow stakes and coir logs. Working well after 6 months.",
  "Community garden plot expanded — now 40 raised beds growing organic vegetables.",
  "Pollinator garden thriving! Counted 12 butterfly species visiting the native flowers.",
  "Bioswale completed along the street. Already filtering first-flush stormwater beautifully.",
  "Removed 500 lbs of invasive English ivy from the urban forest patch.",
  "Creek daylighting project revealed — flowing water visible for first time in 50 years.",
];

// --- Build all pins ---

function buildPins(): SeedPin[] {
  const pins: SeedPin[] = [];

  // Pollution
  for (const [lat, lng, area] of pollutionSites) {
    const desc = pick(pollutionDescriptions);
    pins.push({
      lat: jitter(lat),
      lng: jitter(lng),
      type: "pollution",
      description: `${area}: ${desc}`,
      upvotes: randInt(0, 5),
      createdAt: daysAgo(randInt(1, 60)),
    });
    // Add a second pin near many pollution sites for density
    if (Math.random() < 0.6) {
      pins.push({
        lat: jitter(lat, 0.01),
        lng: jitter(lng, 0.01),
        type: "pollution",
        description: `Near ${area}: ${pick(pollutionDescriptions)}`,
        upvotes: randInt(0, 3),
        createdAt: daysAgo(randInt(1, 50)),
      });
    }
  }

  // Wildlife
  for (const [lat, lng, area] of wildlifeSites) {
    pins.push({
      lat: jitter(lat),
      lng: jitter(lng),
      type: "wildlife",
      description: `${area}: ${pick(wildlifeDescriptions)}`,
      upvotes: randInt(0, 5),
      createdAt: daysAgo(randInt(1, 60)),
    });
    if (Math.random() < 0.4) {
      pins.push({
        lat: jitter(lat, 0.01),
        lng: jitter(lng, 0.01),
        type: "wildlife",
        description: `At ${area}: ${pick(wildlifeDescriptions)}`,
        upvotes: randInt(0, 4),
        createdAt: daysAgo(randInt(1, 45)),
      });
    }
  }

  // Trail
  for (const [lat, lng, area] of trailSites) {
    pins.push({
      lat: jitter(lat),
      lng: jitter(lng),
      type: "trail",
      description: `${area}: ${pick(trailDescriptions)}`,
      upvotes: randInt(0, 5),
      createdAt: daysAgo(randInt(1, 55)),
    });
    if (Math.random() < 0.5) {
      pins.push({
        lat: jitter(lat, 0.008),
        lng: jitter(lng, 0.008),
        type: "trail",
        description: `Near ${area}: ${pick(trailDescriptions)}`,
        upvotes: randInt(0, 3),
        createdAt: daysAgo(randInt(1, 40)),
      });
    }
  }

  // Water
  for (const [lat, lng, area] of waterSites) {
    pins.push({
      lat: jitter(lat),
      lng: jitter(lng),
      type: "water",
      description: `${area}: ${pick(waterDescriptions)}`,
      upvotes: randInt(0, 5),
      createdAt: daysAgo(randInt(1, 50)),
    });
    if (Math.random() < 0.5) {
      pins.push({
        lat: jitter(lat, 0.008),
        lng: jitter(lng, 0.008),
        type: "water",
        description: `At ${area}: ${pick(waterDescriptions)}`,
        upvotes: randInt(0, 4),
        createdAt: daysAgo(randInt(1, 45)),
      });
    }
  }

  // Restoration
  for (const [lat, lng, area] of restorationSites) {
    pins.push({
      lat: jitter(lat),
      lng: jitter(lng),
      type: "restoration",
      description: `${area}: ${pick(restorationDescriptions)}`,
      upvotes: randInt(1, 5),
      createdAt: daysAgo(randInt(1, 50)),
    });
    if (Math.random() < 0.3) {
      pins.push({
        lat: jitter(lat, 0.008),
        lng: jitter(lng, 0.008),
        type: "restoration",
        description: `Near ${area}: ${pick(restorationDescriptions)}`,
        upvotes: randInt(0, 3),
        createdAt: daysAgo(randInt(1, 40)),
      });
    }
  }

  return pins;
}

async function main() {
  const client = await pool.connect();

  try {
    // Step 1: Migrate existing 'animal' pins to 'wildlife'
    const migrateResult = await client.query(
      `UPDATE pins SET type = 'wildlife' WHERE type = 'animal'`
    );
    console.log(`Migrated ${migrateResult.rowCount} 'animal' pins → 'wildlife'`);

    // Step 2: Insert seed pins
    const pins = buildPins();
    console.log(`Seeding ${pins.length} California pins...`);

    let inserted = 0;
    const batchSize = 50;
    for (let i = 0; i < pins.length; i += batchSize) {
      const batch = pins.slice(i, i + batchSize);
      const values: any[] = [];
      const placeholders: string[] = [];

      batch.forEach((pin, idx) => {
        const offset = idx * 6;
        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
        );
        values.push(pin.lat, pin.lng, pin.type, pin.description, pin.upvotes, pin.createdAt);
      });

      await client.query(
        `INSERT INTO pins (lat, lng, type, description, upvotes, created_at)
         VALUES ${placeholders.join(", ")}`,
        values
      );
      inserted += batch.length;
      process.stdout.write(`\r  Inserted ${inserted}/${pins.length}`);
    }

    console.log(`\nDone! Seeded ${pins.length} pins across California.`);

    // Summary
    const counts = await client.query(
      `SELECT type, COUNT(*) as count FROM pins GROUP BY type ORDER BY count DESC`
    );
    console.log("\nPin type distribution:");
    for (const row of counts.rows) {
      console.log(`  ${row.type}: ${row.count}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
