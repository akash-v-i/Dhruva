import { expeditions, items, stations, type ContentType } from "@/data/dhruva";

export type NodeKind = "station" | "expedition" | "person" | ContentType;

export type GraphNode = {
  id: string;
  kind: NodeKind;
  label: string;
  /** Route target for the node's detail page, if any. */
  href?: { to: "/stations/$id" | "/expeditions/$id" | "/item/$id"; id: string };
  x: number;
  y: number;
  degree: number;
};

export type GraphEdge = { source: string; target: string; relation: string };

export const WIDTH = 1000;
export const HEIGHT = 700;

/** Builds the archive knowledge graph: stations, expeditions, people and records. */
export function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const add = (n: Omit<GraphNode, "x" | "y" | "degree">) => {
    if (!nodes.has(n.id)) nodes.set(n.id, { ...n, x: 0, y: 0, degree: 0 });
  };
  const link = (source: string, target: string, relation: string) => {
    if (!nodes.has(source) || !nodes.has(target)) return;
    edges.push({ source, target, relation });
    nodes.get(source)!.degree += 1;
    nodes.get(target)!.degree += 1;
  };

  stations.forEach((s) =>
    add({
      id: `st:${s.id}`,
      kind: "station",
      label: s.name,
      href: { to: "/stations/$id", id: s.id },
    }),
  );
  expeditions.forEach((e) =>
    add({
      id: `ex:${e.id}`,
      kind: "expedition",
      label: e.number,
      href: { to: "/expeditions/$id", id: e.id },
    }),
  );
  items.forEach((i) =>
    add({ id: `it:${i.id}`, kind: i.type, label: i.title, href: { to: "/item/$id", id: i.id } }),
  );
  // People who appear on more than one record are the interesting links between research threads.
  const authorCount = new Map<string, number>();
  items.forEach((i) => i.authors.forEach((a) => authorCount.set(a, (authorCount.get(a) ?? 0) + 1)));
  expeditions.forEach((e) => authorCount.set(e.leader, (authorCount.get(e.leader) ?? 0) + 1));
  authorCount.forEach((n, a) => n > 1 && add({ id: `pe:${a}`, kind: "person", label: a }));

  expeditions.forEach((e) => {
    e.stationIds.forEach((s) => link(`ex:${e.id}`, `st:${s}`, "visited"));
    link(`pe:${e.leader}`, `ex:${e.id}`, "led");
  });
  items.forEach((i) => {
    if (i.expeditionId) link(`it:${i.id}`, `ex:${i.expeditionId}`, "produced during");
    if (i.stationId) link(`it:${i.id}`, `st:${i.stationId}`, "recorded at");
    i.authors.forEach((a) => link(`pe:${a}`, `it:${i.id}`, "authored"));
  });

  const list = [...nodes.values()];
  layout(list, edges);
  return { nodes: list, edges };
}

/** Deterministic force-directed layout (same result on server and client). */
function layout(nodes: GraphNode[], edges: GraphEdge[]) {
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  // Seed hubs on an inner ring, everything else on an outer ring.
  nodes.forEach((n, i) => {
    const hub = n.kind === "station" || n.kind === "expedition";
    const r = hub ? 140 : 300;
    const a = (i / nodes.length) * Math.PI * 2 * (hub ? 3 : 1);
    n.x = WIDTH / 2 + r * Math.cos(a);
    n.y = HEIGHT / 2 + r * Math.sin(a) * 0.8;
  });
  const vx = new Float64Array(nodes.length);
  const vy = new Float64Array(nodes.length);
  for (let step = 0; step < 320; step++) {
    const cool = 1 - step / 320;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = 0.1;
          dy = 0.1;
          d2 = 0.02;
        }
        const f = 7000 / d2;
        const d = Math.sqrt(d2);
        vx[i] = vx[i]! + (dx / d) * f;
        vy[i] = vy[i]! + (dy / d) * f;
        vx[j] = vx[j]! - (dx / d) * f;
        vy[j] = vy[j]! - (dy / d) * f;
      }
    }
    edges.forEach((e) => {
      const i = index.get(e.source)!;
      const j = index.get(e.target)!;
      const a = nodes[i]!;
      const b = nodes[j]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 95) * 0.02;
      vx[i] = vx[i]! + (dx / d) * f;
      vy[i] = vy[i]! + (dy / d) * f;
      vx[j] = vx[j]! - (dx / d) * f;
      vy[j] = vy[j]! - (dy / d) * f;
    });
    nodes.forEach((n, i) => {
      vx[i] = vx[i]! + (WIDTH / 2 - n.x) * 0.0025;
      vy[i] = vy[i]! + (HEIGHT / 2 - n.y) * 0.004;
      n.x += Math.max(-12, Math.min(12, vx[i]! * cool));
      n.y += Math.max(-12, Math.min(12, vy[i]! * cool));
      vx[i] = vx[i]! * 0.5;
      vy[i] = vy[i]! * 0.5;
      n.x = Math.max(30, Math.min(WIDTH - 30, n.x));
      n.y = Math.max(30, Math.min(HEIGHT - 30, n.y));
    });
  }
  nodes.forEach((n) => {
    n.x = Math.round(n.x * 10) / 10;
    n.y = Math.round(n.y * 10) / 10;
  });
}

export const KIND_STYLE: Record<NodeKind, { color: string; label: string; hi: string }> = {
  station: { color: "oklch(0.52 0.16 252)", label: "Station", hi: "स्टेशन" },
  expedition: { color: "oklch(0.45 0.12 280)", label: "Expedition", hi: "अभियान" },
  person: { color: "oklch(0.6 0.02 250)", label: "Person", hi: "व्यक्ति" },
  report: { color: "oklch(0.62 0.11 185)", label: "Report", hi: "रिपोर्ट" },
  publication: { color: "oklch(0.55 0.13 160)", label: "Publication", hi: "प्रकाशन" },
  dataset: { color: "oklch(0.7 0.13 75)", label: "Dataset", hi: "डेटासेट" },
  photo: { color: "oklch(0.62 0.17 30)", label: "Photo", hi: "फ़ोटो" },
  video: { color: "oklch(0.58 0.18 350)", label: "Video", hi: "वीडियो" },
  activity: { color: "oklch(0.6 0.13 300)", label: "Activity", hi: "गतिविधि" },
};
