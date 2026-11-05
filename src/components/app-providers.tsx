"use client";

import type { ReactNode } from "react";
import { ProgressProvider } from "@/lib/progress";
import { SettingsProvider } from "@/lib/settings";
import { ToastProvider } from "@/components/ui";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <ToastProvider>{children}</ToastProvider>
      </ProgressProvider>
    </SettingsProvider>
  );
}
