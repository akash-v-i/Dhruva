import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Network,
  ScanText,
  Send,
  Sparkles,
  Tags,
  Upload,
  Users,
} from "lucide-react";
import {
  CONTENT_TYPES,
  IMAGES,
  REGIONS,
  expeditions,
  stations,
  typeLabel,
  type Access,
  type ContentType,
  type Region,
} from "@/data/dhruva";
import { analyseImage, enrich, type Enriched } from "@/lib/enrich";
import { saveSubmission } from "@/lib/submissions";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute material — Dhruva" },
      {
        name: "description",
        content:
          "Upload a report, dataset, photo or video once. Dhruva extracts text, fills metadata, suggests tags, checks for duplicates and drafts summaries for editor review.",
      },
    ],
  }),
  component: Contribute,
});

type Sample = {
  id: string;
  label: string;
  hi: string;
  fileName: string;
  mime: string;
  text: string;
  image?: string;
  visionTags?: string[];
};

const SAMPLES: Sample[] = [
  {
    id: "blizzard",
    label: "Field report (text)",
    hi: "क्षेत्र रिपोर्ट (पाठ)",
    fileName: "maitri-winter-blizzard-log-2024.txt",
    mime: "text/plain",
    text: `Winter Blizzard Log, Maitri Station 2024
Dr. Meera Iyer and V. Joshi, overwintering team, Maitri station, Schirmacher Oasis, Antarctica.
Between May and August 2024 the overwintering team recorded eleven blizzard events at Maitri, with katabatic winds from the polar plateau exceeding 100 km/h on four days. Visibility fell below 50 metres during the strongest events and outdoor work was suspended for a total of 19 days.
The automatic weather station and manual observations were compared hourly, and snow drift was measured at six stakes around the station. The longest blizzard lasted 72 hours in late June, during the polar night.
The log recommends extra anchoring for antenna masts and a revised safety roster for outdoor observations during high winds.`,
  },
  {
    id: "duplicate",
    label: "Resubmitted report (duplicate)",
    hi: "दोबारा भेजी गई रिपोर्ट (प्रतिलिपि)",
    fileName: "sea-ice-observations-expedition-42-final.txt",
    mime: "text/plain",
    text: `Antarctic Sea-Ice Observations from Expedition 42
Analysis of sea-ice concentration, thickness and floe distribution recorded during the ISEA-42 voyage between Cape Town and Prydz Bay.
Sea-ice observations were logged hourly during daylight transit using the ASPeCt protocol. The report compares 2022–23 observations with the twelve preceding seasons and documents an earlier-than-average break-up of fast ice near the Larsemann Hills.`,
  },
  {
    id: "photo",
    label: "Field photo",
    hi: "क्षेत्र फ़ोटो",
    fileName: "bharati-coast-icebergs-jan-2024.webp",
    mime: "image/webp",
    text: "Coastline near Bharati station with icebergs in Prydz Bay, photographed in January 2024 during ISEA-43. Photo by R. Sen.",
    image: IMAGES.coast,
    visionTags: ["icebergs", "mountains", "rocky coast", "sea ice"],
  },
];

const STEPS = [
  {
    id: "extract",
    icon: ScanText,
    en: "Extracting text and file metadata",
    hi: "पाठ और फ़ाइल जानकारी निकाली जा रही है",
  },
  {
    id: "metadata",
    icon: FileText,
    en: "Detecting region, station, expedition and authors",
    hi: "क्षेत्र, स्टेशन, अभियान और लेखक पहचाने जा रहे हैं",
  },
  { id: "tags", icon: Tags, en: "Suggesting subject tags", hi: "विषय टैग सुझाए जा रहे हैं" },
  {
    id: "duplicates",
    icon: AlertTriangle,
    en: "Checking the archive for duplicates",
    hi: "संग्रह में प्रतिलिपि जाँची जा रही है",
  },
  {
    id: "summaries",
    icon: Users,
    en: "Drafting scientist, student and public summaries",
    hi: "वैज्ञानिक, विद्यार्थी और जनता के सारांश बन रहे हैं",
  },
  {
    id: "graph",
    icon: Network,
    en: "Linking to the knowledge graph",
    hi: "ज्ञान ग्राफ़ से जोड़ा जा रहा है",
  },
] as const;

