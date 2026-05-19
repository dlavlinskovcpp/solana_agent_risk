# Solana Agent: Autonomous Risk Intelligence MVP

Category: **Ace Data Cloud Usage / x402 Facilitator**

This repository is a preview-mode MVP submission for an autonomous Solana-oriented risk intelligence agent. It accepts a target project, discovers SAP-style tools, selects the right services, calls Ace Data Cloud adapters, calculates a dynamic risk score, creates an x402 Solana USDC payment requirement preview, and saves JSON plus Markdown reports.

## What The Agent Does

The agent runs a local end-to-end workflow for targets such as `Jupiter Aggregator` or `Tensor NFT Marketplace`.

It demonstrates:

- SAP-style tool discovery and tool selection.
- Three Ace Data Cloud service calls when `ACE_API_KEY` and `ENABLE_REAL_HTTP=true` are configured.
- Dynamic risk scoring from SERP results, extracted web text/signals, and LLM risk output.
- x402 SDK-compatible Solana USDC payment requirement preview.
- Ace x402 client adapter loading and handler readiness checks.
- Safe local reporting without private funds or mainnet payment broadcast.

## End-To-End Workflow

```text
trigger
-> SAP-style tool discovery
-> tool selection
-> Ace Data Cloud SERP Google API
-> Ace Data Cloud WebExtrator Extract API
-> Ace Data Cloud Chat Completions API
-> dynamic risk score
-> x402 Solana USDC payment requirement preview
-> JSON / Markdown report saved
```

The saved report includes these workflow steps:

```text
trigger_received
sap_style_tools_discovered
sap_style_tools_selected
ace_serp_google_completed
ace_webextrator_extract_completed
ace_chat_completions_completed
x402_payment_requirement_preview_created
```

## Ace Data Cloud Services

| Service                     | Endpoint               | Purpose                                                                            |
| --------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| Ace Google SERP API         | `/serp/google`         | Finds public search results and risk-related mentions for the target.              |
| Ace WebExtrator Extract API | `/webextrator/extract` | Extracts target website content and raw web signals.                               |
| Ace Chat Completions API    | `/v1/chat/completions` | Produces structured Solana risk analysis with `risk_level`, reasons, and decision. |

## x402 Payment Preview

The MVP creates an x402-compatible payment requirement, but it does not sign or broadcast a transaction.

- SDK package: `@acedatacloud/x402-client`.
- SDK adapter loaded: reported in each run under `payment.sdk.adapterLoaded`.
- Handler ready: reported under `payment.sdk.handlerCreated`.
- Asset: Solana mainnet USDC.
- USDC mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`.
- Amount: `0.03` USDC.
- Base units: `30000`.
- Facilitator: `https://facilitator.acedata.cloud`.
- Broadcast: disabled by default and reported as `broadcasted: false`.

The trace includes `real_x402_broadcast_disabled_by_safety_flag` in normal MVP mode.

## Optional Solana Devnet Execution Proof

The agent can optionally record a short Solana Memo transaction on Devnet with a SHA-256 hash of the assembled JSON report.

This proof is:

- Optional and disabled by default.
- Devnet only.
- A Memo Program record of the report hash, workflow id, target, and timestamp.
- Explorer-verifiable when the wallet has devnet SOL.
- Not SAP mainnet registration.
- Not x402 payment settlement.
- Not a SOL or USDC payment.

Enable it with:

```bash
ENABLE_DEVNET_ONCHAIN_PROOF=true npm run dev -- "Jupiter Aggregator"
```

Or run the combined live Ace plus Devnet proof demo:

```bash
npm run demo:jupiter:proof
```

The local agent wallet needs devnet SOL for transaction fees. If it has no devnet SOL, the agent saves the report anyway with `onchainProof.status` set to `skipped` or `failed` and a clear reason.
Latest recorded Devnet proof:

- Signature: `3Lc15ed5PFuEZWPXXykFL1oicAZhi5Vqx7cyu1c49hveaVJvzwqnW4qyZX2akwv5KUMKCUWGo6bks7ayd3V6GSSo`
- Explorer: `https://explorer.solana.com/tx/3Lc15ed5PFuEZWPXXykFL1oicAZhi5Vqx7cyu1c49hveaVJvzwqnW4qyZX2akwv5KUMKCUWGo6bks7ayd3V6GSSo?cluster=devnet`

## SAP Integration Status

This project presents SAP integration honestly as:

- SAP-style local tool discovery.
- SAP-style tool selection.
- SAP SDK probes for imports, PDA derivation, account checks, and register instruction construction.
- SAP registration simulation/preview mode.

It does **not** claim successful SAP mainnet registration. During the bounty period, the public SAP mainnet registration flow had builder-facing issues, including `global_registry` / Anchor `3007` errors and official onboarding loading problems reported by other builders. Mainnet registration also requires real mainnet funds. For that reason, registration is kept in simulation/preview mode in this MVP.

Useful SAP scripts are kept in `package.json`:

```bash
npm run probe:sdk
npm run probe:sap
npm run probe:sap:pda
npm run build:sap:register
npm run check:sap:agent
npm run simulate:sap:register
npm run simulate:sap:register:mainnet
```

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` locally and add your Ace key:

```text
ACE_API_KEY=your_local_key_here
```

Keep the default safety flags unless you are intentionally testing a local-only simulation:

```text
AGENT_MODE=mock
ENABLE_REAL_HTTP=false
ENABLE_REAL_X402_PAYMENT=false
ENABLE_DEVNET_ONCHAIN_PROOF=false
SAP_REGISTRATION_MODE=simulation
```

## How To Run Demo

Run the Jupiter demo with live Ace HTTP enabled:

```bash
npm run demo:jupiter
```

Run the Tensor demo:

```bash
npm run demo:tensor
```

Run the optional Devnet Memo proof demo:

```bash
npm run demo:jupiter:proof
```

Run probes:

```bash
npm run probe:ace
npm run probe:x402
npm run probe:x402:compat
```

Build TypeScript:

```bash
npm run build
```

## Reports

Each run saves:

- `runs/agent-report-*.json`
- `runs/agent-report-*.md`

The `runs/*.json` and `runs/*.md` files are ignored by Git so demo artifacts do not leak raw API responses or local runtime details into the repository.
