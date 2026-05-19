import "dotenv/config";
import {
  callAceChatCompletionsService,
  callAceSearchService,
  callAceWebExtractService,
} from "./acedata";
import type { SapTool } from "./sap";

const target = "Jupiter Aggregator";

const tools: Record<string, SapTool> = {
  search: {
    id: "probe-search",
    name: "Probe Search Tool",
    description: "Probe Ace SERP Google endpoint",
    category: "search",
  },
  analysis: {
    id: "probe-analysis",
    name: "Probe Web Extract Tool",
    description: "Probe Ace WebExtrator endpoint",
    category: "analysis",
  },
  summary: {
    id: "probe-summary",
    name: "Probe Summary Tool",
    description: "Probe Ace Chat Completions endpoint",
    category: "summary",
  },
};

async function main() {
  if (!process.env.ACE_API_KEY) {
    console.log("ACE_API_KEY is not set.");
    console.log("Add it to .env to run real Ace Data Cloud API probes.");
  }

  const results = [
    await callAceSearchService(tools.search, target, true),
    await callAceWebExtractService(tools.analysis, target, true),
    await callAceChatCompletionsService(tools.summary, target, true),
  ];

  console.log("\nAce Data Cloud probe summary:");
  console.log(
    JSON.stringify(
      results.map((result) => ({
        serviceName: result.serviceName,
        category: result.category,
        status: result.status,
        endpoint: result.endpoint,
        aceHttpStatus: result.data.aceHttpStatus,
        error: result.data.aceError,
        reason: result.data.reason,
      })),
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
