import {
  ALL_TAGS,
  expeditions,
  items,
  stations,
  type ContentType,
  type Item,
  type Region,
} from "@/data/dhruva";
import { rankItems } from "@/lib/search";

// Client-side stand-in for the ingestion pipeline (OCR → metadata → tags → duplicates →
// summaries → graph links). Every suggestion is shown to an editor before publication.

export type Enriched = {
  title: string;
  type: ContentType;
  region: Region | "";
  stationId: string;
  expeditionId: string;
  year: number;
  authors: string[];
  tags: string[];
  summaries: { scientist: string; student: string; public: string };
  duplicate: { item: Item; similarity: number } | null;
  related: Item[];
  textConfidence: "high" | "low" | "none";
  wordCount: number;
};

const REGION_WORDS: [Region, RegExp][] = [
  ["Southern Ocean", /southern ocean|polar front|circumpolar|marginal ice zone|subantarctic/i],
  ["Arctic", /\barctic|svalbard|ny-?ålesund|ny-?alesund|himadri|kongsfjorden|spitsbergen|tromsø/i],
  ["Himalaya", /himalaya|chandra basin|himansh|lahaul|ladakh/i],
  [
    "Antarctica",
    /\bantarctic|maitri|bharati|larsemann|prydz|schirmacher|dakshin gangotri|queen maud/i,
  ],
];

const KEYWORD_TAGS: [RegExp, string][] = [
  [/sea[- ]ice/i, "Sea ice"],
  [/ice[- ]shelf/i, "Ice shelf"],
  [/ice[- ]core/i, "Ice cores"],
  [/glacier|glaciolog/i, "Glaciology"],
  [/ozone/i, "Ozone"],
  [/aerosol/i, "Aerosols"],
  [/wind|blizzard|katabatic/i, "Meteorology"],
  [/temperature|weather|meteorolog/i, "Meteorology"],
  [/penguin|seal|whale|krill|seabird|wildlife/i, "Wildlife"],
  [/ocean|ctd|salinity|hydrograph/i, "Oceanography"],
  [/carbon|co2|pco2/i, "Carbon"],
  [/climate|warming/i, "Climate"],
  [/school|student|teacher|lecture|explainer/i, "Education"],
  [/outreach|exhibition|public/i, "Outreach"],
  [/geolog|rock|moraine/i, "Geology"],
  [/lake|limnolog/i, "Limnology"],
  [/microb|bacteria/i, "Microbiology"],
  [/aurora/i, "Aurora"],
  [/snow/i, "Snow"],
];

// Archive tags too broad to be useful as suggestions.
const GENERIC_TAGS = new Set(["Station", "Stations", "Expedition", "Winter", "Safety"]);

// Words replaced in the student summary so a class 9 reader can follow it.
const PLAIN: [RegExp, string][] = [
  [/\bkatabatic winds?\b/gi, "cold winds that rush downhill"],
  [/\bcryosphere\b/gi, "frozen parts of the Earth"],
  [/\banomal(y|ies)\b/gi, "unusual change"],
  [/\bbasal melt\b/gi, "melting from below"],
  [/\bmass balance\b/gi, "ice gained minus ice lost"],
  [/\bobservations?\b/gi, "measurements"],
  [/\bmeteorological\b/gi, "weather"],
  [/\bprecipitation\b/gi, "snow and rain"],
  [/\bsubsequently\b/gi, "later"],
  [/\bapproximately\b/gi, "about"],
];

function sentencesOf(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\b(Dr|Mr|Ms|Prof|St|e\.g|i\.e)\./g, "$1․")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/․/g, ".").trim())
    .filter((s) => s.length > 25);
}

function words(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}

