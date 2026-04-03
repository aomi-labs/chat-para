"use client";

import { useState } from "react";
import { AomiRuntimeProvider, useAomiRuntime } from "@aomi-labs/react";
import { Thread } from "@/components/assistant-ui/thread";
import { NotificationToaster } from "@/components/ui/notification";
import { WalletTxHandler } from "@/components/wallet-tx-handler";
import { getBackendUrl } from "@/lib/settings-api";
import {
  ModeToolsDialog,
  ParaNamespaceSync,
  WorkspaceHeader,
  WorkspaceShell,
} from "@/components/para-workspace";

function ConsumerWorkspaceShell() {
  const { currentThreadId, threadViewKey } = useAomiRuntime();
  const [isModeToolsOpen, setModeToolsOpen] = useState(false);

  return (
    <WorkspaceShell>
      <ParaNamespaceSync mode="consumer" />
      <div className="relative flex h-full flex-col">
        <WorkspaceHeader
          mode="consumer"
          onOpenTools={() => setModeToolsOpen(true)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Thread key={`${currentThreadId}-${threadViewKey}`} />
        </div>
        <NotificationToaster />
        <WalletTxHandler />
      </div>
      <ModeToolsDialog
        mode="consumer"
        open={isModeToolsOpen}
        onOpenChange={setModeToolsOpen}
        onManageKey={() => {}}
      />
    </WorkspaceShell>
  );
}

export default function ConsumerPage() {
  return (
    <AomiRuntimeProvider backendUrl={getBackendUrl()}>
      <ConsumerWorkspaceShell />
    </AomiRuntimeProvider>
  );
}
