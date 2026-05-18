import crypto from "crypto";
import { discoverSapTools, selectTool, type SapTool } from "./sap";
import {
  callAceRiskService,
  callAceSearchService,
  callAceSummaryService,
  type AceServiceResult,
} from "./acedata";
import { settleX402Payment, type PaymentRecord } from "./payment";
import { calculateRiskScore } from "./risk";

export type AgentTask = {
  target: string;
  mode?: "mock" | "real";
  enableRealHttp?: boolean;
  aceFacilitatorUrl?: string;
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
};

export async function runWorkflow(task: AgentTask): Promise<AgentReport> {
  const workflowId = crypto.randomUUID();
  const steps: string[] = [];

  steps.push("trigger_received");

  const tools = await discoverSapTools(task.target);
  steps.push("sap_tools_discovered");

  const searchTool = selectTool(tools, "search");
  const riskTool = selectTool(tools, "analysis");
  const summaryTool = selectTool(tools, "summary");
  steps.push("sap_tools_selected");

  const searchResult = await callAceSearchService(
    searchTool,
    task.target,
    task.enableRealHttp ?? false,
  );
  steps.push("ace_search_service_completed");

  const riskResult = await callAceRiskService(riskTool, task.target);
  steps.push("ace_risk_service_completed");

  const summaryResult = await callAceSummaryService(summaryTool, task.target);
  steps.push("ace_summary_service_completed");

  const payment = await settleX402Payment(
    workflowId,
    0.03,
    task.aceFacilitatorUrl ?? "https://facilitator.acedata.cloud",
  );
  steps.push("x402_payment_requirement_preview_created");

  const aceResults = [searchResult, riskResult, summaryResult];
  const riskScore = calculateRiskScore(aceResults);

  return {
    workflowId,
    target: task.target,
    riskScore,
    toolsUsed: [searchTool, riskTool, summaryTool],
    aceResults,
    payment,
    signals: [
      "Public mentions found",
      "Moderate reputation risk",
      "Summary generated from AI service output",
      "x402 payment requirement preview generated",
    ],
    mode: task.mode ?? "mock",
    steps,
  };
}
