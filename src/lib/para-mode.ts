"use client";

import { createContext, useContext } from "react";

export type ParaMode = "consumer" | "dev";

export const ParaModeContext = createContext<ParaMode>("consumer");

export function useParaMode(): ParaMode {
  return useContext(ParaModeContext);
}

export function resolveParaModeFromPath(pathname: string): ParaMode {
  if (pathname.startsWith("/dev")) {
    return "dev";
  }

  return "consumer";
}

export function shouldPromptForDevApiKey(mode: ParaMode, hasApiKey: boolean): boolean {
  return mode === "dev" && !hasApiKey;
}
