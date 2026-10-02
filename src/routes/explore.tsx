import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";
import {
  ALL_TAGS,
  CONTENT_TYPES,
  REGIONS,
  items as allItems,
  type ContentType,
} from "@/data/dhruva";
import { ItemCard } from "@/components/site/ItemCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { rankItems } from "@/lib/search";
import { logUnanswered } from "@/lib/gaps";

interface ExploreSearch {
  q?: string | undefined;
  type?: ContentType | undefined;
  region?: string | undefined;
  tag?: string | undefined;
  sort?: "newest" | "oldest" | "title" | undefined;
  page?: number | undefined;
}

const PAGE_SIZE = 6;

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => {
    const q = search["q"];
    const type = search["type"];
    const region = search["region"];
    const tag = search["tag"];
    const sort = search["sort"];
    const page = search["page"];
    return {
      q: typeof q === "string" && q ? q : undefined,
      type: CONTENT_TYPES.some((c) => c.id === type) ? (type as ContentType) : undefined,
      region: typeof region === "string" && region ? region : undefined,
      tag: typeof tag === "string" && tag ? tag : undefined,
      sort: sort === "oldest" || sort === "title" || sort === "newest" ? sort : undefined,
      page: typeof page === "number" && page > 1 ? page : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Explore the archive — Dhruva" },
      {
        name: "description",
        content:
          "Browse and filter polar reports, publications, datasets, photos, videos and activities by region, station, expedition, year and tag.",
      },
      { property: "og:title", content: "Explore the archive — Dhruva" },
      {
        property: "og:description",
        content:
          "Browse and filter polar reports, publications, datasets, photos, videos and activities.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const hi = useHindi();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const [draft, setDraft] = useState(search.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setSearch = (patch: Partial<ExploreSearch>) =>
    navigate({ search: (prev) => ({ ...prev, page: undefined, ...patch }) });

  // Keep the box in sync when the header search navigates here with a new query.
  useEffect(() => setDraft(search.q ?? ""), [search.q]);

  const results = useMemo(() => {
    const q = (search.q ?? "").trim();
    let list = allItems.filter((i) => {
      if (search.type && i.type !== search.type) return false;
      if (search.region && i.region !== search.region) return false;
      if (search.tag && !i.tags.includes(search.tag)) return false;
      return true;
    });
    if (q) {
      const ranked = rankItems(q, list).map((r) => r.item);
      // Default order for a query is relevance; an explicit sort choice overrides it.
      if (!search.sort) return ranked;
      list = ranked;
    }
    return list.slice().sort((a, b) => {
      if (search.sort === "oldest") return a.date.localeCompare(b.date);
      if (search.sort === "title") return a.title.localeCompare(b.title);
      return b.date.localeCompare(a.date);
    });
  }, [search]);

  // Empty searches feed the content-gap list on the Insights page.
  useEffect(() => {
    if (search.q && results.length === 0 && !search.type && !search.region && !search.tag)
      logUnanswered(search.q);
  }, [search.q, results.length, search.type, search.region, search.tag]);

  const page = search.page ?? 1;
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters: { label: string; clear: Partial<ExploreSearch> }[] = [];
  if (search.type)
    activeFilters.push({
      label: uiText(CONTENT_TYPES.find((c) => c.id === search.type)?.label ?? search.type, hi),
      clear: { type: undefined },
    });
  if (search.region)
    activeFilters.push({ label: uiText(search.region, hi), clear: { region: undefined } });
  if (search.tag) activeFilters.push({ label: search.tag, clear: { tag: undefined } });
  if (search.q) activeFilters.push({ label: `“${search.q}”`, clear: { q: undefined } });

  const facetCount = (fn: (i: (typeof allItems)[number]) => boolean) => allItems.filter(fn).length;

  const FilterPanel = (
    <div className="space-y-7">
      <FilterGroup title={hi ? "सामग्री का प्रकार" : "Content type"}>
        {CONTENT_TYPES.map((c) => (
          <FilterRow
            key={c.id}
            label={uiText(c.plural, hi)}
            count={facetCount((i) => i.type === c.id)}
            active={search.type === c.id}
            onClick={() => setSearch({ type: search.type === c.id ? undefined : c.id })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={hi ? "क्षेत्र" : "Region"}>
        {REGIONS.map((r) => (
          <FilterRow
            key={r}
            label={uiText(r, hi)}
            count={facetCount((i) => i.region === r)}
            active={search.region === r}
            onClick={() => setSearch({ region: search.region === r ? undefined : r })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={hi ? "विषय" : "Tags"}>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSearch({ tag: search.tag === t ? undefined : t })}
              className={`chip transition-colors ${search.tag === t ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </FilterGroup>

      <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
        {hi
          ? "प्रवेश स्तर और सामग्री स्थिति के फ़िल्टर कर्मचारियों के लिए उपलब्ध हैं।"
          : "Access-level and workflow-status filters are available to signed-in staff accounts."}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Explore" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold">{hi ? "संग्रह खोजें" : "Explore the archive"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "ध्रुव में प्रकाशित रिपोर्ट, प्रकाशन, डेटासेट, फ़ोटो, वीडियो और गतिविधियाँ खोजें और छाँटें।"
            : "Search and filter every published report, publication, dataset, photograph, video and activity in Dhruva."}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch({ q: draft || undefined });
        }}
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label={hi ? "संग्रह में खोजें" : "Search the archive"}
            placeholder={
              hi
                ? "रिपोर्ट, स्टेशन, अभियान और डेटा खोजें..."
                : "Search reports, stations, expeditions, datasets and more..."
            }
            className="w-full rounded-md border border-input bg-card py-3 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button type="submit" className="btn-base btn-primary py-3">
          {hi ? "खोजें" : "Search"}
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="btn-base btn-outline py-3 lg:hidden"
        >
          <SlidersHorizontal className="size-4" /> {hi ? "फ़िल्टर" : "Filters"}
        </button>
      </form>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {hi ? "सक्रिय फ़िल्टर:" : "Active filters:"}
          </span>
          {activeFilters.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setSearch(f.clear)}
              className="chip border-primary/40 bg-primary/10 hover:bg-primary/20"
            >
              {f.label} <X className="size-3" />
            </button>
          ))}
          <Link
            to="/explore"
            search={{}}
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            {hi ? "सभी हटाएँ" : "Clear all"}
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">{FilterPanel}</aside>
        {filtersOpen && (
          <div className="rounded-lg border border-border bg-card p-5 lg:hidden">{FilterPanel}</div>
        )}

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <p className="text-sm text-muted-foreground">
              {results.length === 0
                ? hi
                  ? "कोई परिणाम नहीं"
                  : "No results"
                : hi
                  ? `${results.length} में से ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, results.length)} परिणाम`
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, results.length)} of ${results.length} result${results.length === 1 ? "" : "s"}`}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{hi ? "क्रम" : "Sort"}</span>
              <select
                value={search.sort ?? (search.q ? "relevance" : "newest")}
                onChange={(e) =>
                  setSearch({
                    sort:
                      e.target.value === "relevance"
                        ? undefined
                        : (e.target.value as ExploreSearch["sort"]),
                  })
                }
                className="rounded-md border border-input bg-card px-2 py-1.5 text-sm outline-none focus:border-primary"
              >
                {search.q && (
                  <option value="relevance">{hi ? "सबसे प्रासंगिक" : "Most relevant"}</option>
                )}
                <option value="newest">{hi ? "नए पहले" : "Newest first"}</option>
                <option value="oldest">{hi ? "पुराने पहले" : "Oldest first"}</option>
                <option value="title">{hi ? "शीर्षक अ–ज्ञ" : "Title A–Z"}</option>
              </select>
            </label>
          </div>

          {current.length > 0 ? (
            <div className="mt-5 space-y-4">
              {current.map((i) => (
                <ItemCard key={i.id} item={i} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-border bg-ice p-10 text-center">
              <p className="font-display text-lg font-semibold">
                {hi ? "कोई मेल खाती सामग्री नहीं मिली" : "No matching items were found"}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {hi
                  ? "व्यापक विषय खोजें, फ़िल्टर हटाएँ या ध्रुव से सवाल पूछें।"
                  : "Try a broader topic, remove a filter, or ask Polar a question about this subject."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link to="/explore" search={{}} className="btn-base btn-outline">
                  {hi ? "फ़िल्टर हटाएँ" : "Clear filters"}
                </Link>
                <Link to="/ask" search={{ q: search.q }} className="btn-base btn-primary">
                  <Sparkles className="size-4" />{" "}
                  {hi ? "इस विषय पर ध्रुव से पूछें" : "Ask Polar about this topic"}
                </Link>
              </div>
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => navigate({ search: (p) => ({ ...p, page: page - 1 }) })}
                className="btn-base btn-outline disabled:opacity-40"
              >
                {hi ? "पिछला" : "Previous"}
              </button>
              <p className="text-sm text-muted-foreground">
                {hi ? `पृष्ठ ${page} / ${pages}` : `Page ${page} of ${pages}`}
              </p>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => navigate({ search: (p) => ({ ...p, page: page + 1 }) })}
                className="btn-base btn-outline disabled:opacity-40"
              >
                {hi ? "अगला" : "Next"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <div className="mt-3 space-y-1">{children}</div>
    </div>
  );
}

function FilterRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        active ? "bg-primary/10 font-semibold text-primary" : "hover:bg-ice"
      }`}
    >
      <span>{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </button>
  );
}
