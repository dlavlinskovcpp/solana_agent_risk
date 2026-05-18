import crypto from "crypto";

export type PaymentStatus =
    | "simulated"
    | "payment_required_preview"
    | "paid"
    | "failed";

export type X402PaymentRequirement = {
    scheme: "exact";

    network: "solana-mainnet";

    maxAmountRequired: string;

    resource: string;

    description: string;

    mimeType: "application/json";

    payTo: string;

    asset: "SOL" | "USDC";

    facilitator: string;
};

export type PaymentRecord = {
    provider: "x402";

    status: PaymentStatus;

    httpStatus: 402;

    amountUsd: number;

    asset: "SOL" | "USDC";

    reference: string;

    facilitator: string;

    resource: string;

    requirement: X402PaymentRequirement;

    trace: string[];
};

export async function settleX402Payment(
    workflowId: string,

    amountUsd: number,

    facilitatorUrl = "https://facilitator.acedata.cloud",
): Promise<PaymentRecord> {
    const reference = `x402-preview-${crypto

        .createHash("sha256")

        .update(`${workflowId}:${amountUsd}:${Date.now()}`)

        .digest("hex")

        .slice(0, 16)}`;

    const resource = `sap://agent-workflow/${workflowId}/ace-data-cloud-query`;

    const requirement: X402PaymentRequirement = {
        scheme: "exact",

        network: "solana-mainnet",

        maxAmountRequired: amountUsd.toFixed(4),

        resource,

        description:
            "Payment requirement preview for autonomous Ace Data Cloud service execution.",

        mimeType: "application/json",

        payTo: "agent-controlled-wallet",

        asset: "USDC",

        facilitator: facilitatorUrl,
    };

    return {
        provider: "x402",

        status: "payment_required_preview",

        httpStatus: 402,

        amountUsd,

        asset: "USDC",

        reference,

        facilitator: facilitatorUrl,

        resource,

        requirement,

        trace: [
            "x402_client_loaded",

            "payment_requirement_preview_created",

            "http_402_payment_required_modeled",

            "facilitator_selected",

            "payment_not_broadcasted_no_private_funds_used",
        ],
    };
}
