import { Connection } from "@solana/web3.js";
import { loadConfig } from "./config.js";
import "dotenv/config";
import { loadOrCreateAgentWallet } from "./wallet.js";

async function main() {
    console.log("=== SAP CHECK AGENT ACCOUNT ===");

    const config = loadConfig();
    const connection = new Connection(config.rpcUrl, "confirmed");

    const sap = await import("@oobe-protocol-labs/synapse-sap-sdk");
    const wallet = loadOrCreateAgentWallet();

    const [agentPda] = sap.Pdas.getAgentPDA(wallet.publicKey);
    const [agentStatsPda] = sap.Pdas.getAgentStatsPDA(agentPda);
    const [globalPda] = sap.Pdas.getGlobalPDA();

    console.log("Wallet:", wallet.publicKey.toBase58());
    console.log("Agent PDA:", agentPda.toBase58());
    console.log("AgentStats PDA:", agentStatsPda.toBase58());
    console.log("GlobalRegistry PDA:", globalPda.toBase58());

    console.log("\nChecking accounts...");

    await printAccount(connection, "agent PDA", agentPda);
    await printAccount(connection, "agentStats PDA", agentStatsPda);
    await printAccount(connection, "globalRegistry PDA", globalPda);
}

async function printAccount(
    connection: Connection,
    label: string,
    pubkey: any,
): Promise<void> {
    const account = await connection.getAccountInfo(pubkey);

    if (!account) {
        console.log(`${label}: not found`);
        return;
    }

    console.log(`${label}: exists`);
    console.log("  lamports:", account.lamports);
    console.log("  owner:", account.owner.toBase58());
    console.log("  executable:", account.executable);
    console.log("  data length:", account.data.length);
}

main().catch((error) => {
    console.error("Check failed:", error);
    process.exit(1);
});
