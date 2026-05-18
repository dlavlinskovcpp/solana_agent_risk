import "dotenv/config";
import { Connection } from "@solana/web3.js";
import { loadOrCreateAgentWallet } from "./wallet";
import { runWorkflow } from "./workflow";
import { assertRealModeConfig } from "./synapse-real";
import { printWalletStatus, requestDevnetAirdropIfNeeded } from "./funding";
import { saveJsonReport, saveTextReport } from "./storage";
import { buildMarkdownReport } from "./markdown";
import { loadConfig } from "./config";

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

    await printWalletStatus(connection, agentWallet.publicKey);

    if (config.enableAirdrop && rpcUrl.includes("devnet")) {
        await requestDevnetAirdropIfNeeded(connection, agentWallet.publicKey);
        await printWalletStatus(connection, agentWallet.publicKey);
    }

    const report = await runWorkflow({
        target,
        mode: config.agentMode,
        enableRealHttp: config.enableRealHttp,
        aceFacilitatorUrl: config.aceFacilitatorUrl,
    });

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
