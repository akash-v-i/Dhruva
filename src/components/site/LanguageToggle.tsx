import { useLanguage } from "@/lib/language";

export function LanguageToggle({ light = false }: { light?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language / भाषा"
      className={`inline-flex shrink-0 items-center rounded-md border text-xs font-semibold ${light ? "border-primary-foreground/50" : "border-border bg-background"}`}
    >
      <button
        type="button"
        lang="en"
        aria-label="Switch to English"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
        className={`min-h-9 min-w-10 rounded-l-md px-2 transition-colors ${language === "en" ? (light ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground") : "hover:bg-primary/15"}`}
      >
        EN
      </button>
      <button
        type="button"
        lang="hi"
        aria-label="हिंदी में बदलें"
        aria-pressed={language === "hi"}
        onClick={() => setLanguage("hi")}
        className={`min-h-9 min-w-10 rounded-r-md px-2 transition-colors ${language === "hi" ? (light ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground") : "hover:bg-primary/15"}`}
      >
        हिं
      </button>
    </div>
  );
}
