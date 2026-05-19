async function main() {
  const x402 = await import("@acedatacloud/x402-client");

  console.log("x402 exports:");
  console.log(Object.keys(x402));

  if ("signSolanaPayment" in x402) {
    console.log("\nsignSolanaPayment:");
    console.log(String(x402.signSolanaPayment).slice(0, 1000));
  }

  if ("createX402PaymentHandler" in x402) {
    console.log("\ncreateX402PaymentHandler:");
    console.log(String(x402.createX402PaymentHandler).slice(0, 1000));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
