import { useHindi } from "@/lib/language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Scale, ShieldCheck, Users, Clock, Languages } from "lucide-react";
import { IMAGES } from "@/data/dhruva";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Dhruva — polar knowledge and outreach" },
      {
        name: "description",
        content:
          "How Dhruva curates polar knowledge: content types, editorial review, licensing, embargo handling and accessibility.",
      },
      { property: "og:title", content: "About Dhruva — polar knowledge and outreach" },
      {
        property: "og:description",
        content:
          "How Dhruva curates polar knowledge, reviews content and handles licensing and embargoes.",
      },
    ],
  }),
  component: About,
});

function About() {
  const hi = useHindi();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "About" }]} />

      <header className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">{hi ? "परिचय" : "About"}</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {hi
              ? "ध्रुवीय ज्ञान का एक विश्वसनीय घर"
              : "A single, reviewed home for polar knowledge"}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {hi
              ? "ध्रुव ध्रुवीय अभियानों और अनुसंधान स्टेशनों की रिपोर्ट, प्रकाशन, डेटा, फ़ोटो, वीडियो और गतिविधियों को एक खोजने योग्य संग्रह में लाता है।"
              : "Dhruva brings together the material produced by polar expeditions and research stations — reports, publications, datasets, photographs, videos and institutional activities — and presents it in one consistent, searchable record structure."}
          </p>
          <p className="mt-3 text-muted-foreground">
            {hi
              ? "यह पोर्टल जनता, विद्यार्थियों, शोधकर्ताओं और जनसंपर्क टीमों के लिए है। सरल सारांश के साथ स्रोत और लाइसेंस विवरण भी दिए जाते हैं।"
              : "The portal serves the public, students, researchers and outreach teams at the same time: plain-language summaries sit alongside full metadata, citations and licensing terms."}
          </p>
        </div>
        <img
          src={IMAGES.ships}
          alt={
            hi
              ? "बर्फ़ीले पहाड़ों से घिरी खाड़ी में दो ध्रुवीय जहाज़"
              : "Two polar vessels anchored in an ice-filled bay below snow-covered mountains"
          }
          loading="lazy"
          width={1920}
          height={1088}
          className="aspect-[16/10] w-full rounded-lg object-cover shadow-polar"
        />
      </header>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">
          {hi ? "सामग्री का प्रबंधन" : "How content is handled"}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FileCheck2,
              t: hi ? "संपादकीय समीक्षा" : "Editorial review",
              d: hi
                ? "अपलोड संसाधित होते हैं, मेटाडेटा निकाला और जाँचा जाता है, और प्रकाशन से पहले संपादक हर रिकॉर्ड स्वीकृत करते हैं।"
                : "Uploads are processed, metadata is extracted and checked, and an editor approves each record before publication.",
            },
            {
              icon: ShieldCheck,
              t: hi ? "स्रोत उल्लेख" : "Attribution",
              d: hi
                ? "सारांश और जवाब उन रिकॉर्ड का उल्लेख करते हैं जिनसे वे बने हैं; हर बनाई गई सामग्री स्रोत से जाँची जाती है।"
                : "Summaries and answers cite the records they were built from, and every generated sentence is checked against its source.",
            },
            {
              icon: Scale,
              t: hi ? "लाइसेंस" : "Licensing",
              d: hi
                ? "हर रिकॉर्ड अपना लाइसेंस और पुनः उपयोग की शर्तें दिखाता है। लाइसेंस से अधिक कुछ भी डाउनलोड के लिए नहीं दिया जाता।"
                : "Each record displays its licence and reuse terms. Nothing is offered for download beyond what the licence allows.",
            },
            {
              icon: Clock,
              t: hi ? "प्रकाशन प्रतिबंध" : "Embargo",
              d: hi
                ? "प्रतिबंधित सामग्री में केवल मेटाडेटा दिखता है। जारी होने की तिथि के बाद ही डाउनलोड उपलब्ध होता है।"
                : "Embargoed items show metadata only. Download controls appear only after the release date has passed.",
            },
            {
              icon: Users,
              t: hi ? "प्रवेश स्तर" : "Access levels",
              d: hi
                ? "सार्वजनिक, आंतरिक और प्रतिबंधित सामग्री स्पष्ट रूप से अलग है। आंतरिक फ़ाइलों के लिए अधिकृत कर्मचारी खाता आवश्यक है।"
                : "Public, internal and embargoed content are clearly distinguished. Internal files require an authorised staff account.",
            },
            {
              icon: Languages,
              t: hi ? "भाषाएँ" : "Languages",
              d: hi
                ? "पोर्टल अंग्रेज़ी और हिंदी में उपलब्ध है, और IndicTrans2 के माध्यम से अन्य भारतीय भाषाओं तक विस्तार योग्य है।"
                : "The portal works in English and Hindi, and extends to other Indian languages through IndicTrans2.",
            },
          ].map((c) => (
            <div key={c.t} className="card-polar p-5">
              <c.icon className="size-5 text-primary" />
              <p className="mt-3 font-display font-semibold">{c.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">{hi ? "सुलभता" : "Accessibility"}</h2>
          <p className="mt-3 text-muted-foreground">
            {hi
              ? "हर मानचित्र के साथ उसके चिह्नों की पाठ सूची है। जानकारी केवल रंग से नहीं दी जाती, सभी नियंत्रण कीबोर्ड से उपयोग किए जा सकते हैं, और पृष्ठ मोबाइल पर भी साफ़ पढ़े जा सकते हैं।"
              : "Every map has a text alternative listing the features it shows. Colour is never the only way information is conveyed, controls are reachable by keyboard, and pages are designed to read clearly at mobile widths."}
          </p>
          <h2 className="mt-10 text-2xl font-bold">{hi ? "संपर्क" : "Contact"}</h2>
          <p className="mt-3 text-muted-foreground">
            {hi
              ? "ध्रुव राष्ट्रीय ध्रुवीय एवं समुद्री अनुसंधान केंद्र (NCPOR), पृथ्वी विज्ञान मंत्रालय के लिए प्रस्तावित है। संस्थागत संपर्क विवरण यहाँ प्रकाशित किए जाएँगे।"
              : "Dhruva is proposed for the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences. Institutional contact details will be published here."}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-ice p-6">
          <p className="eyebrow">{hi ? "कर्मचारी प्रवेश" : "Staff access"}</p>
          <p className="mt-2 text-muted-foreground">
            {hi
              ? "योगदानकर्ता, संपादक और जनसंपर्क अधिकारी कार्यक्षेत्र में काम करते हैं: सामग्री अपलोड, AI-भरे मेटाडेटा की समीक्षा, तथ्य-जाँच सहित कंटेंट स्टूडियो और सामग्री-अंतर इनसाइट्स।"
              : "Contributors, editors and outreach officers work in the Workspace: uploading material, reviewing AI-filled metadata, creating fact-checked posts in the Content Studio, and planning outreach from content-gap insights."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/contribute" className="btn-base btn-primary">
              {hi ? "सामग्री जोड़ें" : "Contribute material"}
            </Link>
            <Link to="/studio" className="btn-base btn-outline">
              {hi ? "कंटेंट स्टूडियो" : "Content Studio"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
