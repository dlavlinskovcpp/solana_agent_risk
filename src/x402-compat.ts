import "dotenv/config";
import path from "path";
import { pathToFileURL } from "url";
import { loadOrCreateAgentWallet } from "./wallet";

const SOLANA_MAINNET_USDC_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export type X402SolanaRequirement = {
  scheme: "exact";
  network: "solana";
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: "application/json";
  payTo: string;
  asset: string;
  extra: {
    decimals: number;
  };
};

export function buildX402SolanaRequirement(input: {
  workflowId: string;
  amountUsdc: number;
  payTo: string;
}): X402SolanaRequirement {
  return {
    scheme: "exact",
    network: "solana",
    maxAmountRequired: String(Math.round(input.amountUsdc * 1_000_000)),
    resource: `sap://agent-workflow/${input.workflowId}/ace-data-cloud-query`,
    description:
      "x402 Solana payment requirement for autonomous Ace Data Cloud service execution.",
    mimeType: "application/json",
    payTo: input.payTo,
    asset: SOLANA_MAINNET_USDC_MINT,
    extra: {
      decimals: 6,
    },
  };
}

async function importX402SdkAdapter(): Promise<{
  createX402PaymentHandler: (options: unknown) => unknown;
}> {
  const sdkPath = path.join(
    process.cwd(),
    "node_modules",
    "@acedatacloud",
    "x402-client",
    "dist",
    "sdkAdapter.js",
  );

  return import(pathToFileURL(sdkPath).href);
}

async function main() {
  const x402 = await importX402SdkAdapter();
  const wallet = loadOrCreateAgentWallet();

  const requirement = buildX402SolanaRequirement({
    workflowId: "compat-probe",
    amountUsdc: 0.03,
    payTo: wallet.publicKey.toBase58(),
  });

  console.log("Agent wallet:", wallet.publicKey.toBase58());

  console.log("\nX402 Solana-compatible requirement:");
  console.log(JSON.stringify(requirement, null, 2));

  console.log("\nX402 SDK adapter loaded:");
  console.log(Object.keys(x402));

  const handler = x402.createX402PaymentHandler({
    network: "solana",
    solanaWallet: wallet.keypair,
  });

  console.log("\nX402 handler created:", typeof handler);
  console.log("Payment was NOT signed or broadcasted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
