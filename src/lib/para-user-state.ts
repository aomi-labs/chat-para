export const PARA_API_KEY_EXT_KEY = "para_api_key";

type UserExt = Record<string, unknown>;

type UserStateWithExt = {
  ext?: UserExt | null;
};

function isUserExt(value: unknown): value is UserExt {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function withParaApiKeyInUserExt<T extends UserStateWithExt>(
  userState: T,
  apiKey: string | null,
): Omit<T, "ext"> & { ext?: UserExt } {
  const trimmedApiKey = apiKey?.trim() || null;
  const nextExt: UserExt = isUserExt(userState.ext) ? { ...userState.ext } : {};

  if (trimmedApiKey) {
    nextExt[PARA_API_KEY_EXT_KEY] = trimmedApiKey;
  } else {
    delete nextExt[PARA_API_KEY_EXT_KEY];
  }

  const { ext: _ext, ...rest } = userState;
  if (Object.keys(nextExt).length === 0) {
    return rest;
  }

  return {
    ...rest,
    ext: nextExt,
  };
}
