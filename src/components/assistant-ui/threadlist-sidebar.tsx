"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { WalletConnect } from "@/components/control-bar/wallet-connect";
import { ParaMark } from "@/components/para-mark";

type ThreadListSidebarProps = React.ComponentProps<typeof Sidebar> & {
  /** Position of the wallet button: "header" (top), "footer" (bottom), or null (hidden) */
  walletPosition?: "header" | "footer" | null;
};

export function ThreadListSidebar({
  walletPosition = "footer",
  ...props
}: ThreadListSidebarProps) {
  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="relative"
      {...props}
    >
      <SidebarHeader className="aomi-sidebar-header border-b border-border/60 px-5 py-5">
        <div className="aomi-sidebar-header-content flex items-center justify-between gap-3">
          <Link
            href="/consumer"
            className="flex items-center justify-center"
          >
            <ParaMark compact />
          </Link>
          {walletPosition === "header" && <WalletConnect />}
        </div>
      </SidebarHeader>
      <SidebarContent className="aomi-sidebar-content px-3 py-4">
        <ThreadList />
      </SidebarContent>
      <SidebarRail />
      {walletPosition === "footer" && (
        <SidebarFooter className="aomi-sidebar-footer mx-4 mb-4 border-0 pt-2">
          <WalletConnect className="w-full" />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
