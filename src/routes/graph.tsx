import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Network, RotateCcw, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { HEIGHT, KIND_STYLE, WIDTH, buildGraph, type GraphNode, type NodeKind } from "@/lib/graph";
import { useHindi } from "@/lib/language";

export const Route = createFileRoute("/graph")({
  head: () => ({
    meta: [
      { title: "Knowledge graph — Dhruva" },
      {
        name: "description",
        content:
          "Explore how India's polar stations, expeditions, scientists, datasets, publications and media connect.",
      },
    ],
  }),
  component: KnowledgeGraph,
});

const GRAPH = buildGraph();
const KINDS = Object.keys(KIND_STYLE) as NodeKind[];

function radius(n: GraphNode) {
  if (n.kind === "station" || n.kind === "expedition") return 12 + Math.min(n.degree, 16) * 0.5;
  if (n.kind === "person") return 6 + Math.min(n.degree, 8) * 0.5;
  return 6;
}

function KnowledgeGraph() {
  const hi = useHindi();
  const [hidden, setHidden] = useState<Set<NodeKind>>(new Set());
  const [selected, setSelected] = useState<string | null>("st:bharati");
  const [hover, setHover] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => GRAPH.nodes.filter((n) => !hidden.has(n.kind)), [hidden]);
  const visibleIds = useMemo(() => new Set(visible.map((n) => n.id)), [visible]);
  const edges = useMemo(
    () => GRAPH.edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [visibleIds],
  );
  const byId = useMemo(() => new Map(GRAPH.nodes.map((n) => [n.id, n])), []);

  const focus = hover ?? selected;
  const neighbours = useMemo(() => {
    const set = new Set<string>();
    if (!focus) return set;
    set.add(focus);
    edges.forEach((e) => {
      if (e.source === focus) set.add(e.target);
      if (e.target === focus) set.add(e.source);
    });
    return set;
  }, [focus, edges]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      q.length > 1
        ? new Set(visible.filter((n) => n.label.toLowerCase().includes(q)).map((n) => n.id))
        : null,
    [q, visible],
  );

  const sel = selected ? byId.get(selected) : undefined;
  const connections = sel
    ? edges
        .filter((e) => e.source === sel.id || e.target === sel.id)
        .map((e) => ({
          node: byId.get(e.source === sel.id ? e.target : e.source)!,
          relation: e.relation,
        }))
        .sort((a, b) => a.node.kind.localeCompare(b.node.kind))
    : [];

  const toggle = (k: NodeKind) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const dim = (id: string) => (matches ? !matches.has(id) : focus ? !neighbours.has(id) : false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Knowledge graph" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-2">
            <Network className="size-3.5" /> {hi ? "ज्ञान ग्राफ़" : "Knowledge graph"}
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {hi ? "सब कुछ कैसे जुड़ा है" : "How everything connects"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {hi
              ? "हर रिपोर्ट, डेटासेट, फ़ोटो और वीडियो अपने अभियान, स्टेशन और वैज्ञानिकों से जुड़ा है। किसी भी बिंदु पर क्लिक करें।"
              : "Every report, dataset, photo and video is linked to the expedition, station and scientists behind it. Click any node to follow the connections."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {GRAPH.nodes.length} {hi ? "बिंदु" : "nodes"} · {GRAPH.edges.length}{" "}
          {hi ? "संबंध" : "links"}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => toggle(k)}
            aria-pressed={!hidden.has(k)}
            className={`chip py-1 transition-opacity ${hidden.has(k) ? "opacity-40" : ""}`}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: KIND_STYLE[k].color }}
            />
            {hi ? KIND_STYLE[k].hi : KIND_STYLE[k].label}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={hi ? "बिंदु खोजें…" : "Find a node…"}
            aria-label={hi ? "ग्राफ़ में खोजें" : "Search the graph"}
            className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_center,var(--ice),var(--background))]">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-auto w-full"
            role="img"
            aria-label={hi ? "ज्ञान ग्राफ़" : "Knowledge graph of the polar archive"}
            onClick={() => setSelected(null)}
          >
            <g>
              {edges.map((e, i) => {
                const a = byId.get(e.source)!;
                const b = byId.get(e.target)!;
                const on = focus && (e.source === focus || e.target === focus);
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={on ? "oklch(0.52 0.16 252)" : "oklch(0.75 0.03 245)"}
                    strokeWidth={on ? 1.8 : 0.8}
                    opacity={focus && !on ? 0.15 : on ? 0.9 : 0.45}
                  />
                );
              })}
            </g>
            {visible.map((n) => {
              const r = radius(n);
              const isSel = n.id === selected;
              const faded = dim(n.id);
              const showLabel =
                n.kind === "station" ||
                n.kind === "expedition" ||
                isSel ||
                n.id === hover ||
                (focus && neighbours.has(n.id) && n.kind === "person") ||
                matches?.has(n.id);
              return (
                <g
                  key={n.id}
                  className="cursor-pointer"
                  opacity={faded ? 0.18 : 1}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setSelected(n.id);
                  }}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${KIND_STYLE[n.kind].label}: ${n.label}`}
                  onKeyDown={(ev) => ev.key === "Enter" && setSelected(n.id)}
                >
                  {isSel && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r + 7}
                      fill={KIND_STYLE[n.kind].color}
                      opacity={0.2}
                    />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r}
                    fill={KIND_STYLE[n.kind].color}
                    stroke="white"
                    strokeWidth={isSel ? 3 : 1.5}
                  />
                  {showLabel && (
                    <text
                      x={n.x}
                      y={n.y - r - 5}
                      textAnchor="middle"
                      fontSize={n.kind === "station" || n.kind === "expedition" ? 13 : 11}
                      fontWeight={
                        n.kind === "station" || n.kind === "expedition" || isSel ? 700 : 500
                      }
                      fill="oklch(0.27 0.062 258)"
                      stroke="white"
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {n.label.length > 34 ? `${n.label.slice(0, 32)}…` : n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-ice p-5">
            {sel ? (
              <>
                <p className="eyebrow" style={{ color: KIND_STYLE[sel.kind].color }}>
                  {hi ? KIND_STYLE[sel.kind].hi : KIND_STYLE[sel.kind].label}
                </p>
                <p className="mt-1 font-display text-lg font-semibold leading-snug">{sel.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {connections.length} {hi ? "सीधे संबंध" : "direct connections"}
                </p>
                {sel.href && (
                  <Link
                    to={sel.href.to}
                    params={{ id: sel.href.id }}
                    className="btn-base btn-primary mt-4 py-1.5 text-xs"
                  >
                    {hi ? "पूरा रिकॉर्ड खोलें" : "Open full record"}{" "}
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {hi
                  ? "संबंध देखने के लिए किसी बिंदु पर क्लिक करें।"
                  : "Click a node to see what it connects to."}
              </p>
            )}
          </div>

          {sel && connections.length > 0 && (
            <div className="rounded-lg border border-border p-5">
              <p className="eyebrow">{hi ? "संबंध" : "Connections"}</p>
              <ul className="mt-3 max-h-[26rem] space-y-1 overflow-y-auto pr-1 text-sm">
                {connections.map(({ node, relation }) => (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(node.id)}
                      onMouseEnter={() => setHover(node.id)}
                      onMouseLeave={() => setHover(null)}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-ice"
                    >
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: KIND_STYLE[node.kind].color }}
                      />
                      <span className="min-w-0">
                        <span className="block leading-snug">{node.label}</span>
                        <span className="text-xs text-muted-foreground">{relation}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setHidden(new Set());
              setQuery("");
              setSelected(null);
            }}
            className="btn-base btn-outline py-2 text-xs"
          >
            <RotateCcw className="size-3.5" /> {hi ? "दृश्य रीसेट करें" : "Reset view"}
          </button>
        </aside>
      </div>
    </div>
  );
}
