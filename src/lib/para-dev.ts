export type CreateWalletInput = {
  walletType: string;
  userIdentifier: string;
  userIdentifierType: string;
  scheme?: string;
  cosmosPrefix?: string;
};

export type GetWalletInput = {
  walletId: string;
};

export type SignRawInput = {
  walletId: string;
  data: string;
};

export type ParaDevRequestPromptInput = {
  request: string;
};

export type ParaConsumerRequestPromptInput = {
  request: string;
};

export type WalletSelectionPromptInput = {
  action: string;
  toolName: string;
};

export const PARA_DOCS_LINK = "https://docs.getpara.com/v2/introduction/welcome";

export function resolveDevApiKey(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function validateSignRawInput(value: string): string | null {
  if (!value.startsWith("0x")) {
    return "sign_raw data must be a 0x-prefixed hex string.";
  }

  const hex = value.slice(2);
  if (!hex || /[^a-fA-F0-9]/.test(hex)) {
    return "sign_raw data must be valid hexadecimal.";
  }

  return null;
}

export function buildParaDevRequestPrompt(input: ParaDevRequestPromptInput): string {
  return input.request.trim();
}

export function buildParaConsumerRequestPrompt(input: ParaConsumerRequestPromptInput): string {
  return input.request.trim();
}

export function buildWalletSelectionPrompt(input: WalletSelectionPromptInput): string {
  return buildParaDevRequestPrompt({
    request: [
      `Show me the available wallets and ask me which wallet to use for ${input.action}.`,
      `Do not call ${input.toolName} until I choose a wallet.`,
    ].join("\n"),
  });
}

export function buildCreateWalletPrompt(input: CreateWalletInput): string {
  const lines = [
    "Create a Para wallet and wait until it is ready.",
    `Wallet type: ${input.walletType}`,
    `User identifier: ${input.userIdentifier}`,
    `User identifier type: ${input.userIdentifierType}`,
  ];

  if (input.scheme?.trim()) {
    lines.push(`Scheme: ${input.scheme.trim()}`);
  }

  if (input.cosmosPrefix?.trim()) {
    lines.push(`Cosmos prefix: ${input.cosmosPrefix.trim()}`);
  }

  return buildParaDevRequestPrompt({
    request: lines.join("\n"),
  });
}

export function buildGetWalletPrompt(input: GetWalletInput): string {
  return buildParaDevRequestPrompt({
    request: [
      "Fetch the status of this Para wallet.",
      `Wallet ID: ${input.walletId}`,
    ].join("\n"),
  });
}

export function buildSignRawPrompt(input: SignRawInput): string {
  return buildParaDevRequestPrompt({
    request: [
      "Sign raw data with this Para wallet.",
      `Wallet ID: ${input.walletId}`,
      `Data: ${input.data}`,
    ].join("\n"),
  });
}
