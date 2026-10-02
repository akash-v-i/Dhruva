export type GapEntry = { q: string; at: string; count: number };

const KEY = "dhruva-content-gaps";

const SEED: GapEntry[] = [
  { q: "Has India measured microplastics in Antarctic snow?", at: "2026-09-12", count: 18 },
  {
    q: "What is the winter population of emperor penguins near Bharati?",
    at: "2026-09-18",
    count: 11,
  },
  { q: "Are there Hindi lesson plans on katabatic winds?", at: "2026-09-22", count: 9 },
  { q: "How does polar warming affect the Indian monsoon?", at: "2026-09-25", count: 27 },
];

export function readGaps(): GapEntry[] {
  const sortedSeed = [...SEED].sort((a, b) => b.count - a.count);
  if (typeof window === "undefined") return sortedSeed;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return sortedSeed;
    const extra = JSON.parse(raw) as GapEntry[];
    const map = new Map<string, GapEntry>();
    [...SEED, ...extra].forEach((g) => {
      const k = g.q.toLowerCase();
      const prev = map.get(k);
      map.set(k, prev ? { ...prev, count: prev.count + g.count } : g);
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  } catch {
    return sortedSeed;
  }
}

export function logUnanswered(question: string) {
  if (typeof window === "undefined") return;
  const q = question.trim();
  if (q.length < 8) return;
  const extra: GapEntry[] = (() => {
    try {
      return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as GapEntry[];
    } catch {
      return [];
    }
  })();
  const i = extra.findIndex((e) => e.q.toLowerCase() === q.toLowerCase());
  if (i >= 0)
    extra[i] = {
      ...extra[i]!,
      count: extra[i]!.count + 1,
      at: new Date().toISOString().slice(0, 10),
    };
  else extra.push({ q, at: new Date().toISOString().slice(0, 10), count: 1 });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(extra.slice(-40)));
  } catch {
    /* storage full or blocked — the gap is simply not recorded */
  }
}
