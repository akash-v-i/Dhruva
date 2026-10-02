import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { IMAGES, type Item } from "@/data/dhruva";
import logoUrl from "@/assets/logo-snowflake.png";

const SIZE = 1080;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    lines[maxLines - 1] = `${lines[maxLines - 1]!.replace(/\s+\S*$/, "")}…`;
  }
  return lines;
}

/** Renders a ready-to-post 1080×1080 social image for a record. */
export function SocialCard({
  item,
  headline,
  verified,
  hi,
}: {
  item: Item;
  headline: string;
  verified: boolean;
  hi: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const draw = async () => {
      const c = canvas.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      setReady(false);
      await document.fonts?.ready;
      const [photo, logo] = await Promise.all([
        loadImage(item.image ?? IMAGES.hero).catch(() => null),
        loadImage(logoUrl).catch(() => null),
      ]);
      if (cancelled) return;

      // Background photo, cropped to fill the square.
      ctx.fillStyle = "#0f1f3d";
      ctx.fillRect(0, 0, SIZE, SIZE);
      if (photo) {
        const scale = Math.max(SIZE / photo.width, SIZE / photo.height);
        const w = photo.width * scale;
        const h = photo.height * scale;
        ctx.drawImage(photo, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
      }
      const shade = ctx.createLinearGradient(0, 0, 0, SIZE);
      shade.addColorStop(0, "rgba(10,22,48,0.55)");
      shade.addColorStop(0.35, "rgba(10,22,48,0.1)");
      shade.addColorStop(0.55, "rgba(10,22,48,0.55)");
      shade.addColorStop(1, "rgba(10,22,48,0.95)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Brand bar.
      if (logo) {
        ctx.fillStyle = "#1d5fd1";
        ctx.beginPath();
        ctx.roundRect(64, 60, 76, 76, 14);
        ctx.fill();
        ctx.drawImage(logo, 72, 68, 60, 60);
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 44px 'Space Grotesk', sans-serif";
      ctx.fillText("Dhruva", 160, 108);
      ctx.font = "500 22px 'IBM Plex Sans', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(hi ? "ध्रुवीय ज्ञान पोर्टल" : "POLAR KNOWLEDGE PORTAL", 162, 136);

      // Tag line.
      ctx.font = "600 26px 'IBM Plex Sans', sans-serif";
      ctx.fillStyle = "#9fd8e6";
      ctx.fillText(`${item.region.toUpperCase()} · ${item.year}`, 64, 600);

      // Headline.
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 58px 'Space Grotesk', sans-serif";
      const lines = wrap(ctx, headline, SIZE - 128, 5);
      lines.forEach((l, i) => ctx.fillText(l, 64, 672 + i * 68));

      // Footer: credit, licence and grounding status.
      ctx.font = "500 24px 'IBM Plex Sans', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(
        `Source: ${item.authors[0] ?? "Dhruva archive"} · ${item.licence}`,
        64,
        SIZE - 56,
      );
      if (verified) {
        const label = hi ? "✓ स्रोत से सत्यापित" : "✓ Fact-checked against source";
        ctx.font = "600 24px 'IBM Plex Sans', sans-serif";
        const w = ctx.measureText(label).width + 36;
        ctx.fillStyle = "rgba(38,166,154,0.95)";
        ctx.beginPath();
        ctx.roundRect(SIZE - 64 - w, SIZE - 92, w, 50, 25);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, SIZE - 64 - w + 18, SIZE - 58);
      }
      setReady(true);
    };
    void draw();
    return () => {
      cancelled = true;
    };
  }, [item, headline, verified, hi]);

  const download = () => {
    const c = canvas.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `${item.id}-social-card.png`;
    a.click();
  };

  return (
    <div className="mt-4">
      <canvas
        ref={canvas}
        width={SIZE}
        height={SIZE}
        className="aspect-square w-full max-w-md rounded-lg border border-border shadow-polar"
        role="img"
        aria-label={headline}
      />
      <button
        type="button"
        onClick={download}
        disabled={!ready}
        className="btn-base btn-outline mt-3 py-2 text-xs disabled:opacity-50"
      >
        <Download className="size-3.5" />{" "}
        {hi ? "PNG डाउनलोड करें (1080×1080)" : "Download PNG (1080×1080)"}
      </button>
    </div>
  );
}
