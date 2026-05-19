# Sanitized Demo Output

This is a shortened, sanitized example of a successful `npm run demo:jupiter:proof` run. It does not include API keys or large raw API responses.

```text
=== AGENT STARTED ===
Mode: mock
Real HTTP: true
Target: Jupiter Aggregator
RPC: https://api.devnet.solana.com
SAP registration mode: simulation
Real x402 payment broadcast: disabled
Devnet on-chain proof: enabled
Agent public key: <local-agent-public-key>
Agent SOL balance: 0

[SAP-style] Discovering tools for target: Jupiter Aggregator
[SAP-style] Selected search tool: Web Search Tool
[SAP-style] Selected analysis tool: Risk Analyzer Tool
[SAP-style] Selected summary tool: Summary Generator Tool

[AceData] Calling Ace SERP Google service via tool: Web Search Tool
[AceData] Calling Ace WebExtrator service via tool: Risk Analyzer Tool
[AceData] Calling Ace LLM summary service via tool: Summary Generator Tool
```

## Report Highlights

```json
{
  "target": "Jupiter Aggregator",
  "riskScore": 72,
  "steps": [
    "trigger_received",
    "sap_style_tools_discovered",
    "sap_style_tools_selected",
    "ace_serp_google_completed",
    "ace_webextrator_extract_completed",
    "ace_chat_completions_completed",
    "x402_payment_requirement_preview_created",
    "devnet_onchain_execution_proof_recorded"
  ],
  "aceResults": [
    {
      "serviceName": "ace_serp_google_service",
      "category": "SERP",
      "status": "live_ace_api",
      "endpoint": "https://api.acedata.cloud/serp/google"
    },
    {
      "serviceName": "ace_webextrator_extract_service",
      "category": "WEB_EXTRACT",
      "status": "live_ace_api",
      "endpoint": "https://api.acedata.cloud/webextrator/extract"
    },
    {
      "serviceName": "ace_llm_summary_service",
      "category": "LLM_SUMMARY",
      "status": "live_ace_api",
      "endpoint": "https://api.acedata.cloud/v1/chat/completions"
    }
  ],
  "payment": {
    "provider": "x402",
    "status": "handler_ready",
    "assetSymbol": "USDC",
    "assetMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "facilitator": "https://facilitator.acedata.cloud",
    "sdk": {
      "adapterLoaded": true,
      "handlerCreated": true,
      "broadcasted": false
    }
  },
  "onchainProof": {
    "status": "recorded",
    "network": "solana-devnet",
    "method": "memo",
    "reportHash": "sha256:<sanitized-report-hash>",
    "signature": "<devnet-transaction-signature>",
    "explorerUrl": "https://explorer.solana.com/tx/<signature>?cluster=devnet",
    "memoProgramId": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    "broadcasted": true
  }
}
```

The run ends with paths similar to:

```text
JSON report saved to: /Users/dmitry/solana-agent/runs/agent-report-<timestamp>.json
Markdown report saved to: /Users/dmitry/solana-agent/runs/agent-report-<timestamp>.md
```
