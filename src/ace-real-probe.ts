import "dotenv/config";

async function main() {
  const apiKey = process.env.ACE_API_KEY;

  if (!apiKey) {
    console.log("ACE_API_KEY is not set.");
    console.log("Add it to .env to run a real Ace Data Cloud API call.");
    process.exit(0);
  }

  const response = await fetch("https://api.acedata.cloud/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a risk intelligence service. Return concise JSON only.",
        },
        {
          role: "user",
          content:
            "Analyze Jupiter Aggregator on Solana. Return JSON with risk_level, reasons, and decision.",
        },
      ],
    }),
  });

  console.log("HTTP status:", response.status);
  console.log("Content-Type:", response.headers.get("content-type"));

  const text = await response.text();
  console.log("\nResponse:");
  console.log(text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
