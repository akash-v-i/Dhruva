import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, Maximize2, RotateCcw } from "lucide-react";
import { expeditions, items, itemsByStation, stations, formatDate } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PolarMap, type Hemisphere, type MapMarker } from "@/components/site/PolarMap";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Polar map — Dhruva" },
      {
        name: "description",
        content:
          "An interactive Antarctic and Arctic map of research stations, expedition routes, dataset coverage and media locations.",
      },
      { property: "og:title", content: "Polar map — Dhruva" },
      {
        property: "og:description",
        content: "Interactive map of polar stations, expedition routes, datasets and media.",
      },
    ],
  }),
  component: MapPage,
});

const LAYERS = [
  { id: "stations", label: "Research stations" },
  { id: "routes", label: "Expedition routes" },
  { id: "datasets", label: "Dataset coverage" },
  { id: "media", label: "Media locations" },
  { id: "activities", label: "Activities" },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];

function MapPage() {
  const hi = useHindi();
  const [hemisphere, setHemisphere] = useState<Hemisphere>("south");
  const [active, setActive] = useState<Record<LayerId, boolean>>({
    stations: true,
    routes: true,
    datasets: true,
    media: true,
    activities: false,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void mapRef.current?.requestFullscreen?.().catch(() => {});
  };

  const markers = useMemo(() => {
    const inHemisphere = (lat: number) => (hemisphere === "south" ? lat < 0 : lat > 0);
    const out: MapMarker[] = [];
    if (active.stations) {
      stations
        .filter((s) => inHemisphere(s.lat))
        .forEach((s) =>
          out.push({ id: s.id, label: s.name, lat: s.lat, lon: s.lon, kind: "station" }),
        );
    }
    const linked = (kind: MapMarker["kind"], types: string[]) =>
      items
        .filter((i) => types.includes(i.type) && i.stationId)
        .forEach((i) => {
          const st = stations.find((s) => s.id === i.stationId);
          if (!st || !inHemisphere(st.lat)) return;
          out.push({
            id: `item-${i.id}`,
            label: i.title.length > 34 ? `${i.title.slice(0, 32)}…` : i.title,
            lat: st.lat + (kind === "media" ? 1.4 : kind === "dataset" ? -1.4 : 2.6),
            lon: st.lon + (kind === "media" ? 3 : kind === "dataset" ? -3 : 5),
            kind,
          });
        });
    if (active.datasets) linked("dataset", ["dataset"]);
    if (active.media) linked("media", ["photo", "video"]);
    if (active.activities) linked("activity", ["activity"]);
    return out;
  }, [active, hemisphere]);

  const routes = active.routes
    ? expeditions
        .filter((e) => (hemisphere === "south" ? e.region !== "Arctic" : e.region === "Arctic"))
        .map((e) => ({ id: e.id, label: e.number, points: e.route }))
    : [];

  const selectedStation = stations.find((s) => s.id === selected);
  const selectedExpedition = expeditions.find((e) => e.id === selected);
  const selectedItem = items.find((i) => `item-${i.id}` === selected);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Polar Map" }]} />
      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold">{hi ? "ध्रुवीय मानचित्र" : "Polar map"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "ध्रुवीय मानचित्र पर स्टेशन, अभियान मार्ग, डेटासेट और मीडिया देखें। विवरण खोलने के लिए किसी चिह्न या मार्ग को चुनें।"
            : "Stations, expedition routes, dataset coverage and media plotted on an azimuthal polar projection. Select any marker or route to open its details."}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr_280px]">
        <aside className="space-y-6">
          <div>
            <p className="eyebrow">{hi ? "क्षेत्र" : "Region"}</p>
            <div className="mt-3 flex gap-2">
              {(["south", "north"] as Hemisphere[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setHemisphere(h);
                    setSelected(null);
                  }}
                  className={`btn-base py-2 text-xs ${hemisphere === h ? "btn-primary" : "btn-outline"}`}
                >
                  {h === "south" ? (hi ? "अंटार्कटिक" : "Antarctic") : hi ? "आर्कटिक" : "Arctic"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">{hi ? "परतें" : "Layers"}</p>
            <div className="mt-3 space-y-1.5">
              {LAYERS.map((l) => (
                <label
                  key={l.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-ice"
                >
                  <input
                    type="checkbox"
                    checked={active[l.id]}
                    onChange={(e) => setActive((a) => ({ ...a, [l.id]: e.target.checked }))}
                    className="size-4 accent-primary"
                  />
                  {uiText(l.label, hi)}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">{hi ? "संकेत" : "Legend"}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <LegendRow color="oklch(0.52 0.16 252)" label="Station" />
              <LegendRow color="oklch(0.62 0.11 185)" label="Route / dataset" />
              <LegendRow color="oklch(0.72 0.14 75)" label="Media" />
              <LegendRow color="oklch(0.6 0.13 300)" label="Activity" />
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="btn-base btn-outline py-2 text-xs"
            >
              <RotateCcw className="size-3.5" /> {hi ? "दृश्य रीसेट करें" : "Reset view"}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="btn-base btn-outline py-2 text-xs"
            >
              <Maximize2 className="size-3.5" /> {hi ? "पूर्ण स्क्रीन" : "Full screen"}
            </button>
          </div>
        </aside>

        <div
          ref={mapRef}
          className="bg-background [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:p-6"
        >
          <PolarMap
            hemisphere={hemisphere}
            markers={markers}
            routes={routes}
            selectedId={selected}
            onSelect={setSelected}
            className="aspect-square w-full [:fullscreen>&]:h-full [:fullscreen>&]:w-auto"
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-ice p-5">
            <p className="eyebrow">{hi ? "विवरण" : "Details"}</p>
            {selectedStation ? (
              <div className="mt-3">
                <p className="font-display text-lg font-semibold">
                  {uiText(selectedStation.name, hi)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedStation.region} · {Math.abs(selectedStation.lat).toFixed(2)}°
                  {selectedStation.lat < 0 ? "S" : "N"}, {Math.abs(selectedStation.lon).toFixed(2)}°
                  {selectedStation.lon < 0 ? "W" : "E"}
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>
                    {countLabel(
                      expeditions.filter((e) => e.stationIds.includes(selectedStation.id)).length,
                      "expedition",
                      "अभियान",
                      hi,
                    )}
                  </li>
                  <li>
                    {countLabel(
                      itemsByStation(selectedStation.id).filter((i) => i.type === "report").length,
                      "report",
                      "रिपोर्ट",
                      hi,
                    )}
                  </li>
                  <li>
                    {countLabel(
                      itemsByStation(selectedStation.id).filter((i) => i.type === "dataset").length,
                      "dataset",
                      "डेटासेट",
                      hi,
                    )}
                  </li>
                </ul>
                <Link
                  to="/stations/$id"
                  params={{ id: selectedStation.id }}
                  className="btn-base btn-primary mt-4 py-1.5 text-xs"
                >
                  {hi ? "स्टेशन देखें" : "View station"} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : selectedExpedition ? (
              <div className="mt-3">
                <p className="font-display text-lg font-semibold">
                  {uiText(selectedExpedition.name, hi)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedExpedition.region} · {formatDate(selectedExpedition.start)} —{" "}
                  {formatDate(selectedExpedition.end)}
                </p>
                <Link
                  to="/expeditions/$id"
                  params={{ id: selectedExpedition.id }}
                  className="btn-base btn-primary mt-4 py-1.5 text-xs"
                >
                  {hi ? "अभियान देखें" : "View expedition"} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : selectedItem ? (
              <div className="mt-3">
                <p className="font-display text-base font-semibold">{selectedItem.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedItem.summary}</p>
                <Link
                  to="/item/$id"
                  params={{ id: selectedItem.id }}
                  className="btn-base btn-primary mt-4 py-1.5 text-xs"
                >
                  {hi ? "विवरण देखें" : "View item"} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {hi
                  ? "विवरण देखने के लिए कोई चिह्न या मार्ग चुनें।"
                  : "Select a marker or route to see its details here."}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border p-5">
            <p className="eyebrow">
              {hi ? "दिखाई देने वाले चिह्न (पाठ सूची)" : "Visible features (text alternative)"}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {markers.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className="text-left hover:text-primary"
                    onClick={() => setSelected(m.id)}
                  >
                    {m.label}
                  </button>
                </li>
              ))}
              {routes.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="text-left hover:text-primary"
                    onClick={() => setSelected(r.id)}
                  >
                    {hi ? "मार्ग" : "Route"} — {r.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            {hi
              ? "दर्ज निर्देशांकों से बना मानचित्र। तटरेखा अनुमानित है।"
              : "Map rendered from recorded coordinates on an azimuthal equidistant graticule. Coastlines are approximate."}
          </p>
        </aside>
      </div>
    </div>
  );
}

function countLabel(n: number, en: string, hiWord: string, hi: boolean) {
  return hi ? `${n} ${hiWord}` : `${n} ${en}${n === 1 ? "" : "s"}`;
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </li>
  );
}
