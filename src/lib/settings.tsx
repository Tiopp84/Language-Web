"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "language-web:settings:v1";

interface SettingsContextValue {
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  hydrated: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [speechRate, setSpeechRateState] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { speechRate?: number };
        if (typeof parsed.speechRate === "number" && parsed.speechRate >= 0.5 && parsed.speechRate <= 1.5) {
          setSpeechRateState(parsed.speechRate);
        }
      }
    } catch {
      // Tùy chọn nhỏ: lỗi đọc không chặn việc học.
    }
    setHydrated(true);
  }, []);

  const setSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ speechRate: rate }));
    } catch {
      // Không hiển thị lỗi cho tùy chọn hiển thị nhỏ.
    }
  };

  const value = useMemo(
    () => ({ speechRate, setSpeechRate, hydrated }),
    [speechRate, hydrated],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}
