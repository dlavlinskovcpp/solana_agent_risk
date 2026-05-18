import { getJson } from "./http";
import type { SapTool } from "./sap";

export type AceServiceCategory =
  | "SERP"
  | "MARKET_RISK"
  | "LLM_SUMMARY";

export type AceServiceResult = {
  serviceName: string;
  category: AceServiceCategory;
  toolId: string;
  status: "live_probe" | "live_ace_api" | "mocked_adapter";
  data: Record<string, unknown>;
};

type GitHubRepoResponse = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
};

type AceChatCompletionResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: Record<string, unknown>;
};

function repoForTarget(target: string): string {
  const normalized = target.toLowerCase();

  if (normalized.includes("jupiter")) {
    return "jup-ag/metis-binary";
  }

  if (normalized.includes("tensor")) {
    return "tensor-foundation/tensor-vipers";
  }

  return "solana-labs/solana";
}

function extractJsonFromMarkdown(text: string): unknown {
  const trimmed = text.trim();

  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  const rawJson = fenced ? fenced[1] : trimmed;

  try {
    return JSON.parse(rawJson);
  } catch {
    return {
      raw: text,
      parseWarning: "model_response_was_not_valid_json",
    };
  }
}

export async function callAceSearchService(
  tool: SapTool,
  target: string,
  enableRealHttp: boolean,
): Promise<AceServiceResult> {
  console.log(`\n[AceData] Calling SERP intelligence service via tool: ${tool.name}`);

  if (enableRealHttp) {
    const repo = repoForTarget(target);
    const url = `https://api.github.com/repos/${repo}`;

    const response = await getJson<GitHubRepoResponse>(url, {
      "User-Agent": "solana-agent-mvp",
      Accept: "application/vnd.github+json",
    });

    return {
      serviceName: "ace_serp_intelligence_service",
      category: "SERP",
      toolId: tool.id,
      status: "live_probe",
      data: {
        target,
        source: "github_public_api",
        repo: response.full_name,
        description: response.description,
        stars: response.stargazers_count,
        forks: response.forks_count,
        openIssues: response.open_issues_count,
      },
    };
  }

  return {
    serviceName: "ace_serp_intelligence_service",
    category: "SERP",
    toolId: tool.id,
    status: "mocked_adapter",
    data: {
      target,
      source: "mock_serp",
      mentions: 128,
      suspiciousMentions: 4,
      sentiment: "mixed",
    },
  };
}

export async function callAceRiskService(
  tool: SapTool,
  target: string,
): Promise<AceServiceResult> {
  console.log(`\n[AceData] Calling market risk service via tool: ${tool.name}`);

  return {
    serviceName: "ace_market_risk_service",
    category: "MARKET_RISK",
    toolId: tool.id,
    status: "mocked_adapter",
    data: {
      target,
      contractRisk: "medium",
      documentationRisk: "low",
      reputationRisk: "medium",
      liquidityRisk: "medium",
      recommendation: "manual_review_required",
    },
  };
}

export async function callAceSummaryService(
  tool: SapTool,
  target: string,
): Promise<AceServiceResult> {
  console.log(`\n[AceData] Calling LLM summary service via tool: ${tool.name}`);

  const apiKey = process.env.ACE_API_KEY;

  if (!apiKey) {
    return {
      serviceName: "ace_llm_summary_service",
      category: "LLM_SUMMARY",
      toolId: tool.id,
      status: "mocked_adapter",
      data: {
        target,
        summary:
          "The project has moderate public risk signals and requires deeper manual review before trust assumptions are made.",
        decision:
          "The autonomous agent does not mark the target as trusted without additional verification.",
        reason: "ACE_API_KEY is not set",
      },
    };
  }

  const response = await fetch("https://api.acedata.cloud/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an autonomous risk intelligence service. Return concise JSON only.",
        },
        {
          role: "user",
          content: `Analyze ${target} on Solana. Return JSON with risk_level, reasons, and decision.`,
        },
      ],
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    return {
      serviceName: "ace_llm_summary_service",
      category: "LLM_SUMMARY",
      toolId: tool.id,
      status: "mocked_adapter",
      data: {
        target,
        aceHttpStatus: response.status,
        aceError: text,
        fallbackSummary:
          "Ace Data Cloud API call failed, fallback summary was used.",
        decision: "manual_review_required",
      },
    };
  }

  const parsed = JSON.parse(text) as AceChatCompletionResponse;
  const content = parsed.choices?.[0]?.message?.content ?? "";

  return {
    serviceName: "ace_llm_summary_service",
    category: "LLM_SUMMARY",
    toolId: tool.id,
    status: "live_ace_api",
    data: {
      target,
      source: "ace_data_cloud_chat_completions",
      model: parsed.model,
      completionId: parsed.id,
      finishReason: parsed.choices?.[0]?.finish_reason,
      parsed: extractJsonFromMarkdown(content),
      rawContent: content,
      usage: parsed.usage,
    },
  };
}
