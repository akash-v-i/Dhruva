import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  Menu,
  PenSquare,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { LanguageToggle } from "./LanguageToggle";
import { useHindi } from "@/lib/language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoSnowflake from "@/assets/logo-snowflake.png";

const NAV = [
  { to: "/explore", label: "Explore", hi: "खोजें" },
  { to: "/expeditions", label: "Expeditions", hi: "अभियान" },
  { to: "/stations", label: "Stations", hi: "स्टेशन" },
  { to: "/map", label: "Polar Map", hi: "मानचित्र" },
  { to: "/media", label: "Media", hi: "मीडिया" },
  { to: "/graph", label: "Graph", hi: "ग्राफ़" },
  { to: "/learn", label: "Learn", hi: "सीखें" },
] as const;

// Staff-facing modules: from upload to reviewed outreach.
const OUTREACH = [
  {
    to: "/contribute",
    label: "Contribute",
    hi: "सामग्री जोड़ें",
    desc: "Upload once, AI fills the metadata",
    hiDesc: "एक बार अपलोड करें, AI मेटाडेटा भरता है",
    icon: Upload,
  },
  {
    to: "/studio",
    label: "Content Studio",
    hi: "कंटेंट स्टूडियो",
    desc: "Multi-channel drafts with fact check",
    hiDesc: "तथ्य जाँच सहित हर चैनल के ड्राफ्ट",
    icon: PenSquare,
  },
  {
    to: "/review",
    label: "Review queue",
    hi: "समीक्षा कतार",
    desc: "Approve metadata, access and embargo",
    hiDesc: "मेटाडेटा, प्रवेश और प्रतिबंध स्वीकृत करें",
    icon: ClipboardCheck,
  },
  {
    to: "/insights",
    label: "Insights",
    hi: "इनसाइट्स",
    desc: "Content gaps and suggested topics",
    hiDesc: "सामग्री अंतर और सुझाए गए विषय",
    icon: BarChart3,
  },
] as const;

const linkClass =
  "whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-ice hover:text-foreground";

export function Header() {
  const hi = useHindi();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isSignedIn } = useAuth();
  const outreachActive = OUTREACH.some((o) => pathname.startsWith(o.to));

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/explore", search: { q: q.trim() || undefined } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Link to="/home" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary p-1">
            <img src={logoSnowflake} alt="" className="size-full object-contain" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">Dhruva</span>
            <span className="hidden text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
              {hi ? "ध्रुवीय ज्ञान पोर्टल" : "Polar knowledge portal"}
            </span>
          </span>
        </Link>

        <nav
          aria-label={hi ? "मुख्य" : "Main"}
          className="ml-3 hidden items-center gap-0.5 xl:flex"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={linkClass}
              activeProps={{ className: "bg-ice text-primary" }}
            >
              {hi ? n.hi : n.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`${linkClass} inline-flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring ${outreachActive ? "bg-ice text-primary" : ""}`}
            >
              {hi ? "कार्यक्षेत्र" : "Workspace"} <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-1.5">
              {OUTREACH.map((o) => (
                <DropdownMenuItem
                  key={o.to}
                  asChild
                  className="cursor-pointer items-start gap-3 p-2.5"
                >
                  <Link to={o.to}>
                    <o.icon className="mt-0.5 size-4 text-primary" />
                    <span>
                      <span className="block text-sm font-semibold">{hi ? o.hi : o.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {hi ? o.hiDesc : o.desc}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submit} role="search" className="hidden 2xl:block">
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={hi ? "संग्रह में खोजें..." : "Search the archive..."}
                aria-label={hi ? "संग्रह में खोजें" : "Search the archive"}
                className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </form>
          <Link
            to="/explore"
            aria-label={hi ? "संग्रह में खोजें" : "Search the archive"}
            className="btn-base btn-outline hidden px-2.5 py-2 xl:inline-flex 2xl:hidden"
          >
            <Search className="size-4" />
          </Link>

          <Link to="/ask" className="btn-base btn-primary hidden px-3 py-2 md:inline-flex">
            <Sparkles className="size-4" /> {hi ? "ध्रुव से पूछें" : "Ask Polar"}
          </Link>

          <LanguageToggle />

          {isSignedIn ? (
            <UserButton />
          ) : (
            <span className="hidden sm:inline-flex">
              <SignInButton mode="modal">
                <button type="button" className="btn-base btn-outline px-3 py-2">
                  {hi ? "साइन इन" : "Sign in"}
                </button>
              </SignInButton>
            </span>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={hi ? "नेविगेशन खोलें या बंद करें" : "Toggle navigation"}
            className="btn-base btn-outline px-2.5 py-2 xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background xl:hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
            <form onSubmit={submit} role="search" className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  hi ? "रिपोर्ट, स्टेशन, डेटा खोजें..." : "Search reports, stations, datasets..."
                }
                aria-label={hi ? "संग्रह में खोजें" : "Search the archive"}
                className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </form>
            <div className="grid grid-cols-2 gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-ice"
                  activeProps={{ className: "bg-ice text-primary" }}
                >
                  {hi ? n.hi : n.label}
                </Link>
              ))}
              <Link
                to="/about"
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-ice"
                activeProps={{ className: "bg-ice text-primary" }}
              >
                {hi ? "परिचय" : "About"}
              </Link>
              <Link
                to="/ask"
                className="rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-ice"
              >
                {hi ? "ध्रुव से पूछें" : "Ask Polar"}
              </Link>
            </div>
            <div>
              <p className="eyebrow px-3">{hi ? "कार्यक्षेत्र" : "Workspace"}</p>
              <div className="mt-1 grid gap-1 sm:grid-cols-2">
                {OUTREACH.map((o) => (
                  <Link
                    key={o.to}
                    to={o.to}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-ice"
                    activeProps={{ className: "bg-ice text-primary" }}
                  >
                    <o.icon className="size-4 text-primary" /> {hi ? o.hi : o.label}
                  </Link>
                ))}
              </div>
            </div>
            {!isSignedIn && (
              <div className="sm:hidden">
                <SignInButton mode="modal">
                  <button type="button" className="btn-base btn-outline w-full">
                    {hi ? "साइन इन" : "Sign in"}
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
