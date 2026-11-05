"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/lib/settings";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useGermanSpeech() {
  const { speechRate } = useSettings();
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, []);

  const speak = useCallback(
    (text: string, id: string, options?: SpeakOptions) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setSupported(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = options?.rate ?? speechRate;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      const voices = window.speechSynthesis.getVoices();
      const germanVoice =
        voices.find((voice) => voice.lang === "de-DE") ??
        voices.find((voice) => voice.lang.startsWith("de"));
      if (germanVoice) utterance.voice = germanVoice;

      utterance.onend = () => {
        setSpeakingId((current) => (current === id ? null : current));
        setPaused(false);
      };
      utterance.onerror = () => {
        setSpeakingId((current) => (current === id ? null : current));
        setPaused(false);
      };
      utteranceRef.current = utterance;
      setSpeakingId(id);
      setPaused(false);
      window.speechSynthesis.speak(utterance);
    },
    [speechRate],
  );

  return { speak, stop, pause, resume, speakingId, paused, supported, rate: speechRate };
}

export function useDelayedFlag(duration = 650) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const start = useCallback(() => {
    setActive(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(false), duration);
  }, [duration]);

  return { active, start };
}