function Contribute() {
  const hi = useHindi();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [mime, setMime] = useState("");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [visionTags, setVisionTags] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [result, setResult] = useState<Enriched | null>(null);
  const [form, setForm] = useState<{
    title: string;
    type: ContentType;
    region: Region | "";
    stationId: string;
    expeditionId: string;
    year: number;
    authors: string;
    tags: string[];
    licence: string;
    access: Access;
    embargoUntil: string;
  } | null>(null);
  const [audience, setAudience] = useState<"scientist" | "student" | "public">("public");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const reset = () => {
    setResult(null);
    setForm(null);
    setStepIndex(-1);
    setError(null);
  };

  const loadSample = (s: Sample) => {
    reset();
    setFileName(s.fileName);
    setMime(s.mime);
    setText(s.text);
    setPreview(s.image ?? null);
    setVisionTags(s.visionTags ?? []);
  };

  const loadFile = async (file: File) => {
    reset();
    setFileName(file.name);
    setMime(file.type);
    setVisionTags([]);
    setPreview(null);
    if (file.size > 25 * 1024 * 1024) {
      setError(
        hi ? "डेमो में 25 MB तक की फ़ाइल स्वीकार है।" : "The demo accepts files up to 25 MB.",
      );
      return;
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setText("");
      try {
        setVisionTags(await analyseImage(url));
      } catch {
        setVisionTags([]);
      }
    } else if (file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name)) {
      setText((await file.text()).slice(0, 20000));
    } else {
      // PDFs, Office files and video: text extraction / transcription runs on the server.
      setText("");
    }
  };

  const run = () => {
    if (!fileName && !text.trim()) {
      setError(
        hi ? "पहले कोई फ़ाइल चुनें या नमूना आज़माएँ।" : "Choose a file or try a sample first.",
      );
      return;
    }
    setError(null);
    setResult(null);
    const enriched = enrich({ fileName: fileName || "untitled.txt", mime, text, visionTags });
    let i = 0;
    setStepIndex(0);
    const tick = () => {
      i += 1;
      if (i < STEPS.length) {
        setStepIndex(i);
        timer.current = window.setTimeout(tick, 550);
      } else {
        setStepIndex(STEPS.length);
        setResult(enriched);
        setForm({
          title: enriched.title,
          type: enriched.type,
          region: enriched.region,
          stationId: enriched.stationId,
          expeditionId: enriched.expeditionId,
          year: enriched.year,
          authors: enriched.authors.join(", "),
          tags: enriched.tags,
          licence: "CC BY 4.0",
          access: "public",
          embargoUntil: "",
        });
      }
    };
    timer.current = window.setTimeout(tick, 550);
  };

  const submit = () => {
    if (!form || !result) return;
    saveSubmission({
      id: `sub-${Date.now()}`,
      title: form.title.trim() || fileName,
      type: form.type,
      region: form.region,
      stationId: form.stationId,
      expeditionId: form.expeditionId,
      year: form.year,
      authors: form.authors
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      tags: form.tags,
      licence: form.licence,
      access: form.access,
      embargoUntil: form.access === "embargoed" ? form.embargoUntil || undefined : undefined,
      summary: result.summaries.public,
      fileName,
      submittedAt: new Date().toISOString(),
    });
    navigate({ to: "/review", search: { submitted: 1 } });
  };

  const running = stepIndex >= 0 && stepIndex < STEPS.length;
  const field =
    "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Contribute" }]} />
      <div className="mt-4 max-w-3xl">
        <p className="eyebrow">{hi ? "एक बार अपलोड करें" : "Upload once"}</p>
        <h1 className="mt-2 text-3xl font-bold">{hi ? "सामग्री जोड़ें" : "Contribute material"}</h1>
        <p className="mt-2 text-muted-foreground">
          {hi
            ? "रिपोर्ट, डेटासेट, फ़ोटो या वीडियो अपलोड करें। ध्रुव पाठ निकालता है, मेटाडेटा भरता है, टैग सुझाता है, प्रतिलिपि जाँचता है और तीन सारांश बनाता है — फिर संपादक समीक्षा करते हैं।"
            : "Upload a report, dataset, photo or video. Dhruva extracts the text, fills in metadata, suggests tags, checks for duplicates and drafts three summaries — then an editor reviews everything before it is published."}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Step 1: input */}
        <section className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) void loadFile(f);
            }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border bg-ice"}`}
          >
            <Upload className="size-8 text-primary" />
            <p className="mt-3 font-display font-semibold">
              {hi ? "फ़ाइल यहाँ छोड़ें" : "Drop a file here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hi
                ? "PDF, TXT, CSV, JPG, PNG, WEBP, MP4 · 25 MB तक"
                : "PDF, TXT, CSV, JPG, PNG, WEBP, MP4 · up to 25 MB"}
            </p>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="btn-base btn-outline mt-4 py-2 text-xs"
            >
              {hi ? "फ़ाइल चुनें" : "Choose file"}
            </button>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,.csv,.doc,.docx,.nc,image/*,video/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void loadFile(f);
                e.target.value = "";
              }}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {hi ? "या नमूना आज़माएँ:" : "Or try a sample:"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadSample(s)}
                  className={`chip py-1 hover:border-primary/50 ${fileName === s.fileName ? "border-primary bg-primary/10 text-primary" : ""}`}
                >
                  {s.image ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}{" "}
                  {hi ? s.hi : s.label}
                </button>
              ))}
            </div>
          </div>

          {(fileName || text) && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="size-4 text-primary" />
                <span className="truncate font-medium">
                  {fileName || (hi ? "चिपकाया गया पाठ" : "Pasted text")}
                </span>
              </div>
              {preview && (
                <img
                  src={preview}
                  alt=""
                  className="mt-3 aspect-video w-full rounded-md object-cover"
                />
              )}
              <label className="mt-3 block text-xs font-semibold text-muted-foreground">
                {mime.startsWith("image/")
                  ? hi
                    ? "कैप्शन / विवरण (वैकल्पिक)"
                    : "Caption or description (optional)"
                  : hi
                    ? "निकाला गया पाठ (संपादित कर सकते हैं)"
                    : "Extracted text (you can edit it)"}
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    reset();
                  }}
                  rows={mime.startsWith("image/") ? 3 : 8}
                  placeholder={
                    /pdf|word|officedocument|video/.test(mime)
                      ? hi
                        ? "PDF/वीडियो का पाठ सर्वर पर निकाला जाता है। डेमो के लिए सार यहाँ चिपकाएँ।"
                        : "PDF text and video transcripts are extracted on the server. For the demo, paste the abstract here."
                      : ""
                  }
                  className={`${field} font-mono text-xs`}
                />
              </label>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="size-4" /> {error}
            </p>
          )}

          <button
            type="button"
            onClick={run}
            disabled={running}
            className="btn-base btn-primary w-full py-3 disabled:opacity-60"
          >
            {running ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {hi ? "AI से समृद्ध करें" : "Enrich with AI"}
          </button>
        </section>

        {/* Step 2: pipeline and result */}
        <section className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="eyebrow">{hi ? "प्रसंस्करण पाइपलाइन" : "Processing pipeline"}</p>
            <ol className="mt-3 space-y-2">
              {STEPS.map((s, i) => {
                const done = stepIndex > i;
                const active = stepIndex === i;
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-primary/10 text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full ${done ? "bg-aurora text-aurora-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {done ? (
                        <Check className="size-3.5" />
                      ) : active ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <s.icon className="size-3.5" />
                      )}
                    </span>
                    {hi ? s.hi : s.en}
                  </li>
                );
              })}
            </ol>
          </div>

          {result && form && (
            <>
              {result.duplicate && (
                <div className="flex items-start gap-3 rounded-lg border border-embargo/50 bg-embargo/10 p-4 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-embargo" />
                  <div>
                    <p className="font-semibold">
                      {hi ? "संभावित प्रतिलिपि मिली" : "Possible duplicate found"} (
                      {Math.round(result.duplicate.similarity * 100)}% {hi ? "समानता" : "overlap"})
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {hi
                        ? "यह सामग्री पहले से संग्रह में हो सकती है:"
                        : "This material may already be in the archive:"}{" "}
                      <Link
                        to="/item/$id"
                        params={{ id: result.duplicate.item.id }}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {result.duplicate.item.title}
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {result.textConfidence !== "high" && !mime.startsWith("image/") && (
                <p className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  <ScanText className="mt-0.5 size-3.5 shrink-0" />
                  {hi
                    ? "कम पाठ मिला — संपादक को मेटाडेटा ध्यान से जाँचने के लिए चिह्नित किया गया।"
                    : "Little text was available, so this record is flagged for the editor to check metadata carefully."}
                </p>
              )}

              <div className="rounded-lg border border-border bg-card p-5">
                <p className="eyebrow">
                  {hi
                    ? "स्वतः भरा मेटाडेटा — जाँचें और सुधारें"
                    : "Auto-filled metadata — check and correct"}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
                    {hi ? "शीर्षक" : "Title"}
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "प्रकार" : "Type"}
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as ContentType })}
                      className={field}
                    >
                      {CONTENT_TYPES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {uiText(c.label, hi)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "क्षेत्र" : "Region"}
                    <select
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value as Region | "" })}
                      className={field}
                    >
                      <option value="">{hi ? "— चुनें —" : "— Select —"}</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {uiText(r, hi)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "स्टेशन" : "Station"}
                    <select
                      value={form.stationId}
                      onChange={(e) => setForm({ ...form, stationId: e.target.value })}
                      className={field}
                    >
                      <option value="">{hi ? "— कोई नहीं —" : "— None —"}</option>
                      {stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "अभियान" : "Expedition"}
                    <select
                      value={form.expeditionId}
                      onChange={(e) => setForm({ ...form, expeditionId: e.target.value })}
                      className={field}
                    >
                      <option value="">{hi ? "— कोई नहीं —" : "— None —"}</option>
                      {expeditions.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.number}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "लेखक" : "Authors / credit"}
                    <input
                      value={form.authors}
                      onChange={(e) => setForm({ ...form, authors: e.target.value })}
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "वर्ष" : "Year"}
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: Number(e.target.value) || form.year })
                      }
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "लाइसेंस" : "Licence"}
                    <select
                      value={form.licence}
                      onChange={(e) => setForm({ ...form, licence: e.target.value })}
                      className={field}
                    >
                      {["CC BY 4.0", "CC BY-NC 4.0", "CC0 1.0", "All rights reserved"].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-muted-foreground">
                    {hi ? "प्रवेश स्तर" : "Access"}
                    <select
                      value={form.access}
                      onChange={(e) => setForm({ ...form, access: e.target.value as Access })}
                      className={field}
                    >
                      <option value="public">{hi ? "सार्वजनिक" : "Public"}</option>
                      <option value="internal">{hi ? "आंतरिक" : "Internal"}</option>
                      <option value="embargoed">
                        {hi ? "प्रतिबंधित (तिथि तक)" : "Embargoed until a date"}
                      </option>
                    </select>
                  </label>
                  {form.access === "embargoed" && (
                    <label className="text-xs font-semibold text-muted-foreground">
                      {hi ? "जारी होने की तिथि" : "Release date"}
                      <input
                        type="date"
                        value={form.embargoUntil}
                        onChange={(e) => setForm({ ...form, embargoUntil: e.target.value })}
                        className={field}
                      />
                    </label>
                  )}
                </div>

                <p className="mt-4 text-xs font-semibold text-muted-foreground">
                  {hi
                    ? "सुझाए गए टैग (हटाने के लिए क्लिक करें)"
                    : "Suggested tags (click to remove)"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.tags.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      {hi ? "कोई टैग नहीं" : "No tags suggested"}
                    </span>
                  )}
                  {form.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })}
                      className="chip hover:border-destructive/50 hover:text-destructive"
                    >
                      {t} ×
                    </button>
                  ))}
                </div>
                {visionTags.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {hi
                      ? "छवि टैग दृष्टि मॉडल ने सुझाए; संपादक पुष्टि करते हैं।"
                      : "Image tags suggested by the vision model; editors confirm them."}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <p className="eyebrow">
                  {hi ? "तीन पाठकों के लिए सारांश" : "Summaries for three audiences"}
                </p>
                <div
                  className="mt-3 inline-flex rounded-md border border-border p-1"
                  role="tablist"
                >
                  {(["scientist", "student", "public"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      role="tab"
                      aria-selected={audience === a}
                      onClick={() => setAudience(a)}
                      className={`rounded px-3 py-1.5 text-xs font-semibold ${audience === a ? "bg-primary text-primary-foreground" : "hover:bg-ice"}`}
                    >
                      {a === "scientist"
                        ? hi
                          ? "वैज्ञानिक"
                          : "Scientist"
                        : a === "student"
                          ? hi
                            ? "विद्यार्थी"
                            : "Student"
                          : hi
                            ? "जनता"
                            : "Public"}
                    </button>
                  ))}
                </div>
                <p className="mt-3 rounded-md bg-ice p-3 text-sm leading-relaxed">
                  {result.summaries[audience]}
                </p>
              </div>

              {(form.stationId || form.expeditionId || result.related.length > 0) && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="eyebrow flex items-center gap-2">
                    <Network className="size-3.5" />{" "}
                    {hi ? "ज्ञान ग्राफ़ लिंक" : "Knowledge graph links"}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {form.expeditionId && (
                      <li>
                        → {hi ? "अभियान" : "Expedition"}:{" "}
                        <span className="font-medium">
                          {expeditions.find((e) => e.id === form.expeditionId)?.name}
                        </span>
                      </li>
                    )}
                    {form.stationId && (
                      <li>
                        → {hi ? "स्टेशन" : "Station"}:{" "}
                        <span className="font-medium">
                          {stations.find((s) => s.id === form.stationId)?.name}
                        </span>
                      </li>
                    )}
                    {result.related.map((r) => (
                      <li key={r.id}>
                        → {hi ? "संबंधित" : "Related"} {uiText(typeLabel(r.type), hi).toLowerCase()}
                        :{" "}
                        <Link
                          to="/item/$id"
                          params={{ id: r.id }}
                          className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button type="button" onClick={submit} className="btn-base btn-primary w-full py-3">
                <Send className="size-4" />{" "}
                {hi ? "संपादक समीक्षा के लिए भेजें" : "Send to editor review"}
              </button>
            </>
          )}

          {!result && !running && (
            <div className="rounded-lg border border-dashed border-border bg-ice p-8 text-center text-sm text-muted-foreground">
              {hi
                ? "फ़ाइल चुनें और “AI से समृद्ध करें” दबाएँ।"
                : "Choose a file or a sample, then press “Enrich with AI”."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
