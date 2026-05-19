import crypto from "crypto";
import { discoverSapTools, selectTool, type SapTool } from "./sap";
import {
    callAceChatCompletionsService,
    callAceSearchService,
    callAceWebExtractService,
    type AceServiceResult,
} from "./acedata";
import { settleX402Payment, type PaymentRecord } from "./payment";
import { calculateRiskScore } from "./risk";
import type { SapRegistrationMode } from "./config";
import type { OnchainProof } from "./onchain-proof";

export type AgentTask = {
    target: string;
    mode?: "mock" | "real";
    enableRealHttp?: boolean;
    enableRealX402Payment?: boolean;
    aceFacilitatorUrl?: string;
    agentPublicKey?: string;
    sapRegistrationMode?: SapRegistrationMode;
};

export type AgentReport = {
    workflowId: string;
    target: string;
    riskScore: number;
    toolsUsed: SapTool[];
    aceResults: AceServiceResult[];
    payment: PaymentRecord;
    signals: string[];
    steps: string[];
    mode: "mock" | "real";
    sapRegistrationMode: SapRegistrationMode;
    realX402BroadcastEnabled: boolean;
    onchainProof?: OnchainProof;
};

export async function runWorkflow(task: AgentTask): Promise<AgentReport> {
    const workflowId = crypto.randomUUID();
    const steps: string[] = [];

    steps.push("trigger_received");

    const tools = await discoverSapTools(task.target);
    steps.push("sap_style_tools_discovered");

    const searchTool = selectTool(tools, "search");
    const webExtractTool = selectTool(tools, "analysis");
    const summaryTool = selectTool(tools, "summary");
    steps.push("sap_style_tools_selected");

    const searchResult = await callAceSearchService(
        searchTool,
        task.target,
        task.enableRealHttp ?? false,
    );
    steps.push("ace_serp_google_completed");

    const webExtractResult = await callAceWebExtractService(
        webExtractTool,
        task.target,
        task.enableRealHttp ?? false,
    );
    steps.push("ace_webextrator_extract_completed");

    const chatCompletionsResult = await callAceChatCompletionsService(
        summaryTool,
        task.target,
        task.enableRealHttp ?? false,
    );
    steps.push("ace_chat_completions_completed");

    const payment = await settleX402Payment(
        workflowId,
        0.03,
        task.aceFacilitatorUrl ?? "https://facilitator.acedata.cloud",
        task.agentPublicKey ?? "agent-controlled-wallet",
        task.enableRealX402Payment ?? false,
    );
    steps.push("x402_payment_requirement_preview_created");

    const aceResults = [searchResult, webExtractResult, chatCompletionsResult];
    const riskScore = calculateRiskScore(aceResults);

    return {
        workflowId,
        target: task.target,
        riskScore,
        toolsUsed: [searchTool, webExtractTool, summaryTool],
        aceResults,
        payment,
        signals: [
            "Public mentions found",
            "Moderate reputation risk",
            "Summary generated from AI service output",
            "x402 payment requirement preview generated",
        ],
        mode: task.mode ?? "mock",
        sapRegistrationMode: task.sapRegistrationMode ?? "simulation",
        realX402BroadcastEnabled: task.enableRealX402Payment ?? false,
        steps,
    };
}
