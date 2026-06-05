"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal controlled tabs (no external dependency). State is held by the
 * parent so the active document can be derived alongside the generated pack.
 */
export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-wrap gap-1 rounded-lg border border-border bg-secondary/40 p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabTrigger({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-background font-medium text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
