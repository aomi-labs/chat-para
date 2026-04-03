import test from "node:test";
import assert from "node:assert/strict";

test("withParaApiKeyInUserExt adds para_api_key and preserves other ext fields", async () => {
  const moduleUrl = new URL("./para-user-state.ts", import.meta.url);
  const { withParaApiKeyInUserExt } = await import(moduleUrl.href);

  const next = withParaApiKeyInUserExt(
    {
      address: "0x1234",
      chainId: 8453,
      isConnected: true,
      ext: {
        bot_id: "test-bot",
      },
    },
    "para-secret",
  );

  assert.deepEqual(next.ext, {
    bot_id: "test-bot",
    para_api_key: "para-secret",
  });
});

test("withParaApiKeyInUserExt removes para_api_key without dropping unrelated ext fields", async () => {
  const moduleUrl = new URL("./para-user-state.ts", import.meta.url);
  const { withParaApiKeyInUserExt } = await import(moduleUrl.href);

  const next = withParaApiKeyInUserExt(
    {
      address: "0x1234",
      chainId: 8453,
      isConnected: true,
      ext: {
        bot_id: "test-bot",
        para_api_key: "para-secret",
      },
    },
    null,
  );

  assert.deepEqual(next.ext, {
    bot_id: "test-bot",
  });
});

test("withParaApiKeyInUserExt clears ext when the para key was the only custom field", async () => {
  const moduleUrl = new URL("./para-user-state.ts", import.meta.url);
  const { withParaApiKeyInUserExt } = await import(moduleUrl.href);

  const next = withParaApiKeyInUserExt(
    {
      isConnected: false,
      ext: {
        para_api_key: "para-secret",
      },
    },
    null,
  );

  assert.equal(next.ext, undefined);
});
