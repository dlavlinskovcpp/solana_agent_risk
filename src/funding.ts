import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function printWalletStatus(
    connection: Connection,
    publicKey: PublicKey,
): Promise<number> {
    const balance = await connection.getBalance(publicKey);

    console.log("Agent public key:", publicKey.toBase58());
    console.log("Agent SOL balance:", balance / LAMPORTS_PER_SOL);

    return balance;
}

export async function requestDevnetAirdropIfNeeded(
    connection: Connection,
    publicKey: PublicKey,
): Promise<void> {
    const balance = await connection.getBalance(publicKey);

    if (balance > 0) {
        console.log("Airdrop skipped: wallet already funded");
        return;
    }

    console.log("Requesting devnet airdrop...");

    try {
        const signature = await connection.requestAirdrop(
            publicKey,
            LAMPORTS_PER_SOL / 100, // 0.01 SOL
        );

        console.log("Airdrop signature:", signature);

        const latestBlockhash = await connection.getLatestBlockhash();

        await connection.confirmTransaction(
            {
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            "confirmed",
        );

        console.log("Airdrop confirmed");
    } catch (error) {
        console.log("Airdrop failed, but agent will continue.");
        console.log("Reason:", error);
        console.log("");
        console.log("Manual funding options:");
        console.log(`1. solana airdrop 0.01 ${publicKey.toBase58()} --url devnet`);
        console.log("2. https://faucet.solana.com/");
    }
}
