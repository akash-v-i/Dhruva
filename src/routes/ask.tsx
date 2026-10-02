import { useLanguage, useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Sparkles, Send, ShieldCheck } from "lucide-react";
import { ASK_EXAMPLES, items, typeLabel } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { askPolar } from "@/lib/ask.functions";
import { answerFromArchive, type AnswerPart, type AnswerSource } from "@/lib/archive-qa";

export const Route = createFileRoute("/ask")({
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined } => {
    const q = search["q"];
    return { q: typeof q === "string" && q ? q : undefined };
  },
  head: () => ({
    meta: [
      { title: "Ask Polar — Dhruva" },
      {
        name: "description",
        content:
          "Ask a question about polar science and receive an answer drawn only from reviewed material in the Dhruva archive, with sources listed.",
      },
      { property: "og:title", content: "Ask Polar — Dhruva" },
      {
        property: "og:description",
        content: "Cited answers drawn only from reviewed material in the Dhruva archive.",
      },
    ],
  }),
  component: AskPolar,
});

interface Answer {
  question: string;
  text: string;
  parts?: AnswerPart[] | undefined;
  sources: AnswerSource[];
  notFound?: boolean | undefined;
}

// An external LLM is optional. By default Ask Polar answers from Dhruva's own knowledge
// base, so it works offline and sends no archive content to outside AI services.
const USE_LLM = import.meta.env["VITE_ASK_POLAR_LLM"] === "true";

