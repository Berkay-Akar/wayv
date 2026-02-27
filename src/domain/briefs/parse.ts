import { AIBriefResponseSchema, type AIBriefResponse } from "@/domain/schemas";

export function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return text.trim();
  }
  return text.slice(start, end + 1).trim();
}

export function parseBriefFromRaw(raw: string): AIBriefResponse | null {
  const cleaned = extractJson(raw)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    const validated = AIBriefResponseSchema.safeParse(parsed);
    if (!validated.success) {
      return null;
    }
    return validated.data;
  } catch {
    return null;
  }
}
