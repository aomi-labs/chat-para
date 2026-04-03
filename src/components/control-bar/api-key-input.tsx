"use client";

import { useEffect, useState, type FC } from "react";
import { KeyIcon, CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useControl, cn } from "@aomi-labs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettingsApiKey, setSettingsApiKey } from "@/lib/settings-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export type ApiKeyInputProps = {
  className?: string;
  title?: string;
  description?: string;
};

export const ApiKeyInput: FC<ApiKeyInputProps> = ({
  className,
  title = "Aomi API Key",
  description = "Enter your API key to authenticate with Aomi services.",
}) => {
  const { state, setState } = useControl();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);

  const storedApiKey = getSettingsApiKey();
  const resolvedApiKey = state.apiKey?.trim() || storedApiKey || "";
  const hasApiKey = Boolean(resolvedApiKey);

  useEffect(() => {
    if (!open) {
      return;
    }

    setInputValue(resolvedApiKey);
    setShowKey(false);
  }, [open, resolvedApiKey]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative rounded-full text-muted-foreground hover:text-foreground", className)}
          aria-label={hasApiKey ? "API key configured" : "Set API key"}
        >
          <KeyIcon className={cn("h-4 w-4", hasApiKey && "text-green-500")} />
        </Button>
      </DialogTrigger>
      <DialogContent className="para-surface max-w-[320px] rounded-[28px] border border-border/70 p-5 text-foreground shadow-[0_28px_90px_rgba(22,21,20,0.12)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.42)]">
        <DialogHeader className="border-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="api-key" className="mb-2">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder={hasApiKey ? "********" : "Enter your API key"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="rounded-full border-border/60 bg-card/78 pr-10 dark:bg-card/88"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeOffIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {hasApiKey && (
              <p className="text-muted-foreground text-xs">
                <CheckIcon className="mr-1 inline h-3 w-3 text-green-500" />
                API key is configured
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          {hasApiKey && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setState({ apiKey: null });
                setSettingsApiKey(null);
                window.dispatchEvent(
                  new CustomEvent("aomi:apps-updated", {
                    detail: { apiKey: null },
                  }),
                );
                setInputValue("");
                setOpen(false);
              }}
            >
              Clear
            </Button>
          )}
          <Button
            className="rounded-full"
            onClick={() => {
              if (inputValue.trim()) {
                const apiKey = inputValue.trim();
                setState({ apiKey });
                setSettingsApiKey(apiKey);
                window.dispatchEvent(
                  new CustomEvent("aomi:apps-updated", {
                    detail: { apiKey },
                  }),
                );
                setOpen(false);
                setInputValue("");
              }
            }}
            disabled={!inputValue.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
