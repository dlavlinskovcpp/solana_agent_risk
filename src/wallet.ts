import { Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import path from "path";

export type AgentWallet = {
    keypair: Keypair;
    publicKey: PublicKey;
};

const KEYPAIR_PATH = path.join(process.cwd(), ".keys", "agent.json");

export function loadOrCreateAgentWallet(): AgentWallet {
    if (fs.existsSync(KEYPAIR_PATH)) {
        const secretKeyJson = fs.readFileSync(KEYPAIR_PATH, "utf-8");
        const secretKey = Uint8Array.from(JSON.parse(secretKeyJson));
        const keypair = Keypair.fromSecretKey(secretKey);

        return {
            keypair,
            publicKey: keypair.publicKey,
        };
    }

    const keypair = Keypair.generate();

    fs.mkdirSync(path.dirname(KEYPAIR_PATH), { recursive: true });
    fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(keypair.secretKey)));

    return {
        keypair,
        publicKey: keypair.publicKey,
    };
}
