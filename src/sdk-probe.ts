export {};
async function main() {
    console.log("=== SDK PROBE ===");

    console.log("\n[Synapse Client SDK]");
    const synapse = await import("@oobe-protocol-labs/synapse-client-sdk");

    console.log("SynapseClient:", typeof synapse.SynapseClient);
    console.log("SYNAPSE_MAINNET_US:", synapse.SYNAPSE_MAINNET_US);
    console.log("SYNAPSE_MAINNET_EU:", synapse.SYNAPSE_MAINNET_EU);

    console.log("\n[x402 Client SDK]");
    const x402 = await import("@acedatacloud/x402-client");

    console.log("createX402PaymentHandler:", typeof x402.createX402PaymentHandler);
    console.log("signSolanaPayment:", typeof x402.signSolanaPayment);
    console.log("signEVMPayment:", typeof x402.signEVMPayment);

    console.log("\n[SAP SDK]");
    const sap = await import("@oobe-protocol-labs/synapse-sap-sdk");

    console.log("createSapClient:", typeof sap.createSapClient);
    console.log("SapClient:", typeof sap.SapClient);
    console.log("PROGRAM_ID:", sap.PROGRAM_ID);
    console.log("ENDPOINTS:", sap.ENDPOINTS);

    console.log("\nSAP namespaces:");
    console.log("Accounts:", Object.keys(sap.Accounts ?? {}));
    console.log("Instructions:", Object.keys(sap.Instructions ?? {}));
    console.log("Pdas:", Object.keys(sap.Pdas ?? {}));
    console.log("Utils:", Object.keys(sap.Utils ?? {}));
    console.log("Events:", Object.keys(sap.Events ?? {}));

    console.log("\nSDK probe completed");
}

main().catch((error) => {
    console.error("SDK probe failed:", error);
    process.exit(1);
});
