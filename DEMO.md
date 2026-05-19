# Demo Walkthrough

Use this as a short video or live demo script.

## 1. Install

```bash
npm install
```

## 2. Configure Local Environment

```bash
cp .env.example .env
```

Add your local Ace Data Cloud key to `.env`:

```text
ACE_API_KEY=your_local_key_here
```

Keep safety defaults:

```text
AGENT_MODE=mock
ENABLE_REAL_HTTP=false
ENABLE_REAL_X402_PAYMENT=false
ENABLE_DEVNET_ONCHAIN_PROOF=false
SAP_REGISTRATION_MODE=simulation
```

The demo script sets `ENABLE_REAL_HTTP=true` for the run.

## 3. Run Jupiter Demo

```bash
npm run demo:jupiter
```

## 4. Expected Proof Points

In a successful live Ace run with `ACE_API_KEY` configured, the console and JSON report should show:

- `ace_serp_google_service`: `live_ace_api`
- `ace_webextrator_extract_service`: `live_ace_api`
- `ace_llm_summary_service`: `live_ace_api`
- x402 status: `handler_ready`
- `adapterLoaded: true`
- `handlerCreated: true`
- `broadcasted: false`
- JSON report saved to `runs/agent-report-*.json`
- Markdown report saved to `runs/agent-report-*.md`

If `ACE_API_KEY` is missing or an API call fails, the run still completes with `status: "mocked_adapter"` and includes the reason or HTTP error text in the report.

## 5. Optional Devnet Proof Demo

The agent can record the report hash using the Solana Memo Program on devnet. This is optional and is not SAP mainnet registration or x402 payment settlement.

The local agent wallet needs devnet SOL for transaction fees. If the wallet is unfunded, the report is still saved with `onchainProof.status` set to `skipped` or `failed`.

Run with the dedicated script:

```bash
npm run demo:jupiter:proof
```

Or run the equivalent command directly:

```bash
ENABLE_REAL_HTTP=true ENABLE_DEVNET_ONCHAIN_PROOF=true npm run dev -- "Jupiter Aggregator"
```

Expected additional proof points when recorded:

- `onchainProof.status`: `recorded`
- `onchainProof.network`: `solana-devnet`
- `onchainProof.method`: `memo`
- `onchainProof.broadcasted`: `true`
- Explorer URL under `onchainProof.explorerUrl`
