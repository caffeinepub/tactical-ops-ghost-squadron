import { MapPin, Minus, X } from "lucide-react";
import { motion } from "motion/react";
import type { Mission } from "../backend";
import { MissionStatus } from "../backend";

interface TacticalMapProps {
  missions: Mission[] | undefined;
  globalLocations: string[] | undefined;
}

const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  "Eastern Europe": { x: 430, y: 140 },
  "North Africa": { x: 390, y: 220 },
  "Middle East": { x: 490, y: 210 },
  "Central Asia": { x: 550, y: 170 },
  "Southeast Asia": { x: 620, y: 240 },
  "East Asia": { x: 660, y: 160 },
  "West Africa": { x: 350, y: 250 },
  "South America": { x: 230, y: 310 },
  "Central America": { x: 160, y: 240 },
  "Western Europe": { x: 380, y: 130 },
  "Arctic Zone": { x: 450, y: 50 },
  "Pacific Islands": { x: 700, y: 290 },
};

function getLocationCoords(location: string): { x: number; y: number } {
  if (LOCATION_COORDS[location]) return LOCATION_COORDS[location];
  let hash = 0;
  for (let i = 0; i < location.length; i++)
    hash = location.charCodeAt(i) + ((hash << 5) - hash);
  return {
    x: 100 + (Math.abs(hash) % 600),
    y: 80 + (Math.abs(hash >> 4) % 280),
  };
}

export default function TacticalMap({ missions }: TacticalMapProps) {
  const missionLocations =
    missions?.map((m, i) => ({
      ...getLocationCoords(m.location),
      name: m.location,
      status: m.status,
      title: m.title,
      index: i,
    })) ?? [];

  return (
    <div className="tactical-panel hud-glow h-full">
      <div className="tactical-panel-header px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-condensed font-700 text-sm text-foreground tracking-widest">
            TACTICAL GLOBAL MAP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Minimize map"
            className="w-5 h-5 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Minus className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            type="button"
            aria-label="Close map"
            className="w-5 h-5 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div
          className="relative bg-background/60 border border-border overflow-hidden"
          style={{ paddingBottom: "56.25%" }}
        >
          <svg
            viewBox="0 0 800 450"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Tactical global map showing mission locations"
          >
            <title>Tactical Global Map</title>
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="oklch(0.26 0.018 222)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="800" height="450" fill="url(#grid)" />

            {/* North America */}
            <path
              d="M 80 80 L 200 70 L 230 100 L 220 160 L 190 190 L 170 200 L 150 180 L 130 190 L 120 220 L 100 230 L 90 210 L 70 200 L 60 170 L 65 130 Z"
              fill="oklch(0.22 0.015 222)"
              stroke="oklch(0.30 0.018 222)"
              strokeWidth="1"
            />
            {/* South America */}
            <path
              d="M 180 240 L 230 235 L 260 260 L 270 310 L 255 360 L 230 380 L 200 370 L 185 340 L 175 300 L 170 260 Z"
              fill="oklch(0.22 0.015 222)"
              stroke="oklch(0.30 0.018 222)"
              strokeWidth="1"
            />
            {/* Europe */}
            <path
              d="M 340 90 L 420 85 L 440 110 L 430 140 L 410 150 L 385 145 L 360 130 L 345 110 Z"
              fill="oklch(0.22 0.015 222)"
              stroke="oklch(0.30 0.018 222)"
              strokeWidth="1"
            />
            {/* Africa */}
            <path
              d="M 345 175 L 420 170 L 450 200 L 445 260 L 420 310 L 390 330 L 360 310 L 340 270 L 330 220 L 335 190 Z"
              fill="oklch(0.22 0.015 222)"
              stroke="oklch(0.30 0.018 222)"
              strokeWidth="1"
            />
            {/* Asia */}
            <path
              d="M 440 80 L 680 75 L 700 120 L 690 180 L 650 200 L 600 210 L 550 200 L 510 190 L 480 170 L 450 150 L 440 120 Z"
              fill="oklch(0.22 0.015 222)"
              stroke="oklch(0.30 0.018 222)"
              strokeWidth="1"
            />
            {/* Australia */}
            <path
              d="M 630 300 L 710 295 L 720 330 L 700 355 L 660 360 L 630 340 L 620 315 Z"
              fill="oklch(0.22 0.015 222)"
              stroke="oklch(0.30 0.018 222)"
              strokeWidth="1"
            />

            {missionLocations.map((loc, i) => {
              const color =
                loc.status === MissionStatus.completed
                  ? "oklch(0.66 0.12 220)"
                  : loc.status === MissionStatus.available
                    ? "oklch(0.48 0.14 25)"
                    : "oklch(0.40 0.01 222)";
              return (
                <motion.g
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable mission list
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {loc.status === MissionStatus.available && (
                    <circle
                      cx={loc.x}
                      cy={loc.y}
                      r="12"
                      fill={color}
                      fillOpacity="0.15"
                    >
                      <animate
                        attributeName="r"
                        from="8"
                        to="18"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="fill-opacity"
                        from="0.2"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle cx={loc.x} cy={loc.y} r="5" fill={color} />
                  <circle
                    cx={loc.x}
                    cy={loc.y}
                    r="5"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  <text
                    x={loc.x + 8}
                    y={loc.y + 4}
                    fill={color}
                    fontSize="8"
                    fontFamily="'Barlow Condensed', sans-serif"
                    fontWeight="700"
                    letterSpacing="1"
                  >
                    {loc.title.toUpperCase().slice(0, 12)}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center gap-6 mt-3">
          {[
            { color: "bg-allied", label: "ALLIED" },
            { color: "bg-hostile", label: "HOSTILE" },
            { color: "bg-muted-foreground", label: "LOCKED" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="font-condensed text-xs text-muted-foreground tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
