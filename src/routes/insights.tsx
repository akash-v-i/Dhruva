import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, Download, Eye, Search } from "lucide-react";
import { itemsByType, CONTENT_TYPES } from "@/data/dhruva";
import { readGaps, type GapEntry } from "@/lib/gaps";
import { uiText } from "@/lib/translation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useHindi } from "@/lib/language";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Dhruva" },
      {
        name: "description",
        content:
          "Views, downloads, unanswered searches and suggested outreach topics from the polar portal.",
      },
    ],
  }),
  component: Insights,
});

function Insights() {
  const hi = useHindi();
  // Read after mount: logged gaps live in this browser's storage, which the server cannot see.
  const [gaps, setGaps] = useState<GapEntry[]>([]);
  useEffect(() => setGaps(readGaps()), []);
  const stats = [
    { icon: Eye, k: "18,420", v: hi ? "इस माह पृष्ठ दृश्य" : "page views this month" },
    { icon: Download, k: "1,164", v: hi ? "फ़ाइल डाउनलोड" : "file downloads" },
    { icon: Search, k: "642", v: hi ? "संग्रह खोजें" : "archive searches" },
    { icon: BarChart3, k: `${gaps.length}`, v: hi ? "खाली खोज विषय" : "unanswered topics" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Insights" }]} />
      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold">{hi ? "इनसाइट्स" : "Insights"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "जो जनता खोजती है और संग्रह में नहीं मिलता, वही अगले सप्ताह के जनसंपर्क का विषय बनता है।"
            : "Views and downloads sit beside searches that returned nothing. Those gaps become next week’s outreach list."}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.v} className="card-polar p-5">
            <s.icon className="size-5 text-primary" />
            <p className="mt-3 font-display text-3xl font-bold">{s.k}</p>
            <p className="text-sm text-muted-foreground">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold">{hi ? "सामग्री अंतर" : "Content gaps"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hi
              ? "ध्रुव से पूछें जिन सवालों का जवाब संग्रह में नहीं था।"
              : "Questions Ask Polar could not answer, plus empty archive searches."}
          </p>
          <ul className="mt-4 space-y-2">
            {gaps.map((g) => (
              <li key={g.q} className="flex items-start gap-3 rounded-lg border border-border p-4">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-embargo" />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{g.q}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {g.count} {hi ? "बार" : g.count === 1 ? "time" : "times"} · {g.at}
                  </span>
                </span>
                <Link
                  to="/explore"
                  search={{ q: g.q }}
                  className="btn-base btn-outline shrink-0 py-1.5 text-xs"
                >
                  {hi ? "संग्रह जाँचें" : "Check archive"}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold">{hi ? "संग्रह कवरेज" : "Archive coverage"}</h2>
          <ul className="mt-4 space-y-3">
            {CONTENT_TYPES.map((c) => {
              const n = itemsByType(c.id).length;
              const most = Math.max(...CONTENT_TYPES.map((t) => itemsByType(t.id).length), 1);
              const pct = Math.round((n / most) * 100);
              return (
                <li key={c.id}>
                  <div className="flex justify-between text-sm">
                    <span>{uiText(c.plural, hi)}</span>
                    <span className="text-muted-foreground">{n}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 rounded-lg border border-border bg-ice p-5">
            <p className="eyebrow">{hi ? "सुझाए गए विषय" : "Suggested outreach"}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                ·{" "}
                {hi
                  ? "मानसून और ध्रुवीय बर्फ़ — विद्यार्थी व्याख्या"
                  : "Monsoon links to polar ice — student explainer"}
              </li>
              <li>
                ·{" "}
                {hi
                  ? "भारती के पास सम्राट पेंगुइन — फ़ोटो निबंध"
                  : "Emperor penguins near Bharati — photo essay"}
              </li>
              <li>
                ·{" "}
                {hi
                  ? "अंटार्कटिक हिम में माइक्रोप्लास्टिक — डेटा कॉल"
                  : "Microplastics in Antarctic snow — data call"}
              </li>
            </ul>
            <Link to="/studio" className="btn-base btn-primary mt-4 py-2 text-xs">
              {hi ? "स्टूडियो खोलें" : "Open Content Studio"} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
