"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getChainInfo,
  useAomiRuntime,
  useControl,
  cn,
} from "@aomi-labs/react";
import { ThreadListPrimitive, useAssistantApi } from "@assistant-ui/react";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { WalletConnect } from "@/components/control-bar/wallet-connect";
import { NetworkSelect } from "@/components/control-bar/network-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountIdentity } from "@/lib/use-account-identity";
import { ParaMark } from "@/components/para-mark";
import {
  getNamespaceForMode,
  type ParaMode,
} from "@/lib/para-mode";
import {
  buildParaConsumerRequestPrompt,
  buildCreateWalletPrompt,
  buildGetWalletPrompt,
  buildSignRawPrompt,
  type CreateWalletInput,
  type GetWalletInput,
  type SignRawInput,
  validateSignRawInput,
} from "@/lib/para-dev";
import {
  useParaDevSession,
} from "@/components/para-dev-session";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const CONSUMER_ACTIONS = [
  {
    title: "Show balances",
    description: "Summarize my current wallet balances and which token I can move next.",
    prompt: "Show my wallet balances.",
  },
  {
    title: "Send tokens",
    description: "Draft a simple transfer with the correct wallet approval flow.",
    prompt: "Help me send tokens from my connected wallet and guide me through the transaction approval flow.",
  },
  {
    title: "Swap tokens",
    description: "Suggest the best route and walk me through the swap.",
    prompt: "Help me swap tokens from my connected wallet, explain the route, and guide me through approval.",
  },
] as const;

function PanelSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="para-surface rounded-[28px] p-5">
      <div className="mb-4 space-y-1">
        <h3 className="para-kicker text-xs font-medium text-foreground/80">
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ParaModeSwitcher({ mode }: { mode: ParaMode }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-[0_12px_30px_rgba(22,21,20,0.06)]">
      <Link
        href="/consumer"
        className={cn(
          "para-kicker rounded-full px-4 py-2 text-[11px] font-medium transition-colors",
          mode === "consumer"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Consumer
      </Link>
      <Link
        href="/dev"
        className={cn(
          "para-kicker rounded-full px-4 py-2 text-[11px] font-medium transition-colors",
          mode === "dev"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Dev
      </Link>
    </div>
  );
}

export function ParaNamespaceSync({ mode }: { mode: ParaMode }) {
  const { currentThreadId } = useAomiRuntime();
  const { getCurrentThreadControl, onNamespaceSelect, isProcessing } = useControl();
  const targetNamespace = getNamespaceForMode(mode);

  useEffect(() => {
    if (isProcessing) {
      return;
    }

    const currentNamespace = getCurrentThreadControl().namespace;
    if (currentNamespace !== targetNamespace) {
      onNamespaceSelect(targetNamespace);
    }
  }, [
    currentThreadId,
    getCurrentThreadControl,
    isProcessing,
    onNamespaceSelect,
    targetNamespace,
  ]);

  return null;
}

function ConsumerPanel() {
  const api = useAssistantApi();
  const { onNamespaceSelect, isProcessing } = useControl();
  const identity = useAccountIdentity();
  const network = identity.chainId ? getChainInfo(identity.chainId) : undefined;

  const sendPrompt = (prompt: string) => {
    onNamespaceSelect("para-consumer");
    api.thread().append(buildParaConsumerRequestPrompt({ request: prompt }));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="para-kicker inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
          Consumer mode
        </div>
        <div className="space-y-2">
          <h1 className="font-bauhaus text-4xl leading-[0.95] text-foreground md:text-[2.8rem]">
            Move tokens with a calmer wallet flow.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Connect your wallet, keep the app locked to <code>para-consumer</code>,
            and use guided chat actions instead of navigating the full Aomi multi-app surface.
          </p>
        </div>
      </div>

      <PanelSection
        title="Connected account"
        description="Consumer mode reads the active Para or external wallet identity and keeps the network selector visible in chat."
      >
        <div className="grid gap-3 text-sm">
          <div className="rounded-3xl border border-border/60 bg-white/70 p-4">
            <div className="para-kicker text-[11px] text-muted-foreground">
              Status
            </div>
            <div className="mt-2 text-base font-medium text-foreground">
              {identity.isConnected ? "Connected" : "Not connected"}
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-white/70 p-4">
            <div className="para-kicker text-[11px] text-muted-foreground">
              Primary identity
            </div>
            <div className="mt-2 break-all text-base font-medium text-foreground">
              {identity.primaryLabel}
            </div>
            {identity.address && (
              <div className="mt-2 break-all text-xs text-muted-foreground">
                {identity.address}
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-border/60 bg-white/70 p-4">
            <div className="para-kicker text-[11px] text-muted-foreground">
              Network
            </div>
            <div className="mt-2 text-base font-medium text-foreground">
              {network?.name ?? "Select a network after connecting"}
            </div>
          </div>
        </div>
      </PanelSection>

      <PanelSection
        title="Quick actions"
        description="Each card sends a structured consumer prompt straight into chat."
      >
        <div className="space-y-3">
          {CONSUMER_ACTIONS.map((action) => (
            <button
              key={action.title}
              type="button"
              disabled={isProcessing}
              onClick={() => {
                sendPrompt(action.prompt);
              }}
              className="w-full rounded-[24px] border border-border/70 bg-white/75 px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="text-sm font-semibold text-foreground">{action.title}</div>
              <div className="mt-1 text-sm leading-6 text-muted-foreground">
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}

export function DevApiKeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { apiKey, setApiKey, clearApiKey } = useParaDevSession();
  const [draft, setDraft] = useState(apiKey ?? "");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(apiKey ?? "");
      setStatus(null);
    }
  }, [apiKey, open]);

  const handleApply = () => {
    const trimmedKey = draft.trim();
    if (!trimmedKey) {
      setStatus("Enter a Para API key to continue.");
      return;
    }

    setApiKey(trimmedKey);
    setStatus("Para developer key saved locally in this browser.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="para-surface max-w-md rounded-[28px] border border-border/70 p-6 text-foreground shadow-[0_28px_90px_rgba(22,21,20,0.12)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.42)]">
        <DialogHeader>
          <DialogTitle className="font-bauhaus text-2xl">Enter your Para API key</DialogTitle>
          <DialogDescription className="leading-6">
            Dev mode stores this key locally in your browser and attaches it to request state while
            requests still flow through the agent instead of direct frontend tool calls.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="password"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setStatus(null);
            }}
            placeholder="Enter your Para API key"
            className="h-12 rounded-full border-border/60 bg-card/78 px-5 dark:bg-card/88"
          />
          {status && <div className="text-sm text-muted-foreground">{status}</div>}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              clearApiKey();
              setDraft("");
              setStatus("Developer key cleared from local browser storage.");
            }}
          >
            Clear key
          </Button>
          <Button
            type="button"
            className="rounded-full"
            onClick={() => {
              void handleApply();
            }}
            disabled={!draft.trim()}
          >
            Save key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModeToolsDialog({
  mode,
  open,
  onOpenChange,
  onManageKey,
}: {
  mode: ParaMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManageKey: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="para-surface max-h-[85vh] max-w-3xl overflow-y-auto rounded-[28px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-bauhaus text-2xl">
            <ParaMark compact />
            {mode === "consumer" ? "Consumer tools" : "Developer tools"}
          </DialogTitle>
          <DialogDescription className="leading-6">
            {mode === "consumer"
              ? "Quick wallet actions and account context for token movement."
              : "Structured Para wallet creation, lookup, and signing controls."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          {mode === "consumer" ? <ConsumerPanel /> : <DevPanel onManageKey={onManageKey} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DevPanel({ onManageKey }: { onManageKey: () => void }) {
  const api = useAssistantApi();
  const { onNamespaceSelect, isProcessing } = useControl();
  const { apiKey, hasApiKey, clearApiKey } = useParaDevSession();
  const [createInput, setCreateInput] = useState<CreateWalletInput>({
    walletType: "EVM",
    userIdentifier: "",
    userIdentifierType: "EMAIL",
    scheme: "",
    cosmosPrefix: "",
  });
  const [getInput, setGetInput] = useState<GetWalletInput>({
    walletId: "",
  });
  const [signInput, setSignInput] = useState<SignRawInput>({
    walletId: "",
    data: "",
  });

  const formsLocked = !hasApiKey || isProcessing;
  const signValidation = signInput.data ? validateSignRawInput(signInput.data) : null;

  const submitPrompt = (prompt: string) => {
    onNamespaceSelect("para");
    api.thread().append(prompt);
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formsLocked) return;
    submitPrompt(buildCreateWalletPrompt(createInput));
  };

  const handleGetSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formsLocked) return;
    submitPrompt(buildGetWalletPrompt(getInput));
  };

  const handleSignSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formsLocked || signValidation) return;
    submitPrompt(buildSignRawPrompt(signInput));
  };

  const accessTone = useMemo(() => {
    if (!hasApiKey) {
      return {
        title: "Developer key required",
        body: "Apply a Para API key to unlock agent-routed wallet creation, lookup, and raw-signing actions in dev mode.",
      };
    }

    return {
      title: "Developer access active",
      body: "Create wallets, fetch status, and sign raw payloads through the agent. In dev mode, the saved Para key is attached to request state instead of visible prompt text.",
    };
  }, [hasApiKey]);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="para-kicker inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
          Dev mode
        </div>
        <div className="space-y-2">
          <h1 className="font-bauhaus text-4xl leading-[0.95] text-foreground md:text-[2.8rem]">
            Build wallet flows against the Para namespace.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The chat stays in control, but the workbench constrains inputs for wallet creation,
            status lookup, and raw data signing.
          </p>
        </div>
      </div>

      <PanelSection
        title="Session key"
        description="Dev mode asks for the key in a modal as soon as you enter this route without one."
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onManageKey}
              className="rounded-full"
            >
              {hasApiKey ? "Update key" : "Enter key"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                clearApiKey();
              }}
              disabled={!hasApiKey}
            >
              Clear key
            </Button>
          </div>
          <div className="rounded-3xl border border-border/60 bg-white/70 p-4">
            <div className="text-sm font-semibold text-foreground">{accessTone.title}</div>
            <div className="mt-1 text-sm leading-6 text-muted-foreground">{accessTone.body}</div>
            {apiKey && (
              <div className="mt-3 text-xs text-muted-foreground">
                Active session key: {apiKey.slice(0, 6)}...{apiKey.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </PanelSection>

      <PanelSection
        title="Create wallet"
        description="Send a structured request that asks the agent to create a wallet and wait until it becomes ready."
      >
        <form className="grid gap-3" onSubmit={handleCreateSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-muted-foreground">
              Wallet type
              <select
                value={createInput.walletType}
                onChange={(event) =>
                  setCreateInput((current) => ({
                    ...current,
                    walletType: event.target.value,
                  }))
                }
                className="mt-2 h-12 w-full rounded-2xl border border-input bg-white/80 px-4 text-foreground outline-none"
              >
                <option value="EVM">EVM</option>
                <option value="SOLANA">SOLANA</option>
                <option value="COSMOS">COSMOS</option>
              </select>
            </label>
            <label className="text-sm text-muted-foreground">
              Identifier type
              <select
                value={createInput.userIdentifierType}
                onChange={(event) =>
                  setCreateInput((current) => ({
                    ...current,
                    userIdentifierType: event.target.value,
                  }))
                }
                className="mt-2 h-12 w-full rounded-2xl border border-input bg-white/80 px-4 text-foreground outline-none"
              >
                <option value="EMAIL">EMAIL</option>
                <option value="PHONE">PHONE</option>
                <option value="CUSTOM_ID">CUSTOM_ID</option>
                <option value="GUEST_ID">GUEST_ID</option>
                <option value="TELEGRAM">TELEGRAM</option>
                <option value="DISCORD">DISCORD</option>
                <option value="TWITTER">TWITTER</option>
              </select>
            </label>
          </div>
          <Input
            value={createInput.userIdentifier}
            onChange={(event) =>
              setCreateInput((current) => ({
                ...current,
                userIdentifier: event.target.value,
              }))
            }
            placeholder="Please enter your email"
            className="h-12 rounded-full bg-white/80 px-5"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={createInput.scheme}
              onChange={(event) =>
                setCreateInput((current) => ({
                  ...current,
                  scheme: event.target.value,
                }))
              }
              placeholder="DKLS (optional)"
              className="h-12 rounded-full bg-white/80 px-5"
            />
            <Input
              value={createInput.cosmosPrefix}
              onChange={(event) =>
                setCreateInput((current) => ({
                  ...current,
                  cosmosPrefix: event.target.value,
                }))
              }
              placeholder="Cosmos prefix (optional)"
              className="h-12 rounded-full bg-white/80 px-5"
            />
          </div>
          <Button
            type="submit"
            disabled={formsLocked || !createInput.userIdentifier.trim()}
            className="rounded-full"
          >
            Create wallet in chat
          </Button>
        </form>
      </PanelSection>

      <PanelSection
        title="Lookup + sign"
        description="Use the saved browser key while routing wallet lookup and raw-sign requests through the agent."
      >
        <div className="grid gap-4">
          <form className="grid gap-3" onSubmit={handleGetSubmit}>
            <Input
              value={getInput.walletId}
              onChange={(event) =>
                setGetInput((current) => ({
                  ...current,
                  walletId: event.target.value,
                }))
              }
              placeholder="Wallet ID"
              className="h-12 rounded-full bg-white/80 px-5"
            />
            <Button type="submit" disabled={formsLocked || !getInput.walletId.trim()} className="rounded-full">
              Fetch wallet status in chat
            </Button>
          </form>

          <form className="grid gap-3" onSubmit={handleSignSubmit}>
            <Input
              value={signInput.walletId}
              onChange={(event) =>
                setSignInput((current) => ({
                  ...current,
                  walletId: event.target.value,
                }))
              }
              placeholder="Wallet ID"
              className="h-12 rounded-full bg-white/80 px-5"
            />
            <Input
              value={signInput.data}
              onChange={(event) =>
                setSignInput((current) => ({
                  ...current,
                  data: event.target.value,
                }))
              }
              placeholder="0x-prefixed hex payload"
              className="h-12 rounded-full bg-white/80 px-5 font-mono"
            />
            {signValidation && (
              <div className="text-sm text-destructive">{signValidation}</div>
            )}
            <Button
              type="submit"
              disabled={formsLocked || !signInput.walletId.trim() || !signInput.data.trim() || Boolean(signValidation)}
              className="rounded-full"
            >
              Sign raw data in chat
            </Button>
          </form>
        </div>
      </PanelSection>
    </div>
  );
}

export function WorkspaceHeader({
  mode,
  onManageKey,
  onOpenTools,
}: {
  mode: ParaMode;
  onManageKey?: () => void;
  onOpenTools: () => void;
}) {
  const { currentThreadId, getThreadMetadata } = useAomiRuntime();
  const currentTitle = getThreadMetadata(currentThreadId)?.title ?? "New Chat";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/65 px-4 backdrop-blur-xl">
      <SidebarTrigger />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ParaMark compact />
        <div className="min-w-0">
          <div className="para-kicker text-[11px] text-muted-foreground">
            {mode === "consumer" ? "Consumer workspace" : "Developer workspace"}
          </div>
          <div className="truncate text-sm font-medium text-foreground">{currentTitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThreadListPrimitive.New asChild>
          <Button variant="outline" className="rounded-full">
            New chat
          </Button>
        </ThreadListPrimitive.New>
        <ParaModeSwitcher mode={mode} />
        <Button variant="outline" className="rounded-full" onClick={onOpenTools}>
          {mode === "consumer" ? "Consumer tools" : "Dev tools"}
        </Button>
        {mode === "consumer" && <NetworkSelect />}
        {mode === "dev" && onManageKey && (
          <Button variant="outline" className="rounded-full" onClick={onManageKey}>
            API key
          </Button>
        )}
        <WalletConnect className="rounded-full" />
      </div>
    </header>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-full min-h-0!">
      <div className="para-app-shell relative h-screen w-full overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,78,0,0.16)_0%,rgba(255,78,0,0)_28%),radial-gradient(circle_at_bottom_right,rgba(22,21,20,0.08)_0%,rgba(22,21,20,0)_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle,rgba(142,133,127,0.14)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,white,transparent_82%)]" />
        <div className="relative flex h-full w-full overflow-hidden">
          <ThreadListSidebar walletPosition={null} variant="sidebar" className="border-r border-border/60 bg-transparent" />
          <SidebarInset className="min-h-0 overflow-hidden rounded-none bg-transparent shadow-none md:m-0">
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