function AskPolar() {
  const hi = useHindi();
  const { language } = useLanguage();
  const { q } = Route.useSearch();
  const [input, setInput] = useState(q ?? "");
  const [history, setHistory] = useState<Answer[]>([]);
  const [thinking, setThinking] = useState(false);
  const busy = useRef(false);
  const autoAsked = useRef<string | null>(null);
  const ask = async (question: string) => {
    if (!question.trim() || busy.current) return;
    busy.current = true;
    setThinking(true);
    setInput("");
    try {
      if (!USE_LLM) {
        // Brief pause so the "searching" state is visible rather than flickering.
        await new Promise((r) => setTimeout(r, 350));
        setHistory((h) => [answerFromArchive(question, hi), ...h]);
        return;
      }
      const r = await askPolar({ data: { question, language } });
      if (r.error) {
        setHistory((h) => [answerFromArchive(question, hi), ...h]);
        return;
      }
      const sources: AnswerSource[] = r.sourceIds
        .map((id) => items.find((i) => i.id === id))
        .filter((i): i is (typeof items)[number] => Boolean(i))
        .map((i) => ({
          id: `item:${i.id}`,
          title: i.title,
          meta: `${typeLabel(i.type)} · ${i.region} · ${i.licence}`,
          href: { to: "/item/$id", params: { id: i.id } },
        }));
      setHistory((h) => [{ question, text: r.text, sources }, ...h]);
    } catch {
      setHistory((h) => [answerFromArchive(question, hi), ...h]);
    } finally {
      busy.current = false;
      setThinking(false);
    }
  };

  useEffect(() => {
    // Guard against the effect running twice for the same linked question.
    if (q && autoAsked.current !== q) {
      autoAsked.current = q;
      void ask(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Ask Polar" }]} />

      <div className="mt-4">
        <p className="eyebrow">Ask Polar</p>
        <h1 className="mt-2 text-3xl font-bold">
          {uiText("Ask a question, get a cited answer", hi)}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {hi
            ? "जवाब केवल ध्रुव संग्रह की समीक्षित सामग्री से तैयार किए जाते हैं। हर जवाब के स्रोत दिए जाते हैं, ताकि आप उन्हें स्वयं जाँच सकें।"
            : "Answers are assembled only from reviewed records in the Dhruva archive. Every answer lists the sources it used, so you can open and verify each one."}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label={hi ? "सवाल पूछें" : "Ask a question"}
          placeholder={
            hi
              ? "समुद्री बर्फ़, हिमनद, स्टेशन और डेटा के बारे में पूछें..."
              : "Ask about sea ice, glaciers, stations, datasets..."
          }
          className="flex-1 rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <button type="submit" className="btn-base btn-primary py-3">
          <Send className="size-4" /> {hi ? "पूछें" : "Ask"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {ASK_EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => ask(hi ? uiText(e, true) : e)}
            className="chip whitespace-normal py-1 text-left hover:border-primary/50"
          >
            {uiText(e, hi)}
          </button>
        ))}
      </div>

      {thinking && (
        <div className="mt-8 rounded-lg border border-border bg-ice p-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 animate-pulse text-primary" />{" "}
            {hi ? "संग्रह में खोज जारी है..." : "Searching the archive..."}
          </p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {history.map((a, idx) => (
          <article
            key={`${a.question}-${idx}`}
            className="rounded-lg border border-border bg-card p-6 shadow-polar"
          >
            <p className="font-display text-lg font-semibold">{a.question}</p>
            {a.parts && a.parts.length > 0 ? (
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {a.parts.map((p, i) => (
                  <span key={i}>
                    {p.text}
                    <a
                      href={`#src-${idx}-${p.cite}`}
                      className="mx-0.5 inline-flex -translate-y-1 items-center justify-center rounded bg-primary/10 px-1 text-[10px] font-bold text-primary hover:bg-primary/20"
                      aria-label={`${hi ? "स्रोत" : "Source"} ${p.cite}`}
                    >
                      {p.cite}
                    </a>{" "}
                  </span>
                ))}
              </p>
            ) : (
              <p className="mt-3 text-muted-foreground">{a.text}</p>
            )}

            {a.sources.length > 0 && (
              <div className="mt-5">
                <p className="eyebrow">{hi ? "स्रोत" : "Sources"}</p>
                <ul className="mt-3 space-y-2">
                  {a.sources.map((s, si) => (
                    <li key={s.id} id={`src-${idx}-${si + 1}`} className="scroll-mt-24">
                      <Link
                        // Sources can be records, stations, expeditions or the Learn page.
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        {...(s.href as any)}
                        className="flex items-start gap-2 rounded-md border border-border p-3 text-sm hover:border-primary/40 hover:bg-ice"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[11px] font-bold text-primary">
                          {si + 1}
                        </span>
                        <span>
                          <span className="font-medium">{uiText(s.title, hi)}</span>
                          <span className="block text-xs text-muted-foreground">{s.meta}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {a.sources.length > 0 && (
              <p className="mt-5 flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                {hi
                  ? "यह जवाब संग्रह रिकॉर्ड से तैयार हुआ है; वाक्य मूल (अंग्रेज़ी) रिकॉर्ड से उद्धृत हैं। वैज्ञानिक या आधिकारिक उपयोग से पहले स्रोत जाँचें।"
                  : "Generated from archive records. Always check the cited sources before reuse in scientific or official work."}
              </p>
            )}
            {a.notFound && (
              <p className="mt-5 flex flex-wrap items-center gap-2 rounded-md bg-embargo/15 p-3 text-xs text-foreground">
                <AlertTriangle className="size-3.5 shrink-0 text-embargo" />
                {hi
                  ? "यह सवाल सामग्री-अंतर सूची में दर्ज किया गया, ताकि जनसंपर्क टीम इस पर सामग्री बना सके।"
                  : "Logged as a content gap so the outreach team can plan material on this topic."}
                <Link
                  to="/insights"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {hi ? "इनसाइट्स देखें" : "View Insights"}
                </Link>
              </p>
            )}
          </article>
        ))}
      </div>

      {history.length === 0 && !thinking && (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-ice p-8 text-center text-sm text-muted-foreground">
          {hi
            ? "ऊपर सवाल पूछें या उदाहरणों में से एक चुनें।"
            : "Ask a question above, or pick one of the examples to see how sourcing works."}
        </div>
      )}
    </div>
  );
}
