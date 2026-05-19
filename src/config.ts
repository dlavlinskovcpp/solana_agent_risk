export type AgentMode = "mock" | "real";
export type SapRegistrationMode = "simulation" | "preview";

export type AppConfig = {
    rpcUrl: string;
    agentMode: AgentMode;
    enableRealHttp: boolean;
    enableAirdrop: boolean;
    enableRealX402Payment: boolean;
    enableDevnetOnchainProof: boolean;
    sapRegistrationMode: SapRegistrationMode;
    synapseRpcUrl?: string;
    synapseApiKey?: string;
    aceApiKey?: string;
    aceFacilitatorUrl: string;
};

export function loadConfig(): AppConfig {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    const agentMode = process.env.AGENT_MODE || "mock";
    const enableRealHttp = process.env.ENABLE_REAL_HTTP === "true";
    const enableAirdrop = process.env.ENABLE_AIRDROP === "true";
    const enableRealX402Payment =
        process.env.ENABLE_REAL_X402_PAYMENT === "true";
    const enableDevnetOnchainProof =
        process.env.ENABLE_DEVNET_ONCHAIN_PROOF === "true";
    const sapRegistrationMode = process.env.SAP_REGISTRATION_MODE || "simulation";

    if (!rpcUrl) {
        throw new Error("SOLANA_RPC_URL is not set");
    }

    if (agentMode !== "mock" && agentMode !== "real") {
        throw new Error("AGENT_MODE must be either mock or real");
    }

    if (
        sapRegistrationMode !== "simulation" &&
        sapRegistrationMode !== "preview"
    ) {
        throw new Error(
            "SAP_REGISTRATION_MODE must be either simulation or preview",
        );
    }

    return {
        rpcUrl,
        agentMode,
        enableRealHttp,
        enableAirdrop,
        enableRealX402Payment,
        enableDevnetOnchainProof,
        sapRegistrationMode,
        synapseRpcUrl: process.env.SYNAPSE_RPC_URL || undefined,
        synapseApiKey: process.env.SYNAPSE_API_KEY || undefined,
        aceApiKey: process.env.ACE_API_KEY || undefined,
        aceFacilitatorUrl:
            process.env.ACE_FACILITATOR_URL || "https://facilitator.acedata.cloud",
    };
}
