"use client";

import * as React from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionGridProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Allow free-form additions beyond the curated list. */
  allowCustom?: boolean;
  customPlaceholder?: string;
}

/**
 * Multi-select chip grid used across the assessment steps.
 * Selection state is held by the parent — this component stores nothing.
 */
export function OptionGrid({
  options,
  selected,
  onChange,
  allowCustom = true,
  customPlaceholder = "Add your own…",
}: OptionGridProps) {
  const [custom, setCustom] = React.useState("");

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const addCustom = () => {
    const value = custom.trim();
    if (value && !selected.includes(value)) {
      onChange([...selected, value]);
    }
    setCustom("");
  };

  // Custom values the user added that are not part of the curated list.
  const extras = selected.filter((s) => !options.includes(s));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent",
              )}
            >
              {active && <Check className="h-3.5 w-3.5" />}
              {opt}
            </button>
          );
        })}
        {extras.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            {opt}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {allowCustom && (
        <div className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={customPlaceholder}
            className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-input px-3 text-sm hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}
    </div>
  );
}
