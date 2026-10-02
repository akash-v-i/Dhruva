import type { Item } from "@/data/dhruva";
import { englishTermsIn } from "@/lib/translation";

// Lightweight client-side ranking for the demo archive. Stands in for the hybrid
// keyword + embedding search described in the backend PRD: tokens are normalised,
// expanded with related polar terms and Hindi→English glossary terms, then scored
// with extra weight for title and tag hits.

const STOP = new Set([
  "the",
  "and",
  "for",
  "are",
  "was",
  "what",
  "which",
  "where",
  "when",
  "does",
  "did",
  "that",
  "this",
  "from",
  "with",
  "about",
  "have",
  "been",
  "were",
  "their",
  "they",
  "into",
  "near",
  "how",
  "why",
  "who",
  "can",
  "any",
  "has",
  "had",
  "its",
  "our",
  "your",
  "you",
  "all",
  "tell",
  "show",
  "much",
  "many",
]);

const RELATED: Record<string, string[]> = {
  glacier: ["glaciology", "ice", "mass"],
  glaciers: ["glaciology", "ice", "mass"],
  melt: ["melting", "thinning", "basal"],
  melting: ["melt", "thinning", "basal"],
  warming: ["climate", "temperature"],
  climate: ["warming", "temperature", "atmosphere"],
  penguin: ["penguins", "wildlife"],
  penguins: ["penguin", "wildlife"],
  aurora: ["aurora", "polar night"],
  ocean: ["oceanography", "marine", "sea"],
  carbon: ["co2", "flux", "pco2"],
  pollution: ["aerosol", "aerosols", "pollutant"],
  weather: ["meteorology", "meteorological", "atmosphere"],
  core: ["cores", "ice core"],
  cores: ["core", "ice core"],
  monsoon: ["climate", "monsoon"],
  station: ["stations", "base"],
  fjord: ["kongsfjorden"],
  wildlife: ["penguin", "seal", "krill", "biology", "microbial"],
};

// Light stemming: "datasets" → "dataset", "glaciers" → "glacier". Word-start matching
// then still finds the plural forms in the text.
function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[-–—_/]/g, " ")
    .replace(/\u2082/g, "2") // pCO₂ → pco2
    .replace(/[^a-z0-9\s\u0900-\u097f]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function baseTerms(query: string): string[] {
  const english = englishTermsIn(query).map(normalise);
  const words = normalise(`${query} ${english.join(" ")}`)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w) && !/[\u0900-\u097f]/.test(w))
    .map(stem);
  // Devanagari words with no glossary entry can still match Hindi text directly.
  const devanagari = normalise(query)
    .split(" ")
    .filter((w) => w.length > 1 && /[\u0900-\u097f]/.test(w));
  return [...new Set([...words, ...(english.length ? [] : devanagari)])];
}

export function rankItems(query: string, list: Item[]): { item: Item; score: number }[] {
  const base = baseTerms(query);
  if (base.length === 0) return [];
  const phrase = normalise(query);

  // Match at word starts so "sea" finds "sea-ice" but not "research"; plurals still match.
  const has = (text: string, term: string) => ` ${text}`.includes(` ${term}`);

  const scored = list.map((item) => {
    const title = normalise(item.title);
    const tags = normalise(item.tags.join(" "));
    const rest = normalise(
      `${item.summary} ${item.body} ${item.authors.join(" ")} ${item.region} ${item.type}`,
    );
    const all = `${title} ${tags} ${rest}`;
    let score = 0;
    let matched = 0;
    for (const t of base) {
      const related = RELATED[t] ?? [];
      const hit = has(all, t);
      if (hit) matched += 1;
      else if (related.some((r) => has(all, r))) matched += 0.5;
      if (has(title, t)) score += 3;
      if (has(tags, t)) score += 2;
      if (has(rest, t)) score += 1;
      related.forEach((r) => {
        if (has(all, r)) score += 0.5;
      });
    }
    if (phrase.length > 3 && has(all, phrase)) score += 4;
    return { item, score, matched };
  });

  // Prefer items that cover every query word; relax to half the words if nothing does.
  const strict = scored.filter((r) => r.matched >= base.length);
  const pool =
    strict.length > 0 ? strict : scored.filter((r) => r.matched >= Math.max(1, base.length / 2));
  return pool
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item, score }) => ({ item, score }));
}
