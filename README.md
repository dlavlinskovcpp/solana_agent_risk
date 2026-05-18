# Solana Autonomous Risk Agent

Autonomous research agent for the **OOBE Protocol / Ace Data Cloud** bounty.
The agent demonstrates an end-to-end autonomous workflow:

```text
trigger
→ SAP-style tool discovery
→ tool selection
→ Ace Data Cloud service execution
→ risk scoring
→ x402 payment requirement preview
→ JSON / Markdown report generation

Category

Ace Data Cloud Usage — x402 Facilitator

What the agent does

The agent receives a target project name, discovers suitable tools, executes three service categories, calculates a risk score, creates an x402 payment requirement preview, and saves a full machine-readable and human-readable report.

Example target:

ENABLE_REAL_HTTP=true npm run dev -- "Jupiter Aggregator"

Implemented workflow

The current workflow includes:

1. Trigger received from CLI input.
2. SAP-style tool discovery.
3. Tool selection for search, analysis, and summary tasks.
4. Ace Data Cloud-style service execution.
5. Risk score calculation.
6. x402 402 Payment Required preview.
7. JSON and Markdown report generation.

Example workflow steps:

trigger_received
sap_tools_discovered
sap_tools_selected
ace_search_service_completed
ace_risk_service_completed
ace_summary_service_completed
x402_payment_requirement_preview_created

Ace Data Cloud service categories

The agent executes three distinct service categories:

Category	Service name	Current status
SERP	ace_serp_intelligence_service	live public HTTP probe
Market / Risk	ace_market_risk_service	mocked adapter
LLM Summary	ace_llm_summary_service	mocked adapter

The SERP service can run a real HTTP probe when ENABLE_REAL_HTTP=true.

x402 payment preview

The agent generates an x402-style payment requirement preview instead of broadcasting a real payment.

Example payment object:

{
  "provider": "x402",
  "status": "payment_required_preview",
  "httpStatus": 402,
  "amountUsd": 0.03,
  "asset": "USDC",
  "facilitator": "https://facilitator.acedata.cloud"
}

No private funds are used in the current MVP.

SAP integration status

The project includes SAP SDK integration probes:

* SAP SDK import check
* SAP client inspection
* SAP PDA derivation
* registerAgent instruction construction
* devnet simulation diagnostics

The project uses:

@oobe-protocol-labs/synapse-sap-sdk@0.17.0

The registerAgent instruction is built with the documented 5-account layout:

wallet
agent
agent_stats
global_registry
system_program

Mainnet registration is not performed in this repository because it requires real mainnet SOL for transaction fees and rent.

Project structure

src/
  index.ts                         CLI entry point
  workflow.ts                      Autonomous workflow orchestration
  sap.ts                           SAP-style tool discovery
  acedata.ts                       Ace Data Cloud service adapters
  payment.ts                       x402 payment requirement preview
  risk.ts                          Risk scoring
  wallet.ts                        Stable Solana agent wallet
  funding.ts                       Balance / optional devnet airdrop
  storage.ts                       JSON / Markdown report saving
  markdown.ts                      Markdown report renderer
  sdk-probe.ts                     SDK import probe
  sap-real-probe.ts                SAP client probe
  sap-pda-probe.ts                 SAP PDA derivation probe
  sap-build-register.ts            registerAgent instruction builder
  sap-check-agent.ts               SAP account checker
  sap-simulate-register.ts         devnet simulation
  sap-simulate-register-mainnet.ts mainnet simulation without sending

Setup

Install dependencies:

npm install

Create .env:

cp .env.example .env

Run the agent:

ENABLE_REAL_HTTP=true npm run dev -- "Jupiter Aggregator"

Run another demo target:

ENABLE_REAL_HTTP=true npm run dev -- "Tensor NFT Marketplace"

Reports

Each run creates:

runs/agent-report-*.json
runs/agent-report-*.md

Reports are intentionally ignored by Git to avoid committing generated artifacts.

Safety

This repository does not include:

* private wallet keys
* API keys
* real payment execution
* mainnet transaction broadcasting

The .keys/ directory and .env file are ignored by Git.

Current limitations

* SAP discovery is currently implemented as SAP-style local discovery.
* Ace Data Cloud risk and summary services are adapter mocks.
* x402 payment is represented as a payment requirement preview.
* SAP mainnet registration is pending because it requires real SOL and official registration flow confirmation.

Submission summary

This MVP demonstrates an autonomous agent loop:

target input
→ SAP-style discovery
→ three Ace Data Cloud service categories
→ dynamic risk score
→ x402 payment requirement preview
→ persistent report
```
