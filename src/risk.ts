import type { AceServiceResult } from "./acedata";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function countRiskWords(value: unknown): number {
  const text = (JSON.stringify(value ?? "") ?? "").toLowerCase();

  const words = [
    "risk",
    "vulnerability",
    "vulnerabilities",
    "exploit",
    "hack",
    "attack",
    "outage",
    "scrutiny",
    "contagion",
    "slippage",
    "regulatory",
    "volatility",
    "congestion",
  ];

  return words.reduce((count, word) => {
    const matches = text.match(new RegExp(`\\b${word}\\b`, "g"));
    return count + (matches?.length ?? 0);
  }, 0);
}

function getNested(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;

  for (const key of path) {
    if (
      typeof current !== "object" ||
      current === null ||
      !(key in current)
    ) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function findFirstArrayByKey(value: unknown, keys: string[]): unknown[] | null {
  if (Array.isArray(value)) {
    return null;
  }

  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  for (const child of Object.values(record)) {
    const found = findFirstArrayByKey(child, keys);

    if (found) {
      return found;
    }
  }

  return null;
}

function findFirstStringByKey(value: unknown, keys: string[]): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    if (typeof record[key] === "string") {
      return record[key] as string;
    }
  }

  for (const child of Object.values(record)) {
    const found = findFirstStringByKey(child, keys);

    if (found) {
      return found;
    }
  }

  return null;
}

function riskLevelScore(riskLevel: string): number {
  const normalized = riskLevel.toLowerCase();

  if (normalized.includes("critical")) {
    return 40;
  }

  if (normalized.includes("high")) {
    return 30;
  }

  if (normalized.includes("medium") || normalized.includes("moderate")) {
    return 20;
  }

  if (normalized.includes("low")) {
    return 5;
  }

  return 0;
}

export function calculateRiskScore(results: AceServiceResult[]): number {
  let score = 30;

  for (const result of results) {
    if (result.status === "live_ace_api") {
      score += 5;
    }

    if (result.category === "SERP") {
      const organic = findFirstArrayByKey(result.data, [
        "organic",
        "organic_results",
        "organicResults",
        "organicResultsItems",
      ]);

      if (organic) {
        score += Math.min(organic.length * 2, 12);
        score += Math.min(countRiskWords(organic) * 3, 24);
      }
    }

    if (result.category === "WEB_EXTRACT") {
      const extractedText = findFirstStringByKey(result.data, [
        "text",
        "content",
        "markdown",
        "extractedText",
        "rawText",
        "raw_text",
      ]);
      const rawSignals =
        getNested(result.data, ["response", "data", "rawSignals"]) ??
        getNested(result.data, ["response", "rawSignals"]) ??
        getNested(result.data, ["rawSignals"]);
      const textLength =
        extractedText?.length ??
        getNested(result.data, ["response", "data", "rawSignals", "textLength"]);

      if (typeof textLength === "number" && textLength > 500) {
        score += 5;
      }

      score += Math.min(countRiskWords(extractedText ?? rawSignals) * 2, 24);
    }

    if (result.category === "LLM_SUMMARY") {
      const riskLevel =
        getNested(result.data, ["parsed", "risk_level"]) ??
        getNested(result.data, ["parsed", "riskLevel"]) ??
        getNested(result.data, ["risk_level"]) ??
        getNested(result.data, ["riskLevel"]);

      if (typeof riskLevel === "string") {
        score += riskLevelScore(riskLevel);
      }

      score += Math.min(countRiskWords(result.data) * 2, 20);
    }
  }

  return clamp(score, 0, 100);
}
