const REQUEST_API_KEY_GLOBAL = "__AOMI_REQUEST_API_KEY__";
const PARA_API_KEY_GLOBAL = "__AOMI_PARA_API_KEY__";

export const AOMI_PARA_DEV_API_KEY_ENV = "NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY";
export const AOMI_PARA_MAIN_API_KEY_ENV = "NEXT_PUBLIC_AOMI_PARA_MAIN_API_KEY";

type RuntimeAuthGlobals = typeof globalThis & {
  [REQUEST_API_KEY_GLOBAL]?: string;
  [PARA_API_KEY_GLOBAL]?: string | null;
};

function runtimeAuthGlobals(): RuntimeAuthGlobals {
  return globalThis as RuntimeAuthGlobals;
}

function readConfiguredAomiRequestApiKey(): string {
  const value = process.env.NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY?.trim();
  if (!value) {
    throw new Error(`${AOMI_PARA_DEV_API_KEY_ENV} is not defined`);
  }
  return value;
}

export function getAomiMainApiKey(): string | null {
  return process.env.NEXT_PUBLIC_AOMI_PARA_MAIN_API_KEY?.trim() || null;
}

export function getAomiRequestApiKey(): string {
  return readConfiguredAomiRequestApiKey();
}

export function getParaToolApiKey(): string | null {
  const value = runtimeAuthGlobals()[PARA_API_KEY_GLOBAL];
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function setParaToolApiKey(apiKey: string | null): void {
  runtimeAuthGlobals()[PARA_API_KEY_GLOBAL] = apiKey?.trim() || null;
}

export function syncRuntimeAuthGlobals(): void {
  const globals = runtimeAuthGlobals();
  globals[REQUEST_API_KEY_GLOBAL] = getAomiRequestApiKey();
  globals[PARA_API_KEY_GLOBAL] = getParaToolApiKey();
}

syncRuntimeAuthGlobals();
