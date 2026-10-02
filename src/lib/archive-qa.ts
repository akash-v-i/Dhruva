import {
  GLOSSARY,
  POLAR_FACTS,
  expeditions,
  formatDate,
  items,
  stations,
  typeLabel,
} from "@/data/dhruva";
import { logUnanswered } from "@/lib/gaps";
import { baseTerms } from "@/lib/search";
import { englishTermsIn } from "@/lib/translation";

/** Where a citation leads: a record, a station, an expedition or the Learn page. */
export type AnswerSource = {
  id: string;
  title: string;
  meta: string;
  href: { to: string; params?: Record<string, string> };
};
export type AnswerPart = { text: string; cite: number };
export type ArchiveAnswer = {
  question: string;
  text: string;
  parts?: AnswerPart[];
  sources: AnswerSource[];
  /** True when the archive had nothing on the topic (the question was logged as a content gap). */
  notFound?: boolean;
};

/** A passage-bearing document in the Ask Polar knowledge base. */
type Doc = {
  source: AnswerSource;
  /** Names the question may refer to directly ("Maitri", "ISEA-42"). */
  names: string[];
  /** Fact sentences first, then descriptive text. */
  sentences: string[];
  kind: "station" | "expedition" | "glossary" | "fact" | "record";
};

function split(text: string) {
  return text
    .replace(/\b(Dr|Mr|Ms|Prof|St|e\.g|i\.e)\./g, "$1․")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/․/g, ".").trim())
    .filter((s) => s.length > 15);
}

