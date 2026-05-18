import crypto from "crypto";
import path from "path";
import { pathToFileURL } from "url";

const SOLANA_MAINNET_USDC_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export type PaymentStatus =
  | "simulated"
  | "payment_required_preview"
  | "handler_ready"
  | "paid"
  | "failed";

export type X402PaymentRequirement = {
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

export type PaymentRecord = {
  provider: "x402";
  status: PaymentStatus;
  httpStatus: 402;
  amountUsd: number;
  assetSymbol: "USDC";
  assetMint: string;
  reference: string;
  facilitator: string;
  resource: string;
  requirement: X402PaymentRequirement;
  sdk: {
    package: "@acedatacloud/x402-client";
    adapterLoaded: boolean;
    handlerCreated: boolean;
    importMode: "package_export" | "file_url_workaround" | "not_loaded";
    broadcasted: boolean;
  };
  trace: string[];
};

async function tryLoadX402SdkAdapter(): Promise<{
  adapterLoaded: boolean;
  handlerCreated: boolean;
  importMode: "package_export" | "file_url_workaround" | "not_loaded";
}> {
  try {
    const sdkPath = path.join(
      process.cwd(),
      "node_modules",
      "@acedatacloud",
      "x402-client",
      "dist",
      "sdkAdapter.js",
    );

    const x402 = await import(pathToFileURL(sdkPath).href);

    if (typeof x402.createX402PaymentHandler !== "function") {
      return {
        adapterLoaded: true,
        handlerCreated: false,
        importMode: "file_url_workaround",
      };
    }

    return {
      adapterLoaded: true,
      handlerCreated: true,
      importMode: "file_url_workaround",
    };
  } catch {
    return {
      adapterLoaded: false,
      handlerCreated: false,
      importMode: "not_loaded",
    };
  }
}

function usdcToBaseUnits(amountUsdc: number): string {
  return String(Math.round(amountUsdc * 1_000_000));
}

export async function settleX402Payment(
  workflowId: string,
  amountUsd: number,
  facilitatorUrl = "https://facilitator.acedata.cloud",
  payTo = "agent-controlled-wallet",
): Promise<PaymentRecord> {
  const reference = `x402-preview-${crypto
    .createHash("sha256")
    .update(`${workflowId}:${amountUsd}:${Date.now()}`)
    .digest("hex")
    .slice(0, 16)}`;

  const resource = `sap://agent-workflow/${workflowId}/ace-data-cloud-query`;

  const requirement: X402PaymentRequirement = {
    scheme: "exact",
    network: "solana",
    maxAmountRequired: usdcToBaseUnits(amountUsd),
    resource,
    description:
      "x402 Solana payment requirement for autonomous Ace Data Cloud service execution.",
    mimeType: "application/json",
    payTo,
    asset: SOLANA_MAINNET_USDC_MINT,
    extra: {
      decimals: 6,
    },
  };

  const sdkStatus = await tryLoadX402SdkAdapter();

  return {
    provider: "x402",
    status: sdkStatus.handlerCreated
      ? "handler_ready"
      : "payment_required_preview",
    httpStatus: 402,
    amountUsd,
    assetSymbol: "USDC",
    assetMint: SOLANA_MAINNET_USDC_MINT,
    reference,
    facilitator: facilitatorUrl,
    resource,
    requirement,
    sdk: {
      package: "@acedatacloud/x402-client",
      adapterLoaded: sdkStatus.adapterLoaded,
      handlerCreated: sdkStatus.handlerCreated,
      importMode: sdkStatus.importMode,
      broadcasted: false,
    },
    trace: [
      "x402_sdk_adapter_import_attempted",
      sdkStatus.adapterLoaded
        ? "x402_sdk_adapter_loaded"
        : "x402_sdk_adapter_not_loaded",
      sdkStatus.handlerCreated
        ? "x402_payment_handler_available"
        : "x402_payment_handler_unavailable",
      "solana_usdc_requirement_created",
      "http_402_payment_required_modeled",
      "facilitator_selected",
      "payment_not_signed_or_broadcasted_no_private_funds_used",
    ],
  };
}
