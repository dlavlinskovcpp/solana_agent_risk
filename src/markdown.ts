import type { AgentReport } from "./workflow";

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
                JSON.stringify(result.data, null, 2),
                "```",
            ].join("\n");
        })
        .join("\n\n");

    const steps = report.steps.map((step) => `- ${step}`).join("\n");

    const signals = report.signals.map((signal) => `- ${signal}`).join("\n");

    return `# Autonomous Risk Report

## Target

${report.target}

## Workflow ID

${report.workflowId}

## Mode

${report.mode}

## Risk Score

${report.riskScore}/100

## Signals

${signals}

## Tools Used

${tools}

## Service Results

${services}

## Payment

- Provider: ${report.payment.provider}
- Status: ${report.payment.status}
- Amount USD: ${report.payment.amountUsd}
- Reference: ${report.payment.reference}

## Workflow Steps

${steps}
`;
}