const coords = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat < 0 ? "S" : "N"}, ${Math.abs(lon).toFixed(2)}°${lon < 0 ? "W" : "E"}`;

function buildDocs(): Doc[] {
  const docs: Doc[] = [];

  stations.forEach((s) => {
    const visits = expeditions.filter((e) => e.stationIds.includes(s.id));
    const records = items.filter((i) => i.stationId === s.id && i.access === "public");
    docs.push({
      kind: "station",
      names: [s.name, `${s.name} station`],
      source: {
        id: `station:${s.id}`,
        title: `${s.name} station`,
        meta: `Research station · ${s.region}`,
        href: { to: "/stations/$id", params: { id: s.id } },
      },
      sentences: [
        `${s.name} is an Indian research station in ${s.region === "Arctic" ? "the Arctic" : s.region}, established in ${s.established}.`,
        ...split(s.description),
        `It is located at ${coords(s.lat, s.lon)}.`,
        ...(visits.length
          ? [
              `Expeditions that worked at ${s.name} include ${visits.map((e) => e.number).join(", ")}.`,
            ]
          : []),
        ...(records.length
          ? [`The archive holds ${records.length} public records from ${s.name}.`]
          : []),
      ],
    });
  });

  expeditions.forEach((e) => {
    const visited = e.stationIds
      .map((id) => stations.find((s) => s.id === id)?.name)
      .filter(Boolean);
    docs.push({
      kind: "expedition",
      names: [e.number, e.name],
      source: {
        id: `expedition:${e.id}`,
        title: e.name,
        meta: `Expedition · ${e.number} · ${e.region}`,
        href: { to: "/expeditions/$id", params: { id: e.id } },
      },
      sentences: [
        `${e.number} (${e.name}) was led by ${e.leader}.`,
        `It ran from ${formatDate(e.start)} to ${formatDate(e.end)}${visited.length ? ` and worked at ${visited.join(" and ")}` : " in the open ocean"}.`,
        ...split(e.summary),
        ...e.timeline.map((t) => `On ${t.date}: ${t.title.toLowerCase()} — ${t.detail}`),
      ],
    });
  });

  GLOSSARY.forEach((g) => {
    docs.push({
      kind: "glossary",
      names: [g.t],
      source: {
        id: `glossary:${g.t}`,
        title: g.t,
        meta: "Glossary · Learn Polar",
        href: { to: "/learn" },
      },
      sentences: [`${g.t}: ${g.d}`],
    });
  });

  POLAR_FACTS.forEach((f, i) => {
    docs.push({
      kind: "fact",
      names: [],
      source: {
        id: `fact:${i}`,
        title: "Polar facts",
        meta: "Learn Polar",
        href: { to: "/learn" },
      },
      sentences: [f],
    });
  });

  // Only reviewed, openly accessible records may be quoted to the public.
  items
    .filter((i) => i.access === "public")
    .forEach((i) => {
      docs.push({
        kind: "record",
        names: [i.title],
        source: {
          id: `item:${i.id}`,
          title: i.title,
          meta: `${typeLabel(i.type)} · ${i.region} · ${i.licence}`,
          href: { to: "/item/$id", params: { id: i.id } },
        },
        sentences: [
          ...split(i.summary),
          ...split(i.body),
          `Tags: ${i.tags.join(", ")}, ${typeLabel(i.type).toLowerCase()}, ${i.region}${i.stationId ? `, ${stations.find((s) => s.id === i.stationId)?.name ?? ""}` : ""}.`,
        ],
      });
    });

  return docs;
}

const DOCS = buildDocs();

function normalise(text: string) {
  return ` ${text
    .toLowerCase()
    .replace(/[-–—/()]/g, " ")
    .replace(/[^a-z0-9\sऀ-ॿ°.]/g, " ")
    .replace(/\s+/g, " ")} `;
}

// Word-start match; longer terms also match inside compounds ("fjord" in "Kongsfjorden"),
// except that "arctic" must never match inside "antarctic".
function has(hay: string, term: string) {
  if (hay.includes(` ${term}`)) return true;
  if (term.length < 5) return false;
  for (let i = hay.indexOf(term); i >= 0; i = hay.indexOf(term, i + 1)) {
    if (hay.slice(Math.max(0, i - 3), i) !== "ant") return true;
  }
  return false;
}

// Question filler that says nothing about the topic.
const FILLER = new Set([
  "happen",
  "happens",
  "happening",
  "measure",
  "measured",
  "tell",
  "explain",
  "describe",
  "mean",
  "means",
  "know",
  "learn",
  "learnt",
  "found",
  "find",
  "give",
  "show",
  "list",
  "quickly",
  "really",
  "please",
  "more",
  "india",
  "indian",
  "change",
  "changing",
  "changed",
  "affect",
  "affects",
  "affecting",
  "effect",
  "impact",
  "work",
  "works",
  "doing",
  "built",
  "build",
  "founded",
  "set",
  "started",
  "visible",
  "see",
  "seen",
  "important",
  "different",
  "kind",
  "type",
  "types",
  "thing",
  "things",
  "anything",
  "something",
  "today",
]);

/** Question intent: which kind of sentence best answers it. */
function intentOf(question: string) {
  const q = question.toLowerCase();
  if (/\bwho\b|led|leader|किसने|नेतृत्व/.test(q)) return /led by|leader|\bdr\./i;
  if (/\bwhen\b|\byear\b|established|built|founded|कब/.test(q))
    return /\b(19|20)\d{2}\b|established|from .* to/i;
  if (/\bwhere\b|located|location|कहाँ|कहां/.test(q))
    return /located|°|research station in|schirmacher|larsemann|ny-ålesund/i;
  if (/how many|कितने|कितनी/.test(q)) return /\b\d+\b/;
  if (/\bwhat (is|are)\b|define|meaning|क्या है/.test(q)) return /: | is an? | are /i;
  return null;
}

// No \b here: it does not treat Devanagari letters as word characters.
const GREETING = /^\s*(hi+|hello|hey|namaste|नमस्ते|नमस्कार)[\s!.?।]*$/i;

/**
 * Retrieval-grounded answer over records, stations, expeditions and the glossary. Picks
 * the sentences that best answer the question and cites each one, so every statement
 * can be traced to where it came from — and says so honestly when nothing matches.
 */
export function answerFromArchive(question: string, hi = false): ArchiveAnswer {
  const terms = baseTerms(question);

  if (GREETING.test(question) || terms.filter((t) => !FILLER.has(t)).length === 0) {
    return {
      question,
      text: hi
        ? "नमस्ते! ध्रुवीय स्टेशनों, अभियानों, समुद्री बर्फ़, हिमनदों या संग्रह के किसी डेटासेट के बारे में पूछें — जैसे “मैत्री क्या है?” या “ISEA-42 का नेतृत्व किसने किया?”"
        : "Hello! Ask about India's polar stations, expeditions, sea ice, glaciers or any dataset in the archive — for example “What is Maitri?” or “Who led ISEA-42?”",
      sources: [],
    };
  }

  // Hindi questions are matched through their English glossary terms ("मैत्री" → "Maitri").
  const qNorm = normalise(`${question} ${englishTermsIn(question).join(" ")}`);
  const intent = intentOf(question);
  const definitional = /\bwhat (is|are)\b|\bwhy\b|define|meaning|क्या है|क्या होता|क्यों/i.test(
    question,
  );
  const topical = terms.filter((t) => !FILLER.has(t));
  const asksStation = /station|base|स्टेशन/i.test(question);
  const asksExpedition = /expedition|voyage|cruise|अभियान/i.test(question);

  // Rare words carry the meaning of a question; a word the archive never uses (e.g. an
  // unstudied topic) should stop a match rather than be ignored.
  const docHays = DOCS.map((doc) => normalise(`${doc.names.join(" ")} ${doc.sentences.join(" ")}`));
  const idf = new Map(
    topical.map((t) => {
      const df = docHays.filter((h) => has(h, t)).length;
      return [t, Math.log((DOCS.length + 1) / (df + 0.5))];
    }),
  );
  const totalWeight = topical.reduce((n, t) => n + (idf.get(t) ?? 0), 0);

  const scored = DOCS.map((doc, di) => {
    // Glossary terms count as "named" only when the question asks for a definition.
    const named =
      (doc.kind !== "glossary" || definitional) &&
      doc.names.some((n) => n.length > 2 && qNorm.includes(normalise(n).trim()));
    const hay = docHays[di]!;
    const nameHay = normalise(doc.names.join(" "));
    let score = 0;
    let weight = 0;
    topical.forEach((t) => {
      if (has(hay, t)) {
        weight += idf.get(t) ?? 0;
        score += 1;
      }
      if (has(nameHay, t)) score += 2;
    });
    const coverage = totalWeight > 0 ? weight / totalWeight : 0;
    // A named document must also cover what is asked about it ("population of penguins
    // near Bharati" is not answered by a general description of Bharati).
    const nameHayWords = normalise(doc.names.join(" "));
    const asked = topical.filter((t) => !has(nameHayWords, t));
    const askedWeight = asked.reduce((n, t) => n + (idf.get(t) ?? 0), 0);
    const askedCovered = asked
      .filter((t) => has(hay, t))
      .reduce((n, t) => n + (idf.get(t) ?? 0), 0);
    const namedRelevant = named && (asked.length === 0 || askedCovered / askedWeight >= 0.5);
    if (named) score += 6;
    if (doc.kind === "glossary" && definitional && score > 0) score += 3;
    if (doc.kind === "station" && asksStation && score > 0) score += 3;
    if (doc.kind === "expedition" && asksExpedition && score > 0) score += 3;
    return { doc, score: score * (0.5 + coverage), coverage, named: namedRelevant };
  });

  // When the question names something specific, answer about that thing — not its neighbours.
  const namedKinds = new Set(scored.filter((s) => s.named).map((s) => s.doc.kind));
  const ranked = scored
    .filter((s) => s.named || s.coverage >= 0.6)
    .filter(
      (s) =>
        s.named ||
        !(namedKinds.has(s.doc.kind) && (s.doc.kind === "station" || s.doc.kind === "expedition")),
    )
    .sort((a, b) => b.score - a.score);
  // If something covers the whole question, partial matches only add noise.
  const bestCoverage = Math.max(0, ...ranked.map((t) => t.coverage));
  const top = ranked.filter((t) => t.named || t.coverage >= bestCoverage - 0.25).slice(0, 3);

  if (top.length === 0) {
    logUnanswered(question);
    return {
      question,
      text: hi
        ? "ध्रुव संग्रह में अभी इस सवाल का जवाब देने वाली समीक्षित सामग्री नहीं है। कोई व्यापक विषय खोजें या क्षेत्र, स्टेशन अथवा अभियान के अनुसार संग्रह देखें।"
        : "The Dhruva archive does not yet contain reviewed material that answers this question. Try a broader topic, or browse the archive by region, station or expedition.",
      sources: [],
      notFound: true,
    };
  }

  // Keep only documents reasonably close to the best match, so a weak third hit doesn't dilute the answer.
  const bestDoc = top[0]!.score;
  const docs = top.filter((t) => t.score >= bestDoc * 0.45).map((t) => t.doc);

  const candidates = docs.flatMap((doc, rank) =>
    doc.sentences
      .filter((text) => !text.startsWith("Tags:"))
      .map((text, pos) => {
        const hay = normalise(text);
        let score = topical.filter((t) => has(hay, t)).length;
        if (intent?.test(text)) score += 2;
        if (doc.names.some((n) => hay.includes(normalise(n).trim()))) score += 0.5;
        return { doc, rank, pos, text, score };
      }),
  );
  const best = Math.max(0, ...candidates.map((c) => c.score));
  const floor = Math.max(1, best / 2);
  const picked: typeof candidates = [];
  const perDoc = new Map<Doc, number>();
  [...candidates]
    .sort((a, b) => b.score - a.score || a.rank - b.rank || a.pos - b.pos)
    .forEach((c) => {
      if (picked.length >= 4 || (perDoc.get(c.doc) ?? 0) >= 2) return;
      if (c.score < floor && picked.length > 0) return;
      picked.push(c);
      perDoc.set(c.doc, (perDoc.get(c.doc) ?? 0) + 1);
    });
  picked.sort((a, b) => a.rank - b.rank || a.pos - b.pos);

  const usedDocs = docs.filter((d) => picked.some((p) => p.doc === d));
  // Glossary and fact entries share the Learn page; cite it once.
  const sources: AnswerSource[] = [];
  const citeFor = new Map<Doc, number>();
  usedDocs.forEach((d) => {
    const existing = sources.findIndex(
      (s) => s.href.to === d.source.href.to && d.source.href.to === "/learn",
    );
    if (existing >= 0) citeFor.set(d, existing + 1);
    else {
      sources.push(d.source);
      citeFor.set(d, sources.length);
    }
  });
  const parts = picked.map((p) => ({ text: p.text, cite: citeFor.get(p.doc)! }));
  const text = parts.map((p) => `${p.text} [${p.cite}]`).join(" ");

  return { question, text, parts, sources };
}
