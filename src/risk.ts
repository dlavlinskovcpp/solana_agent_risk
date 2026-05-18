import type { AceServiceResult } from "./acedata";

export function calculateRiskScore(results: AceServiceResult[]): number {
    let score = 30;

    for (const result of results) {
        const data = result.data;

        if (typeof data.suspiciousMentions === "number") {
            score += data.suspiciousMentions * 5;
        }

        if (typeof data.openIssues === "number") {
            if (data.openIssues > 100) score += 15;
            else if (data.openIssues > 50) score += 10;
            else if (data.openIssues > 10) score += 5;
        }

        if (data.contractRisk === "high") score += 25;
        if (data.contractRisk === "medium") score += 15;
        if (data.contractRisk === "low") score += 5;

        if (data.reputationRisk === "high") score += 25;
        if (data.reputationRisk === "medium") score += 15;
        if (data.reputationRisk === "low") score += 5;
    }

    return Math.max(0, Math.min(100, score));
}
