import type { Item } from "@/data/dhruva";

export type Audience = "scientist" | "student" | "public";

export type Enrichment = {
  autoTags?: string[] | undefined;
  transcript?: { time: string; text: string }[] | undefined;
  summaries?: Record<Audience, string>;
  workflow?: "published" | "in-review" | "draft";
};

const ENRICHMENT: Record<string, Enrichment> = {
  "sea-ice-observations-42": {
    workflow: "published",
    summaries: {
      scientist:
        "ASPeCt-protocol hourly sea-ice logs from ISEA-42, compared with twelve preceding seasons, document earlier-than-average fast-ice break-up near the Larsemann Hills.",
      student:
        "Scientists on the ship counted sea ice every hour. They found the ice near Bharati broke up earlier than in most of the last twelve years.",
      public:
        "India’s 42nd Antarctic expedition recorded sea ice between Cape Town and Prydz Bay. Fast ice around the Larsemann Hills broke up earlier than usual.",
    },
  },
  "amery-ice-shelf-thinning": {
    workflow: "published",
    summaries: {
      scientist:
        "Airborne radar from ISEA-43 plus 15 years of altimetry yield spatially resolved basal melt, including a persistent high-melt channel near the grounding zone.",
      student:
        "The Amery Ice Shelf is melting from below. Radar and satellites show a warm-water channel eating ice near where the shelf meets the land.",
      public:
        "New measurements show the Amery Ice Shelf is thinning from underneath, especially close to the coast where it is anchored.",
    },
  },
  "bharati-winter-photo": {
    autoTags: [
      "research station",
      "winter twilight",
      "Larsemann Hills",
      "container modules",
      "architecture",
    ],
    workflow: "published",
  },
  "ice-core-handling": {
    autoTags: ["ice core", "field camp", "glaciology", "researcher", "cold storage"],
    workflow: "published",
  },
  "polar-night-photo-essay": {
    autoTags: ["aurora australis", "polar night", "Maitri", "night sky", "long exposure"],
    workflow: "in-review",
  },
  "life-at-maitri": {
    workflow: "published",
    autoTags: ["station life", "overwintering", "documentary", "Maitri"],
    transcript: [
      {
        time: "00:12",
        text: "Maitri sits in the Schirmacher Oasis, a year-round Indian station on the Antarctic continent.",
      },
      {
        time: "02:40",
        text: "During the polar night the sun does not rise for nearly six weeks. The team keeps science, power and medical routines on a strict roster.",
      },
      {
        time: "08:15",
        text: "Weather records, ice observations and station logs continue through winter so the next summer team inherits a complete season.",
      },
      {
        time: "12:50",
        text: "When the sun returns, cargo flights and the relief voyage reopen the station to the wider programme.",
      },
    ],
  },
  "hindi-explainer-video": {
    workflow: "published",
    autoTags: ["education", "ice cores", "Hindi", "schools"],
    transcript: [
      { time: "00:08", text: "बर्फ़ की हर परत एक साल की बर्फबारी की कहानी है।" },
      {
        time: "01:55",
        text: "हवा के बुलबुलों में पुराने वायुमंडल की गैसें बंद हैं — कार्बन डाइऑक्साइड भी।",
      },
      {
        time: "04:20",
        text: "वैज्ञानिक इन परतों की गिनती और रासायनिक जाँच से जलवायु का इतिहास पढ़ते हैं।",
      },
      {
        time: "07:10",
        text: "भारत के अभियान पूर्वी अंटार्कटिका से छोटे क्रोड लाते हैं, जो प्रयोगशाला में सुरक्षित रखे जाते हैं।",
      },
    ],
  },
  "aerosol-composition-arctic": { workflow: "in-review" },
  "southern-ocean-carbon-flux": { workflow: "published" },
  "training-course-polar-logistics": { workflow: "draft" },
};

export function getEnrichment(item: Item): Required<Pick<Enrichment, "workflow">> & Enrichment {
  const extra = ENRICHMENT[item.id] ?? {};
  return {
    workflow: extra.workflow ?? "published",
    autoTags:
      extra.autoTags ??
      (item.type === "photo" || item.type === "video"
        ? item.tags.map((t) => t.toLowerCase())
        : undefined),
    transcript: extra.transcript,
    summaries: extra.summaries ?? {
      scientist: item.summary,
      student: item.summary,
      public: item.summary,
    },
  };
}
