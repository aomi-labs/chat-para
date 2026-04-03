import test from "node:test";
import assert from "node:assert/strict";

test("buildCreateWalletPrompt includes the required wallet creation fields without embedding the api key", async () => {
  const moduleUrl = new URL("./para-dev.ts", import.meta.url);
  const { buildCreateWalletPrompt } = await import(moduleUrl.href);

  const prompt = buildCreateWalletPrompt({
    walletType: "EVM",
    userIdentifier: "builder@getpara.dev",
    userIdentifierType: "EMAIL",
    scheme: "DKLS",
  });

  assert.match(prompt, /create a Para wallet/i);
  assert.match(prompt, /wallet type:\s*EVM/i);
  assert.match(prompt, /user identifier:\s*builder@getpara\.dev/i);
  assert.doesNotMatch(prompt, /para-secret/);
});

test("buildSignRawPrompt includes wallet id and hex payload without embedding the api key", async () => {
  const moduleUrl = new URL("./para-dev.ts", import.meta.url);
  const { buildSignRawPrompt } = await import(moduleUrl.href);

  const prompt = buildSignRawPrompt({
    walletId: "wallet_123",
    data: "0x48656c6c6f",
  });

  assert.match(prompt, /sign raw data/i);
  assert.match(prompt, /wallet_123/);
  assert.match(prompt, /0x48656c6c6f/);
  assert.doesNotMatch(prompt, /para-secret/);
});

test("buildParaDevRequestPrompt keeps only the user request text without the dev-mode api key preamble", async () => {
  const moduleUrl = new URL("./para-dev.ts", import.meta.url);
  const { buildParaDevRequestPrompt } = await import(moduleUrl.href);

  const prompt = buildParaDevRequestPrompt({
    request: "Summarize the available Para tools for this environment.",
  });

  assert.doesNotMatch(prompt, /dev mode context/i);
  assert.doesNotMatch(prompt, /Para API key:/i);
  assert.doesNotMatch(prompt, /use this para api key/i);
  assert.doesNotMatch(prompt, /user request:/i);
  assert.match(prompt, /Summarize the available Para tools/i);
});

test("buildParaConsumerRequestPrompt keeps the Para docs link without the consumer-mode preamble", async () => {
  const moduleUrl = new URL("./para-dev.ts", import.meta.url);
  const { buildParaConsumerRequestPrompt } = await import(moduleUrl.href);

  const prompt = buildParaConsumerRequestPrompt({
    request: "Help me send tokens from my Para wallet.",
  });

  assert.doesNotMatch(prompt, /consumer mode context/i);
  assert.doesNotMatch(prompt, /you are the para consumer bot/i);
  assert.match(prompt, /https:\/\/docs\.getpara\.com\/v2\/introduction\/welcome/i);
  assert.match(prompt, /Help me send tokens from my Para wallet/i);
});

test("buildWalletSelectionPrompt instructs the agent to list wallets and ask the user which one to use", async () => {
  const moduleUrl = new URL("./para-dev.ts", import.meta.url);
  const { buildWalletSelectionPrompt } = await import(moduleUrl.href);

  const prompt = buildWalletSelectionPrompt({
    action: "get wallet status",
    toolName: "get_wallet",
  });

  assert.match(prompt, /list_para_wallets/i);
  assert.match(prompt, /ask me which wallet to use/i);
  assert.match(prompt, /get wallet status/i);
  assert.match(prompt, /do not call get_wallet until i choose a wallet/i);
  assert.doesNotMatch(prompt, /para-secret/);
});

test("validateSignRawInput rejects non-hex values and accepts prefixed hex", async () => {
  const moduleUrl = new URL("./para-dev.ts", import.meta.url);
  const { validateSignRawInput } = await import(moduleUrl.href);

  assert.equal(validateSignRawInput("hello"), "sign_raw data must be a 0x-prefixed hex string.");
  assert.equal(validateSignRawInput("0xzz"), "sign_raw data must be valid hexadecimal.");
  assert.equal(validateSignRawInput("0x48656c6c6f"), null);
});

test("resolveDevApiKey trims input and returns null for empty values", async () => {
  const moduleUrl = new URL("./para-dev.ts", import.meta.url);
  const { resolveDevApiKey } = await import(moduleUrl.href);

  assert.equal(resolveDevApiKey("  para-secret  "), "para-secret");
  assert.equal(resolveDevApiKey("   "), null);
});
