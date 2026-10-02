import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarRange, User } from "lucide-react";
import { IMAGES, expeditions, formatDate, itemsByExpedition, stations } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/expeditions/")({
  head: () => ({
    meta: [
      { title: "Expeditions — Dhruva" },
      {
        name: "description",
        content:
          "Antarctic, Arctic and Southern Ocean expeditions with routes, timelines, stations visited and all the material they produced.",
      },
      { property: "og:title", content: "Expeditions — Dhruva" },
      {
        property: "og:description",
        content:
          "Polar expeditions with routes, timelines and every report, dataset and image they produced.",
      },
    ],
  }),
  component: ExpeditionsIndex,
});

function ExpeditionsIndex() {
  const hi = useHindi();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Expeditions" }]} />
      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold">{hi ? "अभियान" : "Expeditions"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "हर अभियान के पृष्ठ पर उसका मार्ग, समयरेखा, दौरा किए गए स्टेशन और उससे जुड़ी रिपोर्ट, प्रकाशन, डेटा व मीडिया एक साथ मिलते हैं।"
            : "Each expedition page gathers the route, the timeline, the stations visited and every report, publication, dataset and media item produced during the campaign."}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {expeditions.map((e) => {
          const count = itemsByExpedition(e.id).length;
          return (
            <article key={e.id} className="card-polar overflow-hidden">
              <img
                src={e.image ?? IMAGES.hero}
                alt=""
                loading="lazy"
                width={1280}
                height={864}
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow">{e.number}</span>
                  <span className="chip">{uiText(e.region, hi)}</span>
                  <span className="chip">
                    {count} {hi ? "सामग्रियाँ" : "items"}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-lg font-semibold">
                  <Link to="/expeditions/$id" params={{ id: e.id }} className="hover:text-primary">
                    {uiText(e.name, hi)}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {uiText(e.summary, hi)}
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarRange className="size-3.5" /> {formatDate(e.start)} —{" "}
                    {formatDate(e.end)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" /> {e.leader}
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {hi ? "स्टेशन:" : "Stations:"}{" "}
                  {e.stationIds.map((s) => stations.find((x) => x.id === s)?.name).join(", ") ||
                    (hi ? "कोई नहीं" : "None")}
                </p>
                <Link
                  to="/expeditions/$id"
                  params={{ id: e.id }}
                  className="btn-base btn-outline mt-4 py-1.5 text-xs"
                >
                  {hi ? "अभियान देखें" : "View expedition"} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
