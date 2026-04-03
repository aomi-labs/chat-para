"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FC,
} from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { useControl, cn } from "@aomi-labs/react";
import { Button } from "@/components/ui/button";
import { getSettingsApiKey, settingsApiFetch } from "@/lib/settings-api";
import { useAccountIdentity } from "@/lib/use-account-identity";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  filterVisibleApps,
  getVisibleAppsFallback,
} from "@/lib/para-mode";
import { buildAppsRequest } from "./app-select-path";
import { resolveAppsApiKey } from "./app-select-api-key";

export type AppSelectProps = {
  className?: string;
  placeholder?: string;
};

export const AppSelect: FC<AppSelectProps> = ({
  className,
  placeholder = "Select app",
}) => {
  const {
    state,
    setState,
    getCurrentThreadControl,
    onNamespaceSelect: onAppSelect,
    isProcessing,
  } = useControl();
  const identity = useAccountIdentity();
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<string[]>([]);
  const apiKeyRef = useRef<string | null>(state.apiKey);

  useEffect(() => {
    apiKeyRef.current = state.apiKey;
  }, [state.apiKey]);

  const refreshApps = useCallback(async (nextApiKey?: string | null) => {
    try {
      const request = buildAppsRequest(
        identity.address,
        resolveAppsApiKey(apiKeyRef.current, nextApiKey),
      );
      const data = await settingsApiFetch<string[]>(request.path, { apiKey: request.apiKey });
      const normalized = [...new Set((data ?? []).map((app) => app.toLowerCase()))];
      const visibleApps = filterVisibleApps(normalized);
      const nextApps = visibleApps.length > 0 ? visibleApps : getVisibleAppsFallback();
      setApps(nextApps);
      return nextApps;
    } catch (error) {
      console.error("Failed to fetch apps for selector:", error);
      const fallbackApps = getVisibleAppsFallback();
      setApps(fallbackApps);
      return fallbackApps;
    }
  }, [identity.address]);

  useEffect(() => {
    const storedApiKey = getSettingsApiKey();
    const currentApiKey = apiKeyRef.current;
    if (storedApiKey && currentApiKey !== storedApiKey) {
      setState({ apiKey: storedApiKey });
    }

    void refreshApps(resolveAppsApiKey(currentApiKey, storedApiKey));
    const onAppsUpdated = (event: Event) => {
      const maybeEvent = event as CustomEvent<{ apiKey?: string | null }>;
      const nextApiKey =
        maybeEvent.detail && "apiKey" in maybeEvent.detail
          ? maybeEvent.detail.apiKey ?? null
          : apiKeyRef.current;
      if (maybeEvent.detail && "apiKey" in maybeEvent.detail) {
        setState({ apiKey: nextApiKey });
      }
      void refreshApps(nextApiKey);
    };
    window.addEventListener("aomi:apps-updated", onAppsUpdated);
    return () => {
      window.removeEventListener("aomi:apps-updated", onAppsUpdated);
    };
  }, [
    identity.address,
    identity.isConnected,
    refreshApps,
    setState,
  ]);

  const threadControl = getCurrentThreadControl();
  const selectedApp =
    threadControl.namespace ?? state.defaultNamespace ?? "para-consumer";

  useEffect(() => {
    if (isProcessing || apps.length === 0) {
      return;
    }

    const normalizedSelected = selectedApp.toLowerCase();
    if (apps.includes(normalizedSelected)) {
      return;
    }

    const fallbackApp =
      apps.includes("para-consumer") ? "para-consumer" : apps[0];
    onAppSelect(fallbackApp);
  }, [apps, isProcessing, onAppSelect, selectedApp]);

  if (apps.length === 0) {
    return (
      <Button
        variant="ghost"
        disabled
        className={cn(
          "h-8 w-auto min-w-[100px] rounded-full px-2 text-xs",
          "text-muted-foreground",
          className,
        )}
      >
        <span className="truncate">{selectedApp}</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          disabled={isProcessing}
          className={cn(
            "h-8 w-auto min-w-[100px] justify-between rounded-full px-3 text-xs",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isProcessing && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <span className="truncate">{selectedApp ?? placeholder}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={-40}
        className="w-[180px] rounded-3xl p-1 shadow-none"
      >
        <div className="flex flex-col gap-0.5">
          {apps.map((app: string) => (
            <button
              key={app}
              disabled={isProcessing}
              onClick={() => {
                if (isProcessing) return;
                onAppSelect(app);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground",
                selectedApp === app && "bg-accent",
                isProcessing && "cursor-not-allowed opacity-50",
              )}
            >
              <span>{app}</span>
              {selectedApp === app && <CheckIcon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
