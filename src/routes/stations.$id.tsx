import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { IMAGES, expeditions, getStation, itemsByStation, stations } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ItemCard } from "@/components/site/ItemCard";
import { PolarMap } from "@/components/site/PolarMap";

export const Route = createFileRoute("/stations/$id")({
  loader: ({ params }) => {
    const station = getStation(params.id);
    if (!station) throw notFound();
    return { station };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Station not found — Dhruva" }, { name: "robots", content: "noindex" }],
      };
    }
    const s = loaderData.station;
    return {
      meta: [
        { title: `${s.name} station — Dhruva` },
        { name: "description", content: s.description },
        { property: "og:title", content: `${s.name} station — Dhruva` },
        { property: "og:description", content: s.description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Station not found</h1>
      <Link to="/stations" className="btn-base btn-primary mt-6">
        All stations
      </Link>
    </div>
  ),
  component: StationDetail,
});

function StationDetail() {
  const hi = useHindi();
  const { station } = Route.useLoaderData();
  const related = itemsByStation(station.id);
  const visits = expeditions.filter((e) => e.stationIds.includes(station.id));
  const nearby = stations.filter((s) => s.id !== station.id && s.region === station.region);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Stations", to: "/stations" }, { label: station.name }]} />

      <header className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">
            {uiText(station.region, hi)} · {hi ? "स्थापित" : "Established"} {station.established}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{uiText(station.name, hi)}</h1>
          <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" /> {Math.abs(station.lat).toFixed(2)}°
            {station.lat < 0 ? "S" : "N"}, {Math.abs(station.lon).toFixed(2)}°
            {station.lon < 0 ? "W" : "E"}
          </p>
          <p className="mt-4 text-muted-foreground">{uiText(station.description, hi)}</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { k: visits.length, v: hi ? "अभियान" : "expeditions" },
              {
                k: related.filter((i) => i.type === "report").length,
                v: hi ? "रिपोर्टें" : "reports",
              },
              {
                k: related.filter((i) => i.type === "dataset").length,
                v: hi ? "डेटासेट" : "datasets",
              },
            ].map((s) => (
              <div key={s.v} className="rounded-md border border-border bg-ice p-3 text-center">
                <p className="font-display text-xl font-bold">{s.k}</p>
                <p className="text-xs text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <img
          src={station.image ?? IMAGES.station}
          alt={
            hi ? `${uiText(station.name, hi)} अनुसंधान स्टेशन` : `${station.name} research station`
          }
          loading="lazy"
          width={1280}
          height={864}
          className="aspect-[16/10] w-full rounded-lg object-cover shadow-polar"
        />
      </header>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-xl font-bold">{hi ? "स्थान" : "Location"}</h2>
          <PolarMap
            hemisphere={station.lat < 0 ? "south" : "north"}
            className="mt-4 aspect-square w-full"
            selectedId={station.id}
            markers={stations
              .filter((s) => (station.lat < 0 ? s.lat < 0 : s.lat > 0))
              .map((s) => ({
                id: s.id,
                label: s.name,
                lat: s.lat,
                lon: s.lon,
                kind: "station" as const,
              }))}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">
            {hi ? "यहाँ आए अभियान" : "Expeditions that visited"}
          </h2>
          <div className="mt-4 space-y-3">
            {visits.length > 0 ? (
              visits.map((e) => (
                <Link
                  key={e.id}
                  to="/expeditions/$id"
                  params={{ id: e.id }}
                  className="card-polar block p-4"
                >
                  <p className="eyebrow">{e.number}</p>
                  <p className="mt-1 font-display font-semibold">{uiText(e.name, hi)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hi ? "नेतृत्व:" : "Led by"} {e.leader}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {hi ? "अभी कोई अभियान दर्ज नहीं है।" : "No expeditions recorded yet."}
              </p>
            )}
          </div>

          {nearby.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-bold">
                {hi ? "संबंधित स्टेशन" : "Related stations"}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {nearby.map((s) => (
                  <Link
                    key={s.id}
                    to="/stations/$id"
                    params={{ id: s.id }}
                    className="chip hover:border-primary/50"
                  >
                    {uiText(s.name, hi)}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">
          {hi
            ? `${uiText(station.name, hi)} की सामग्री`
            : `Material from ${uiText(station.name, hi)}`}
        </h2>
        {related.length > 0 ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {related.map((i) => (
              <ItemCard key={i.id} item={i} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {hi ? "अभी कोई सामग्री जुड़ी नहीं है।" : "No linked material yet."}
          </p>
        )}
      </section>
    </div>
  );
}
