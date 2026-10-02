import { useHindi } from "@/lib/language";
import { contentText, uiText } from "@/lib/translation";
import { Link } from "@tanstack/react-router";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Database,
  Video,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import type { ContentType, Item } from "@/data/dhruva";
import { formatDate, getExpedition, getStation, typeLabel } from "@/data/dhruva";
import { AccessBadge } from "./AccessBadge";
import { downloadText, recordFileStub } from "@/lib/actions";

export const typeIcon: Record<ContentType, typeof FileText> = {
  report: FileText,
  publication: BookOpen,
  dataset: Database,
  photo: ImageIcon,
  video: Video,
  activity: CalendarDays,
};

export function ItemCard({ item }: { item: Item }) {
  const hi = useHindi();
  const Icon = typeIcon[item.type];
  const expedition = getExpedition(item.expeditionId);
  const station = getStation(item.stationId);

  return (
    <article className="card-polar flex gap-4 overflow-hidden p-4 sm:p-5">
      <div className="hidden shrink-0 sm:block">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            width={160}
            height={120}
            className="h-24 w-32 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-24 w-32 items-center justify-center rounded-md bg-ice">
            <Icon className="size-7 text-primary" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{uiText(typeLabel(item.type), hi)}</span>
          <AccessBadge access={item.access} until={item.embargoUntil} />
        </div>

        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug">
          <Link to="/item/$id" params={{ id: item.id }} className="hover:text-primary">
            {contentText(item.title, hi)}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {contentText(item.summary, hi)}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {uiText(item.region, hi)}
          {expedition ? ` · ${expedition.number}` : ""}
          {station ? ` · ${station.name}` : ""} · {formatDate(item.date)} · {item.licence}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {item.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/item/$id"
            params={{ id: item.id }}
            className="btn-base btn-outline py-1.5 text-xs"
          >
            {hi ? "विवरण देखें" : "View item"}
          </Link>
          {item.access === "public" && (
            <button
              type="button"
              onClick={() =>
                downloadText(
                  `${item.id}.txt`,
                  recordFileStub(
                    item.title,
                    `${item.summary}\n\n${item.body}\n\nLicence: ${item.licence}`,
                  ),
                )
              }
              className="btn-base btn-ghost py-1.5 text-xs"
            >
              <Download className="size-3.5" /> {hi ? "डाउनलोड" : "Download"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
