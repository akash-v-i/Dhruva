import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { IMAGES, formatDate, getExpedition, itemsByExpedition, stations } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ItemCard } from "@/components/site/ItemCard";
import { PolarMap } from "@/components/site/PolarMap";

export const Route = createFileRoute("/expeditions/$id")({
  loader: ({ params }) => {
    const expedition = getExpedition(params.id);
    if (!expedition) throw notFound();
    return { expedition };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Expedition not found — Dhruva" }, { name: "robots", content: "noindex" }],
      };
    }
    const e = loaderData.expedition;
    return {
      meta: [
        { title: `${e.name} — Dhruva` },
        { name: "description", content: e.summary },
        { property: "og:title", content: `${e.name} — Dhruva` },
        { property: "og:description", content: e.summary },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Expedition not found</h1>
      <Link to="/expeditions" className="btn-base btn-primary mt-6">
        All expeditions
      </Link>
    </div>
  ),
  component: ExpeditionDetail,
});

function ExpeditionDetail() {
  const hi = useHindi();
  const { expedition } = Route.useLoaderData();
  const related = itemsByExpedition(expedition.id);
  const visited = expedition.stationIds
    .map((id) => stations.find((s) => s.id === id))
    .filter(Boolean) as (typeof stations)[number][];
  const hemisphere = expedition.region === "Arctic" ? "north" : "south";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[{ label: "Expeditions", to: "/expeditions" }, { label: expedition.number }]}
      />

      <header className="mt-6 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">{expedition.number}</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{uiText(expedition.name, hi)}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {uiText(expedition.region, hi)} · {formatDate(expedition.start)} —{" "}
            {formatDate(expedition.end)} · {hi ? "नेतृत्व:" : "Led by"} {expedition.leader}
          </p>
          <p className="mt-4 text-muted-foreground">{uiText(expedition.summary, hi)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {visited.map((s) => (
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
          <Link
            to="/journey/$id"
            params={{ id: expedition.id }}
            className="btn-base btn-primary mt-6"
          >
            <Compass className="size-4" />{" "}
            {hi ? "आभासी अभियान शुरू करें" : "Start virtual expedition"}
          </Link>
        </div>
        <img
          src={expedition.image ?? IMAGES.hero}
          alt=""
          loading="lazy"
          width={1280}
          height={864}
          className="aspect-[16/10] w-full rounded-lg object-cover shadow-polar"
        />
      </header>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-xl font-bold">{hi ? "मार्ग" : "Route"}</h2>
          <PolarMap
            hemisphere={hemisphere}
            className="mt-4 aspect-square w-full"
            routes={[{ id: expedition.id, label: expedition.number, points: expedition.route }]}
            markers={visited.map((s) => ({
              id: s.id,
              label: s.name,
              lat: s.lat,
              lon: s.lon,
              kind: "station" as const,
            }))}
            selectedId={expedition.id}
          />
          <div className="mt-4 rounded-lg border border-border bg-ice p-4">
            <p className="eyebrow">
              {hi ? "मार्ग के पड़ाव (पाठ रूप में)" : "Route waypoints (text alternative)"}
            </p>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
              {expedition.route.map((p) => (
                <li key={p.label}>
                  {p.label} — {p.lat.toFixed(2)}°, {p.lon.toFixed(2)}°
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold">{hi ? "समयरेखा" : "Timeline"}</h2>
          <ol className="mt-4 space-y-5 border-l border-border pl-6">
            {expedition.timeline.map((t) => (
              <li key={t.title} className="relative">
                <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.date}</p>
                <p className="mt-1 font-display font-semibold">{t.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">
          {hi ? "इस अभियान की सामग्री" : "Material from this expedition"}
        </h2>
        {related.length > 0 ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {related.map((i) => (
              <ItemCard key={i.id} item={i} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {hi
              ? "अभी इस अभियान से कोई प्रकाशित सामग्री नहीं जुड़ी है।"
              : "No published material is linked to this expedition yet."}
          </p>
        )}
      </section>
    </div>
  );
}
