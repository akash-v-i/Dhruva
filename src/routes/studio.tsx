import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, FileWarning, ShieldCheck, Sparkles } from "lucide-react";
import { items, typeLabel, formatDate } from "@/data/dhruva";
import { APPROVAL_THRESHOLD, LIMITS, buildKit, type Channel } from "@/lib/studio";
import { copyText } from "@/lib/actions";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SocialCard } from "@/components/site/SocialCard";
import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";

const CHANNELS: { id: Channel; label: string; hi: string }[] = [
  { id: "x", label: "X post", hi: "X पोस्ट" },
  { id: "instagram", label: "Instagram", hi: "इंस्टाग्राम" },
  { id: "linkedin", label: "LinkedIn", hi: "लिंक्डइन" },
  { id: "press", label: "Press note", hi: "प्रेस नोट" },
  { id: "news", label: "Website news", hi: "वेब समाचार" },
  { id: "newsletter", label: "Newsletter", hi: "न्यूज़लेटर" },
  { id: "quiz", label: "School quiz", hi: "विद्यालय प्रश्नोत्तरी" },
  { id: "card", label: "Social image card", hi: "सोशल इमेज कार्ड" },
];

export const Route = createFileRoute("/studio")({
  validateSearch: (search: Record<string, unknown>): { item?: string | undefined } => ({
    item: typeof search["item"] === "string" && search["item"] ? search["item"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Content Studio — Dhruva" },
      {
        name: "description",
        content:
          "Generate multi-channel outreach kits from one archive record, with a fact-grounding check before approval.",
      },
    ],
  }),
  component: Studio,
});

