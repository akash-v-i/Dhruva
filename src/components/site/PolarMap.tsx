import { useMemo } from "react";

export type Hemisphere = "south" | "north";

export interface MapMarker {
  id: string;
  label: string;
  lat: number;
  lon: number;
  kind?: "station" | "media" | "dataset" | "activity" | "ship" | undefined;
}

export interface MapRoute {
  id: string;
  label: string;
  points: { lat: number; lon: number; label: string }[];
}

const SIZE = 520;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 28;

// Degrees of latitude shown from the pole. Antarctica's coast sits near 70°S, so a
// 50° span keeps the continent large while ports further north clamp to the rim.
const SPAN = 40;

/** Azimuthal equidistant projection centred on the pole. */
function project(lat: number, lon: number, hemisphere: Hemisphere) {
  const dist = hemisphere === "south" ? 90 + lat : 90 - lat;
  const r = Math.min(Math.max(dist, 0) / SPAN, 1) * R;
  // South: Greenwich at the top, 90°E to the right. North: Greenwich at the bottom, 90°E to the right.
  const theta = (lon * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    x: round(CX + r * Math.sin(theta)),
    y: round(CY + (hemisphere === "south" ? -r * Math.cos(theta) : r * Math.cos(theta))),
    clipped: dist > SPAN,
  };
}

// Approximate coastlines (lon, lat) — enough to orient a visitor, not for navigation.
const ANTARCTICA: [number, number][] = [
  [0, -70],
  [15, -70],
  [30, -69.5],
  [45, -68],
  [60, -67.5],
  [70, -68.5],
  [75, -69.8],
  [80, -67.5],
  [90, -66.5],
  [105, -66],
  [120, -66.5],
  [135, -66.5],
  [150, -68.5],
  [162, -71],
  [170, -76],
  [180, -78],
  [-165, -78.5],
  [-150, -77],
  [-135, -74.5],
  [-120, -73.8],
  [-105, -74],
  [-90, -72.8],
  [-80, -71.5],
  [-72, -69],
  [-67, -66],
  [-62, -63.5],
  [-57, -63.5],
  [-60, -67],
  [-62, -70],
  [-60, -74],
  [-50, -77.5],
  [-40, -78],
  [-30, -76.5],
  [-20, -74],
  [-10, -71.5],
];
const GREENLAND: [number, number][] = [
  [-73, 78],
  [-60, 82],
  [-40, 83.5],
  [-20, 82],
  [-18, 77],
  [-22, 72],
  [-25, 69],
  [-35, 66],
  [-42, 60],
  [-48, 61],
  [-53, 66],
  [-55, 70],
  [-60, 76],
];
const SVALBARD: [number, number][] = [
  [11, 78.5],
  [13, 80],
  [20, 80.4],
  [27, 80],
  [25, 78.5],
  [19, 77],
  [15, 77.3],
];

