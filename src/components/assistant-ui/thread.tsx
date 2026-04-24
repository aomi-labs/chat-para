"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  Square,
} from "lucide-react";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";

import type { FC, FormEvent } from "react";
import { useEffect } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

import { cn, useControl, useNotification, useThreadContext } from "@aomi-labs/react";
import { useComposerControl } from "@/components/aomi-frame";
import { ModelSelect } from "@/components/control-bar/model-select";
import { AppSelect } from "@/components/control-bar/app-select";
import { ApiKeyInput } from "@/components/control-bar/api-key-input";
import { NetworkSelect } from "@/components/control-bar/network-select";
import { WalletConnect } from "@/components/control-bar/wallet-connect";
import { ParaMark } from "@/components/para-mark";
import { useAssistantApi, useMessage } from "@assistant-ui/react";
import { useParaMode } from "@/lib/para-mode";
import {
  buildParaConsumerRequestPrompt,
  buildParaDevRequestPrompt,
} from "@/lib/para-dev";
import { requestParaDevKey } from "@/lib/para-auth";
import { useParaDevSession } from "@/components/para-dev-session";

const seenSystemMessages = new Set<string>();

export const Thread: FC = () => {
  const api = useAssistantApi();
  const { threadViewKey } = useThreadContext();

  useEffect(() => {
    try {
      const composer = api.composer();
      composer.setText("");
    } catch (error) {
      console.error("Failed to reset composer input:", error);
    }
  }, [api, threadViewKey]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <ThreadPrimitive.Root
          className="aui-root aui-thread-root @container bg-transparent flex h-full flex-col"
          style={{
            ["--thread-max-width" as string]: "56rem",
          }}
        >
          <ThreadPrimitive.Viewport className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-2">
            <ThreadPrimitive.If empty>
              <ThreadWelcome />
            </ThreadPrimitive.If>

            <ThreadPrimitive.Messages
              components={{
                UserMessage,
                EditComposer,
                AssistantMessage,
                SystemMessage,
              }}
            />

            <ThreadPrimitive.If empty={false}>
              <div className="aui-thread-viewport-spacer min-h-8 grow" />
            </ThreadPrimitive.If>

            <Composer />
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
      </MotionConfig>
    </LazyMotion>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full border border-border/70 bg-card/95 p-4 shadow-[0_16px_36px_rgba(22,21,20,0.1)] disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  const mode = useParaMode();
  const { hasApiKey } = useParaDevSession();
  const devLocked = mode === "dev" && !hasApiKey;

  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
      <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message flex size-full max-w-5xl flex-col justify-center px-4 text-center md:px-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-6 flex justify-center"
          >
            <div className="para-surface rounded-full px-4 py-3">
              <ParaMark />
            </div>
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="aui-thread-welcome-message-motion-1 para-kicker text-[11px] text-primary"
          >
            {mode === "dev" ? "Para developer mode" : "Para consumer mode"}
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.05 }}
            className="aui-thread-welcome-message-motion-1 para-display mt-3 text-[2.5rem] font-semibold leading-[0.92] md:text-[4.25rem]"
          >
            {mode === "dev" ? "Build with Para." : "Move tokens with Para."}
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
            className="aui-thread-welcome-message-motion-2 mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-xl"
          >
            {devLocked
              ? "Enter a Para API key before sending create-wallet or signing requests."
              : mode === "dev"
              ? "Create wallets, fetch status, and sign raw data through the para namespace by routing requests through the agent. The saved Para key is included in request context instead of visible chat text."
              : "Use guided chat to inspect balances, transfer assets, and walk through swaps."}
          </m.div>
          {devLocked && (
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
              onClick={() => {
                requestParaDevKey();
              }}
            >
              Enter API key
            </Button>
          </div>
        )}
          <m.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.18 }}
            className="mt-8 hidden justify-center md:flex"
          >
            <div className="para-surface relative overflow-hidden rounded-[32px] p-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,78,0,0.12)_0%,rgba(255,78,0,0)_30%)]" />
              <Image
                src="/para-brand/hero-image.svg"
                alt="Para product illustration"
                width={961}
                height={546}
                className="relative h-auto w-[720px] max-w-full"
                priority
              />
            </div>
          </m.div>
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  const mode = useParaMode();
  const { hasApiKey } = useParaDevSession();
  const devLocked = mode === "dev" && !hasApiKey;

  if (devLocked || mode === "dev") {
    return null;
  }

  const suggestions = [
    {
      title: "Show my balances",
      label: "and suggest the next move",
      action: buildParaConsumerRequestPrompt({
        request: "Show my wallet balances.",
      }),
    },
    {
      title: "Send tokens",
      label: "with a guided transfer flow",
      action: buildParaConsumerRequestPrompt({
        request: "Help me send tokens from my connected wallet and guide me through the transaction approval flow.",
      }),
    },
    {
      title: "Swap tokens",
      label: "with route context",
      action: buildParaConsumerRequestPrompt({
        request: "Help me swap tokens from my connected wallet, explain the route, and guide me through approval.",
      }),
    },
    {
      title: "Check network context",
      label: "before I act",
      action: buildParaConsumerRequestPrompt({
        request: "Summarize my connected wallet identity and current network context before I move tokens.",
      }),
    },
  ];

  return (
    <div className="aui-thread-welcome-suggestions @md:grid-cols-2 grid w-full gap-3 pb-4">
      {suggestions.map((suggestedAction, index) => (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="aui-thread-welcome-suggestion-display @md:[&:nth-child(n+3)]:block [&:nth-child(n+3)]:hidden"
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestedAction.action}
            send
            asChild
          >
            <Button
              variant="ghost"
              className="aui-thread-welcome-suggestion @md:flex-col h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-[28px] border border-border/70 bg-white/70 px-5 py-4 text-left text-sm font-normal text-foreground shadow-[0_12px_30px_rgba(22,21,20,0.05)] hover:border-primary/35 hover:bg-accent dark:border-white/12 dark:bg-card/92 dark:text-foreground dark:hover:border-primary/35 dark:hover:bg-accent/85"
              aria-label={suggestedAction.action}
            >
              <span className="aui-thread-welcome-suggestion-text-1 font-medium text-foreground dark:text-foreground">
                {suggestedAction.title}
              </span>
              <span className="aui-thread-welcome-suggestion-text-2 text-muted-foreground dark:text-foreground/68">
                {suggestedAction.label}
              </span>
            </Button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  const mode = useParaMode();
  const api = useAssistantApi();
  const { onAppSelect } = useControl();
  const { apiKey, hasApiKey } = useParaDevSession();

  if (mode === "dev" && !hasApiKey) {
    return (
      <div className="aui-composer-wrapper bg-transparent sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-3xl pb-4 md:pb-6">
        <div className="para-surface rounded-[28px] px-5 py-4">
          <div className="text-sm font-medium text-foreground">Para API key required</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Enter a Para API key to unlock developer chat actions. In dev mode, the saved key is included in request context while requests still route through the agent.
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "dev" && !apiKey) {
      return;
    }

    if (api.thread().getState().isRunning) {
      return;
    }

    const composer = api.composer();
    const text = composer.getState().text.trim();
    if (!text) {
      return;
    }

  const prompt = mode === "dev"
      ? buildParaDevRequestPrompt({
          request: text,
        })
      : buildParaConsumerRequestPrompt({
          request: text,
        });

    if (mode === "dev") {
      onAppSelect("para");
    }
    api.thread().append(prompt);
    void composer.reset();
  };

  return (
    <div className="aui-composer-wrapper bg-transparent sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-3xl pb-4 md:pb-6">
      <ThreadScrollToBottom />
      <ComposerPrimitive.Root
        onSubmit={handleSubmit}
        className="aui-composer-root para-surface relative flex w-full flex-col rounded-[30px] px-1 pt-2 text-card-foreground"
      >
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="aui-composer-input ml-3 mt-2 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pb-3 pt-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:outline-primary"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  const pathname = usePathname();
  const mode = useParaMode();
  const composerControl = useComposerControl();
  const controlBarProps = composerControl.controlBarProps ?? {};
  const isConsumerWorkspace = pathname.startsWith("/consumer");
  const showInlineControls = composerControl.enabled || isConsumerWorkspace;
  const hideModel = mode === "dev" ? true : controlBarProps.hideModel ?? false;
  const hideApp = mode === "dev"
    ? true
    : (controlBarProps as { hideApp?: boolean }).hideApp ?? false;
  const hideApiKey = mode === "dev" ? true : controlBarProps.hideApiKey ?? false;
  const hideWallet = isConsumerWorkspace ? true : controlBarProps.hideWallet ?? true;
  const hideNetwork = mode === "dev" ? true : controlBarProps.hideNetwork ?? false;

  return (
    <div className="aui-composer-action-wrapper relative mx-1 mb-2 mt-2 flex items-center">
      {showInlineControls && (
        <div className="ml-2 flex items-center gap-2">
          {!hideNetwork && <NetworkSelect />}
          {!hideModel && <ModelSelect />}
          {!hideApp && <AppSelect />}
          {!hideWallet && <WalletConnect />}
          {!hideApiKey && <ApiKeyInput />}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            className="aui-composer-send mb-3 mr-3 size-[36px] rounded-full p-1"
            aria-label="Send message"
          >
            <ArrowUpIcon className="aui-composer-send-icon size-5" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            className="aui-composer-cancel border-muted-foreground/40 hover:bg-primary/75 size-[36px] rounded-full border"
            aria-label="Stop generating"
          >
            <Square className="aui-composer-cancel-icon size-3.5 fill-white dark:fill-black" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root border-destructive bg-destructive/10 text-destructive dark:bg-destructive/5 mt-2 rounded-md border p-3 text-sm dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-assistant-message-root animate-in fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-[var(--thread-max-width)] py-4 duration-150 ease-out last:mb-24"
        data-role="assistant"
      >
        <div className="aui-assistant-message-content mx-2 break-words px-5 py-1 text-sm leading-6 text-foreground">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownText,
              tools: { Fallback: ToolFallback },
            }}
          />
          <MessageError />
        </div>

        <div className="aui-assistant-message-footer ml-2 mt-1 flex">
          <BranchPicker />
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root text-muted-foreground data-floating:absolute data-floating:rounded-full data-floating:border data-floating:border-border data-floating:bg-card data-floating:p-1 data-floating:shadow-sm col-start-3 row-start-2 -ml-1 flex gap-1"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-user-message-root animate-in fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 duration-150 ease-out first:mt-3 last:mb-5 [&:where(>*)]:col-start-2"
        data-role="user"
      >
        <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
          <div className="aui-user-message-content bg-primary text-primary-foreground break-words rounded-[28px] px-5 py-3 text-sm">
            <MessagePrimitive.Parts />
          </div>
          <div className="aui-user-action-bar-wrapper absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 pr-2">
            <UserActionBar />
          </div>
        </div>

        <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4">
      <ComposerPrimitive.Root className="aui-edit-composer-root max-w-7/8 ml-auto flex w-full flex-col rounded-[28px] border border-border/70 bg-card/92">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
          autoFocus
        />

        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" aria-label="Cancel edit">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" aria-label="Update message">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root text-muted-foreground -ml-2 mr-2 inline-flex items-center text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const SystemMessage: FC = () => {
  const { showNotification } = useNotification();
  const messageId = useMessage((state) => state.id);
  const content = useMessage((state) => state.content) as Array<{
    type: string;
    text?: string;
  }>;
  const custom = useMessage((state) => state.metadata?.custom) as
    | { kind?: string; title?: string }
    | undefined;
  useEffect(() => {
    const text = content
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) return;

    const key = messageId ?? text;
    if (seenSystemMessages.has(key)) return;
    seenSystemMessages.add(key);

    const inferredKind =
      custom?.kind ??
      (text.startsWith("Wallet transaction request:")
        ? "wallet_tx_request"
        : "system_notice");

    const type =
      inferredKind === "system_error"
        ? "error"
        : inferredKind === "system_success"
          ? "success"
          : "notice";

    const title =
      custom?.title ??
      (inferredKind === "wallet_tx_request"
        ? "Wallet transaction request"
        : inferredKind === "system_error"
          ? "Error"
          : "System notice");

    showNotification({ type, title, message: text });
  }, [content, custom, showNotification, messageId]);

  return null;
};
