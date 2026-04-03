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

test("shouldPromptForDevApiKey returns true only for dev mode without key", async () => {
  const moduleUrl = new URL("./para-mode.ts", import.meta.url);
  const { shouldPromptForDevApiKey } = await import(moduleUrl.href);

  assert.equal(shouldPromptForDevApiKey("consumer", false), false);
  assert.equal(shouldPromptForDevApiKey("dev", true), false);
  assert.equal(shouldPromptForDevApiKey("dev", false), true);
});
