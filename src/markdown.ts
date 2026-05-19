import type { AceServiceResult } from "./acedata";
import type { AgentReport } from "./workflow";

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
}

function truncate(value: unknown, maxLength = 240): string {
    if (value === undefined || value === null) {
        return "";
    }

    const text =
        typeof value === "string" ? value : JSON.stringify(value, null, 2);

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 3)}...`;
}

function findFirstArrayByKey(value: unknown, keys: string[]): unknown[] | null {
    if (Array.isArray(value)) {
        return null;
    }

    const record = asRecord(value);

    if (!record) {
        return null;
    }

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

function serviceSummary(result: AceServiceResult): Record<string, unknown> {
    const data = result.data;
    const parsed = asRecord(data.parsed);
    const organic = findFirstArrayByKey(data, [
        "organic",
        "organic_results",
        "organicResults",
    ]);

    const summary: Record<string, unknown> = {
        serviceName: result.serviceName,
        category: result.category,
        status: result.status,
        endpoint: result.endpoint,
        query: data.query,
        url: data.url,
        model: data.model,
        organicResults: organic?.length,
        riskLevel: parsed?.risk_level ?? parsed?.riskLevel,
        decision: data.decision ?? parsed?.decision,
        fallback: data.fallback,
        reason: data.reason,
        aceHttpStatus: data.aceHttpStatus,
        aceError: truncate(data.aceError),
    };

    return Object.fromEntries(
        Object.entries(summary).filter(([, value]) => {
            return value !== undefined && value !== "";
        }),
    );
}

function buildOnchainProofSection(report: AgentReport): string {
    const proof = report.onchainProof;

    if (!proof) {
        return [
            "## Solana Devnet Execution Proof",
            "",
            "- Status: skipped",
            "- Reason: ENABLE_DEVNET_ONCHAIN_PROOF is false",
        ].join("\n");
    }

    if (proof.status === "recorded") {
        return [
            "## Solana Devnet Execution Proof",
            "",
            `- Status: ${proof.status}`,
            `- Network: ${proof.network}`,
            `- Method: ${proof.method}`,
            `- Report hash: ${proof.reportHash}`,
            `- Signature: ${proof.signature}`,
            `- Explorer URL: ${proof.explorerUrl}`,
            `- Memo program: ${proof.memoProgramId}`,
            `- Broadcasted: ${proof.broadcasted}`,
        ].join("\n");
    }

    return [
        "## Solana Devnet Execution Proof",
        "",
        `- Status: ${proof.status}`,
        `- Network: ${proof.network}`,
        `- Method: ${proof.method}`,
        `- Broadcasted: ${proof.broadcasted}`,
        `- Reason: ${proof.reason ?? "not recorded"}`,
    ].join("\n");
}

export function buildMarkdownReport(report: AgentReport): string {
    const tools = report.toolsUsed
        .map((tool) => `- ${tool.name} (${tool.category}): ${tool.description}`)
        .join("\n");

    const services = report.aceResults
        .map((result) => {
            return [
                `### ${result.serviceName}`,
                "",
                "```json",
                JSON.stringify(serviceSummary(result), null, 2),
                "```",
            ].join("\n");
        })
        .join("\n\n");

    const steps = report.steps.map((step) => `- ${step}`).join("\n");

    const signals = report.signals.map((signal) => `- ${signal}`).join("\n");

    return `# Autonomous Solana Risk Report

## Workflow

- Workflow ID: ${report.workflowId}
- Target: ${report.target}
- Mode: ${report.mode}
- SAP registration mode: ${report.sapRegistrationMode}
- Risk score: ${report.riskScore}/100

## Workflow Steps

${steps}

## Signals

${signals}

## Tools Used

${tools}

## Ace Data Cloud Results

${services}

${buildOnchainProofSection(report)}

## x402 Payment Preview

- Provider: ${report.payment.provider}
- Status: ${report.payment.status}
- HTTP status modeled: ${report.payment.httpStatus}
- Amount: ${report.payment.amountUsd} USDC
- Asset mint: ${report.payment.assetMint}
- Max amount required: ${report.payment.requirement.maxAmountRequired}
- Facilitator: ${report.payment.facilitator}
- Resource: ${report.payment.resource}
- Broadcasted: ${report.payment.sdk.broadcasted}
- Private funds used: ${report.payment.safety.privateFundsUsed}

## SDK Status

- Package: ${report.payment.sdk.package}
- Adapter loaded: ${report.payment.sdk.adapterLoaded}
- Handler created: ${report.payment.sdk.handlerCreated}
- Import mode: ${report.payment.sdk.importMode}
- Real broadcast requested: ${report.payment.safety.realBroadcastRequested}
- Real broadcast executed: ${report.payment.safety.realBroadcastExecuted}

## Safety Notes

This report is a local MVP artifact. It does not claim SAP mainnet registration, x402 payment broadcast, payment volume, escrow settlement, or use of private funds.
`;
}
