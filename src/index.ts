import "dotenv/config";
import { Connection } from "@solana/web3.js";
import { loadOrCreateAgentWallet } from "./wallet";
import { runWorkflow } from "./workflow";
import { assertRealModeConfig } from "./synapse-real";
import { printWalletStatus, requestDevnetAirdropIfNeeded } from "./funding";
import { saveJsonReport, saveTextReport } from "./storage";
import { buildMarkdownReport } from "./markdown";
import { loadConfig } from "./config";
import { createDevnetExecutionProof } from "./onchain-proof";

async function main() {
    const config = loadConfig();
    if (config.agentMode === "real") {
        assertRealModeConfig(config);
    }

    const rpcUrl = config.rpcUrl;
    const target = process.argv.slice(2).join(" ") || "Example Web3 Protocol";

    const connection = new Connection(config.rpcUrl, "confirmed");
    const agentWallet = loadOrCreateAgentWallet();

    console.log("=== AGENT STARTED ===");
    console.log("Mode:", config.agentMode);
    console.log("Real HTTP:", config.enableRealHttp);
    console.log("Airdrop:", config.enableAirdrop);
    console.log("Target:", target);
    console.log("RPC:", rpcUrl);
    console.log("SAP registration mode:", config.sapRegistrationMode);
    console.log(
        "Real x402 payment broadcast:",
        config.enableRealX402Payment ? "requested but disabled in MVP" : "disabled",
    );
    console.log(
        "Devnet on-chain proof:",
        config.enableDevnetOnchainProof ? "enabled" : "disabled",
    );

    await printWalletStatus(connection, agentWallet.publicKey);

    if (config.enableAirdrop && rpcUrl.includes("devnet")) {
        await requestDevnetAirdropIfNeeded(connection, agentWallet.publicKey);
        await printWalletStatus(connection, agentWallet.publicKey);
    }

    const report = await runWorkflow({
        target,
        mode: config.agentMode,
        enableRealHttp: config.enableRealHttp,
        enableRealX402Payment: config.enableRealX402Payment,
        aceFacilitatorUrl: config.aceFacilitatorUrl,
        agentPublicKey: agentWallet.publicKey.toBase58(),
        sapRegistrationMode: config.sapRegistrationMode,
    });

    let proofStepIndex: number | null = null;

    if (config.enableDevnetOnchainProof) {
        proofStepIndex = report.steps.push(
            "devnet_onchain_execution_proof_recorded",
        ) - 1;
    }

    const onchainProof = await createDevnetExecutionProof({
        connection,
        wallet: agentWallet.keypair,
        workflowId: report.workflowId,
        target,
        report,
        enabled: config.enableDevnetOnchainProof,
        rpcUrl,
    });

    report.onchainProof = onchainProof;

    if (config.enableDevnetOnchainProof) {
        if (
            report.onchainProof.status !== "recorded" &&
            proofStepIndex !== null
        ) {
            report.steps[proofStepIndex] = "devnet_onchain_execution_proof_failed";
        }

        console.log("\nDevnet on-chain proof status:", report.onchainProof.status);

        if (report.onchainProof.signature) {
            console.log("Devnet on-chain proof signature:", report.onchainProof.signature);
        }

        if (report.onchainProof.explorerUrl) {
            console.log("Devnet on-chain proof explorer:", report.onchainProof.explorerUrl);
        }

        if (report.onchainProof.reason) {
            console.log("Devnet on-chain proof reason:", report.onchainProof.reason);
        }
    }

    console.log("\n=== WORKFLOW REPORT ===");
    console.log(JSON.stringify(report, null, 2));
    const reportPath = await saveJsonReport(report, "agent-report");
    console.log("\nJSON report saved to:", reportPath);

    const markdown = buildMarkdownReport(report);

    const markdownPath = await saveTextReport(markdown, "agent-report", "md");

    console.log("Markdown report saved to:", markdownPath);
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
