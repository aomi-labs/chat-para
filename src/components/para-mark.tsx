"use client";

import Image from "next/image";
import { cn } from "@aomi-labs/react";

export function ParaMark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="para-surface flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-white/90 p-2 dark:bg-white/8">
        <Image
          src="/para-brand/logo-mark-orange.svg"
          alt="Para mark"
          width={28}
          height={28}
          className="h-7 w-7"
          priority
        />
      </div>
      <div className="min-w-0">
        <Image
          src="/para-brand/logo-primary.svg"
          alt="Para"
          width={98}
          height={25}
          className="h-6 w-auto dark:hidden"
          priority
        />
        <Image
          src="/para-brand/logo-primary-dark.svg"
          alt="Para"
          width={98}
          height={25}
          className="hidden h-6 w-auto dark:block"
          priority
        />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="para-kicker text-[11px] text-muted-foreground">
            Modern wallet infra
          </div>
        </div>
      )}
    </div>
  );
}
