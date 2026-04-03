"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useControl, useUser } from "@aomi-labs/react";
import { resolveDevApiKey } from "@/lib/para-dev";
import {
  setParaToolApiKey,
  syncRuntimeAuthGlobals,
} from "@/lib/request-api-keys";
import { getParaDevApiKey, setParaDevApiKey } from "@/lib/settings-api";
import type { ParaMode } from "@/lib/para-mode";
import { withParaApiKeyInUserExt } from "@/lib/para-user-state";

type RuntimeUserStatePatch = Parameters<ReturnType<typeof useUser>["setUser"]>[0] & {
  ext?: Record<string, unknown>;
};

type RuntimeUserStateWithExt = ReturnType<ReturnType<typeof useUser>["getUserState"]> & {
  ext?: Record<string, unknown>;
};

type ParaDevSessionValue = {
  apiKey: string | null;
  hasApiKey: boolean;
  canAccessPara: boolean;
  setApiKey: (apiKey: string | null) => void;
  clearApiKey: () => void;
};

const ParaDevSessionContext = createContext<ParaDevSessionValue | null>(null);

export function ParaDevSessionProvider({
  children,
  mode,
}: {
  children: ReactNode;
  mode: ParaMode;
}) {
  const { state, getAuthorizedNamespaces } = useControl();
  const { user, setUser } = useUser();
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const canAccessPara = state.authorizedNamespaces.includes("para");

  useEffect(() => {
    syncRuntimeAuthGlobals();
    void getAuthorizedNamespaces();
  }, [getAuthorizedNamespaces]);

  useEffect(() => {
    setApiKeyState(resolveDevApiKey(getParaDevApiKey()));
  }, []);

  useEffect(() => {
    setParaDevApiKey(apiKey);
    setParaToolApiKey(apiKey);
    syncRuntimeAuthGlobals();
  }, [apiKey]);

  useEffect(() => {
    const userWithExt = user as RuntimeUserStateWithExt;
    const nextUserState = withParaApiKeyInUserExt(userWithExt, mode === "dev" ? apiKey : null);
    const currentExt = JSON.stringify(userWithExt.ext ?? null);
    const nextExt = JSON.stringify(nextUserState.ext ?? null);

    if (currentExt === nextExt) {
      return;
    }

    const patch: RuntimeUserStatePatch = { ext: nextUserState.ext };
    setUser(patch);
  }, [apiKey, mode, setUser, user]);

  const setApiKey = useCallback(
    (nextApiKey: string | null) => {
      setApiKeyState(resolveDevApiKey(nextApiKey));
    },
    [],
  );

  const clearApiKey = useCallback(() => {
    setApiKeyState(null);
  }, []);

  return (
    <ParaDevSessionContext.Provider
      value={{
        apiKey,
        hasApiKey: Boolean(apiKey),
        canAccessPara,
        setApiKey,
        clearApiKey,
      }}
    >
      {children}
    </ParaDevSessionContext.Provider>
  );
}

const NOOP_SET = (_k: string | null) => {};
const NOOP_CLEAR = () => {};

const DEFAULT_VALUE: ParaDevSessionValue = {
  apiKey: null,
  hasApiKey: false,
  canAccessPara: false,
  setApiKey: NOOP_SET,
  clearApiKey: NOOP_CLEAR,
};

export function useParaDevSession(): ParaDevSessionValue {
  const context = useContext(ParaDevSessionContext);
  return context ?? DEFAULT_VALUE;
}
