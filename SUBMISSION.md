# Submission

## Project Name

Solana Agent: Autonomous Risk Intelligence MVP

## Category

Ace Data Cloud Usage / x402 Facilitator

## Brief Summary

An autonomous Solana risk intelligence agent that performs SAP-style tool discovery, calls three Ace Data Cloud services, calculates a dynamic risk score, creates an x402 Solana USDC payment requirement preview, and saves JSON plus Markdown reports.

## What The Agent Does

The agent receives a target such as `Jupiter Aggregator`, discovers local SAP-style tools, selects search/extract/summary capabilities, executes Ace Data Cloud services, scores risk signals, and prepares a payment requirement preview for the work performed.

## Why It Matters

Autonomous agents need a repeatable path from task trigger to tool discovery, paid data/service usage, structured analysis, and auditable output. This MVP shows that loop in a Solana-oriented setting while keeping funds and registration claims safe.

## Workflow

```text
trigger
-> SAP-style tool discovery
-> tool selection
-> Ace SERP Google
-> Ace WebExtrator Extract
-> Ace Chat Completions
-> risk scoring
-> x402 Solana USDC payment requirement preview
-> JSON / Markdown reports
```

## Ace Services Used

| Service                     | Endpoint                                        | Status in live-key demo |
| --------------------------- | ----------------------------------------------- | ----------------------- |
| Ace Google SERP API         | `https://api.acedata.cloud/serp/google`         | `live_ace_api`          |
| Ace WebExtrator Extract API | `https://api.acedata.cloud/webextrator/extract` | `live_ace_api`          |
| Ace Chat Completions API    | `https://api.acedata.cloud/v1/chat/completions` | `live_ace_api`          |

## x402 Payment Handling

The agent creates an x402 SDK-compatible Solana USDC payment requirement preview.

- Provider: `x402`
- Status: `handler_ready` when the Ace x402 adapter and handler factory are available.
- Asset: USDC
- Mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- Amount: `0.03` USDC
- Base units: `30000`
- Facilitator: `https://facilitator.acedata.cloud`
- Broadcasted: `false`

No real transaction is signed or broadcast by default.

## Devnet On-Chain Proof

The agent includes an optional Solana Devnet execution proof. When enabled, it hashes the assembled JSON report and records a short Memo Program transaction on Solana devnet containing the project name, workflow id, target, report hash, timestamp, and the label `devnet execution proof`.

- Provides an explorer-verifiable signature when enabled and funded with devnet SOL.
- Records only a report hash, not raw API responses.
- Does not send SOL or USDC payments.
- Does not claim SAP mainnet registration.
- Does not claim x402 payment settlement.

Latest recorded proof:

- Network: Solana Devnet
- Method: Memo Program
- Signature: `3Lc15ed5PFuEZWPXXykFL1oicAZhi5Vqx7cyu1c49hveaVJvzwqnW4qyZX2akwv5KUMKCUWGo6bks7ayd3V6GSSo`
- Explorer: [🔍 **View transaction in Solana Explorer**](https://explorer.solana.com/tx/3Lc15ed5PFuEZWPXXykFL1oicAZhi5Vqx7cyu1c49hveaVJvzwqnW4qyZX2akwv5KUMKCUWGo6bks7ayd3V6GSSo?cluster=devnet)

## SAP Status

SAP is represented as SAP-style discovery plus SAP SDK probe/simulation support. The repository includes probes for SDK import, PDA derivation, account inspection, register instruction building, and simulation.

This submission does not claim SAP mainnet registration. Registration remains in simulation/preview mode because the public mainnet registration flow had known builder-facing issues during the bounty period, including `global_registry` / Anchor `3007` errors and official onboarding loading problems, and because mainnet registration requires real funds.

## Safety Statement

No API keys, private keys, private funds, real x402 broadcasts, payment volume, escrow settlement, or SAP mainnet registration success are claimed. `.env`, `.keys`, generated JSON reports, and generated Markdown reports are ignored by Git.

## Suggested X/Twitter Post

Built an autonomous Solana risk intelligence agent for the OOBE Protocol / Ace Data Cloud bounty.

It runs SAP-style tool discovery, calls 3 Ace Data Cloud services, generates a dynamic risk score, creates an x402 Solana USDC payment requirement preview, and saves auditable JSON/Markdown reports.

No mainnet payment broadcast, no private funds used, and no false SAP mainnet registration claim.
