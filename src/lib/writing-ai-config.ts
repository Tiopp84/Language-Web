/**
 * Cấu hình dùng chung cho phần chấm Writing bằng AI.
 * Không chứa secret; chỉ đọc biến môi trường phía server.
 */

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
