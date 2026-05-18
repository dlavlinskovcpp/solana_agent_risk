export type AgentMode = "mock" | "real";

export type AppConfig = {
    rpcUrl: string;
    agentMode: AgentMode;
    enableRealHttp: boolean;
    enableAirdrop: boolean;
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

    if (!rpcUrl) {
        throw new Error("SOLANA_RPC_URL is not set");
    }

    if (agentMode !== "mock" && agentMode !== "real") {
        throw new Error("AGENT_MODE must be either mock or real");
    }

    return {
        rpcUrl,
        agentMode,
        enableRealHttp,
        enableAirdrop,
        synapseRpcUrl: process.env.SYNAPSE_RPC_URL || undefined,
        synapseApiKey: process.env.SYNAPSE_API_KEY || undefined,
        aceApiKey: process.env.ACE_API_KEY || undefined,
        aceFacilitatorUrl:
            process.env.ACE_FACILITATOR_URL || "https://facilitator.acedata.cloud",
    };
}
