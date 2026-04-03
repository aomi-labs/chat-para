import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const passWithNoTests = args.includes("--passWithNoTests");

const knownTestEntries = [
  "test",
  "tests",
  "src/__tests__",
  "src/**/*.test.ts",
  "src/**/*.test.tsx",
  "src/**/*.spec.ts",
  "src/**/*.spec.tsx",
];

const hasConfiguredTests = knownTestEntries.some((entry) => !entry.includes("*") && existsSync(entry));

if (!hasConfiguredTests) {
  if (passWithNoTests) {
    console.log("No frontend tests found; exiting successfully.");
    process.exit(0);
  }

  console.error("No frontend tests are configured.");
  process.exit(1);
}

const result = spawnSync("node", ["--test", ...args], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
