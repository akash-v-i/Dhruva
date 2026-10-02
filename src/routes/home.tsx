import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Scale,
  Clock,
  Compass,
  Network,
  PenSquare,
  Upload,
  BarChart3,
  MessageSquareQuote,
} from "lucide-react";
import {
  CONTENT_TYPES,
  IMAGES,
  POLAR_FACTS,
  LEARN_TOPICS,
  ASK_EXAMPLES,
  expeditions,
  items,
  stations,
  formatDate,
  itemsByType,
  typeLabel,
} from "@/data/dhruva";
import { ItemCard, typeIcon } from "@/components/site/ItemCard";
import { PolarMap } from "@/components/site/PolarMap";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Dhruva — Polar Knowledge and Outreach Portal" },
      {
        name: "description",
        content:
          "Search polar expeditions, research stations, reports, publications, datasets, photos and videos in one reviewed, citable archive.",
      },
      { property: "og:title", content: "Dhruva — Polar Knowledge and Outreach Portal" },
      {
        property: "og:description",
        content:
          "Search polar expeditions, research stations, reports, publications, datasets, photos and videos in one reviewed, citable archive.",
      },
    ],
  }),
  component: Home,
});

const TABS = [
  { id: "report", label: "Latest reports" },
  { id: "publication", label: "New publications" },
  { id: "dataset", label: "Featured datasets" },
  { id: "photo", label: "Recent media" },
] as const;

