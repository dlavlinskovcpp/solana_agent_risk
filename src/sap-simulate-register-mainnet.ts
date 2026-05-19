import "dotenv/config";
import { Connection, Transaction } from "@solana/web3.js";
import { loadOrCreateAgentWallet } from "./wallet";

async function main() {
    console.log("=== SAP MAINNET REGISTER SIMULATION ONLY ===");
    console.log("This probe builds and simulates a transaction. It never sends.");

    const sap = await import("@oobe-protocol-labs/synapse-sap-sdk");
    const mainnetRpc = process.env.SYNAPSE_RPC_URL || sap.ENDPOINTS.MAINNET;
    const connection = new Connection(mainnetRpc, "confirmed");
    const client = sap.createSapClient(mainnetRpc);
    const wallet = loadOrCreateAgentWallet();

    const [agentPda] = sap.Pdas.getAgentPDA(wallet.publicKey);
    const [agentStatsPda] = sap.Pdas.getAgentStatsPDA(agentPda);
    const [globalPda] = sap.Pdas.getGlobalPDA();

    console.log("Wallet:", wallet.publicKey.toBase58());
    console.log("Agent PDA:", agentPda.toBase58());
    console.log("AgentStats PDA:", agentStatsPda.toBase58());
    console.log("GlobalRegistry PDA:", globalPda.toBase58());

    const ix = await client.agent.registerAgent({
        signer: wallet.keypair,
        wallet: wallet.publicKey,
        agent: agentPda,
        agentStats: agentStatsPda,
        globalRegistry: globalPda,
        name: "Autonomous Risk Research Agent",
        description:
            "An autonomous agent that discovers tools, executes risk analysis workflows, and prepares x402 payment requirement previews.",
        capabilities: [],
        pricing: [],
        protocols: ["sap", "x402", "acedata"],
        agentId: "solana-agent-mainnet-preview",
        agentUri: null,
        x402Endpoint: null,
    });

    const latestBlockhash = await connection.getLatestBlockhash();
    const tx = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    tx.add(ix);
    tx.sign(wallet.keypair);

    const result = await connection.simulateTransaction(tx);

    console.log("\nSimulation result:");
    console.log(JSON.stringify(result.value, null, 2));
    console.log("\nIMPORTANT: transaction was NOT sent or broadcast.");
}

main().catch((error) => {
    console.error("Mainnet simulation failed:", error);
    process.exit(1);
});
