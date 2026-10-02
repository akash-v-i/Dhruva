import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, GraduationCap, RotateCcw } from "lucide-react";
import { GLOSSARY, IMAGES, LEARN_TOPICS, POLAR_FACTS, items } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn polar science — Dhruva" },
      {
        name: "description",
        content:
          "Student explainers, a polar quiz, facts and glossary terms that make polar science easy to follow.",
      },
      { property: "og:title", content: "Learn polar science — Dhruva" },
      {
        property: "og:description",
        content: "Explainers, quizzes and glossary terms for students and curious readers.",
      },
    ],
  }),
  component: Learn,
});

const QUIZ = [
  {
    q: "What do air bubbles trapped in an ice core tell scientists?",
    options: ["Ocean salinity", "The composition of past atmospheres", "Penguin populations"],
    answer: 1,
  },
  {
    q: "Roughly how much of the world's fresh water is held in Antarctic ice?",
    options: ["About 10 per cent", "About 30 per cent", "About 60 per cent"],
    answer: 2,
  },
  {
    q: "Which Indian station is located in the Arctic?",
    options: ["Himadri", "Maitri", "Bharati"],
    answer: 0,
  },
];

const QUIZ_HI: Record<string, string> = {
  "What do air bubbles trapped in an ice core tell scientists?":
    "हिम क्रोड में फँसे हवा के बुलबुले वैज्ञानिकों को क्या बताते हैं?",
  "Roughly how much of the world’s fresh water is held in Antarctic ice?":
    "दुनिया के मीठे पानी का लगभग कितना हिस्सा अंटार्कटिक बर्फ़ में है?",
  "Roughly how much of the world's fresh water is held in Antarctic ice?":
    "दुनिया के मीठे पानी का लगभग कितना हिस्सा अंटार्कटिक बर्फ़ में है?",
  "Which Indian station is located in the Arctic?": "कौन सा भारतीय स्टेशन आर्कटिक में है?",
  "Ocean salinity": "समुद्र की लवणता",
  "The composition of past atmospheres": "प्राचीन वायुमंडल की संरचना",
  "Penguin populations": "पेंगुइन की संख्या",
  "About 10 per cent": "लगभग 10 प्रतिशत",
  "About 30 per cent": "लगभग 30 प्रतिशत",
  "About 60 per cent": "लगभग 60 प्रतिशत",
};

const quizText = (text: string, hi: boolean) => (hi ? (QUIZ_HI[text] ?? text) : text);

function Learn() {
  const hi = useHindi();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = QUIZ.filter((item, qi) => answers[qi] === item.answer).length;
  const explainers = items
    .filter((i) => i.tags.includes("Education") || i.type === "video")
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Learn" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold">
          {hi ? "ध्रुवीय विज्ञान सीखें" : "Learn polar science"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "ध्रुव संग्रह पर आधारित सरल व्याख्याएँ, प्रश्नोत्तरी और शब्दार्थ।"
            : "Short explainers, a quiz and plain-language definitions built from material in the Dhruva archive."}
        </p>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {LEARN_TOPICS.map((t) => (
          <Link key={t.id} to="/explore" search={{ q: t.title }} className="card-polar group p-5">
            <GraduationCap className="size-5 text-primary" />
            <p className="mt-3 font-display font-semibold group-hover:text-primary">
              {uiText(t.title, hi)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{uiText(t.blurb, hi)}</p>
          </Link>
        ))}
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow">{hi ? "चुनिंदा प्रश्नोत्तरी" : "Featured quiz"}</p>
          <h2 className="mt-2 text-2xl font-bold">
            {hi ? "अपना ज्ञान जाँचें" : "Test what you know"}
          </h2>
          <div className="mt-5 space-y-5">
            {QUIZ.map((item, qi) => (
              <div
                key={item.q}
                className="rounded-lg border border-border bg-card p-5 shadow-polar"
              >
                <p className="font-medium">{quizText(item.q, hi)}</p>
                <div className="mt-3 space-y-2">
                  {item.options.map((o, oi) => {
                    const picked = answers[qi];
                    const isPicked = picked === oi;
                    const correct = item.answer === oi;
                    return (
                      <button
                        key={o}
                        type="button"
                        disabled={picked !== undefined}
                        onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          picked === undefined
                            ? "border-border hover:border-primary/40 hover:bg-ice"
                            : correct
                              ? "border-aurora/60 bg-aurora/10"
                              : isPicked
                                ? "border-destructive/50 bg-destructive/10"
                                : "border-border opacity-70"
                        }`}
                      >
                        {quizText(o, hi)}
                        {picked !== undefined && correct && (
                          <CheckCircle2 className="size-4 text-aurora" />
                        )}
                        {picked !== undefined && isPicked && !correct && (
                          <XCircle className="size-4 text-destructive" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {Object.keys(answers).length === QUIZ.length && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-aurora/40 bg-aurora/10 p-4">
              <p className="font-display font-semibold">
                {hi
                  ? `आपका स्कोर: ${score} / ${QUIZ.length}`
                  : `You scored ${score} of ${QUIZ.length}`}
              </p>
              <button
                type="button"
                onClick={() => setAnswers({})}
                className="btn-base btn-outline py-1.5 text-xs"
              >
                <RotateCcw className="size-3.5" /> {hi ? "फिर से खेलें" : "Try again"}
              </button>
            </div>
          )}
        </div>

        <div>
          <img
            src={IMAGES.fieldTeam}
            alt={
              hi
                ? "हिमशैलों के पास खड़े दो ध्रुवीय शोधकर्ता"
                : "Two polar field researchers looking out over icebergs"
            }
            loading="lazy"
            width={1280}
            height={864}
            className="aspect-[4/3] w-full rounded-lg object-cover shadow-polar"
          />
          <div className="mt-6 rounded-lg border border-border bg-ice p-5">
            <p className="eyebrow">{hi ? "ध्रुवीय तथ्य" : "Polar facts"}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {POLAR_FACTS.map((f) => (
                <li key={f}>· {uiText(f, hi)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <p className="eyebrow">{hi ? "शब्दावली" : "Glossary"}</p>
        <h2 className="mt-2 text-2xl font-bold">
          {hi ? "संग्रह में मिलने वाले शब्द" : "Terms you will meet in the archive"}
        </h2>
        <dl className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GLOSSARY.map((g) => (
            <div key={uiText(g.t, hi)} className="rounded-lg border border-border p-5">
              <dt className="font-display font-semibold">{uiText(g.t, hi)}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{uiText(g.d, hi)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14">
        <p className="eyebrow">{hi ? "व्याख्याएँ और मीडिया" : "Explainers and media"}</p>
        <h2 className="mt-2 text-2xl font-bold">{hi ? "देखें और पढ़ें" : "Watch and read"}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {explainers.map((i) => (
            <Link
              key={i.id}
              to="/item/$id"
              params={{ id: i.id }}
              className="card-polar overflow-hidden"
            >
              <img
                src={i.image ?? IMAGES.hero}
                alt=""
                loading="lazy"
                width={1280}
                height={864}
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="p-4">
                <p className="font-display font-semibold leading-snug">{uiText(i.title, hi)}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {uiText(i.summary, hi)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
