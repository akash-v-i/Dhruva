import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react";
import { Compass, Map, Ship, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import bg from "@/assets/hero-polar.jpg";
import { useGuest } from "@/lib/guest";
import { useHindi } from "@/lib/language";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import logo from "@/assets/logo-snowflake.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dhruva — Polar Knowledge and Outreach Portal" },
      {
        name: "description",
        content:
          "Dhruva brings India's polar research — Antarctic and Arctic stations, expeditions, data and stories — into one open portal. Sign in to explore.",
      },
      { property: "og:title", content: "Dhruva — Polar Knowledge and Outreach Portal" },
      {
        property: "og:description",
        content: "Explore India's polar stations, expeditions, research and learning resources.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/favicon.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: "/favicon.png" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Compass,
    title: "Explore the archive",
    text: "Reports, datasets, photos, videos and stories from decades of polar science.",
  },
  {
    icon: Ship,
    title: "Follow expeditions",
    text: "Routes, timelines and findings from Antarctic, Arctic and Southern Ocean voyages.",
  },
  {
    icon: Map,
    title: "Polar map",
    text: "Research stations and expedition tracks across both poles on an interactive map.",
  },
  {
    icon: Sparkles,
    title: "Ask Polar",
    text: "Ask questions in plain language and get answers backed by cited sources.",
  },
  {
    icon: BookOpen,
    title: "Learn",
    text: "Quizzes, glossary and polar facts for students, teachers and the curious.",
  },
];

function Landing() {
  const hi = useHindi();
  const { setGuest } = useGuest();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const enterAsGuest = () => {
    setGuest(true);
    navigate({ to: "/home" });
  };
  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={bg} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/90" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 text-primary-foreground">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Dhruva logo" className="size-10" />
            <span className="font-display text-2xl font-bold tracking-tight">Dhruva</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle light />
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/home">
                <button className="rounded-md border border-primary-foreground/50 px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10">
                  {hi ? "साइन इन" : "Sign in"}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                to="/home"
                className="rounded-md border border-primary-foreground/50 px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10"
              >
                {hi ? "पोर्टल खोलें" : "Open portal"}
              </Link>
            </SignedIn>
          </div>
        </nav>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/80">
            {hi ? "ध्रुवीय ज्ञान और जनसंपर्क पोर्टल" : "Polar knowledge and outreach portal"}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-tight sm:text-6xl">
            {hi ? "ध्रुवों तक भारत की खिड़की।" : "India’s window to the poles."}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/90">
            {hi
              ? "ध्रुव भारत के अंटार्कटिक, आर्कटिक और हिमालयी अनुसंधान से जुड़ा विज्ञान, स्टेशन और कहानियाँ एक जगह लाता है — खोजने योग्य, स्रोत सहित और सीखने के इच्छुक सभी लोगों के लिए खुला।"
              : "Dhruva gathers the science, stations and stories of India’s Antarctic, Arctic and Himalayan research in one place — searchable, cited, and open to everyone who wants to learn."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/home">
                <button className="inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 font-semibold text-primary hover:opacity-90">
                  {hi ? "निःशुल्क खाता बनाएँ" : "Create free account"}{" "}
                  <ArrowRight className="size-4" />
                </button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl="/home">
                <button className="rounded-md border border-primary-foreground/60 px-6 py-3 font-semibold hover:bg-primary-foreground/10">
                  {hi ? "मेरा पहले से खाता है" : "I already have an account"}
                </button>
              </SignInButton>
            </SignedOut>
            {!isSignedIn && (
              <button
                type="button"
                onClick={enterAsGuest}
                className="inline-flex items-center gap-2 rounded-md px-6 py-3 font-semibold underline-offset-4 hover:underline"
              >
                {hi ? "अतिथि के रूप में देखें" : "Explore as guest"}{" "}
                <ArrowRight className="size-4" />
              </button>
            )}
            <SignedIn>
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 font-semibold text-primary hover:opacity-90"
              >
                {hi ? "पोर्टल में जाएँ" : "Enter the portal"} <ArrowRight className="size-4" />
              </Link>
            </SignedIn>
          </div>
        </section>

        <section className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-primary-foreground/20 bg-primary/40 p-5 backdrop-blur"
            >
              <f.icon className="size-6" />
              <h2 className="mt-3 font-display font-semibold">
                {hi
                  ? (
                      {
                        "Explore the archive": "संग्रह खोजें",
                        "Follow expeditions": "अभियानों का अनुसरण करें",
                        "Polar map": "ध्रुवीय मानचित्र",
                        "Ask Polar": "ध्रुव से पूछें",
                        Learn: "सीखें",
                      } as Record<string, string>
                    )[f.title]
                  : f.title}
              </h2>
              <p className="mt-1 text-sm text-primary-foreground/80">
                {hi
                  ? (
                      {
                        "Explore the archive":
                          "दशकों के ध्रुवीय विज्ञान की रिपोर्टें, डेटासेट, फ़ोटो, वीडियो और कहानियाँ।",
                        "Follow expeditions":
                          "अंटार्कटिक, आर्कटिक और दक्षिणी महासागर की यात्राओं के मार्ग, समयरेखाएँ और खोजें।",
                        "Polar map": "दोनों ध्रुवों पर अनुसंधान स्टेशन और अभियान मार्ग।",
                        "Ask Polar": "साधारण भाषा में सवाल पूछें और स्रोत सहित जवाब पाएँ।",
                        Learn:
                          "विद्यार्थियों, शिक्षकों और जिज्ञासुओं के लिए प्रश्नोत्तरी, शब्दावली और ध्रुवीय तथ्य।",
                      } as Record<string, string>
                    )[f.title]
                  : f.text}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
