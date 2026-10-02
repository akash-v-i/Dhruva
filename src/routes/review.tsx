import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Clock, FileEdit, Sparkles, Trash2, Upload } from "lucide-react";
import { expeditions, items, stations, typeLabel, formatDate } from "@/data/dhruva";
import {
  readSubmissions,
  removeSubmission,
  saveSubmission,
  type Submission,
} from "@/lib/submissions";
import { getEnrichment } from "@/data/enrichment";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { AccessBadge } from "@/components/site/AccessBadge";
import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";

export const Route = createFileRoute("/review")({
  validateSearch: (search: Record<string, unknown>): { submitted?: number | undefined } => ({
    submitted: search["submitted"] ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Review queue — Dhruva" },
      { name: "description", content: "Editor approval queue for metadata, access and embargo." },
    ],
  }),
  component: ReviewQueue,
});

type Workflow = "published" | "in-review" | "draft" | "on-hold";

const STATUS_LABEL: Record<Workflow, [string, string]> = {
  published: ["Published", "प्रकाशित"],
  "in-review": ["In review", "समीक्षा में"],
  draft: ["Draft", "ड्राफ्ट"],
  "on-hold": ["On hold", "रोका गया"],
};

function ReviewQueue() {
  const hi = useHindi();
  const [status, setStatus] = useState<Record<string, Workflow>>(() =>
    Object.fromEntries(items.map((i) => [i.id, getEnrichment(i).workflow ?? "published"])),
  );

  const { submitted } = Route.useSearch();
  const [uploads, setUploads] = useState<Submission[]>([]);
  const setUploadStatus = (id: string, status: "published" | "on-hold") => {
    setUploads((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        const next = { ...u, status };
        saveSubmission(next);
        return next;
      }),
    );
  };
  useEffect(() => setUploads(readSubmissions()), []);
  const discard = (id: string) => {
    removeSubmission(id);
    setUploads((u) => u.filter((x) => x.id !== id));
  };

  const queue = items.filter((i) => status[i.id] !== "published");
  const publishedNow = items.filter(
    (i) => status[i.id] === "published" && getEnrichment(i).workflow !== "published",
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Review" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">{hi ? "समीक्षा कतार" : "Review queue"}</h1>
          <p className="mt-2 text-muted-foreground">
            {hi
              ? "संपादक मेटाडेटा जाँचते हैं, प्रवेश स्तर तय करते हैं, फिर प्रकाशित करते हैं। यह डेमो स्थानीय स्थिति बदलता है।"
              : "Editors check auto-filled metadata, set access or embargo, then publish. This demonstration updates status in the browser only."}
          </p>
        </div>
        <Link to="/contribute" className="btn-base btn-outline">
          <Upload className="size-4" /> {hi ? "सामग्री जोड़ें" : "Contribute material"}
        </Link>
      </div>

      {submitted && uploads.length > 0 && (
        <p className="mt-6 flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm text-primary">
          <Sparkles className="size-4" />
          {hi
            ? "आपकी सामग्री AI-भरे मेटाडेटा के साथ समीक्षा कतार में पहुँच गई।"
            : "Your upload arrived in the review queue with AI-filled metadata."}
        </p>
      )}

      {uploads.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Upload className="size-4 text-primary" /> {hi ? "नए अपलोड" : "New uploads"}
          </h2>
          <ul className="mt-4 space-y-4">
            {uploads.map((u) => {
              const st = u.status ?? "in-review";
              return (
                <li
                  key={u.id}
                  className={`rounded-lg border bg-card p-5 shadow-polar ${st === "published" ? "border-aurora/50" : "border-primary/40"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow">{uiText(typeLabel(u.type), hi)}</span>
                    <span className="chip border-primary/40 bg-primary/10 text-primary">
                      {hi ? "AI-भरा" : "AI-filled"}
                    </span>
                    <span
                      className={`chip ${st === "published" ? "border-aurora/50 bg-aurora/15" : st === "on-hold" ? "border-embargo/50 bg-embargo/15" : ""}`}
                    >
                      {STATUS_LABEL[st][hi ? 1 : 0]}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold">{u.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[
                      u.authors.join(", "),
                      u.year,
                      u.region,
                      stations.find((s) => s.id === u.stationId)?.name,
                      expeditions.find((e) => e.id === u.expeditionId)?.number,
                      u.licence,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{u.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {u.tags.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {u.fileName} · {hi ? "भेजा गया" : "submitted"} {formatDate(u.submittedAt)}
                  </p>
                  {st === "published" ? (
                    <p className="mt-4 flex items-center gap-2 text-sm text-aurora">
                      <Check className="size-4" />{" "}
                      {hi
                        ? "प्रकाशित (डेमो — इसी ब्राउज़र में)"
                        : "Published (demo — kept in this browser)"}
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadStatus(u.id, "published")}
                        className="btn-base btn-primary py-2 text-xs"
                      >
                        <Check className="size-3.5" />{" "}
                        {hi ? "प्रकाशित करें" : "Approve and publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadStatus(u.id, "on-hold")}
                        className="btn-base btn-outline py-2 text-xs"
                      >
                        <Clock className="size-3.5" /> {hi ? "रोकें" : "Hold"}
                      </button>
                      <button
                        type="button"
                        onClick={() => discard(u.id)}
                        className="btn-base btn-outline py-2 text-xs hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" /> {hi ? "हटाएँ" : "Discard"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {publishedNow.length > 0 && (
        <p className="mt-6 flex flex-wrap items-center gap-2 rounded-md bg-aurora/10 p-3 text-sm">
          <Check className="size-4 text-aurora" />
          {hi
            ? `इस सत्र में ${publishedNow.length} रिकॉर्ड प्रकाशित:`
            : `Published this session: ${publishedNow.length}`}
          {publishedNow.map((i) => (
            <Link
              key={i.id}
              to="/item/$id"
              params={{ id: i.id }}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {uiText(i.title, hi)}
            </Link>
          ))}
        </p>
      )}

      {queue.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border bg-ice p-8 text-center text-sm text-muted-foreground">
          {hi
            ? "कतार खाली है। सभी रिकॉर्ड प्रकाशित हैं।"
            : "Queue is clear. All demonstration records are published."}
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {queue.map((i) => (
            <li key={i.id} className="rounded-lg border border-border bg-card p-5 shadow-polar">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">{uiText(typeLabel(i.type), hi)}</span>
                <AccessBadge access={i.access} until={i.embargoUntil} />
                <span
                  className={`chip ${status[i.id] === "on-hold" ? "border-embargo/50 bg-embargo/15" : ""}`}
                >
                  {STATUS_LABEL[status[i.id] ?? "draft"][hi ? 1 : 0]}
                </span>
              </div>
              <h2 className="mt-2 font-display text-lg font-semibold">
                <Link to="/item/$id" params={{ id: i.id }} className="hover:text-primary">
                  {uiText(i.title, hi)}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {i.authors.join(", ")} · {formatDate(i.date)} · {i.licence}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{uiText(i.summary, hi)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatus((s) => ({ ...s, [i.id]: "published" }))}
                  className="btn-base btn-primary py-2 text-xs"
                >
                  <Check className="size-3.5" /> {hi ? "प्रकाशित करें" : "Approve and publish"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus((s) => ({ ...s, [i.id]: "draft" }))}
                  className="btn-base btn-outline py-2 text-xs"
                >
                  <FileEdit className="size-3.5" /> {hi ? "ड्राफ्ट में रखें" : "Return to draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus((s) => ({ ...s, [i.id]: "on-hold" }))}
                  className="btn-base btn-outline py-2 text-xs"
                >
                  <Clock className="size-3.5" /> {hi ? "रोकें" : "Hold"}
                </button>
                <Link
                  to="/studio"
                  search={{ item: i.id }}
                  className="btn-base btn-ghost py-2 text-xs"
                >
                  {hi ? "स्टूडियो में खोलें" : "Open in Studio"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
