"use client";

const SETTINGS_SESSION_KEY = "aomi_settings_session_id";
const APP_API_KEY_STORAGE_KEY = "aomi_api_key";
const PARA_DEV_API_KEY_STORAGE_KEY = "para_dev_api_key";

function readTrimmedStorageValue(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(key);
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function writeTrimmedStorageValue(key: string, value: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = value?.trim();
  if (trimmed) {
    window.localStorage.setItem(key, trimmed);
  } else {
    window.localStorage.removeItem(key);
  }
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `settings-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getSettingsSessionId(): string {
  if (typeof window === "undefined") {
    return "settings-server";
  }

  const existing = window.localStorage.getItem(SETTINGS_SESSION_KEY);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const next = generateSessionId();
  window.localStorage.setItem(SETTINGS_SESSION_KEY, next);
  return next;
}

export function getBackendUrl(): string {
  return "";
}

export function getSettingsApiKey(): string | null {
  return readTrimmedStorageValue(APP_API_KEY_STORAGE_KEY);
}

export function setSettingsApiKey(apiKey: string | null): void {
  writeTrimmedStorageValue(APP_API_KEY_STORAGE_KEY, apiKey);
}

export function getParaDevApiKey(): string | null {
  return readTrimmedStorageValue(PARA_DEV_API_KEY_STORAGE_KEY);
}

export function setParaDevApiKey(apiKey: string | null): void {
  writeTrimmedStorageValue(PARA_DEV_API_KEY_STORAGE_KEY, apiKey);
}

export async function settingsApiFetch<T>(
  path: string,
  options?: RequestInit & { apiKey?: string | null },
): Promise<T> {
  const { apiKey, ...requestInit } = options ?? {};
  const url = `${getBackendUrl()}${path}`;
  const headers = new Headers(requestInit.headers ?? {});
  headers.set("X-Session-Id", getSettingsSessionId());
  const resolvedApiKey = apiKey === undefined ? getSettingsApiKey() : apiKey?.trim() || null;
  if (resolvedApiKey) {
    headers.set("X-API-Key", resolvedApiKey);
  }
  if (!headers.has("Content-Type") && requestInit.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...requestInit,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
