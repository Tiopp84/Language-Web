"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Check, Gauge, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";
import { useGermanSpeech } from "@/lib/use-speech";

/* ------------------------------- Card & layout ------------------------------ */

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag className={cn("rounded-2xl border border-line bg-surface card-shadow", className)}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-navy sm:text-[26px]">
          {title}
        </h2>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "soft" | "navy" | "warning" | "danger" | "success";
  className?: string;
}) {
  const tones = {
    neutral: "border-line bg-[#f5f7fc] text-muted",
    primary: "border-primary/15 bg-primary-soft text-primary",
    soft: "border-[#d6e3ff] bg-soft text-[#2457b8]",
    navy: "border-navy/10 bg-[#edf1f8] text-navy",
    warning: "border-[#f1dc9c] bg-warning-soft text-warning",
    danger: "border-[#f6c9c3] bg-danger-soft text-danger",
    success: "border-[#b9e4ce] bg-success-soft text-success",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "primary",
  className,
  label,
}: {
  value: number;
  tone?: "primary" | "navy" | "soft";
  className?: string;
  label?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const colors = {
    primary: "bg-primary",
    navy: "bg-navy",
    soft: "bg-[#7c9be8]",
  };
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf5]", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      aria-label={label ?? "Tiến độ"}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", colors[tone])}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 84,
  stroke = 7,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const safe = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e6edf8" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#006458"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {children ?? <span className="text-sm font-bold text-navy">{safe}%</span>}
      </span>
    </div>
  );
}

/* --------------------------------- Buttons -------------------------------- */

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: "primary" | "secondary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
} = {}) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-strong",
    secondary: "border border-line bg-white text-navy hover:border-[#c9d5e8] hover:bg-[#f8faff]",
    soft: "bg-soft text-[#2457b8] hover:bg-soft-strong",
    ghost: "text-muted hover:bg-[#f3f6fc] hover:text-navy",
    danger: "border border-[#f3c1ba] bg-white text-danger hover:bg-danger-soft",
  };
  const sizes = {
    sm: "h-8 px-3 text-[12px]",
    md: "h-10 px-4",
    lg: "h-12 px-5 text-[15px]",
  };
  return cn(buttonBase, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function FilterPill({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-white"
          : "border-line bg-white text-muted hover:border-[#c9d5e8] hover:text-navy",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------- Speech UI ------------------------------- */

export function SpeechButton({
  text,
  id,
  label,
  variant = "icon",
  rate,
  className,
  children,
}: {
  text: string;
  id: string;
  label: string;
  variant?: "icon" | "inline" | "chip";
  rate?: number;
  className?: string;
  children?: ReactNode;
}) {
  const { speak, stop, speakingId, supported } = useGermanSpeech();
  const active = speakingId === id;

  const handleClick = () => {
    if (active) stop();
    else speak(text, id, rate ? { rate } : undefined);
  };

  if (!supported) {
    return (
      <span
        className={cn("inline-flex items-center gap-1.5 text-[11px] text-muted", className)}
        title="Trình duyệt này không hỗ trợ phát âm bằng Web Speech API"
      >
        <Volume2 className="h-4 w-4 opacity-40" aria-hidden="true" />
        {variant !== "icon" ? "Audio không khả dụng" : null}
      </span>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? `Dừng phát âm ${label}` : `Phát âm ${label}`}
        title={active ? "Dừng phát âm" : `Nghe: ${text}`}
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-primary/30 hover:text-primary",
          active && "border-primary/40 bg-primary-soft text-primary speaking-pulse",
          className,
        )}
      >
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-primary/30 hover:text-primary",
          active && "border-primary/40 bg-primary-soft text-primary",
          className,
        )}
      >
        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        {active ? "Đang phát" : "Nghe"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-strong",
        active && "text-primary-strong",
        className,
      )}
    >
      <Volume2 className="h-4 w-4" aria-hidden="true" />
      {children ?? (active ? "Dừng phát âm" : "Nghe phát âm")}
    </button>
  );
}

export function RateControl({ compact = false }: { compact?: boolean }) {
  const { speechRate, setSpeechRate } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[12px] font-semibold text-navy transition-colors hover:border-[#c9d5e8]",
          compact ? "h-8" : "h-9",
        )}
      >
        <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
        {speechRate.toFixed(1)}x
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-line bg-white p-4 shadow-xl animate-fade-up">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Tốc độ phát âm</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Áp dụng cho nút phát âm và bài nghe bằng Web Speech API.
          </p>
          <div className="mt-3 flex gap-1.5">
            {[0.7, 1, 1.2, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setSpeechRate(rate)}
                className={cn(
                  "h-8 flex-1 rounded-lg border text-[12px] font-semibold transition-colors",
                  speechRate === rate
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-white text-muted hover:text-navy",
                )}
              >
                {rate.toFixed(1)}x
              </button>
            ))}
          </div>
          <label className="mt-3 block text-[11px] font-semibold text-muted" htmlFor="speech-rate-range">
            Tùy chỉnh: {speechRate.toFixed(1)}x
          </label>
          <input
            id="speech-rate-range"
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={speechRate}
            onChange={(event) => setSpeechRate(Number(event.target.value))}
            className="mt-1 w-full accent-[#006458]"
          />
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        onClick={onClose}
        className="absolute inset-0 bg-navy/35 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 w-full rounded-2xl border border-line bg-white p-6 shadow-2xl animate-fade-up",
          widths[width],
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-navy">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-[#f3f6fc] hover:text-navy"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---------------------------------- Misc ---------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d5ddeb] bg-[#fbfcff] px-6 py-10 text-center">
      {icon ? <div className="mb-3 text-[#8fa2bf]">{icon}</div> : null}
      <p className="text-sm font-semibold text-navy">{title}</p>
      {description ? <p className="mt-1 max-w-md text-xs leading-5 text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm leading-6 text-[#3f4d63]">
      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Check className="h-3 w-3" aria-hidden="true" />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-navy">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function AnswerFeedback({
  correct,
  title,
  explanation,
  translation,
  children,
}: {
  correct: boolean;
  title: string;
  explanation: string;
  translation?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        correct ? "border-[#b9e4ce] bg-success-soft" : "border-[#f6c9c3] bg-danger-soft",
      )}
      role="status"
    >
      <p className={cn("flex items-center gap-2 text-sm font-bold", correct ? "text-success" : "text-danger")}>
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full text-white",
            correct ? "bg-success" : "bg-danger",
          )}
        >
          {correct ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#3f4d63]">{explanation}</p>
      {translation ? <p className="mt-1 text-xs italic leading-5 text-muted">{translation}</p> : null}
      {children}
    </div>
  );
}

export function SimpleTooltip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[10px] font-semibold text-white group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  );
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

export function StopSpeechButton() {
  const { stop, speakingId } = useGermanSpeech();
  if (!speakingId) return null;
  return (
    <button
      type="button"
      onClick={stop}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary"
    >
      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
      Dừng phát âm
    </button>
  );
}

/* ------------------------------ Small context ------------------------------ */

interface ToastContextValue {
  notify: (message: string) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [message]);

  const value = useMemo(() => ({ notify: (next: string) => setMessage(next) }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-xl animate-fade-up"
        >
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
