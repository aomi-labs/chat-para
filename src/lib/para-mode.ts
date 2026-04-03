"use client";

import { createContext, useContext } from "react";

export type ParaMode = "consumer" | "dev";

export const ParaModeContext = createContext<ParaMode>("consumer");

export function useParaMode(): ParaMode {
  return useContext(ParaModeContext);
}

export type ParaNamespace = "para-consumer" | "para";

const MODE_TO_NAMESPACE: Record<ParaMode, ParaNamespace> = {
  consumer: "para-consumer",
  dev: "para",
};

const VISIBLE_APPS: readonly ParaNamespace[] = ["para-consumer", "para"];
const VISIBLE_APP_SET = new Set<string>(VISIBLE_APPS);

export function resolveParaModeFromPath(pathname: string): ParaMode {
  if (pathname.startsWith("/dev")) {
    return "dev";
  }

  return "consumer";
}

export function getNamespaceForMode(mode: ParaMode): ParaNamespace {
  return MODE_TO_NAMESPACE[mode];
}

export function filterVisibleApps(apps: string[]): string[] {
  return apps.filter((app) => VISIBLE_APP_SET.has(app));
}

export function getVisibleAppsFallback(): ParaNamespace[] {
  return [...VISIBLE_APPS];
}

export function shouldPromptForDevApiKey(mode: ParaMode, hasApiKey: boolean): boolean {
  return mode === "dev" && !hasApiKey;
}
