/**
 * Cấu hình AI cho Writing theo chuẩn OpenAI-compatible.
 * Chỉ đọc biến môi trường phía server; không chứa secret trong source.
 *
 * Ưu tiên WRITING_AI_*. Nếu chưa có, tự nhận diện cấu hình Gemini/Groq cũ
 * để không phải đổi env ngay khi nâng cấp.
 */

export type WritingAiSource = "generic" | "gemini" | "groq";
export type WritingAiJsonMode = "json_schema" | "json_object";

export interface WritingAiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  fallbackModel: string | null;
  label: string;
  source: WritingAiSource;
  jsonMode: WritingAiJsonMode;
  maxTokens: number;
  reasoningEffort: string | null;
}

const GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GROQ_OPENAI_BASE_URL = "https://api.groq.com/openai/v1";

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

/** Chấp nhận cả base URL gốc lẫn URL đầy đủ .../chat/completions. */
export function normalizeOpenAiBaseUrl(value: string) {
  return value
    .trim()
    .replace(/\/+$/u, "")
    .replace(/\/chat\/completions$/u, "");
}

function hostLabel(baseUrl: string) {
  try {
    const host = new URL(baseUrl).hostname;
    if (host.includes("groq")) return "Groq";
    if (host.includes("generativelanguage") || host.includes("googleapis")) return "Gemini";
    if (host.includes("openrouter")) return "OpenRouter";
    if (host === "localhost" || host === "127.0.0.1") return "AI local";
    return host;
  } catch {
    return "AI";
  }
}

function parseJsonMode(value: string): WritingAiJsonMode {
  return value === "json_object" ? "json_object" : "json_schema";
}

function parseMaxTokens(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 3000;
  return Math.min(Math.max(parsed, 256), 8192);
}

function readReasoningEffort() {
  const value = readEnv("WRITING_AI_REASONING_EFFORT").toLowerCase();
  return ["minimal", "low", "medium", "high"].includes(value) ? value : null;
}

export function getWritingAiConfig(): WritingAiConfig | null {
  const genericBaseUrl = readEnv("WRITING_AI_BASE_URL");
  const genericApiKey = readEnv("WRITING_AI_API_KEY");
  const genericModel = readEnv("WRITING_AI_MODEL");

  if (genericBaseUrl && genericApiKey && genericModel) {
    const baseUrl = normalizeOpenAiBaseUrl(genericBaseUrl);
    return {
      baseUrl,
      apiKey: genericApiKey,
      model: genericModel,
      fallbackModel: readEnv("WRITING_AI_FALLBACK_MODEL") || null,
      label: readEnv("WRITING_AI_LABEL") || hostLabel(baseUrl),
      source: "generic",
      jsonMode: parseJsonMode(readEnv("WRITING_AI_JSON_MODE")),
      maxTokens: parseMaxTokens(readEnv("WRITING_AI_MAX_TOKENS")),
      reasoningEffort: readReasoningEffort(),
    };
  }

  // Tương thích cấu hình Gemini cũ: dùng endpoint OpenAI-compatible của Gemini.
  const geminiKey = readEnv("GEMINI_API_KEY");
  if (geminiKey) {
    return {
      baseUrl: GEMINI_OPENAI_BASE_URL,
      apiKey: geminiKey,
      model: readEnv("GEMINI_MODEL") || "gemini-3.8-flash",
      fallbackModel: readEnv("GEMINI_FALLBACK_MODEL") || "gemini-3.5-flash-lite",
      label: "Gemini",
      source: "gemini",
      jsonMode: "json_schema",
      maxTokens: 3000,
      reasoningEffort: readReasoningEffort(),
    };
  }

  // Tương thích biến GROQ_* nếu người dùng đã đặt sẵn.
  const groqKey = readEnv("GROQ_API_KEY");
  if (groqKey) {
    return {
      baseUrl: GROQ_OPENAI_BASE_URL,
      apiKey: groqKey,
      model: readEnv("GROQ_MODEL") || "openai/gpt-oss-120b",
      fallbackModel: readEnv("GROQ_FALLBACK_MODEL") || "qwen/qwen3.8-27b",
      label: "Groq",
      source: "groq",
      jsonMode: "json_schema",
      maxTokens: 3000,
      reasoningEffort: readReasoningEffort() ?? "low",
    };
  }

  return null;
}

export function isWritingAiConfigured() {
  return getWritingAiConfig() !== null;
}
