import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin } from "lucide-react";
import { useRecentPins } from "@/hooks/use-leaderboard";
import { getDisplayName, timeAgo, type RecentPin } from "@/lib/leaderboard";
import { motion } from "framer-motion";

const PIN_COLORS: Record<string, string> = {
  pollution: "#ef4444",
  animal: "#f97316",
  trail: "#22c55e",
  other: "#3b82f6",
};

function SeedCard({ pin }: { pin: RecentPin }) {
  const color = PIN_COLORS[pin.type] || "#3b82f6";
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-border/50">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <MapPin className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground line-clamp-2">{pin.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {getDisplayName(pin.firstName, pin.lastName)} &middot; {timeAgo(pin.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function LiveMapSection() {
  const { data: recentPins } = useRecentPins();
  const pins: RecentPin[] = recentPins ?? [];
  const displayPins = pins.slice(0, 50);
  const cardPins = pins.slice(0, 3);

  // Default center: US
  const center: [number, number] = [39.8, -98.5];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 font-display">
            Community in Action
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl">
            See what Verde contributors are reporting around the world.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Recent seed cards */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recent Seeds
            </h3>
            {cardPins.length > 0 ? (
              cardPins.map((pin) => <SeedCard key={pin.id} pin={pin} />)
            ) : (
              <p className="text-sm text-muted-foreground">
                No seeds yet. Be the first to plant one!
              </p>
            )}
            <a
              href="/map"
              className="inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700 mt-2"
            >
              View all on map &rarr;
            </a>
          </div>

          {/* Mini map */}
          <div className="lg:col-span-3 h-[400px] rounded-2xl overflow-hidden shadow-xl border border-border/50">
            <MapContainer
              center={center}
              zoom={4}
              scrollWheelZoom={true}
              zoomControl={true}
              dragging={true}
              style={{ height: "100%", width: "100%" }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {displayPins.map((pin) => (
                <CircleMarker
                  key={pin.id}
                  center={[pin.lat, pin.lng]}
                  radius={6}
                  pathOptions={{
                    color: PIN_COLORS[pin.type] || "#3b82f6",
                    fillColor: PIN_COLORS[pin.type] || "#3b82f6",
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="capitalize">{pin.type}</strong>
                      <p className="text-muted-foreground mt-1">{pin.description}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
