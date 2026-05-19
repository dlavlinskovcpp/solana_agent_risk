async function main() {
  const candidates = ["acedata", "@acedatacloud/sdk"];

  for (const pkg of candidates) {
    try {
      const mod = await import(pkg);
      console.log(`\n=== ${pkg} loaded ===`);
      console.log(Object.keys(mod));

      for (const [key, value] of Object.entries(mod)) {
        if (typeof value === "function") {
          console.log(`\nFunction export: ${key}`);
          console.log(String(value).slice(0, 600));
        }
      }
    } catch (error) {
      console.log(`\n=== ${pkg} failed ===`);
      console.log(error instanceof Error ? error.message : error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
