import type { Access, ContentType, Region } from "@/data/dhruva";

// Uploads made on the Contribute page. Kept in this browser so the demo's review queue
// can show them; the production system stores them server-side.

export type Submission = {
  id: string;
  title: string;
  type: ContentType;
  region: Region | "";
  stationId: string;
  expeditionId: string;
  year: number;
  authors: string[];
  tags: string[];
  licence: string;
  access: Access;
  embargoUntil?: string | undefined;
  summary: string;
  status?: "in-review" | "published" | "on-hold" | undefined;
  fileName: string;
  submittedAt: string;
};

const KEY = "dhruva-submissions";

export function readSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Submission[];
  } catch {
    return [];
  }
}

export function saveSubmission(s: Submission) {
  try {
    const list = readSubmissions().filter((x) => x.id !== s.id);
    window.localStorage.setItem(KEY, JSON.stringify([s, ...list].slice(0, 30)));
  } catch {
    /* storage unavailable — the submission simply isn't kept */
  }
}

export function removeSubmission(id: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(readSubmissions().filter((x) => x.id !== id)));
  } catch {
    /* ignore */
  }
}
