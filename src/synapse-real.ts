import type { AppConfig } from "./config";

export function assertRealModeConfig(config: AppConfig): void {
    const missing: string[] = [];

    if (!config.synapseRpcUrl) missing.push("SYNAPSE_RPC_URL");
    if (!config.synapseApiKey) missing.push("SYNAPSE_API_KEY");
    if (!config.aceApiKey) missing.push("ACE_API_KEY");

    if (missing.length > 0) {
        throw new Error(
            `Real mode is not configured. Missing env: ${missing.join(", ")}`,
        );
    }
}
