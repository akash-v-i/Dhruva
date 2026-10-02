import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Presentation, X } from "lucide-react";
import { useHindi } from "@/lib/language";

type Step = {
  path: string;
  search?: Record<string, string>;
  en: string;
  hi: string;
  tipEn: string;
  tipHi: string;
};

// A presenter's walkthrough of the features that set Dhruva apart, in demo order.
const STEPS: Step[] = [
  {
    path: "/ask",
    search: { q: "How is the Amery Ice Shelf changing?" },
    en: "Ask Polar — cited answer",
    hi: "ध्रुव से पूछें — स्रोत सहित जवाब",
    tipEn: "Every sentence carries a numbered citation to its record.",
    tipHi: "हर वाक्य के साथ उसके स्रोत का क्रमांक है।",
  },
  {
    path: "/ask",
    search: { q: "Has India measured microplastics in Antarctic snow?" },
    en: "Honest “not found” → content gap",
    hi: "ईमानदार “नहीं मिला” → सामग्री अंतर",
    tipEn: "No invented answer; the question is logged for the outreach team.",
    tipHi: "कोई मनगढ़ंत जवाब नहीं; सवाल जनसंपर्क टीम के लिए दर्ज होता है।",
  },
  {
    path: "/studio",
    en: "Content Studio — fact-grounding gate",
    hi: "कंटेंट स्टूडियो — तथ्य जाँच",
    tipEn: "Submit → blocked by the red sentence → Remove → approved. Open “Social image card”.",
    tipHi: "भेजें → लाल वाक्य से रुका → हटाएँ → स्वीकृत। “सोशल इमेज कार्ड” खोलें।",
  },
  {
    path: "/contribute",
    en: "Contribute — AI enrichment pipeline",
    hi: "सामग्री जोड़ें — AI पाइपलाइन",
    tipEn: "Try the samples: field report, duplicate detection and photo tagging.",
    tipHi: "नमूने आज़माएँ: रिपोर्ट, प्रतिलिपि पहचान और फ़ोटो टैग।",
  },
  {
    path: "/review",
    en: "Review queue — humans approve",
    hi: "समीक्षा कतार — मानव स्वीकृति",
    tipEn: "The upload arrives with AI-filled metadata for an editor to publish.",
    tipHi: "अपलोड AI-भरे मेटाडेटा के साथ संपादक तक पहुँचता है।",
  },
  {
    path: "/journey/isea-42",
    en: "Virtual expedition",
    hi: "आभासी अभियान",
    tipEn: "Press Play: the voyage unfolds on the polar map with linked records.",
    tipHi: "चलाएँ दबाएँ: मानचित्र पर यात्रा और जुड़े रिकॉर्ड।",
  },
  {
    path: "/graph",
    en: "Knowledge graph",
    hi: "ज्ञान ग्राफ़",
    tipEn: "Click a station or scientist to see everything linked to it.",
    tipHi: "किसी स्टेशन या वैज्ञानिक पर क्लिक करें।",
  },
  {
    path: "/map",
    en: "Polar map — both poles",
    hi: "ध्रुवीय मानचित्र",
    tipEn: "Switch Antarctic ↔ Arctic and toggle layers.",
    tipHi: "अंटार्कटिक ↔ आर्कटिक बदलें और परतें चुनें।",
  },
  {
    path: "/insights",
    en: "Insights — what the public wants",
    hi: "इनसाइट्स — जनता क्या चाहती है",
    tipEn: "Unanswered questions become next week’s outreach topics.",
    tipHi: "अनुत्तरित सवाल अगले सप्ताह के विषय बनते हैं।",
  },
];

const KEY = "dhruva-demo-guide";

export function DemoGuide() {
  const hi = useHindi();
  const { pathname, searchStr } = useLocation();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<number[]>([]);

  useEffect(() => {
    try {
      setSeen(JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as number[]);
    } catch {
      /* ignore */
    }
  }, []);

  // Tick off a step when the presenter reaches its page.
  useEffect(() => {
    const i = STEPS.findIndex(
      (s) =>
        s.path === pathname &&
        (!s.search?.["q"] ||
          decodeURIComponent(searchStr.replace(/\+/g, " ")).includes(s.search["q"].slice(0, 20))),
    );
    if (i < 0) return;
    setSeen((prev) => {
      if (prev.includes(i)) return prev;
      const next = [...prev, i];
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [pathname, searchStr]);

  const reset = () => {
    setSeen([]);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      {open && (
        <div className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-polar-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-border bg-navy px-4 py-3 text-background">
            <div>
              <p className="font-display text-sm font-semibold">
                {hi ? "डेमो गाइड" : "Demo guide"}
              </p>
              <p className="text-xs opacity-75">
                {seen.length} / {STEPS.length} {hi ? "पूरे" : "explored"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={hi ? "बंद करें" : "Close"}
              className="rounded p-1 hover:bg-background/15"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-aurora transition-all"
              style={{ width: `${(seen.length / STEPS.length) * 100}%` }}
            />
          </div>
          <ol className="max-h-[60vh] space-y-0.5 overflow-y-auto p-2">
            {STEPS.map((s, i) => (
              <li key={`${s.path}-${i}`}>
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ to: s.path, search: s.search ?? {} } as any)}
                  onClick={() => window.innerWidth < 640 && setOpen(false)}
                  className="flex items-start gap-2.5 rounded-md p-2 hover:bg-ice"
                >
                  {seen.includes(i) ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-aurora" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {i + 1}. {hi ? s.hi : s.en}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {hi ? s.tipHi : s.tipEn}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span>
              {hi
                ? "सुझाव: हिंदी में भी आज़माएँ (ऊपर हिं)"
                : "Tip: switch to Hindi with हिं at the top"}
            </span>
            <button
              type="button"
              onClick={reset}
              className="font-semibold text-primary hover:underline"
            >
              {hi ? "रीसेट" : "Reset"}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-background shadow-polar-lg transition-transform hover:scale-105"
      >
        <Presentation className="size-4" /> {hi ? "डेमो गाइड" : "Demo guide"}
        {seen.length < STEPS.length && (
          <span className="rounded-full bg-aurora px-1.5 text-xs text-aurora-foreground">
            {STEPS.length - seen.length}
          </span>
        )}
      </button>
    </div>
  );
}