function landPath(coords: [number, number][], hemisphere: Hemisphere) {
  return (
    coords
      .map(([lon, lat], i) => {
        const p = project(lat, lon, hemisphere);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

export function PolarMap({
  hemisphere,
  markers = [],
  routes = [],
  selectedId,
  onSelect,
  className = "",
}: {
  hemisphere: Hemisphere;
  markers?: MapMarker[];
  routes?: MapRoute[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const rings = useMemo(
    () => (hemisphere === "south" ? [-80, -70, -60] : [80, 70, 60]),
    [hemisphere],
  );

  // Place labels on the left when a marker sits close to one already labelled on the right,
  // so neighbouring stations (Maitri and Dakshin Gangotri are ~80 km apart) stay readable.
  const placed = useMemo(() => {
    const rightSide: { x: number; y: number }[] = [];
    return markers.map((m) => {
      const p = project(m.lat, m.lon, hemisphere);
      const crowded = rightSide.some((q) => Math.abs(q.x - p.x) < 150 && Math.abs(q.y - p.y) < 16);
      if (!crowded) rightSide.push(p);
      return { m, p, left: crowded };
    });
  }, [markers, hemisphere]);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-border bg-ice ${className}`}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full"
        role="img"
        aria-label={`${hemisphere === "south" ? "Antarctic" : "Arctic"} polar map`}
      >
        <defs>
          <radialGradient id="ocean" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.985 0.012 230)" />
            <stop offset="100%" stopColor="oklch(0.9 0.05 232)" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={R} fill="url(#ocean)" stroke="oklch(0.84 0.05 232)" />

        {(hemisphere === "south" ? [ANTARCTICA] : [GREENLAND, SVALBARD]).map((coast, i) => (
          <path
            key={i}
            d={landPath(coast, hemisphere)}
            fill="oklch(0.995 0.004 240)"
            stroke="oklch(0.78 0.04 240)"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        ))}

        {rings.map((lat) => {
          const p = project(lat, 0, hemisphere);
          const r = Math.round((Math.abs(p.y - CY) || Math.abs(p.x - CX)) * 1000) / 1000;
          return (
            <g key={lat}>
              <circle
                cx={CX}
                cy={CY}
                r={r}
                fill="none"
                stroke="oklch(0.8 0.04 232)"
                strokeDasharray="3 5"
                strokeWidth={1}
              />
              <text
                x={CX - r * 0.707 + 4}
                y={CY + r * 0.707 - 4}
                fontSize="10"
                fill="oklch(0.55 0.04 245)"
              >
                {Math.abs(lat)}°{hemisphere === "south" ? "S" : "N"}
              </text>
            </g>
          );
        })}

        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((lon) => {
          const edge = project(hemisphere === "south" ? -50 : 50, lon, hemisphere);
          return (
            <line
              key={lon}
              x1={CX}
              y1={CY}
              x2={edge.x}
              y2={edge.y}
              stroke="oklch(0.85 0.03 232)"
              strokeWidth={1}
            />
          );
        })}

        {routes.map((route) => {
          const pts = route.points.map((p) => project(p.lat, p.lon, hemisphere));
          // Legs between two ports beyond the rim would cut straight across the map, so start a
          // new sub-path there instead of drawing the chord.
          const d = pts
            .map((p, i) => {
              const move = i === 0 || (p.clipped && pts[i - 1]!.clipped);
              return `${move ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ");
          const active = selectedId === route.id;
          return (
            <g key={route.id} className="cursor-pointer" onClick={() => onSelect?.(route.id)}>
              <path
                d={d}
                fill="none"
                stroke={active ? "oklch(0.52 0.16 252)" : "oklch(0.62 0.11 185)"}
                strokeWidth={active ? 3.5 : 2.5}
                strokeDasharray="7 5"
                strokeLinecap="round"
              />
              {pts.map((p, i) =>
                p.clipped ? null : (
                  <circle key={i} cx={p.x} cy={p.y} r={3} fill="oklch(0.62 0.11 185)" />
                ),
              )}
            </g>
          );
        })}

        {placed.map(({ m, p, left }) => {
          const active = selectedId === m.id;
          const fill =
            m.kind === "ship"
              ? "oklch(0.58 0.2 28)"
              : m.kind === "media"
                ? "oklch(0.72 0.14 75)"
                : m.kind === "dataset"
                  ? "oklch(0.62 0.11 185)"
                  : m.kind === "activity"
                    ? "oklch(0.6 0.13 300)"
                    : "oklch(0.52 0.16 252)";
          return (
            <g
              key={m.id}
              className="cursor-pointer"
              onClick={() => onSelect?.(m.id)}
              role="button"
              tabIndex={0}
              aria-label={m.label}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelect?.(m.id);
              }}
            >
              {m.kind === "ship" && (
                <circle cx={p.x} cy={p.y} r={10} fill={fill} opacity={0.35}>
                  <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.45;0;0.45"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {active && <circle cx={p.x} cy={p.y} r={12} fill={fill} opacity={0.2} />}
              <circle
                cx={p.x}
                cy={p.y}
                r={m.kind === "ship" ? 7.5 : active ? 7 : 5.5}
                fill={fill}
                stroke="white"
                strokeWidth={2}
              />
              {(active || m.kind === "station" || m.kind === "ship" || m.kind === undefined) && (
                <text
                  x={left ? p.x - 10 : p.x + 10}
                  y={p.y + 4}
                  textAnchor={left ? "end" : "start"}
                  fontSize="11"
                  fontWeight={active ? 700 : 500}
                  fill="oklch(0.27 0.062 258)"
                  stroke="white"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {m.label.length > 26 ? `${m.label.slice(0, 26)}…` : m.label}
                </text>
              )}
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={2.5} fill="oklch(0.27 0.062 258)" />
        <text x={CX + 6} y={CY - 6} fontSize="10" fill="oklch(0.45 0.04 250)">
          {hemisphere === "south" ? "South Pole" : "North Pole"}
        </text>
      </svg>
    </div>
  );
}
