import { NextResponse } from "next/server";
import { writingPrompts } from "@/data/content";
import { getGeminiFallbackModel, getGeminiModel, isGeminiConfigured } from "@/lib/writing-ai-config";
import { runLocalWritingReview, type WritingReview } from "@/lib/writing-review";
import { GeminiReviewError, reviewWritingWithGemini } from "@/lib/writing-review-gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_TEXT_LENGTH = 2500;
const MIN_TEXT_LENGTH = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 12;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "local";
}

function takeRateLimit(key: string) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (existing.count >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export async function GET() {
  const configured = isGeminiConfigured();
  const model = getGeminiModel();
  const fallbackModel = getGeminiFallbackModel();

  return NextResponse.json(
    {
      provider: configured ? "gemini" : "local",
      configured,
      model: configured ? model : "local-demo-v1",
      fallbackModel: configured ? fallbackModel : null,
      // Chỉ trả tên/trạng thái của các biến liên quan Writing, không trả giá trị secret.
      env: {
        GEMINI_API_KEY: configured ? "set" : "missing",
        GEMINI_MODEL: model,
        GEMINI_FALLBACK_MODEL: fallbackModel,
        VERCEL_ENV: process.env.VERCEL_ENV ?? null,
        VERCEL_REGION: process.env.VERCEL_REGION ?? null,
        VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
        VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const rate = takeRateLimit(clientKey(request));
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Bạn đã chấm quá nhiều bài trong thời gian ngắn. Vui lòng thử lại sau.",
        code: "rate_limited",
        retryAfter: rate.retryAfter,
      },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu gửi lên không hợp lệ.", code: "invalid_json" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Dữ liệu gửi lên không hợp lệ.", code: "invalid_body" },
      { status: 400 },
    );
  }

  const { promptId, text } = body as { promptId?: unknown; text?: unknown };
  if (typeof promptId !== "string" || typeof text !== "string") {
    return NextResponse.json(
      { error: "Thiếu đề bài hoặc nội dung bài viết.", code: "invalid_body" },
      { status: 400 },
    );
  }

  const prompt = writingPrompts.find((item) => item.id === promptId);
  if (!prompt) {
    return NextResponse.json(
      { error: "Không tìm thấy đề bài.", code: "unknown_prompt" },
      { status: 404 },
    );
  }

  const original = text.trim();
  if (original.length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Bài viết quá ngắn để chấm. Hãy viết thêm vài câu.", code: "text_too_short" },
      { status: 400 },
    );
  }
  if (original.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: `Bài viết dài quá ${MAX_TEXT_LENGTH} ký tự. Hãy rút gọn trước khi chấm.`,
        code: "text_too_long",
      },
      { status: 400 },
    );
  }

  if (!isGeminiConfigured()) {
    const review: WritingReview = runLocalWritingReview(prompt, original);
    return NextResponse.json({
      review,
      provider: "local",
      fallback: true,
      reason: "not_configured",
      notice:
        "Chưa cấu hình GEMINI_API_KEY nên bài được chấm bằng bộ quy tắc cục bộ. Bài viết của bạn vẫn được giữ.",
    });
  }

  try {
    const review = await reviewWritingWithGemini(prompt, original);
    return NextResponse.json({ review, provider: "gemini", fallback: false });
  } catch (error) {
    const geminiError = error instanceof GeminiReviewError ? error : null;
    const code = geminiError?.code ?? "api_error";
    const message = error instanceof Error ? error.message : String(error);

    console.error(
      "[writing-review] gemini_failed",
      JSON.stringify({
        code,
        message,
        models: geminiError?.attempts.map((attempt) => attempt.model) ?? [],
        attempts: geminiError?.attempts ?? [],
      }),
    );

    const review: WritingReview = runLocalWritingReview(prompt, original);
    const notice =
      code === "timeout"
        ? "Gemini phản hồi quá lâu nên bài đã được chấm bằng bộ quy tắc cục bộ. Bản nháp của bạn vẫn được giữ."
        : code === "unavailable"
          ? "Gemini đang quá tải nên bài đã được chấm bằng bộ quy tắc cục bộ. Bản nháp của bạn vẫn được giữ; hãy thử lại sau."
          : code === "rate_limited"
            ? "Gemini đã hết quota miễn phí (khoảng 20 lượt/ngày với Gemini 3.8 Flash). Bài đã được chấm bằng bộ quy tắc cục bộ; hãy thử lại sau khi quota reset."
            : "Gemini tạm thời không phản hồi. Bài đã được chấm bằng bộ quy tắc cục bộ và bản nháp của bạn vẫn được giữ.";

    return NextResponse.json({
      review,
      provider: "local",
      fallback: true,
      reason: code,
      notice,
    });
  }
}
