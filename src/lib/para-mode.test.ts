import test from "node:test";
import assert from "node:assert/strict";

test("resolveParaModeFromPath maps consumer and dev routes", async () => {
  const moduleUrl = new URL("./para-mode.ts", import.meta.url);
  const { resolveParaModeFromPath } = await import(moduleUrl.href);

  assert.equal(resolveParaModeFromPath("/consumer"), "consumer");
  assert.equal(resolveParaModeFromPath("/dev"), "dev");
});

test("resolveParaModeFromPath falls back to consumer for unknown paths", async () => {
  const moduleUrl = new URL("./para-mode.ts", import.meta.url);
  const { resolveParaModeFromPath } = await import(moduleUrl.href);

  assert.equal(resolveParaModeFromPath("/"), "consumer");
  assert.equal(resolveParaModeFromPath("/settings"), "consumer");
});

test("getNamespaceForMode only exposes para-consumer and para namespaces", async () => {
  const moduleUrl = new URL("./para-mode.ts", import.meta.url);
  const {
    getNamespaceForMode,
    filterVisibleApps,
    shouldPromptForDevApiKey,
  } = await import(moduleUrl.href);

  assert.equal(getNamespaceForMode("consumer"), "para-consumer");
  assert.equal(getNamespaceForMode("dev"), "para");
  assert.deepEqual(
    filterVisibleApps(["default", "wallet", "para-consumer", "para", "social"]),
    ["para-consumer", "para"],
  );
  assert.equal(shouldPromptForDevApiKey("consumer", false), false);
  assert.equal(shouldPromptForDevApiKey("dev", true), false);
  assert.equal(shouldPromptForDevApiKey("dev", false), true);
});