function Studio() {
  const hi = useHindi();
  const { item: itemId } = Route.useSearch();
  const sources = items.filter((i) => i.access === "public");
  const [selectedId, setSelectedId] = useState(itemId ?? sources[0]?.id ?? "");
  const [inject, setInject] = useState(true);
  const [channel, setChannel] = useState<Channel>("x");
  const [status, setStatus] = useState<"idle" | "copied" | "copy-failed" | "approved" | "blocked">(
    "idle",
  );
  const item = sources.find((i) => i.id === selectedId) ?? sources[0];
  const kit = useMemo(() => (item ? buildKit(item, inject) : null), [item, inject]);

  if (!item || !kit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p>{hi ? "कोई स्रोत उपलब्ध नहीं" : "No source records available."}</p>
      </div>
    );
  }

  const copyChannel = async () => {
    try {
      await copyText(kit.channels[channel]);
      setStatus("copied");
    } catch {
      setStatus("copy-failed");
    }
    window.setTimeout(
      () => setStatus((s) => (s === "copied" || s === "copy-failed" ? "idle" : s)),
      2000,
    );
  };

  const approve = () => {
    if (!kit.canApprove) {
      // Stays visible until the kit changes (source, demo toggle or removal), so a
      // presenter can talk through it.
      setStatus("blocked");
      return;
    }
    setStatus("approved");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Content Studio" }]} />
      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold">{hi ? "कंटेंट स्टूडियो" : "Content Studio"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "एक स्रोत से हर चैनल के लिए ड्राफ्ट — तथ्य जाँच के बाद ही स्वीकृति।"
            : "One archive record becomes posts, a press note, news item, newsletter blurb, quiz and social line. Sentences are checked against the source; pieces scoring below 80% cannot be approved."}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <label className="block text-sm font-medium">
            {hi ? "स्रोत रिकॉर्ड" : "Source record"}
            <select
              value={item.id}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setStatus("idle");
              }}
              className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            >
              {sources.map((i) => (
                <option key={i.id} value={i.id}>
                  {typeLabel(i.type)} — {i.title}
                </option>
              ))}
            </select>
          </label>
          <Link
            to="/item/$id"
            params={{ id: item.id }}
            className="block rounded-lg border border-border p-4 text-sm hover:bg-ice"
          >
            <p className="eyebrow">{uiText(typeLabel(item.type), hi)}</p>
            <p className="mt-1 font-display font-semibold">{uiText(item.title, hi)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(item.date)} · {item.licence}
            </p>
          </Link>
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={inject}
              onChange={(e) => {
                setInject(e.target.checked);
                setStatus("idle");
              }}
              className="mt-0.5 accent-primary"
            />
            <span>
              {hi ? "डेमो: एक असमर्थित वाक्य जोड़ें" : "Demo: include one unsupported claim"}
              <span className="mt-1 block text-xs text-muted-foreground">
                {hi
                  ? "न्यायाधीशों को ग्राउंडिंग गेट दिखाने के लिए।"
                  : "Shows the grounding gate judges will ask about."}
              </span>
            </span>
          </label>
        </aside>

        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["scientist", "student", "public"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-border bg-card p-4">
                <p className="eyebrow">
                  {k === "scientist"
                    ? hi
                      ? "वैज्ञानिक"
                      : "Scientist"
                    : k === "student"
                      ? hi
                        ? "विद्यार्थी"
                        : "Student"
                      : hi
                        ? "जनता"
                        : "Public"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{kit.summaries[k]}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-6 flex flex-wrap gap-2"
            role="tablist"
            aria-label={hi ? "चैनल" : "Channels"}
          >
            {CHANNELS.map((c) => {
              const flagged = kit.claims.some((cl) => !cl.supported && cl.channels.includes(c.id));
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={channel === c.id}
                  onClick={() => setChannel(c.id)}
                  className={`btn-base relative py-2 text-xs ${channel === c.id ? "btn-primary" : "btn-outline"}`}
                >
                  {hi ? c.hi : c.label}
                  {flagged && (
                    <span
                      className="absolute -right-1 -top-1 size-2.5 rounded-full bg-destructive ring-2 ring-background"
                      aria-label={hi ? "असमर्थित तथ्य" : "has unsupported claim"}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card p-5">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
              {kit.channels[channel]}
            </pre>
            {channel === "card" && (
              <SocialCard
                item={item}
                headline={kit.summaries.public}
                verified={kit.canApprove}
                hi={hi}
              />
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copyChannel}
                className="btn-base btn-outline py-2 text-xs"
              >
                <Copy className="size-3.5" />{" "}
                {status === "copied"
                  ? hi
                    ? "कॉपी हो गया"
                    : "Copied"
                  : status === "copy-failed"
                    ? hi
                      ? "कॉपी नहीं हुआ"
                      : "Copy blocked by browser"
                    : hi
                      ? "ड्राफ्ट कॉपी करें"
                      : "Copy draft"}
              </button>
              <button type="button" onClick={approve} className="btn-base btn-primary py-2 text-xs">
                <Sparkles className="size-3.5" />{" "}
                {hi ? "स्वीकृति के लिए भेजें" : "Submit kit for approval"}
              </button>
              <span
                className={`ml-auto text-xs ${kit.channels[channel].length > LIMITS[channel] ? "text-destructive" : "text-muted-foreground"}`}
              >
                {kit.channels[channel].length} / {LIMITS[channel]} {hi ? "अक्षर" : "characters"}
              </span>
            </div>
            {status === "blocked" && (
              <div className="mt-4 flex flex-wrap items-start gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <FileWarning className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  {hi
                    ? `स्वीकृति रुकी: ${kit.unsupported} वाक्य स्रोत रिकॉर्ड में नहीं मिला (नीचे लाल चिह्नित)। तथ्य जाँच आविष्कृत संख्याओं को आधिकारिक चैनल तक पहुँचने से रोकती है।`
                    : `Approval blocked: ${kit.unsupported} sentence${kit.unsupported === 1 ? " is" : "s are"} not backed by the source record (flagged in red below). The fact check stops invented figures from reaching official channels.`}
                </span>
                {inject && (
                  <button
                    type="button"
                    onClick={() => {
                      setInject(false);
                      setStatus("idle");
                    }}
                    className="btn-base btn-outline shrink-0 py-1.5 text-xs"
                  >
                    {hi ? "असमर्थित वाक्य हटाएँ" : "Remove unsupported sentences"}
                  </button>
                )}
              </div>
            )}
            {status === "approved" && (
              <p className="mt-4 flex items-start gap-2 rounded-md bg-aurora/10 p-3 text-sm">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-aurora" />
                {hi
                  ? "किट संपादक की समीक्षा कतार में भेज दी गई (डेमो)।"
                  : "Kit passed the grounding check and is queued for an editor (demonstration)."}
              </p>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow">{hi ? "तथ्य ग्राउंडिंग" : "Fact-grounding check"}</p>
              <p
                className={`font-display text-2xl font-bold ${kit.canApprove ? "text-aurora" : "text-destructive"}`}
              >
                {kit.score}%
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {hi
                ? `हर वाक्य स्रोत से जाँचा जाता है। ${APPROVAL_THRESHOLD}% से कम या कोई असत्यापित संख्या होने पर स्वीकृति बंद।`
                : `Each sentence across the kit is checked against the source record. Approval is blocked below ${APPROVAL_THRESHOLD}% support or while any number, date or figure is unverified.`}
            </p>
            <p className="mt-3 text-sm font-medium">
              {kit.unsupported === 0
                ? hi
                  ? `सभी ${kit.claims.length} वाक्य स्रोत से समर्थित हैं।`
                  : `All ${kit.claims.length} sentences are supported by the source.`
                : hi
                  ? `${kit.claims.length} में से ${kit.unsupported} वाक्य असमर्थित।`
                  : `${kit.unsupported} of ${kit.claims.length} sentences unsupported.`}
            </p>
            <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {kit.claims.map((c) => (
                <li
                  key={c.text}
                  className={`flex gap-2 rounded-md border p-3 text-sm ${c.supported ? "border-border" : "border-destructive/40 bg-destructive/5"}`}
                >
                  {c.supported ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-aurora" />
                  ) : (
                    <FileWarning className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <span className="min-w-0">
                    <span
                      className={
                        c.supported ? "text-muted-foreground" : "font-medium text-destructive"
                      }
                    >
                      {c.text}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {c.note} ·{" "}
                      {c.channels
                        .map((id) => {
                          const ch = CHANNELS.find((x) => x.id === id);
                          return ch ? (hi ? ch.hi : ch.label) : id;
                        })
                        .join(", ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
