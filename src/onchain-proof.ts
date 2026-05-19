import crypto from "crypto";
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";

export const SOLANA_MEMO_PROGRAM_ID =
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

export type OnchainProof = {
    status: "recorded" | "skipped" | "failed";
    network: "solana-devnet";
    method: "memo";
    reportHash?: string;
    signature?: string;
    explorerUrl?: string;
    memoProgramId?: string;
    broadcasted: boolean;
    reason?: string;
};

export type CreateDevnetExecutionProofParams = {
    connection: Connection;
    wallet: Keypair;
    workflowId: string;
    target: string;
    report: unknown;
    enabled: boolean;
    rpcUrl: string;
    timestamp?: Date;
};

function skipped(reason: string): OnchainProof {
    return {
        status: "skipped",
        network: "solana-devnet",
        method: "memo",
        memoProgramId: SOLANA_MEMO_PROGRAM_ID,
        broadcasted: false,
        reason,
    };
}

function failed(reason: string, reportHash?: string): OnchainProof {
    return {
        status: "failed",
        network: "solana-devnet",
        method: "memo",
        reportHash,
        memoProgramId: SOLANA_MEMO_PROGRAM_ID,
        broadcasted: false,
        reason,
    };
}

function errorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}

function canonicalize(value: unknown): unknown {
    if (value === null) {
        return null;
    }

    if (typeof value === "string" || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (Array.isArray(value)) {
        return value.map((item) => canonicalize(item));
    }

    if (typeof value !== "object") {
        return undefined;
    }

    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const key of Object.keys(input).sort()) {
        if (key === "onchainProof") {
            continue;
        }

        const canonicalValue = canonicalize(input[key]);

        if (canonicalValue !== undefined) {
            output[key] = canonicalValue;
        }
    }

    return output;
}

export function canonicalReportJson(report: unknown): string {
    return JSON.stringify(canonicalize(report));
}

export function hashReport(report: unknown): string {
    const digest = crypto
        .createHash("sha256")
        .update(canonicalReportJson(report), "utf8")
        .digest("hex");

    return `sha256:${digest}`;
}

function isDevnetRpcUrl(rpcUrl: string): boolean {
    const normalized = rpcUrl.toLowerCase();

    return normalized.includes("devnet");
}

function buildMemo(params: {
    workflowId: string;
    target: string;
    reportHash: string;
    timestamp: string;
}): string {
    return [
        "solana-agent",
        "devnet execution proof",
        `workflow=${params.workflowId}`,
        `target=${params.target}`,
        `reportHash=${params.reportHash}`,
        `timestamp=${params.timestamp}`,
    ].join(" | ");
}

export async function createDevnetExecutionProof(
    params: CreateDevnetExecutionProofParams,
): Promise<OnchainProof> {
    if (!params.enabled) {
        return skipped("ENABLE_DEVNET_ONCHAIN_PROOF is false");
    }

    if (!isDevnetRpcUrl(params.rpcUrl)) {
        return skipped("Devnet proof is disabled because SOLANA_RPC_URL is not devnet");
    }

    const reportHash = hashReport(params.report);

    try {
        const balance = await params.connection.getBalance(params.wallet.publicKey);

        if (balance <= 0) {
            return skipped("Wallet has no devnet SOL for transaction fees");
        }

        const timestamp = (params.timestamp ?? new Date()).toISOString();
        const memo = buildMemo({
            workflowId: params.workflowId,
            target: params.target,
            reportHash,
            timestamp,
        });

        const memoInstruction = new TransactionInstruction({
            keys: [],
            programId: new PublicKey(SOLANA_MEMO_PROGRAM_ID),
            data: Buffer.from(memo, "utf8"),
        });

        const transaction = new Transaction().add(memoInstruction);
        const signature = await sendAndConfirmTransaction(
            params.connection,
            transaction,
            [params.wallet],
            { commitment: "confirmed" },
        );

        return {
            status: "recorded",
            network: "solana-devnet",
            method: "memo",
            reportHash,
            signature,
            explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
            memoProgramId: SOLANA_MEMO_PROGRAM_ID,
            broadcasted: true,
        };
    } catch (error) {
        return failed(errorMessage(error), reportHash);
    }
}
