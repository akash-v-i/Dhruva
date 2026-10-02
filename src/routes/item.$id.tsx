import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  Quote,
  Share2,
  MapPin,
  Sparkles,
  Lock,
  Clock,
  Play,
  PenSquare,
} from "lucide-react";
import { copyText, downloadText, recordFileStub, shareOrCopy } from "@/lib/actions";
import { getEnrichment, type Audience } from "@/data/enrichment";
import { formatDate, getExpedition, getItem, getStation, items, typeLabel } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { AccessBadge } from "@/components/site/AccessBadge";
import { ItemCard, typeIcon } from "@/components/site/ItemCard";

export const Route = createFileRoute("/item/$id")({
  loader: ({ params }) => {
    const item = getItem(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Item not found — Dhruva" }, { name: "robots", content: "noindex" }],
      };
    }
    const { item } = loaderData;
    const title = `${item.title} — Dhruva`;
    return {
      meta: [
        { title },
        { name: "description", content: item.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: item.summary },
      ],
    };
  },
  notFoundComponent: ItemNotFound,
  component: ItemDetail,
});

function ItemNotFound() {
  const hi = useHindi();
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">
        {hi ? "यह रिकॉर्ड उपलब्ध नहीं है" : "This record is not available"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {hi
          ? "यह सामग्री हटाई गई हो सकती है या लिंक गलत है।"
          : "The item may have been withdrawn or the link may be incorrect."}
      </p>
      <Link to="/explore" className="btn-base btn-primary mt-6">
        {hi ? "संग्रह पर लौटें" : "Back to the archive"}
      </Link>
    </div>
  );
}

