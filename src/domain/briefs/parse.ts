import { AIBriefResponseSchema, type AIBriefResponse } from "@/domain/schemas";

export function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return text.trim();
  }
  return text.slice(start, end + 1).trim();
}

/**
 * Attempts to fix common LLM JSON mistakes so JSON.parse can succeed.
 * - Trailing commas before ] or }
 * - Optional: strip BOM / control chars at start
 */
export function repairJson(jsonStr: string): string {
  let s = jsonStr.trim();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  s = s.replace(/,(\s*[}\]])/g, "$1");
  return s;
}

export function parseBriefFromRaw(raw: string): AIBriefResponse | null {
  let cleaned = extractJson(raw)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  for (const candidate of [cleaned, repairJson(cleaned)]) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      const validated = AIBriefResponseSchema.safeParse(parsed);
      if (!validated.success) {
        continue;
      }
      return validated.data;
    } catch {
      continue;
    }
  }

  return null;
}
