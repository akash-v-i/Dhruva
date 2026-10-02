import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { items } from "@/data/dhruva";

export const askPolar = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({ question: z.string().min(1).max(500), language: z.enum(["en", "hi"]).optional() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["OPENAI_API_KEY"];
    if (!key)
      return {
        text:
          data.language === "hi"
            ? "ध्रुव से पूछें अभी उपलब्ध नहीं है।"
            : "Ask Polar is not configured yet.",
        sourceIds: [] as string[],
        error: true,
      };

    const archive = items
      .map((i) => `[${i.id}] ${i.title} (${i.type}, ${i.region}): ${i.summary} ${i.body}`)
      .join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are Ask Polar for the Dhruva polar archive. Answer ONLY using the archive records below. If they do not answer the question, say so. Reply as JSON: {"answer": string, "sources": string[] of record ids used}.\n\nARCHIVE:\n' +
              archive +
              (data.language === "hi"
                ? "\n\nIMPORTANT: Answer in natural Hindi (Devanagari). Preserve source record IDs exactly. If records are insufficient, say so in Hindi."
                : ""),
          },
          { role: "user", content: data.question },
        ],
      }),
    });

    if (!res.ok) {
      const msg =
        res.status === 401
          ? "Ask Polar is not configured correctly. Please contact the site team."
          : res.status === 429
            ? "Ask Polar is busy right now. Please try again in a little while."
            : "Ask Polar could not answer right now. Please try again later.";
      return {
        text:
          data.language === "hi"
            ? res.status === 429
              ? "ध्रुव से पूछें अभी व्यस्त है। कृपया थोड़ी देर बाद प्रयास करें।"
              : res.status === 401
                ? "ध्रुव से पूछें सही तरह तैयार नहीं है। कृपया साइट टीम से संपर्क करें।"
                : "अभी जवाब नहीं मिल सका। कृपया बाद में प्रयास करें।"
            : msg,
        sourceIds: [] as string[],
        error: true,
      };
    }
    const json = (await res.json()) as { choices: { message: { content: string } }[] };
    try {
      const parsed = JSON.parse(json.choices[0]?.message.content ?? "{}") as {
        answer?: string;
        sources?: string[];
      };
      return {
        text: parsed.answer ?? (data.language === "hi" ? "कोई जवाब नहीं मिला।" : "No answer."),
        sourceIds: parsed.sources ?? [],
        error: false,
      };
    } catch {
      return {
        text: data.language === "hi" ? "जवाब पढ़ा नहीं जा सका।" : "Could not read the answer.",
        sourceIds: [] as string[],
        error: true,
      };
    }
  });
