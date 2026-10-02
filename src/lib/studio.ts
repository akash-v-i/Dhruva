import type { Item } from "@/data/dhruva";
import { getEnrichment } from "@/data/enrichment";

export type Channel =
  "x" | "instagram" | "linkedin" | "press" | "news" | "newsletter" | "quiz" | "card";

export type Claim = {
  text: string;
  channels: Channel[];
  supported: boolean;
  /** Numbers in the sentence that do not appear anywhere in the source record. */
  missingNumbers: string[];
  note: string;
};

export type ContentKit = {
  itemId: string;
  summaries: { scientist: string; student: string; public: string };
  channels: Record<Channel, string>;
  claims: Claim[];
  score: number;
  unsupported: number;
  canApprove: boolean;
};

export const LIMITS: Record<Channel, number> = {
  x: 280,
  instagram: 2200,
  linkedin: 3000,
  press: 1200,
  news: 600,
  newsletter: 400,
  quiz: 300,
  card: 90,
};

export const APPROVAL_THRESHOLD = 80;

function clip(text: string, n: number) {
  if (text.length <= n) return text;
  return `${text.slice(0, n - 1).replace(/\s+\S*$/, "")}…`;
}

function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[-–—/]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

// Template text the portal adds around generated prose — credits, licences, hashtags, quiz
// scaffolding and references to Dhruva itself — comes from record fields, not from the model,
// so it is not treated as a factual claim.
const TEMPLATE_LINE =
  /^(credit|licence|license|attribution|source|press note|quick quiz|answer:|[a-d]\)|#|📷)/iu;
const TEMPLATE_SENTENCE = /dhruva/i;
const HOLD = "\u0000";

function sentences(block: string): string[] {
  return block
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !TEMPLATE_LINE.test(line))
    .flatMap((line) =>
      line
        // Don't break after abbreviations or initials such as "Dr." or "S. Prabhakar".
        .replace(/\b(Dr|Mr|Ms|Mrs|Prof|St|e\.g|i\.e|et al|[A-Z])\./g, `$1${HOLD}`)
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.split(HOLD).join(".").trim()),
    )
    .map((s) => s.replace(/^this week in polar science\s*[—-]\s*/i, ""))
    .filter((s) => s.length > 30 && !TEMPLATE_SENTENCE.test(s));
}

function numbersIn(text: string) {
  return text.match(/\d+(?:[.,]\d+)?/g) ?? [];
}

function checkClaim(sentence: string, source: string, sourceNumbers: Set<string>) {
  const missingNumbers = numbersIn(sentence).filter((n) => !sourceNumbers.has(n.replace(",", "")));
  const words = normalise(sentence)
    .split(" ")
    .filter((w) => w.length > 3);
  const overlap =
    words.length === 0 ? 1 : words.filter((w) => source.includes(w)).length / words.length;
  const supported = missingNumbers.length === 0 && overlap >= 0.5;
  const note = supported
    ? "Matched against the source summary, body and metadata."
    : missingNumbers.length > 0
      ? `Figure ${missingNumbers.join(", ")} does not appear in the source record.`
      : "Most of this sentence is not found in the source record.";
  return { supported, missingNumbers, note };
}

const UNSUPPORTED =
  "Latest satellite counts show 87 kilometres of ice-shelf retreat in a single week.";

export function buildKit(item: Item, injectUnsupported = true): ContentKit {
  const enrich = getEnrichment(item);
  const summaries = enrich.summaries ?? {
    scientist: item.summary,
    student: item.summary,
    public: item.summary,
  };
  const publicSum = summaries.public;
  const credit = item.authors[0] ?? "Dhruva archive";
  const meta = `${item.region} · ${item.year} · ${item.licence}`;
  const extra = injectUnsupported ? ` ${UNSUPPORTED}` : "";

  const channels: Record<Channel, string> = {
    x: clip(`${publicSum}${extra}\n\nSource: ${item.title} · ${item.licence}`, LIMITS.x),
    instagram: clip(
      `${publicSum}\n\n📷 ${item.title}\nCredit: ${credit}\n${meta}\n\n#PolarScience #Dhruva #NCPOR #Antarctica`,
      LIMITS.instagram,
    ),
    linkedin: clip(
      `${item.title}\n\n${item.summary}\n\n${item.body}\n\nSource: ${item.authors.join(", ")} (${item.year}), Dhruva polar archive. Licence: ${item.licence}.`,
      LIMITS.linkedin,
    ),
    press: clip(
      `Press note — ${item.title}\n\n${publicSum}${extra}\n\n${item.body}\n\nAttribution: ${item.authors.join(", ")} (${item.year}). Full record available in the Dhruva Polar Knowledge Portal.`,
      LIMITS.press,
    ),
    news: clip(
      `${item.title}\n\n${item.summary}\n\nSource: Dhruva polar archive · ${item.licence}`,
      LIMITS.news,
    ),
    newsletter: clip(`This week in polar science — ${summaries.student}`, LIMITS.newsletter),
    quiz: clip(
      `Quick quiz: Which polar region does the record “${item.title}” come from?\nA) Arctic  B) Antarctica  C) Southern Ocean  D) Himalaya\nAnswer: ${item.region}.`,
      LIMITS.quiz,
    ),
    card: clip(`${item.title} — ${item.region}, ${item.year}`, LIMITS.card),
  };

  const sourceText = [
    item.title,
    item.summary,
    item.body,
    item.tags.join(" "),
    item.authors.join(" "),
    item.region,
    item.licence,
    String(item.year),
    item.date,
    item.expeditionId ?? "",
    item.stationId ?? "",
    summaries.scientist,
    summaries.student,
    summaries.public,
    ...Object.values(item.meta ?? {}),
  ].join(" ");
  const source = normalise(sourceText);
  const sourceNumbers = new Set(numbersIn(sourceText).map((n) => n.replace(",", "")));

  const byText = new Map<string, Claim>();
  (Object.entries(channels) as [Channel, string][]).forEach(([channel, block]) => {
    // A clipped trailing sentence is not a finished claim.
    sentences(block)
      .filter((s) => !s.endsWith("…"))
      .forEach((text) => {
        const existing = byText.get(text);
        if (existing) {
          existing.channels.push(channel);
          return;
        }
        byText.set(text, { text, channels: [channel], ...checkClaim(text, source, sourceNumbers) });
      });
  });

  // Flagged sentences first so reviewers see them without scrolling.
  const claims = [...byText.values()].sort((a, b) => Number(a.supported) - Number(b.supported));
  const unsupported = claims.filter((c) => !c.supported).length;
  const score =
    claims.length === 0 ? 100 : Math.round(((claims.length - unsupported) / claims.length) * 100);

  return {
    itemId: item.id,
    summaries,
    channels,
    claims,
    score,
    unsupported,
    // Below the threshold, or any unverified figure, and the kit cannot go to an editor.
    canApprove: score >= APPROVAL_THRESHOLD && claims.every((c) => c.missingNumbers.length === 0),
  };
}
