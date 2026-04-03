"use client";

import type { FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAssistantState,
} from "@assistant-ui/react";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Skeleton } from "@/components/ui/skeleton";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex list-none flex-col items-stretch gap-2">
      <ThreadListNew />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="aui-thread-list-new para-kicker flex items-center justify-start gap-2 rounded-full border border-border/60 bg-card/72 px-4 py-2 text-start text-[11px] text-foreground/88 shadow-[0_10px_24px_rgba(22,21,20,0.05)] hover:border-primary/25 hover:bg-accent/85 hover:text-foreground data-active:border-border/80 data-active:bg-accent/90 dark:shadow-none"
        variant="ghost"
      >
        <PlusIcon className="size-4" />
        New Chat
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  const isLoading = useAssistantState(({ threads }) => threads.isLoading);

  if (isLoading) {
    return <ThreadListSkeleton />;
  }

  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListSkeleton: FC = () => {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading threads"
          aria-live="polite"
          className="aui-thread-list-skeleton-wrapper flex items-center gap-2 rounded-full px-3 py-2"
        >
          <Skeleton className="aui-thread-list-skeleton h-[22px] flex-grow" />
        </div>
      ))}
    </>
  );
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="aui-thread-list-item flex items-center gap-2 rounded-full border border-border/25 bg-card/42 pl-4 transition-all hover:border-border/55 hover:bg-accent/78 focus-visible:border-border/60 focus-visible:bg-accent/78 focus-visible:outline-none data-[active=true]:border-border/70 data-[active=true]:bg-accent/92">
      <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger flex-grow py-2 text-start">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemDelete />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <span className="aui-thread-list-item-title text-sm text-foreground/90">
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </span>
  );
};

const ThreadListItemDelete: FC = () => {
  return (
    <ThreadListItemPrimitive.Delete asChild>
      <TooltipIconButton
        className="aui-thread-list-item-delete ml-auto mr-3 size-4 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        variant="ghost"
        tooltip="Delete thread"
        onClick={(event) => {
          const confirmed = window.confirm(
            "Delete this chat? This action cannot be undone.",
          );
          if (!confirmed) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <TrashIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Delete>
  );
};
