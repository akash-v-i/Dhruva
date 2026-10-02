import { useHindi } from "@/lib/language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { IMAGES, itemsByStation, stations } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PolarMap } from "@/components/site/PolarMap";

export const Route = createFileRoute("/stations/")({
  head: () => ({
    meta: [
      { title: "Research stations — Dhruva" },
      {
        name: "description",
        content:
          "Polar research stations with coordinates, history and every report, dataset and image linked to them.",
      },
      { property: "og:title", content: "Research stations — Dhruva" },
      {
        property: "og:description",
        content: "Polar research stations with coordinates, history and linked archive material.",
      },
    ],
  }),
  component: StationsIndex,
});

function StationsIndex() {
  const hi = useHindi();
  const antarctic = stations.filter((s) => s.lat < 0);
  const arctic = stations.filter((s) => s.lat > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Stations" }]} />
      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold">{hi ? "अनुसंधान स्टेशन" : "Research stations"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "स्थायी और मौसमी अनुसंधान केंद्र, जिनके आसपास होने वाला सारा विज्ञान यहाँ एक साथ जुड़ा है।"
            : "Permanent and seasonal bases that anchor polar research programmes, each acting as a hub for the science produced around it."}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {stations.map((s) => {
            const count = itemsByStation(s.id).length;
            return (
              <article key={s.id} className="card-polar flex gap-4 p-5">
                <img
                  src={s.image ?? IMAGES.station}
                  alt=""
                  loading="lazy"
                  width={1280}
                  height={864}
                  className="hidden h-24 w-32 shrink-0 rounded-md object-cover sm:block"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow">{s.region}</span>
                    <span className="chip">Est. {s.established}</span>
                    <span className="chip">{count} items</span>
                  </div>
                  <h2 className="mt-1.5 font-display text-lg font-semibold">
                    <Link to="/stations/$id" params={{ id: s.id }} className="hover:text-primary">
                      {s.name}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {Math.abs(s.lat).toFixed(2)}°
                    {s.lat < 0 ? "S" : "N"}, {Math.abs(s.lon).toFixed(2)}°{s.lon < 0 ? "W" : "E"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="space-y-6">
          <div>
            <p className="eyebrow">{hi ? "अंटार्कटिक स्टेशन" : "Antarctic stations"}</p>
            <PolarMap
              hemisphere="south"
              className="mt-3 aspect-square w-full"
              markers={antarctic.map((s) => ({
                id: s.id,
                label: s.name,
                lat: s.lat,
                lon: s.lon,
                kind: "station" as const,
              }))}
            />
          </div>
          <div>
            <p className="eyebrow">{hi ? "आर्कटिक स्टेशन" : "Arctic stations"}</p>
            <PolarMap
              hemisphere="north"
              className="mt-3 aspect-square w-full"
              markers={arctic.map((s) => ({
                id: s.id,
                label: s.name,
                lat: s.lat,
                lon: s.lon,
                kind: "station" as const,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
