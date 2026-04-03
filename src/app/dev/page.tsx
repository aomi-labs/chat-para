"use client";

import { useEffect, useState } from "react";
import { AomiRuntimeProvider, useAomiRuntime } from "@aomi-labs/react";
import { Thread } from "@/components/assistant-ui/thread";
import { NotificationToaster } from "@/components/ui/notification";
import { WalletTxHandler } from "@/components/wallet-tx-handler";
import {
  ParaDevSessionProvider,
  useParaDevSession,
} from "@/components/para-dev-session";
import { PARA_DEV_KEY_EVENT } from "@/lib/para-auth";
import { shouldPromptForDevApiKey } from "@/lib/para-mode";
import { getBackendUrl } from "@/lib/settings-api";
import {
  DevApiKeyDialog,
  ModeToolsDialog,
  ParaNamespaceSync,
  WorkspaceHeader,
  WorkspaceShell,
} from "@/components/para-workspace";

function DevWorkspaceShell() {
  const { currentThreadId, threadViewKey } = useAomiRuntime();
  const { hasApiKey } = useParaDevSession();
  const [isDevKeyDialogOpen, setDevKeyDialogOpen] = useState(false);
  const [isModeToolsOpen, setModeToolsOpen] = useState(false);

  useEffect(() => {
    if (shouldPromptForDevApiKey("dev", hasApiKey)) {
      setDevKeyDialogOpen(true);
      return;
    }

    if (hasApiKey) {
      setDevKeyDialogOpen(false);
    }
  }, [hasApiKey]);

  useEffect(() => {
    const handleRequest = () => {
      setDevKeyDialogOpen(true);
    };

    window.addEventListener(PARA_DEV_KEY_EVENT, handleRequest);
    return () => {
      window.removeEventListener(PARA_DEV_KEY_EVENT, handleRequest);
    };
  }, []);

  return (
    <WorkspaceShell>
      <DevApiKeyDialog open={isDevKeyDialogOpen} onOpenChange={setDevKeyDialogOpen} />
      <ModeToolsDialog
        mode="dev"
        open={isModeToolsOpen}
        onOpenChange={setModeToolsOpen}
        onManageKey={() => setDevKeyDialogOpen(true)}
      />
      <ParaNamespaceSync mode="dev" />
      <div className="relative flex h-full flex-col">
        <WorkspaceHeader
          mode="dev"
          onManageKey={() => setDevKeyDialogOpen(true)}
          onOpenTools={() => setModeToolsOpen(true)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Thread key={`${currentThreadId}-${threadViewKey}`} />
        </div>
        <NotificationToaster />
        <WalletTxHandler />
      </div>
    </WorkspaceShell>
  );
}

function DevWorkspaceInner() {
  return (
    <ParaDevSessionProvider mode="dev">
      <DevWorkspaceShell />
    </ParaDevSessionProvider>
  );
}

export default function DevPage() {
  return (
    <AomiRuntimeProvider backendUrl={getBackendUrl()}>
      <DevWorkspaceInner />
    </AomiRuntimeProvider>
  );
}
