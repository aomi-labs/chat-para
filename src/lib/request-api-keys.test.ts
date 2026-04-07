import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const AOMI_PARA_DEV_API_KEY_ENV = "NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY";

async function importRequestApiKeysModule() {
  const moduleUrl = new URL("./request-api-keys.ts", import.meta.url);
  moduleUrl.searchParams.set("t", `${Date.now()}-${Math.random()}`);
  return import(moduleUrl.href);
}

test("request auth globals keep the env-configured Aomi key separate from the Para key", async () => {
  process.env[AOMI_PARA_DEV_API_KEY_ENV] = "aomi-from-env";

  const {
    getAomiRequestApiKey,
    getParaToolApiKey,
    setParaToolApiKey,
    syncRuntimeAuthGlobals,
  } = await importRequestApiKeysModule();

  setParaToolApiKey(null);
  syncRuntimeAuthGlobals();

  assert.equal(getAomiRequestApiKey(), "aomi-from-env");
  assert.equal(getParaToolApiKey(), null);

  setParaToolApiKey("para-secret");
  syncRuntimeAuthGlobals();

  assert.equal(getAomiRequestApiKey(), "aomi-from-env");
  assert.equal(getParaToolApiKey(), "para-secret");
});

test("request auth globals reject a missing Aomi env key", async () => {
  delete process.env[AOMI_PARA_DEV_API_KEY_ENV];

  const moduleUrl = new URL("./request-api-keys.ts", import.meta.url);
  moduleUrl.searchParams.set("t", `${Date.now()}-${Math.random()}`);

  await assert.rejects(
    import(moduleUrl.href),
    /NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY is not defined/,
  );
});

test("request api key module uses a static NEXT_PUBLIC env reference for client bundling", async () => {
  const source = await readFile(new URL("./request-api-keys.ts", import.meta.url), "utf8");
  assert.match(source, /process\.env\.NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY/);
});
