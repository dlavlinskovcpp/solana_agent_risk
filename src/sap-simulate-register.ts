import "dotenv/config";
import { Connection, Transaction } from "@solana/web3.js";
import { loadOrCreateAgentWallet } from "./wallet.js";

async function main() {
    console.log("=== SAP SIMULATE REGISTER AGENT (REORDERED) ===");

    const sap = await import("@oobe-protocol-labs/synapse-sap-sdk");
    const mainnetRpc = sap.ENDPOINTS.MAINNET;
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
            "An autonomous agent that discovers tools, executes risk analysis workflows, and prepares x402 payment settlement records.",
        capabilities: [],
        pricing: [],
        protocols: ["sap", "x402", "acedata"],
        agentId: "solana-risk-agent-mainnet-sim",
        agentUri: null,
        x402Endpoint: null,
    });

    console.log("\n=== TRYING REORDERED ACCOUNTS ===");

    // Пробуем разные варианты порядка
    const variants = [
        {
            name: "globalRegistry at position 1",
            keys: [ix.keys[0], ix.keys[3], ix.keys[1], ix.keys[2], ix.keys[4]],
        },
        {
            name: "globalRegistry at position 2",
            keys: [ix.keys[0], ix.keys[1], ix.keys[3], ix.keys[2], ix.keys[4]],
        },
        {
            name: "globalRegistry at position 0",
            keys: [ix.keys[3], ix.keys[0], ix.keys[1], ix.keys[2], ix.keys[4]],
        },
        {
            name: "globalRegistry at position 4",
            keys: [ix.keys[0], ix.keys[1], ix.keys[2], ix.keys[4], ix.keys[3]],
        },
    ];

    for (const variant of variants) {
        console.log(`\n--- Testing: ${variant.name} ---`);
        ix.keys = variant.keys;

        for (const [index, key] of ix.keys.entries()) {
            console.log(`${index}: ${key.pubkey.toBase58().slice(0, 8)}...`);
        }

        const latestBlockhash = await connection.getLatestBlockhash();
        const tx = new Transaction({
            feePayer: wallet.publicKey,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        tx.add(ix);
        tx.sign(wallet.keypair);

        const result = await connection.simulateTransaction(tx);

        if (!result.value.err) {
            console.log("\n✅✅✅ SUCCESS! ✅✅✅");
            console.log(`Correct order: ${variant.name}`);
            console.log("Transaction simulation succeeded!");
            return;
        } else {
            console.log(`Failed: ${result.value.err}`);
        }
    }

    console.log("\n All variants failed");
}

main().catch(console.error);
