import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Video, Captions, Tags } from "lucide-react";
import { items, IMAGES, typeLabel, formatDate } from "@/data/dhruva";
import { getEnrichment } from "@/data/enrichment";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media library — Dhruva" },
      {
        name: "description",
        content:
          "Auto-tagged photographs and videos with captions, transcripts and credits from the polar archive.",
      },
    ],
  }),
  component: MediaLibrary,
});

function MediaLibrary() {
  const hi = useHindi();
  const media = items.filter((i) => i.type === "photo" || i.type === "video");
  const allTags = Array.from(
    new Set(media.flatMap((i) => getEnrichment(i).autoTags ?? i.tags)),
  ).sort();
  const [tag, setTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(media[0]?.id ?? null);
  const list = useMemo(
    () =>
      media.filter(
        (i) =>
          !tag ||
          (getEnrichment(i).autoTags ?? i.tags).some((t) => t.toLowerCase() === tag.toLowerCase()),
      ),
    [media, tag],
  );
  const open = list.find((i) => i.id === openId) ?? list[0];
  const enrich = open ? getEnrichment(open) : null;
  const detailRef = useRef<HTMLElement>(null);
  const select = (id: string) => {
    setOpenId(id);
    // Below the lg breakpoint the detail panel sits under the grid; bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Media" }]} />
      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold">{hi ? "मीडिया पुस्तकालय" : "Media library"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "फ़ोटो स्वतः टैग और कैप्शन के साथ; वीडियो में प्रतिलेख और उपशीर्षक। संपादक टैग की पुष्टि करते हैं।"
            : "Photographs carry auto-tags and captions. Videos include transcripts and subtitles. Tags are suggestions until an editor confirms them."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTag(null)}
          className={`chip ${!tag ? "border-primary bg-primary text-primary-foreground" : ""}`}
        >
          {hi ? "सभी" : "All"} · {media.length}
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(tag === t ? null : t)}
            className={`chip ${tag === t ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((i) => {
            const e = getEnrichment(i);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => select(i.id)}
                className={`card-polar overflow-hidden text-left ${open?.id === i.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="relative">
                  <img
                    src={i.image ?? IMAGES.hero}
                    alt={uiText(i.title, hi)}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 chip bg-background/90">
                    {i.type === "video" ? (
                      <Video className="size-3.5" />
                    ) : (
                      <ImageIcon className="size-3.5" />
                    )}
                    {uiText(typeLabel(i.type), hi)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-display font-semibold leading-snug">{uiText(i.title, hi)}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {uiText(i.summary, hi)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(e.autoTags ?? []).slice(0, 4).map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {open && enrich && (
          <aside
            ref={detailRef}
            className="scroll-mt-20 space-y-4 lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-lg border border-border bg-ice p-5">
              <p className="eyebrow">{hi ? "चयनित मीडिया" : "Selected media"}</p>
              <h2 className="mt-2 font-display text-lg font-semibold">{uiText(open.title, hi)}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {open.meta?.["Credit"] ?? open.authors.join(", ")} · {formatDate(open.date)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{uiText(open.body, hi)}</p>
              <Link
                to="/item/$id"
                params={{ id: open.id }}
                className="btn-base btn-primary mt-4 py-2 text-xs"
              >
                {hi ? "पूरा रिकॉर्ड" : "Open full record"}
              </Link>
            </div>
            <div className="rounded-lg border border-border p-5">
              <p className="eyebrow flex items-center gap-2">
                <Tags className="size-3.5" /> {hi ? "स्वतः टैग" : "Auto-tags"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(enrich.autoTags ?? []).map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {hi
                  ? "संपादक प्रकाशन से पहले टैग की पुष्टि करते हैं।"
                  : "Suggested by open vision models. Editors confirm tags before publication."}
              </p>
            </div>
            {enrich.transcript && (
              <div className="rounded-lg border border-border p-5">
                <p className="eyebrow flex items-center gap-2">
                  <Captions className="size-3.5" /> {hi ? "प्रतिलेख" : "Transcript"}
                </p>
                <ol className="mt-3 space-y-2 text-sm">
                  {enrich.transcript.map((line) => (
                    <li key={line.time} className="grid grid-cols-[52px_1fr] gap-2">
                      <span className="font-mono text-xs text-primary">{line.time}</span>
                      <span className="text-muted-foreground">{line.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
