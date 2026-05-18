export {};
async function main() {
    console.log("=== SAP CLIENT PROBE ===");

    const sap = await import("@oobe-protocol-labs/synapse-sap-sdk");

    console.log("PROGRAM_ID:", sap.PROGRAM_ID);
    console.log("ENDPOINTS:", sap.ENDPOINTS);

    const client = sap.createSapClient(sap.ENDPOINTS.DEVNET);

    console.log("\nClient created:", Boolean(client));

    console.log("\nClient methods:");
    console.log(
        Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(
            (name) => name !== "constructor",
        ),
    );

    const modules = [
        "agent",
        "tools",
        "escrow",
        "staking",
        "subscription",
        "vault",
        "session",
        "indexing",
    ] as const;

    for (const moduleName of modules) {
        console.log(`\n[${moduleName}]`);

        try {
            const moduleOrFactory = (client as any)[moduleName];

            console.log("property type:", typeof moduleOrFactory);

            const module =
                typeof moduleOrFactory === "function"
                    ? moduleOrFactory.call(client)
                    : moduleOrFactory;

            console.log("module created:", Boolean(module));
            console.log(
                "methods:",
                Object.getOwnPropertyNames(Object.getPrototypeOf(module)).filter(
                    (name) => name !== "constructor",
                ),
            );
        } catch (error) {
            console.log("failed to inspect module:", error);
        }
    }

    console.log("\nSAP client probe completed");
}

main().catch((error) => {
    console.error("SAP client probe failed:", error);
    process.exit(1);
});
