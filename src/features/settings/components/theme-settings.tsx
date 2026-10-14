"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const subscribe = () => () => {};

/** Theme picker; renders neutral until mounted to avoid a hydration mismatch. */
export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map(({ value, label, icon: Icon }) => {
        const selected = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-md border p-4 text-sm transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              selected && "border-primary bg-accent font-medium",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
