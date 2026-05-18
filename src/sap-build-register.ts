import { loadOrCreateAgentWallet } from "./wallet.js";

async function main() {
    console.log("=== SAP BUILD REGISTER AGENT ===");

    const sap = await import("@oobe-protocol-labs/synapse-sap-sdk");

    const wallet = loadOrCreateAgentWallet();

    const client = sap.createSapClient(sap.ENDPOINTS.DEVNET);

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
            "An autonomous agent that discovers tools, executes risk analysis workflows, and prepares x402 payment settlement records.",

        capabilities: [],
        pricing: [],
        protocols: ["sap", "x402", "acedata"],

        agentId: "solana-risk-agent-local-mvp",
        agentUri: null,
        x402Endpoint: null,
    });

    console.log("\nInstruction built successfully");
    console.log("programId:", ix.programId.toBase58());
    console.log("keys:", ix.keys.length);
    console.log("data length:", ix.data.length);

    console.log("\nAccounts:");
    for (const [index, key] of ix.keys.entries()) {
        console.log(index, {
            pubkey: key.pubkey.toBase58(),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
        });
    }

    console.log("\nIMPORTANT: transaction was NOT sent.");
}

main().catch((error) => {
    console.error("Build register instruction failed:", error);
    process.exit(1);
});
