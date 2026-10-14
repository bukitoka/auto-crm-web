"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // richColors: tint success / info / warning / error toasts with our status tokens.
          "--success-bg": "color-mix(in oklch, var(--success) 10%, var(--popover))",
          "--success-border": "color-mix(in oklch, var(--success) 30%, var(--popover))",
          "--success-text": "var(--success)",
          "--info-bg": "color-mix(in oklch, var(--info) 10%, var(--popover))",
          "--info-border": "color-mix(in oklch, var(--info) 30%, var(--popover))",
          "--info-text": "var(--info)",
          "--warning-bg": "color-mix(in oklch, var(--warning) 10%, var(--popover))",
          "--warning-border": "color-mix(in oklch, var(--warning) 30%, var(--popover))",
          "--warning-text": "var(--warning)",
          "--error-bg": "color-mix(in oklch, var(--destructive) 10%, var(--popover))",
          "--error-border": "color-mix(in oklch, var(--destructive) 30%, var(--popover))",
          "--error-text": "var(--destructive)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