function jaccard(a: string, b: string) {
  const A = words(a);
  const B = words(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  A.forEach((w) => B.has(w) && inter++);
  return inter / (A.size + B.size - inter);
}

export function guessType(fileName: string, mime: string, text: string): ContentType {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  if (/\.(csv|nc|netcdf|xlsx?|json)$/i.test(fileName)) return "dataset";
  if (/\bdoi\b|journal|abstract|peer[- ]review/i.test(text)) return "publication";
  if (
    /\b(workshop|webinar|exhibition|school visit|training (course|programme)|outreach event|video call)\b/i.test(
      text,
    )
  )
    return "activity";
  if (/\bdataset\b|time series|daily values|netcdf/i.test(text)) return "dataset";
  return "report";
}

export function enrich(input: {
  fileName: string;
  mime: string;
  text: string;
  visionTags?: string[];
}): Enriched {
  const text = input.text.trim();
  const all = `${input.fileName} ${text}`;
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] ?? "";
  const fromFile = input.fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const titleFromText =
    firstLine.length > 0 && firstLine.length <= 110 && !/[.!?]$/.test(firstLine);
  const title = titleFromText ? firstLine : fromFile;
  // Summaries come from the body: skip the title line and credit lines ("Dr. X and Y, team…").
  const body = lines
    .slice(titleFromText ? 1 : 0)
    .filter((l) => !/^((Dr|Prof)\.?\s|[A-Z]\.\s[A-Z]|photo by|credit)/i.test(l))
    .join("\n");
  const sentences = sentencesOf(body || text);

  const region = REGION_WORDS.find(([, re]) => re.test(all))?.[0] ?? "";
  const station = stations.find((s) => new RegExp(s.name.replace(/\s+/g, "[- ]?"), "i").test(all));
  const expedition =
    expeditions.find((e) => new RegExp(e.number.replace("-", "[- ]?"), "i").test(all)) ??
    expeditions.find((e) => all.toLowerCase().includes(e.name.toLowerCase()));

  const years = (all.match(/\b(19[89]\d|20[0-4]\d)\b/g) ?? []).map(Number);
  const year = years.length ? Math.max(...years) : new Date().getFullYear();

  const authors = Array.from(
    new Set(
      all.match(/\b(?:Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|\b[A-Z]\.\s[A-Z][a-z]+/g) ?? [],
    ),
  ).slice(0, 4);

  const tagSet = new Set<string>();
  ALL_TAGS.forEach((t) => {
    if (GENERIC_TAGS.has(t)) return;
    if (t.length > 3 && new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(all))
      tagSet.add(t);
  });
  KEYWORD_TAGS.forEach(([re, tag]) => re.test(all) && tagSet.add(tag));
  input.visionTags?.forEach((t) => tagSet.add(t));
  const tags = [...tagSet].slice(0, 8);

  const scientist = sentences.slice(0, 2).join(" ") || text.slice(0, 280);
  let student = sentences
    .slice()
    .sort((a, b) => a.length - b.length)
    .slice(0, 2)
    .join(" ");
  PLAIN.forEach(([re, plain]) => (student = student.replace(re, plain)));
  const where = station ? `${station.name} station` : region || "the polar regions";
  const publicSum = sentences[0]
    ? `New from ${where}: ${sentences[0].charAt(0).toLowerCase()}${sentences[0].slice(1)}`
    : `New material from ${where}.`;

  const probe = `${title} ${sentences.slice(0, 3).join(" ")}`;
  const best = items
    .map((item) => ({
      item,
      similarity: jaccard(probe, `${item.title} ${item.summary} ${item.body}`),
    }))
    .sort((a, b) => b.similarity - a.similarity)[0];
  const duplicate = best && best.similarity >= 0.22 ? best : null;
  const related = rankItems(`${title} ${tags.join(" ")}`, items)
    .map((r) => r.item)
    .filter((i) => i.id !== duplicate?.item.id)
    .slice(0, 3);

  const wordCount = text ? text.split(/\s+/).length : 0;
  return {
    title,
    type: guessType(input.fileName, input.mime, text),
    region,
    stationId: station?.id ?? "",
    expeditionId: expedition?.id ?? "",
    year,
    authors,
    tags,
    summaries: { scientist, student: student || scientist, public: publicSum },
    duplicate,
    related,
    textConfidence: wordCount > 40 ? "high" : wordCount > 0 ? "low" : "none",
    wordCount,
  };
}

/** Rough on-device image analysis: brightness and colour balance → scene suggestions. */
export async function analyseImage(url: string): Promise<string[]> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, 64, 64);
  const { data } = ctx.getImageData(0, 0, 64, 64);
  let bright = 0;
  let blue = 0;
  let dark = 0;
  let warm = 0;
  let topBlue = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum > 200 && Math.abs(r - b) < 40) bright++;
    if (b > r + 20 && b > g) {
      blue++;
      if (i < data.length / 3) topBlue++;
    }
    if (lum < 60) dark++;
    if (r > 150 && r > b + 40) warm++;
  }
  const n = data.length / 4;
  const tags: string[] = [];
  if (bright / n > 0.25) tags.push("snow and ice");
  if (blue / n > 0.2) tags.push("open water");
  if (topBlue / (n / 3) > 0.3) tags.push("clear sky");
  if (dark / n > 0.45) tags.push("low light");
  if (warm / n > 0.04) tags.push("people or equipment");
  if (tags.length === 0) tags.push("landscape");
  return tags;
}
