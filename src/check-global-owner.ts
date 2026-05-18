import { Connection, PublicKey } from "@solana/web3.js";

async function main() {
    // PDA из твоего лога
    const globalPda = new PublicKey("9odFrYBBZq6UQC6aGyzMPNXWJQn55kMtfigzhLg6S6L5");
    const connection = new Connection("https://api.devnet.solana.com");
    
    const account = await connection.getAccountInfo(globalPda);
    if (account) {
        console.log("GlobalRegistry owner:", account.owner.toBase58());
        console.log("Expected SAP program:", "SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");
        console.log("Match:", account.owner.toBase58() === "SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");
    }
}

main();
