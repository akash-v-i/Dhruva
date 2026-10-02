import { useHindi } from "@/lib/language";
import { Lock, ShieldCheck, Clock } from "lucide-react";
import type { Access } from "@/data/dhruva";
import { formatDate } from "@/data/dhruva";

export function AccessBadge({ access, until }: { access: Access; until?: string | undefined }) {
  const hi = useHindi();
  if (access === "public") {
    return (
      <span className="chip border-aurora/40 bg-aurora/10 text-foreground">
        <ShieldCheck className="size-3 text-aurora" /> {hi ? "सार्वजनिक" : "Publicly available"}
      </span>
    );
  }
  if (access === "internal") {
    return (
      <span className="chip border-border bg-muted">
        <Lock className="size-3" /> {hi ? "आंतरिक सामग्री" : "Internal content"}
      </span>
    );
  }
  return (
    <span className="chip border-embargo/50 bg-embargo/15 text-embargo-foreground">
      <Clock className="size-3" /> {hi ? "प्रकाशन प्रतिबंधित" : "Embargoed"}
      {until ? ` ${hi ? "इस तारीख तक" : "until"} ${formatDate(until)}` : ""}
    </span>
  );
}
