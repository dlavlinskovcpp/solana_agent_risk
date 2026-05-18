import { loadOrCreateAgentWallet } from "./wallet.js";

async function main() {
    console.log("=== SAP PDA PROBE ===");

    const sap = await import("@oobe-protocol-labs/synapse-sap-sdk");

    const wallet = loadOrCreateAgentWallet();

    console.log("Wallet:", wallet.publicKey.toBase58());
    console.log("SAP PROGRAM_ID:", sap.PROGRAM_ID);

    console.log("\nAvailable PDA helpers:");
    console.log(Object.keys(sap.Pdas));

    const agentResult = sap.Pdas.getAgentPDA(wallet.publicKey);
    const agentStatsResult = sap.Pdas.getAgentStatsPDA(agentResult[0]);
    const globalResult = sap.Pdas.getGlobalPDA();

    console.log("\nDerived PDAs:");
    console.log("agent PDA:", agentResult[0].toBase58(), "bump:", agentResult[1]);
    console.log(
        "agentStats PDA:",
        agentStatsResult[0].toBase58(),
        "bump:",
        agentStatsResult[1],
    );
    console.log(
        "globalRegistry PDA:",
        globalResult[0].toBase58(),
        "bump:",
        globalResult[1],
    );

    console.log("\nSAP PDA probe completed");
}

main().catch((error) => {
    console.error("SAP PDA probe failed:", error);
    process.exit(1);
});
