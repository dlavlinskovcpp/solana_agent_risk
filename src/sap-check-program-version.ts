import { Connection, PublicKey } from "@solana/web3.js";

async function main() {
    const connection = new Connection("https://api.devnet.solana.com");
    const programId = new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");
    
    // Получаем программу
    const account = await connection.getAccountInfo(programId);
    if (account) {
        console.log("Program data length:", account.data.length);
        // Первые 8 байт обычно содержат discriminator
        const discriminator = account.data.slice(0, 8);
        console.log("Discriminator (hex):", Buffer.from(discriminator).toString('hex'));
        
        // Попробуем найти версию в данных программы
        const dataStr = account.data.toString();
        if (dataStr.includes("version")) {
            console.log("Version string found in program data");
        }
    }
    
    // Проверь, есть ли метод для получения версии
    try {
        const version = await connection.getVersion();
        console.log("RPC Version:", version);
    } catch (e) {}
    
    console.log("\nTry to find the program on Solana Explorer:");
    console.log(`https://explorer.solana.com/address/${programId.toBase58()}?cluster=devnet`);
}

main();