function Home() {
  const hi = useHindi();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("report");
  const navigate = useNavigate();
  const featured = expeditions[0]!;
  // Chosen after hydration: the server (UTC) and the visitor's clock can be on different days.
  const [factIndex, setFactIndex] = useState(0);
  useEffect(() => setFactIndex(new Date().getDate() % POLAR_FACTS.length), []);
  const fact = POLAR_FACTS[factIndex];

  const tabItems = itemsByType(tab)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={IMAGES.hero}
          alt="Ice shelf edge meeting dark polar water"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">
              {hi ? "ध्रुवीय ज्ञान और जनसंपर्क पोर्टल" : "Polar knowledge and outreach portal"}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              {hi
                ? "ध्रुवीय अभियान, विज्ञान, डेटा और कहानियाँ खोजें।"
                : "Discover polar expeditions, science, datasets and stories."}
            </h1>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              {hi
                ? "स्टेशनों, यात्राओं, रिपोर्टों, प्रकाशनों और मीडिया का विश्वसनीय संग्रह — संपादकीय समीक्षा और स्रोतों के साथ।"
                : "One trusted archive connecting stations, voyages, reports, publications and media — reviewed by editors, cited to its sources and open where licensing allows."}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/explore", search: { q: q || undefined } });
              }}
              className="mt-8 flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label={hi ? "ध्रुव में खोजें" : "Search Dhruva"}
                  placeholder={
                    hi
                      ? "रिपोर्ट, स्टेशन, अभियान और डेटा खोजें..."
                      : "Search reports, stations, expeditions, datasets and more..."
                  }
                  className="w-full rounded-md border border-input bg-card py-3.5 pl-12 pr-4 text-sm shadow-polar outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <button type="submit" className="btn-base btn-primary py-3.5">
                {hi ? "खोजें" : "Search"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/explore" className="btn-base btn-primary">
                {hi ? "संग्रह खोजें" : "Explore archive"} <ArrowRight className="size-4" />
              </Link>
              <Link to="/ask" className="btn-base btn-outline">
                <Sparkles className="size-4" /> {hi ? "ध्रुव से पूछें" : "Ask Polar"}
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-4 sm:flex sm:flex-wrap">
              {[
                { k: items.length, v: hi ? "संग्रह सामग्री" : "archive items" },
                { k: expeditions.length, v: hi ? "अभियान" : "expeditions" },
                { k: stations.length, v: hi ? "स्टेशन" : "stations" },
                { k: 4, v: hi ? "ध्रुवीय क्षेत्र" : "polar regions" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-bold">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-b border-border bg-navy text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
              {hi ? "ध्रुव को क्या अलग बनाता है" : "What makes Dhruva different"}
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              {hi
                ? "संग्रह से भरोसेमंद जनसंपर्क तक, एक ही मंच पर"
                : "From archive to trusted outreach, in one platform"}
            </h2>
            <p className="mt-3 opacity-80">
              {hi
                ? "एक बार अपलोड करें — ध्रुव उसे समझता है, जोड़ता है, खोजने योग्य बनाता है और तथ्य-जाँचे पोस्ट तैयार करता है।"
                : "Upload once — Dhruva understands it, links it, makes it searchable and drafts fact-checked posts for every channel."}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((d) => (
              <Link
                key={d.to}
                // One tile points at a concrete expedition path, so the route type is widened here.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...({ to: d.to } as any)}
                className="group rounded-lg border border-background/15 bg-background/5 p-5 transition-colors hover:border-background/40 hover:bg-background/10"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-background/15">
                  <d.icon className="size-5" />
                </span>
                <p className="mt-4 font-display text-lg font-semibold">{hi ? d.hi : d.en}</p>
                <p className="mt-1 text-sm opacity-75">{hi ? d.hiText : d.text}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold opacity-90 group-hover:gap-2 transition-all">
                  {hi ? "आज़माएँ" : "Try it"} <ArrowRight className="size-4" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content-type explorer */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead
          eyebrow="Explore by type"
          title="Six content types, one consistent record"
          desc="Every item carries its licence, access status, region and links to the expedition or station it came from."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TYPES.map((c) => {
            const Icon = typeIcon[c.id];
            const count = itemsByType(c.id).length;
            return (
              <Link
                key={c.id}
                to="/explore"
                search={{ type: c.id }}
                className="card-polar group flex items-start gap-4 p-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-ice text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-display font-semibold">
                    {uiText(c.plural, hi)}
                    <span className="chip">{count}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {uiText(c.description, hi)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured expedition */}
      <section className="border-y border-border bg-ice">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">{uiText("Featured expedition", hi)}</p>
            <h2 className="mt-2 text-3xl font-bold">{uiText(featured.name, hi)}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {featured.number} · {uiText(featured.region, hi)} · {formatDate(featured.start)} —{" "}
              {formatDate(featured.end)} · {hi ? "नेतृत्व" : "Led by"} {featured.leader}
            </p>
            <p className="mt-4 text-base text-muted-foreground">{uiText(featured.summary, hi)}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {featured.stationIds.map((s) => (
                <Link
                  key={s}
                  to="/stations/$id"
                  params={{ id: s }}
                  className="chip bg-card hover:text-primary"
                >
                  {uiText(stations.find((st) => st.id === s)?.name ?? "", hi)}
                </Link>
              ))}
            </div>
            <Link
              to="/expeditions/$id"
              params={{ id: featured.id }}
              className="btn-base btn-primary mt-6"
            >
              {hi ? "अभियान देखें" : "Explore expedition"} <ArrowRight className="size-4" />
            </Link>
          </div>
          <img
            src={featured.image ?? IMAGES.vessel}
            alt="Polar research vessel in pack ice"
            loading="lazy"
            width={1280}
            height={864}
            className="aspect-[4/3] w-full rounded-lg object-cover shadow-polar-lg"
          />
        </div>
      </section>

      {/* Map preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <PolarMap
            hemisphere="south"
            className="aspect-square w-full"
            markers={stations
              .filter((s) => s.lat < 0)
              .map((s) => ({ id: s.id, label: s.name, lat: s.lat, lon: s.lon, kind: "station" }))}
            routes={expeditions
              .filter((e) => e.region !== "Arctic")
              .map((e) => ({ id: e.id, label: e.number, points: e.route }))}
          />
          <div>
            <p className="eyebrow">{uiText("Polar map", hi)}</p>
            <h2 className="mt-2 text-3xl font-bold">
              {hi ? "जानें विज्ञान कहाँ होता है" : "See where the science happens"}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {hi
                ? "अंटार्कटिक और आर्कटिक दृश्यों पर स्टेशन, अभियान मार्ग, डेटासेट और मीडिया स्थान। हर चिह्न पूरे रिकॉर्ड से जुड़ा है, और मानचित्र का पाठ-रूप भी उपलब्ध है।"
                : "Stations, expedition routes, dataset coverage and media locations plotted on Antarctic and Arctic views. Every marker links to the full record, and a text list is available for anyone who cannot use the map."}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>
                ·{" "}
                {hi
                  ? "अंटार्कटिक और आर्कटिक दृश्य के बीच बदलें"
                  : "Switch between Antarctic and Arctic views"}
              </li>
              <li>
                ·{" "}
                {hi
                  ? "स्टेशन, मार्ग, डेटासेट, मीडिया और गतिविधियाँ दिखाएँ या छिपाएँ"
                  : "Toggle stations, routes, datasets, media and activities"}
              </li>
              <li>
                ·{" "}
                {hi
                  ? "संबंधित सामग्री की संख्या के साथ विवरण देखें"
                  : "Open a detail panel with related content counts"}
              </li>
            </ul>
            <Link to="/map" className="btn-base btn-outline mt-6">
              {hi ? "पूरा मानचित्र देखें" : "Explore full map"} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured knowledge */}
      <section className="border-y border-border bg-ice">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead eyebrow="Featured knowledge" title="Recently added to the archive" />
          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`btn-base py-2 text-xs ${tab === t.id ? "btn-primary" : "btn-outline"}`}
              >
                {uiText(t.label, hi)}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {tabItems.map((i) => (
              <ItemCard key={i.id} item={i} />
            ))}
          </div>
          <Link to="/explore" search={{ type: tab }} className="btn-base btn-outline mt-6">
            {hi
              ? `सभी ${uiText(typeLabel(tab), true)} देखें`
              : `View all ${typeLabel(tab).toLowerCase()}s`}{" "}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Learn */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead
          eyebrow="Learn"
          title="Polar science, explained simply"
          desc="Short explainers, quizzes and facts for students and curious readers."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LEARN_TOPICS.map((t) => (
            <Link key={t.id} to="/learn" className="card-polar p-5">
              <p className="font-display font-semibold">{uiText(t.title, hi)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{uiText(t.blurb, hi)}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-ice p-6">
            <p className="eyebrow">{uiText("Polar fact", hi)}</p>
            <p className="mt-2 text-lg">{uiText(fact ?? "", hi)}</p>
          </div>
          <div className="rounded-lg border border-border bg-ice p-6">
            <p className="eyebrow">{uiText("This day in polar history", hi)}</p>
            <p className="mt-2 text-lg">
              {hi
                ? "1983 में भारत के पहले अंटार्कटिक स्टेशन, दक्षिण गंगोत्री, का निर्माण क्वीन मॉड लैंड के हिम शेल्फ पर शुरू हुआ।"
                : "In 1983 the first Indian Antarctic station, Dakshin Gangotri, began construction on the ice shelf of Queen Maud Land."}
            </p>
          </div>
        </div>
      </section>

      {/* Ask Polar */}
      <section className="border-y border-border bg-navy text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
                {hi ? "ध्रुव से पूछें" : "Ask Polar"}
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {uiText("Ask a question, get a cited answer", hi)}
              </h2>
              <p className="mt-4 opacity-80">
                {hi
                  ? "ध्रुव से पूछें केवल ध्रुव संग्रह की समीक्षित सामग्री से जवाब देता है। हर जवाब में उसके स्रोत दिए जाते हैं, ताकि आप स्वयं जाँच सकें।"
                  : "Ask Polar answers only from reviewed material in the Dhruva archive. Every answer lists the reports, publications and datasets it drew from, so you can check the source yourself."}
              </p>
              <Link to="/ask" className="btn-base mt-6 bg-background text-navy hover:opacity-90">
                {hi ? "ध्रुव से पूछें" : "Try Ask Polar"} <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {ASK_EXAMPLES.map((e) => (
                <Link
                  key={e}
                  to="/ask"
                  search={{ q: e }}
                  className="block rounded-md border border-background/20 bg-background/10 px-4 py-3 text-sm transition-colors hover:bg-background/20"
                >
                  {uiText(e, hi)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead eyebrow="Trust and governance" title="How content reaches the public" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FileCheck2,
              t: "Human review",
              d: "Every record is checked by an editor before it is published.",
            },
            {
              icon: ShieldCheck,
              t: "Cited sources",
              d: "Summaries and answers link back to the material they came from.",
            },
            {
              icon: Scale,
              t: "Clear licensing",
              d: "Each item displays its licence and reuse conditions.",
            },
            {
              icon: Clock,
              t: "Embargo respected",
              d: "Restricted files stay closed until their release date.",
            },
          ].map((c) => (
            <div key={uiText(c.t, hi)} className="card-polar p-5">
              <c.icon className="size-5 text-primary" />
              <p className="mt-3 font-display font-semibold">{uiText(c.t, hi)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{uiText(c.d, hi)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const DIFFERENTIATORS = [
  {
    to: "/studio",
    icon: PenSquare,
    en: "Fact-grounded content",
    hi: "तथ्य-जाँची सामग्री",
    text: "One record becomes posts for every channel. Any sentence not backed by the source is flagged and blocks approval.",
    hiText:
      "एक रिकॉर्ड से हर चैनल की पोस्ट। स्रोत से असमर्थित वाक्य चिह्नित होकर स्वीकृति रोकता है।",
  },
  {
    to: "/ask",
    icon: MessageSquareQuote,
    en: "Ask Polar, with citations",
    hi: "स्रोत सहित ध्रुव से पूछें",
    text: "Plain-language answers built only from the archive, each sentence cited — and an honest “not found” when the archive has no answer.",
    hiText:
      "केवल संग्रह से जवाब, हर वाक्य के स्रोत के साथ — और जवाब न होने पर ईमानदार “नहीं मिला”।",
  },
  {
    to: "/contribute",
    icon: Upload,
    en: "Upload once, AI does the rest",
    hi: "एक बार अपलोड, बाकी AI",
    text: "Text extraction, metadata, tags, duplicate detection and three audience summaries — then an editor approves.",
    hiText: "पाठ, मेटाडेटा, टैग, प्रतिलिपि पहचान और तीन सारांश — फिर संपादक स्वीकृत करते हैं।",
  },
  {
    to: "/graph",
    icon: Network,
    en: "Polar knowledge graph",
    hi: "ध्रुवीय ज्ञान ग्राफ़",
    text: "Stations, expeditions, scientists and every record linked, so nothing is lost when people move on.",
    hiText: "स्टेशन, अभियान, वैज्ञानिक और हर रिकॉर्ड जुड़े हुए — संस्थागत स्मृति सुरक्षित।",
  },
  {
    to: "/journey/isea-42",
    icon: Compass,
    en: "Virtual expeditions",
    hi: "आभासी अभियान",
    text: "Relive a voyage day by day on the polar map, with the reports, data and photos from each stage.",
    hiText: "मानचित्र पर यात्रा को दिन-प्रतिदिन देखें, हर पड़ाव की रिपोर्ट, डेटा और फ़ोटो के साथ।",
  },
  {
    to: "/insights",
    icon: BarChart3,
    en: "Content-gap intelligence",
    hi: "सामग्री-अंतर विश्लेषण",
    text: "Questions the archive cannot answer become next week’s outreach plan.",
    hiText: "जिन सवालों का जवाब संग्रह में नहीं, वे अगले सप्ताह की जनसंपर्क योजना बनते हैं।",
  },
] as const;

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  const hi = useHindi();
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{uiText(eyebrow, hi)}</p>
      <h2 className="mt-2 text-3xl font-bold">{uiText(title, hi)}</h2>
      {desc && <p className="mt-3 text-muted-foreground">{uiText(desc, hi)}</p>}
    </div>
  );
}
