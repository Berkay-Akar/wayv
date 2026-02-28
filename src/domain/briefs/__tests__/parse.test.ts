import { describe, it, expect } from "vitest";
import { extractJson, parseBriefFromRaw, repairJson } from "../parse";

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
    const wrapped =
      "Here is the result:\n" + JSON.stringify(validBrief) + "\nDone.";
    expect(extractJson(wrapped)).toBe(JSON.stringify(validBrief));
  });

  it("returns trimmed string when no brace pair", () => {
    expect(extractJson("no json here").trim()).toBe("no json here");
  });
});

describe("repairJson", () => {
  it("removes trailing comma before }", () => {
    expect(repairJson('{"a": 1,}')).toBe('{"a": 1}');
  });

  it("removes trailing comma before ]", () => {
    expect(repairJson('{"a": [1, 2,]}')).toBe('{"a": [1, 2]}');
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
    const bad = {
      contentIdeas: validBrief.contentIdeas,
      hookSuggestions: validBrief.hookSuggestions,
    };
    expect(parseBriefFromRaw(JSON.stringify(bad))).toBeNull();
  });

  it("parses JSON with trailing commas after repair", () => {
    const withTrailingComma =
      '{"outreachMessage":"Hi.","contentIdeas":["a","b","c","d","e"],"hookSuggestions":["x","y","z"],}';
    const result = parseBriefFromRaw(withTrailingComma);
    expect(result).not.toBeNull();
    expect(result!.outreachMessage).toBe("Hi.");
  });
});

describe("Invalid JSON repair (LLM-like output)", () => {
  it("markdown + trailing comma with response is parsed", () => {
    const llmStyle =
      "Here is the brief:\n```json\n" +
      '{"outreachMessage":"Hello.","contentIdeas":["i1","i2","i3","i4","i5"],"hookSuggestions":["h1","h2","h3"],}' +
      "\n```";
    const result = parseBriefFromRaw(llmStyle);
    expect(result).not.toBeNull();
    expect(result!.outreachMessage).toBe("Hello.");
    expect(result!.contentIdeas).toHaveLength(5);
    expect(result!.hookSuggestions).toHaveLength(3);
  });
});
