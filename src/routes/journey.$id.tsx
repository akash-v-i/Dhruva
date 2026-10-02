import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  FileText,
  Pause,
  Play,
  PenSquare,
  RotateCcw,
} from "lucide-react";
import { IMAGES, getExpedition, itemsByExpedition, stations, typeLabel } from "@/data/dhruva";
import { PolarMap, type MapMarker } from "@/components/site/PolarMap";
import { rankItems } from "@/lib/search";
import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";

export const Route = createFileRoute("/journey/$id")({
  loader: ({ params }) => {
    const expedition = getExpedition(params.id);
    if (!expedition) throw notFound();
    return { expedition };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Virtual expedition: ${loaderData.expedition.number} — Dhruva` },
          {
            name: "description",
            content: `Travel with ${loaderData.expedition.name}, step by step, on the polar map.`,
          },
        ]
      : [{ title: "Expedition not found — Dhruva" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Expedition not found</h1>
      <Link to="/expeditions" className="btn-base btn-primary mt-6">
        All expeditions
      </Link>
    </div>
  ),
  component: Journey,
});

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Parses timeline dates like "14 Nov 2022" without relying on locale-specific Date parsing. */
function parseDay(label: string) {
  const [d, m, y] = label.split(" ");
  const month = MONTHS.indexOf((m ?? "").slice(0, 3).toLowerCase());
  return Date.UTC(Number(y), Math.max(0, month), Number(d));
}

const STEP_MS = 6000;

function Journey() {
  const hi = useHindi();
  const { expedition } = Route.useLoaderData();
  const steps = expedition.timeline;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = steps.length - 1;
  const done = step > last;

  const hemisphere = expedition.region === "Arctic" ? "north" : "south";
  const records = useMemo(() => itemsByExpedition(expedition.id), [expedition.id]);
  const gallery = useMemo(() => {
    const pool = [expedition.image, ...records.map((r) => r.image)].filter((x): x is string =>
      Boolean(x),
    );
    return pool.length ? [...new Set(pool)] : [IMAGES.hero];
  }, [expedition.image, records]);

  // Where each event happened on the route; events without a position are spread evenly.
  const routeIndex = (i: number) =>
    steps[i]?.at ??
    (steps.length <= 1
      ? expedition.route.length - 1
      : Math.round((i * (expedition.route.length - 1)) / (steps.length - 1)));
  // The drawn track never shrinks, even when the ship heads home.
  const furthest = (i: number) => Math.max(...steps.slice(0, i + 1).map((_, k) => routeIndex(k)));

  const current = steps[Math.min(step, last)]!;
  const point = expedition.route[routeIndex(Math.min(step, last))]!;
  const start = parseDay(steps[0]!.date);
  const day = Math.round((parseDay(current.date) - start) / 86400000) + 1;
  const totalDays = Math.round((parseDay(steps[last]!.date) - start) / 86400000) + 1;
  const linked = rankItems(`${current.title} ${current.detail}`, records)
    .map((r) => r.item)
    .slice(0, 2);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, last + 1)), [last]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(next, STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, step, done, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const visited = expedition.stationIds
    .map((id) => stations.find((s) => s.id === id))
    .filter((s): s is (typeof stations)[number] => Boolean(s));
  const markers: MapMarker[] = [
    ...visited.map((s) => ({
      id: s.id,
      label: s.name,
      lat: s.lat,
      lon: s.lon,
      kind: "station" as const,
    })),
    ...(done
      ? []
      : [
          {
            id: "ship",
            label: current.title,
            lat: point.lat,
            lon: point.lon,
            kind: "ship" as const,
          },
        ]),
  ];
  const travelled = expedition.route.slice(0, done ? expedition.route.length : furthest(step) + 1);

  return (
    <div className="bg-navy text-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/expeditions/$id"
            params={{ id: expedition.id }}
            className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100"
          >
            <ArrowLeft className="size-4" /> {expedition.number}
          </Link>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
            <Compass className="size-4" /> {hi ? "आभासी अभियान" : "Virtual expedition"}
          </p>
        </div>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{uiText(expedition.name, hi)}</h1>
        <p className="mt-2 max-w-3xl opacity-80">{uiText(expedition.summary, hi)}</p>

        {/* Progress */}
        <div
          className="mt-6 flex items-center gap-2"
          role="tablist"
          aria-label={hi ? "पड़ाव" : "Stages"}
        >
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`${s.date}: ${s.title}`}
              onClick={() => setStep(i)}
              className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-background/20"
            >
              <span
                className={`absolute inset-y-0 left-0 rounded-full bg-background transition-[width] ease-linear ${i < step || done ? "w-full" : i === step && playing ? "w-full" : i === step ? "w-1/3" : "w-0"}`}
                style={{ transitionDuration: i === step && playing ? `${STEP_MS}ms` : "300ms" }}
              />
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="min-w-0 rounded-xl bg-background p-2 text-foreground shadow-polar-lg">
            <PolarMap
              hemisphere={hemisphere}
              className="aspect-square w-full"
              routes={[{ id: expedition.id, label: expedition.number, points: travelled }]}
              markers={markers}
              selectedId={expedition.id}
            />
          </div>

          <div className="flex min-w-0 flex-col">
            {!done ? (
              <article
                key={step}
                className="flex flex-1 flex-col overflow-hidden rounded-xl bg-background text-foreground shadow-polar-lg animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <img
                  src={gallery[step % gallery.length]}
                  alt=""
                  className="aspect-[16/8] w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow">
                    {hi ? `दिन ${day} / ${totalDays}` : `Day ${day} of ${totalDays}`} ·{" "}
                    {current.date}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{current.title}</h2>
                  <p className="mt-3 border-l-2 border-primary/40 pl-4 italic text-muted-foreground">
                    “{current.detail}”
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {hi ? "स्थान" : "Position"}: {point.label} · {Math.abs(point.lat).toFixed(1)}°
                    {point.lat < 0 ? "S" : "N"}, {Math.abs(point.lon).toFixed(1)}°
                    {point.lon < 0 ? "W" : "E"}
                  </p>
                  {linked.length > 0 && (
                    <div className="mt-5">
                      <p className="eyebrow">
                        {hi ? "इस पड़ाव से संग्रह में" : "From the archive at this stage"}
                      </p>
                      <ul className="mt-2 space-y-2">
                        {linked.map((r) => (
                          <li key={r.id}>
                            <Link
                              to="/item/$id"
                              params={{ id: r.id }}
                              className="flex items-start gap-2 rounded-md border border-border p-2.5 text-sm hover:border-primary/40 hover:bg-ice"
                            >
                              <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                              <span>
                                <span className="font-medium">{uiText(r.title, hi)}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {uiText(typeLabel(r.type), hi)}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ) : (
              <article className="flex flex-1 flex-col justify-center rounded-xl bg-background p-8 text-foreground shadow-polar-lg animate-in fade-in duration-500">
                <p className="eyebrow">{hi ? "यात्रा पूरी" : "Journey complete"}</p>
                <h2 className="mt-2 text-2xl font-bold">
                  {hi
                    ? `${totalDays} दिन, ${expedition.route.length} पड़ाव`
                    : `${totalDays} days, ${expedition.route.length} waypoints`}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {hi
                    ? `इस अभियान से संग्रह में ${records.length} रिकॉर्ड हैं — रिपोर्ट, डेटा, फ़ोटो और वीडियो।`
                    : `This expedition contributed ${records.length} records to the archive — reports, data, photos and video.`}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    to="/expeditions/$id"
                    params={{ id: expedition.id }}
                    className="btn-base btn-primary"
                  >
                    {hi ? "सभी रिकॉर्ड देखें" : "See all records"} <ArrowRight className="size-4" />
                  </Link>
                  {records[0] && (
                    <Link
                      to="/studio"
                      search={{ item: records[0].id }}
                      className="btn-base btn-outline"
                    >
                      <PenSquare className="size-4" />{" "}
                      {hi ? "इस यात्रा पर पोस्ट बनाएँ" : "Create posts from this voyage"}
                    </Link>
                  )}
                  <button type="button" onClick={() => setStep(0)} className="btn-base btn-ghost">
                    <RotateCcw className="size-4" /> {hi ? "फिर से" : "Replay"}
                  </button>
                </div>
              </article>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="btn-base border border-background/30 text-background hover:bg-background/10 disabled:opacity-40"
              >
                <ArrowLeft className="size-4" />{" "}
                <span className="hidden sm:inline">{hi ? "पिछला" : "Previous"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (done) setStep(0);
                  setPlaying((p) => !p);
                }}
                className="btn-base bg-background text-navy hover:opacity-90"
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                {playing ? (hi ? "रोकें" : "Pause") : hi ? "चलाएँ" : "Play voyage"}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={done}
                className="btn-base border border-background/30 text-background hover:bg-background/10 disabled:opacity-40"
              >
                <span className="hidden sm:inline">{hi ? "अगला" : "Next"}</span>{" "}
                <ArrowRight className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs opacity-60">
              {hi ? "कीबोर्ड: ← → और स्पेस" : "Keyboard: ← → to step, space to play"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
