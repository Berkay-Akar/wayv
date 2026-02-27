import type { LLMProvider } from "./LLMProvider";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export class GroqProvider implements LLMProvider {
  private readonly apiKey = GROQ_API_KEY ?? "";
  private readonly model = "llama-3.3-70b-versatile";

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey?.trim()) {
      throw new Error("GROQ_API_KEY is not set");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.25,
        messages: [
          {
            role: "system",
            content:
              "You generate influencer campaign briefs. Respond with strict JSON only, no markdown or explanation text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      const snippet = body.length > 200 ? `${body.slice(0, 200)}…` : body;
      throw new Error(`Groq API request failed (${response.status}): ${snippet || response.statusText}`);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq API returned empty content");
    }

    return content;
  }
}

