import type { SapTool } from "./sap";

export type AceServiceCategory =
  | "SERP"
  | "WEB_EXTRACT"
  | "LLM_SUMMARY";

export const ACE_SERP_GOOGLE_ENDPOINT =
  "https://api.acedata.cloud/serp/google";
export const ACE_WEBEXTRATOR_EXTRACT_ENDPOINT =
  "https://api.acedata.cloud/webextrator/extract";
export const ACE_CHAT_COMPLETIONS_ENDPOINT =
  "https://api.acedata.cloud/v1/chat/completions";

export type AceServiceResult = {
  serviceName: string;
  category: AceServiceCategory;
  toolId: string;
  status: "live_ace_api" | "mocked_adapter";
  endpoint: string;
  data: Record<string, unknown>;
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

function requireAceApiKey(): string | null {
  return process.env.ACE_API_KEY || null;
}

function shouldUseLiveAceApi(enableRealHttp: boolean): boolean {
  return enableRealHttp && Boolean(requireAceApiKey());
}

function projectUrlForTarget(target: string): string {
  const normalized = target.toLowerCase();

  if (normalized.includes("jupiter")) {
    return "https://jup.ag";
  }

  if (normalized.includes("tensor")) {
    return "https://www.tensor.trade";
  }

  return "https://solana.com";
}

function errorText(error: unknown): string {
  if (error instanceof Error) {
    const cause =
      "cause" in error && error.cause
        ? `; cause: ${String(error.cause)}`
        : "";

    return `${error.message}${cause}`;
  }

  return String(error);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function mockedResult(input: {
  serviceName: string;
  category: AceServiceCategory;
  tool: SapTool;
  endpoint: string;
  data: Record<string, unknown>;
}): AceServiceResult {
  return {
    serviceName: input.serviceName,
    category: input.category,
    toolId: input.tool.id,
    status: "mocked_adapter",
    endpoint: input.endpoint,
    data: input.data,
  };
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

async function postAceJson<T>(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<{
  ok: boolean;
  status: number;
  text: string;
  json: T | null;
}> {
  let response: Response | null = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      break;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }

      await wait(500);
    }
  }

  if (!response) {
    throw new Error("Ace Data Cloud request did not return a response");
  }

  const text = await response.text();

  try {
    return {
      ok: response.ok,
      status: response.status,
      text,
      json: JSON.parse(text) as T,
    };
  } catch {
    return {
      ok: response.ok,
      status: response.status,
      text,
      json: null,
    };
  }
}

export async function callAceSearchService(
  tool: SapTool,
  target: string,
  enableRealHttp: boolean,
): Promise<AceServiceResult> {
  console.log(`\n[AceData] Calling Ace SERP Google service via tool: ${tool.name}`);

  const apiKey = requireAceApiKey();

  if (!shouldUseLiveAceApi(enableRealHttp) || !apiKey) {
    return mockedResult({
      serviceName: "ace_serp_google_service",
      category: "SERP",
      tool,
      endpoint: ACE_SERP_GOOGLE_ENDPOINT,
      data: {
        target,
        reason: apiKey
          ? "ENABLE_REAL_HTTP is not true"
          : "ACE_API_KEY is not set",
        query: `${target} Solana DeFi risk security`,
      },
    });
  }

  try {
    const result = await postAceJson<Record<string, unknown>>(
      ACE_SERP_GOOGLE_ENDPOINT,
      apiKey,
      {
        query: `${target} Solana DeFi risk security`,
        type: "search",
        country: "US",
        language: "en",
        number: 5,
        page: 1,
      },
    );

    if (!result.ok) {
      return mockedResult({
        serviceName: "ace_serp_google_service",
        category: "SERP",
        tool,
        endpoint: ACE_SERP_GOOGLE_ENDPOINT,
        data: {
          target,
          aceHttpStatus: result.status,
          aceError: result.text,
          fallback: true,
        },
      });
    }

    return {
      serviceName: "ace_serp_google_service",
      category: "SERP",
      toolId: tool.id,
      status: "live_ace_api",
      endpoint: ACE_SERP_GOOGLE_ENDPOINT,
      data: {
        target,
        source: "ace_data_cloud_serp_google",
        query: `${target} Solana DeFi risk security`,
        response: result.json,
      },
    };
  } catch (error) {
    return mockedResult({
      serviceName: "ace_serp_google_service",
      category: "SERP",
      tool,
      endpoint: ACE_SERP_GOOGLE_ENDPOINT,
      data: {
        target,
        aceError: errorText(error),
        fallback: true,
      },
    });
  }
}

export async function callAceWebExtractService(
  tool: SapTool,
  target: string,
  enableRealHttp: boolean,
): Promise<AceServiceResult> {
  console.log(`\n[AceData] Calling Ace WebExtrator service via tool: ${tool.name}`);

  const apiKey = requireAceApiKey();
  const url = projectUrlForTarget(target);

  if (!shouldUseLiveAceApi(enableRealHttp) || !apiKey) {
    return mockedResult({
      serviceName: "ace_webextrator_extract_service",
      category: "WEB_EXTRACT",
      tool,
      endpoint: ACE_WEBEXTRATOR_EXTRACT_ENDPOINT,
      data: {
        target,
        url,
        reason: apiKey
          ? "ENABLE_REAL_HTTP is not true"
          : "ACE_API_KEY is not set",
      },
    });
  }

  try {
    const result = await postAceJson<Record<string, unknown>>(
      ACE_WEBEXTRATOR_EXTRACT_ENDPOINT,
      apiKey,
      {
        url,
        expected_type: "article",
        enable_llm: true,
      },
    );

    if (!result.ok) {
      return mockedResult({
        serviceName: "ace_webextrator_extract_service",
        category: "WEB_EXTRACT",
        tool,
        endpoint: ACE_WEBEXTRATOR_EXTRACT_ENDPOINT,
        data: {
          target,
          url,
          aceHttpStatus: result.status,
          aceError: result.text,
          fallback: true,
        },
      });
    }

    return {
      serviceName: "ace_webextrator_extract_service",
      category: "WEB_EXTRACT",
      toolId: tool.id,
      status: "live_ace_api",
      endpoint: ACE_WEBEXTRATOR_EXTRACT_ENDPOINT,
      data: {
        target,
        source: "ace_data_cloud_webextrator_extract",
        url,
        response: result.json,
      },
    };
  } catch (error) {
    return mockedResult({
      serviceName: "ace_webextrator_extract_service",
      category: "WEB_EXTRACT",
      tool,
      endpoint: ACE_WEBEXTRATOR_EXTRACT_ENDPOINT,
      data: {
        target,
        url,
        aceError: errorText(error),
        fallback: true,
      },
    });
  }
}

export async function callAceChatCompletionsService(
  tool: SapTool,
  target: string,
  enableRealHttp: boolean,
): Promise<AceServiceResult> {
  console.log(`\n[AceData] Calling Ace LLM summary service via tool: ${tool.name}`);

  const apiKey = requireAceApiKey();

  if (!shouldUseLiveAceApi(enableRealHttp) || !apiKey) {
    return mockedResult({
      serviceName: "ace_llm_summary_service",
      category: "LLM_SUMMARY",
      tool,
      endpoint: ACE_CHAT_COMPLETIONS_ENDPOINT,
      data: {
        target,
        reason: apiKey
          ? "ENABLE_REAL_HTTP is not true"
          : "ACE_API_KEY is not set",
        decision: "manual_review_required",
      },
    });
  }

  try {
    const result = await postAceJson<AceChatCompletionResponse>(
      ACE_CHAT_COMPLETIONS_ENDPOINT,
      apiKey,
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an autonomous Solana risk intelligence service. Return concise JSON only.",
          },
          {
            role: "user",
            content: `Analyze ${target} on Solana. Return JSON with risk_level, reasons, and decision.`,
          },
        ],
      },
    );

    if (!result.ok || !result.json) {
      return mockedResult({
        serviceName: "ace_llm_summary_service",
        category: "LLM_SUMMARY",
        tool,
        endpoint: ACE_CHAT_COMPLETIONS_ENDPOINT,
        data: {
          target,
          aceHttpStatus: result.status,
          aceError: result.text,
          fallbackSummary:
            "Ace Data Cloud API call failed, fallback summary was used.",
          decision: "manual_review_required",
        },
      });
    }

    const content = result.json.choices?.[0]?.message?.content ?? "";

    return {
      serviceName: "ace_llm_summary_service",
      category: "LLM_SUMMARY",
      toolId: tool.id,
      status: "live_ace_api",
      endpoint: ACE_CHAT_COMPLETIONS_ENDPOINT,
      data: {
        target,
        source: "ace_data_cloud_chat_completions",
        model: result.json.model,
        completionId: result.json.id,
        finishReason: result.json.choices?.[0]?.finish_reason,
        parsed: extractJsonFromMarkdown(content),
        rawContent: content,
        usage: result.json.usage,
      },
    };
  } catch (error) {
    return mockedResult({
      serviceName: "ace_llm_summary_service",
      category: "LLM_SUMMARY",
      tool,
      endpoint: ACE_CHAT_COMPLETIONS_ENDPOINT,
      data: {
        target,
        aceError: errorText(error),
        fallbackSummary:
          "Ace Data Cloud API call failed, fallback summary was used.",
        decision: "manual_review_required",
      },
    });
  }
}
