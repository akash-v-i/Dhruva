import { useHindi } from "@/lib/language";
import { Link } from "@tanstack/react-router";

export function Footer() {
  const hi = useHindi();
  return (
    <footer className="mt-20 border-t border-border bg-ice">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-xl font-bold">Dhruva</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            {hi
              ? "ध्रुवीय विज्ञान के अभियानों, स्टेशनों, रिपोर्टों, प्रकाशनों, डेटा और मीडिया का ज्ञान पोर्टल।"
              : "A knowledge and outreach portal for polar science: expeditions, stations, reports, publications, datasets and media, curated and reviewed before publication."}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {hi
              ? "प्रदर्शन पोर्टल। यहाँ दिखाई गई सामग्री केवल उदाहरण है।"
              : "Demonstration portal. Content shown is illustrative sample material."}
          </p>
        </div>

        <div>
          <p className="eyebrow">{hi ? "देखें" : "Browse"}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/explore" className="hover:text-primary">
                {hi ? "संग्रह खोजें" : "Explore archive"}
              </Link>
            </li>
            <li>
              <Link to="/expeditions" className="hover:text-primary">
                {hi ? "अभियान" : "Expeditions"}
              </Link>
            </li>
            <li>
              <Link to="/stations" className="hover:text-primary">
                {hi ? "स्टेशन" : "Stations"}
              </Link>
            </li>
            <li>
              <Link to="/map" className="hover:text-primary">
                {hi ? "ध्रुवीय मानचित्र" : "Polar map"}
              </Link>
            </li>
            <li>
              <Link to="/ask" className="hover:text-primary">
                {hi ? "ध्रुव से पूछें" : "Ask Polar"}
              </Link>
            </li>
            <li>
              <Link to="/learn" className="hover:text-primary">
                {hi ? "सीखें" : "Learn"}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">{hi ? "नीतियाँ" : "Governance"}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-primary">
                {hi ? "परिचय और संपर्क" : "About and contact"}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                {hi ? "सुलभता विवरण" : "Accessibility statement"}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                {hi ? "सामग्री लाइसेंस" : "Content licensing"}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                {hi ? "प्रवेश स्तर और गोपनीयता" : "Access levels and privacy"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} Dhruva{" "}
            {hi ? "ध्रुवीय ज्ञान पोर्टल" : "Polar Knowledge Portal"}.
          </p>
          <p>
            {hi
              ? "हर रिकॉर्ड पर लाइसेंस दिया गया है। मानचित्र स्टेशन निर्देशांकों पर आधारित है।"
              : "Content licensed as marked on each record. Map graticule rendered from station coordinates."}
          </p>
        </div>
      </div>
    </footer>
  );
}
