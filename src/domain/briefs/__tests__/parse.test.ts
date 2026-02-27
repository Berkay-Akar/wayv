import { describe, it, expect } from "vitest";
import { extractJson, parseBriefFromRaw } from "../parse";

const validBrief = {
  outreachMessage: "Hi, we would like to collaborate.",
  contentIdeas: ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5"],
  hookSuggestions: ["Hook A", "Hook B", "Hook C"],
};

describe("extractJson", () => {
  it("returns full string when it is valid JSON object", () => {
    const s = JSON.stringify(validBrief);
    expect(extractJson(s)).toBe(s);
  });

  it("strips leading and trailing non-JSON text", () => {
    const wrapped = "Here is the result:\n" + JSON.stringify(validBrief) + "\nDone.";
    expect(extractJson(wrapped)).toBe(JSON.stringify(validBrief));
  });

  it("returns trimmed string when no brace pair", () => {
    expect(extractJson("no json here").trim()).toBe("no json here");
  });
});

describe("parseBriefFromRaw", () => {
  it("parses valid JSON matching schema", () => {
    const raw = JSON.stringify(validBrief);
    const result = parseBriefFromRaw(raw);
    expect(result).not.toBeNull();
    expect(result!.outreachMessage).toBe(validBrief.outreachMessage);
    expect(result!.contentIdeas).toHaveLength(5);
    expect(result!.hookSuggestions).toHaveLength(3);
  });

  it("strips markdown code fence", () => {
    const raw = "```json\n" + JSON.stringify(validBrief) + "\n```";
    const result = parseBriefFromRaw(raw);
    expect(result).not.toBeNull();
    expect(result!.outreachMessage).toBe(validBrief.outreachMessage);
  });

  it("returns null for invalid JSON", () => {
    expect(parseBriefFromRaw("not json {")).toBeNull();
    expect(parseBriefFromRaw("{ broken")).toBeNull();
  });

  it("returns null when contentIdeas length !== 5", () => {
    const bad = { ...validBrief, contentIdeas: ["a", "b"] };
    expect(parseBriefFromRaw(JSON.stringify(bad))).toBeNull();
  });

  it("returns null when hookSuggestions length !== 3", () => {
    const bad = { ...validBrief, hookSuggestions: ["a"] };
    expect(parseBriefFromRaw(JSON.stringify(bad))).toBeNull();
  });

  it("returns null when outreachMessage is missing", () => {
    const bad = { contentIdeas: validBrief.contentIdeas, hookSuggestions: validBrief.hookSuggestions };
    expect(parseBriefFromRaw(JSON.stringify(bad))).toBeNull();
  });
});