function ItemDetail() {
  const hi = useHindi();
  const { item } = Route.useLoaderData();
  const Icon = typeIcon[item.type];
  const expedition = getExpedition(item.expeditionId);
  const station = getStation(item.stationId);
  const related = items
    .filter(
      (i) =>
        i.id !== item.id && (i.tags.some((t) => item.tags.includes(t)) || i.region === item.region),
    )
    .slice(0, 3);

  const citation = `${item.authors.join(", ")} (${item.year}). ${uiText(item.title, hi)}. Dhruva Polar Knowledge Portal.${item.meta?.["DOI"] ? ` https://doi.org/${item.meta["DOI"]}` : ""}`;
  const summaries = getEnrichment(item).summaries;
  const [audience, setAudience] = useState<Audience>("public");
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  const flash = (text: string, ok = true) => {
    const next = { text, ok };
    setNotice(next);
    window.setTimeout(() => setNotice((m) => (m === next ? null : m)), 2500);
  };
  const doi = item.meta?.["DOI"];
  const citeKey = `${(item.authors[0] ?? "dhruva")
    .split(" ")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z]/g, "")}${item.year}`;
  const bibtex = [
    `@misc{${citeKey},`,
    `  author = {${item.authors.join(" and ")}},`,
    `  title = {${item.title}},`,
    `  year = {${item.year}},`,
    `  publisher = {Dhruva Polar Knowledge Portal},`,
    ...(doi ? [`  doi = {${doi}},`] : []),
    `  note = {Licence: ${item.licence}}`,
    "}",
    "",
  ].join("\n");
  const ris = [
    `TY  - ${item.type === "dataset" ? "DATA" : item.type === "publication" ? "JOUR" : "RPRT"}`,
    ...item.authors.map((a) => `AU  - ${a}`),
    `TI  - ${item.title}`,
    `PY  - ${item.year}`,
    "PB  - Dhruva Polar Knowledge Portal",
    ...(doi ? [`DO  - ${doi}`] : []),
    `N1  - Licence: ${item.licence}`,
    "ER  - ",
    "",
  ].join("\n");

  const onDownload = () => {
    downloadText(
      `${item.id}.txt`,
      recordFileStub(
        item.title,
        `${item.summary}\n\n${item.body}\n\nCite as: ${citation}\nLicence: ${item.licence}`,
      ),
    );
    flash(hi ? "डेमो फ़ाइल डाउनलोड हो गई" : "Demonstration file downloaded");
  };
  const onCopyCitation = async () => {
    try {
      await copyText(citation);
      flash(hi ? "उद्धरण कॉपी हो गया" : "Citation copied");
    } catch {
      flash(hi ? "ब्राउज़र ने कॉपी रोक दी" : "Your browser blocked copying", false);
    }
  };
  const onShare = async () => {
    try {
      const how = await shareOrCopy(item.title, window.location.href);
      flash(
        how === "shared"
          ? hi
            ? "साझा किया गया"
            : "Shared"
          : hi
            ? "लिंक कॉपी हो गया"
            : "Link copied",
      );
    } catch {
      flash(hi ? "ब्राउज़र ने कॉपी रोक दी" : "Your browser blocked copying", false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Explore", to: "/explore" },
          { label: typeLabel(item.type) + "s", to: "/explore" },
          { label: item.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">{uiText(typeLabel(item.type), hi)}</span>
            <AccessBadge access={item.access} until={item.embargoUntil} />
            <span className="chip">{item.language}</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            {uiText(item.title, hi)}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {item.authors.join(" · ")} — {formatDate(item.date)}
          </p>

          <div className="mt-6 overflow-hidden rounded-lg border border-border bg-ice">
            {item.image ? (
              <div className="relative">
                <img
                  src={item.image}
                  alt={uiText(item.title, hi)}
                  loading="lazy"
                  width={1280}
                  height={864}
                  className="aspect-[16/9] w-full object-cover"
                />
                {item.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-background/90 text-primary shadow-polar-lg">
                      <Play className="size-7" />
                    </span>
                  </span>
                )}
              </div>
            ) : (
              <div className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <Icon className="size-10 text-primary" />
                <p className="text-sm">
                  {item.type === "dataset"
                    ? hi
                      ? "डेटासेट पूर्वावलोकन"
                      : "Dataset preview"
                    : hi
                      ? "दस्तावेज़ पूर्वावलोकन"
                      : "Document preview"}{" "}
                  · {item.meta?.["Format"] ?? "PDF"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {item.access === "public" ? (
              <button type="button" onClick={onDownload} className="btn-base btn-primary">
                <Download className="size-4" />
                {item.type === "dataset"
                  ? hi
                    ? "डेटासेट डाउनलोड करें"
                    : "Download dataset"
                  : item.type === "video"
                    ? hi
                      ? "वीडियो देखें"
                      : "Watch video"
                    : hi
                      ? "डाउनलोड"
                      : "Download"}
              </button>
            ) : item.access === "internal" ? (
              <span className="btn-base btn-outline cursor-default">
                <Lock className="size-4" />{" "}
                {hi ? "कर्मचारी खाते से साइन इन करें" : "Sign in with a staff account"}
              </span>
            ) : (
              <span className="btn-base btn-outline cursor-default">
                <Clock className="size-4" /> {hi ? "फ़ाइल उपलब्ध होगी" : "File access begins"}{" "}
                {formatDate(item.embargoUntil!)}
              </span>
            )}
            <button type="button" onClick={onCopyCitation} className="btn-base btn-outline">
              <Quote className="size-4" /> {hi ? "उद्धरण कॉपी करें" : "Copy citation"}
            </button>
            <button type="button" onClick={onShare} className="btn-base btn-outline">
              <Share2 className="size-4" /> {hi ? "साझा करें" : "Share"}
            </button>
            {item.access === "public" && (
              <Link to="/studio" search={{ item: item.id }} className="btn-base btn-outline">
                <PenSquare className="size-4" /> {hi ? "जनसंपर्क किट बनाएँ" : "Create outreach kit"}
              </Link>
            )}
            <Link to="/ask" search={{ q: item.title }} className="btn-base btn-ghost">
              <Sparkles className="size-4" />{" "}
              {hi ? "इस पर ध्रुव से पूछें" : "Ask Polar about this item"}
            </Link>
          </div>
          <p
            role="status"
            aria-live="polite"
            className={`mt-2 min-h-5 text-sm ${notice?.ok === false ? "text-destructive" : "text-aurora"}`}
          >
            {notice && (
              <span className="inline-flex items-center gap-1.5">
                {notice.ok ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}{" "}
                {notice.text}
              </span>
            )}
          </p>

          {item.access !== "public" && (
            <div className="mt-4 rounded-md border border-embargo/40 bg-embargo/10 p-4 text-sm">
              {item.access === "internal"
                ? hi
                  ? "आंतरिक सामग्री। मेटाडेटा सार्वजनिक है; फ़ाइल केवल अधिकृत कर्मचारियों के लिए है।"
                  : "Internal content. Metadata is public; the file is restricted to authorised staff accounts."
                : hi
                  ? `मेटाडेटा उपलब्ध है। फ़ाइल ${formatDate(item.embargoUntil!)} से उपलब्ध होगी।`
                  : `Metadata available. File access begins on ${formatDate(item.embargoUntil!)}.`}
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-bold">{hi ? "सारांश" : "Summary"}</h2>
            <p className="mt-3 text-muted-foreground">{uiText(item.summary, hi)}</p>
            <p className="mt-3 text-muted-foreground">{uiText(item.body, hi)}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold">
              {hi ? "हर पाठक के लिए सारांश" : "Summary for every reader"}
            </h2>
            <div className="mt-3 inline-flex rounded-md border border-border p-1" role="tablist">
              {(["scientist", "student", "public"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  role="tab"
                  aria-selected={audience === a}
                  onClick={() => setAudience(a)}
                  className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${audience === a ? "bg-primary text-primary-foreground" : "hover:bg-ice"}`}
                >
                  {a === "scientist"
                    ? hi
                      ? "वैज्ञानिक"
                      : "Scientist"
                    : a === "student"
                      ? hi
                        ? "विद्यार्थी"
                        : "Student"
                      : hi
                        ? "जनता"
                        : "Public"}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-md border border-border bg-ice p-4 text-sm leading-relaxed">
              {summaries?.[audience] ?? item.summary}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold">{hi ? "उद्धरण" : "Citation"}</h2>
            <p className="mt-3 rounded-md border border-border bg-muted p-4 font-mono text-xs leading-relaxed [overflow-wrap:anywhere]">
              {citation}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  downloadText(`${citeKey}.bib`, bibtex, "application/x-bibtex;charset=utf-8");
                  flash(hi ? "BibTeX फ़ाइल डाउनलोड हो गई" : "BibTeX file downloaded");
                }}
                className="btn-base btn-outline py-1.5 text-xs"
              >
                {hi ? "BibTeX निर्यात" : "Export BibTeX"}
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadText(
                    `${citeKey}.ris`,
                    ris,
                    "application/x-research-info-systems;charset=utf-8",
                  );
                  flash(hi ? "RIS फ़ाइल डाउनलोड हो गई" : "RIS file downloaded");
                }}
                className="btn-base btn-outline py-1.5 text-xs"
              >
                {hi ? "RIS निर्यात" : "Export RIS"}
              </button>
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold">{hi ? "संबंधित सामग्री" : "Related items"}</h2>
              <div className="mt-4 space-y-4">
                {related.map((r) => (
                  <ItemCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-6">
          <div className="rounded-lg border border-border bg-ice p-5">
            <p className="eyebrow">{hi ? "रिकॉर्ड विवरण" : "Record details"}</p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row k="Region" v={item.region} />
              <Row k="Date" v={formatDate(item.date)} />
              <Row k="Licence" v={item.licence} />
              <Row k="Language" v={item.language} />
              {Object.entries(item.meta ?? {}).map(([k, v]) => (
                <Row key={k} k={k} v={v} />
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-border p-5">
            <p className="eyebrow">{hi ? "संबंधित रिकॉर्ड" : "Relationships"}</p>
            <div className="mt-3 space-y-2 text-sm">
              {expedition && (
                <Link
                  to="/expeditions/$id"
                  params={{ id: expedition.id }}
                  className="block rounded-md px-2 py-1.5 hover:bg-ice hover:text-primary"
                >
                  {expedition.number} — {uiText(expedition.name, hi)}
                </Link>
              )}
              {station && (
                <Link
                  to="/stations/$id"
                  params={{ id: station.id }}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-ice hover:text-primary"
                >
                  <MapPin className="size-3.5" /> {uiText(station.name, hi)}{" "}
                  {hi ? "स्टेशन" : "station"}
                </Link>
              )}
              <Link
                to="/map"
                className="block rounded-md px-2 py-1.5 hover:bg-ice hover:text-primary"
              >
                {hi ? "ध्रुवीय मानचित्र पर देखें" : "Open on the polar map"}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border p-5">
            <p className="eyebrow">{hi ? "विषय" : "Tags"}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Link
                  key={t}
                  to="/explore"
                  search={{ tag: t }}
                  className="chip hover:border-primary/50"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const hi = useHindi();
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <dt className="text-muted-foreground">{uiText(k, hi)}</dt>
      <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{uiText(v, hi)}</dd>
    </div>
  );
}
