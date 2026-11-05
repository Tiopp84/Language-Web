"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Info,
  Lightbulb,
  Loader2,
  PenLine,
  RotateCcw,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { writingPrompts } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { runLocalWritingReview, type WritingReview } from "@/lib/writing-review";
import { cn, formatRelativeTime, wordCount } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  ProgressRing,
  SpeechButton,
  buttonClass,
  useToast,
} from "@/components/ui";

const errorTypeLabels = {
  grammar: "Ngữ pháp",
  vocabulary: "Từ vựng",
  spelling: "Chính tả",
  task: "Đề bài",
};

interface WritingViewProps {
  aiConfigured: boolean;
  aiModel: string;
}

export function WritingView({ aiConfigured, aiModel }: WritingViewProps) {
  const [type, setType] = useState<"sentence" | "paragraph">("sentence");
  const [text, setText] = useState("");
  const [review, setReview] = useState<WritingReview | null>(null);
  const [reviewedText, setReviewedText] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const submittingRef = useRef(false);
  const { data, hydrated, saveWritingDraft, saveWritingReview } = useProgress();
  const { notify } = useToast();

  const prompt = writingPrompts.find((item) => item.type === type) ?? writingPrompts[0];
  const words = wordCount(text);
  const savedReview = data.writingRecords[prompt.id];
  const changedSinceReview = Boolean(review && text !== reviewedText);
  const reviewIsDemo = review ? (review.isDemo ?? review.model === "local-demo-v1") : false;

  useEffect(() => {
    if (!hydrated) return;
    setText(data.writingDrafts[prompt.id] ?? "");
    const record = data.writingRecords[prompt.id];
    setReview(record?.review ?? null);
    setReviewedText(record?.original ?? "");
    setShowOriginal(false);
    // Chỉ nạp lại khi đổi đề hoặc khi dữ liệu cục bộ vừa được hydrate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt.id, hydrated]);

  const changeType = (next: "sentence" | "paragraph") => {
    setType(next);
    setReviewing(false);
    setReviewError(null);
  };

  const changeText = (value: string) => {
    setText(value);
    setReviewError(null);
    saveWritingDraft(prompt.id, value);
  };

  const submit = async () => {
    if (!text.trim() || reviewing || submittingRef.current) return;

    submittingRef.current = true;
    const currentPrompt = prompt;
    const currentText = text.trim();
    setReviewing(true);
    setReviewError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35_000);

    try {
      const response = await fetch("/api/writing/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: currentPrompt.id, text: currentText }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            review?: WritingReview;
            fallback?: boolean;
            notice?: string;
            error?: string;
            retryAfter?: number;
          }
        | null;

      if (!response.ok) {
        const message =
          payload?.error ??
          (response.status === 429
            ? "Bạn đã chấm quá nhiều bài. Vui lòng thử lại sau."
            : "Không chấm được bài viết. Bản nháp của bạn vẫn được giữ.");
        setReviewError(message);
        notify(message);
        return;
      }

      const result = payload?.review;
      if (!result || typeof result.score !== "number" || !Array.isArray(result.criteria)) {
        throw new Error("Phản hồi chấm bài không hợp lệ.");
      }

      setReview(result);
      setReviewedText(currentText);
      saveWritingReview(currentPrompt.id, currentText, result, currentPrompt.title);

      if (payload?.fallback) {
        notify(payload.notice ?? `Đã chấm bằng bộ quy tắc cục bộ: ${result.score}/10.`);
      } else {
        notify(`Đã chấm bằng ${result.model}: ${result.score}/10.`);
      }
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (error) {
      // Mất mạng hoặc route handler lỗi: vẫn giữ bản nháp và chấm cục bộ để không chặn việc học.
      const local = runLocalWritingReview(currentPrompt, currentText);
      setReview(local);
      setReviewedText(currentText);
      saveWritingReview(currentPrompt.id, currentText, local, currentPrompt.title);
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Gemini phản hồi quá lâu. Đã chấm bằng bộ quy tắc cục bộ; bài viết vẫn được giữ."
          : "Không kết nối được máy chủ AI. Đã chấm bằng bộ quy tắc cục bộ; bài viết vẫn được giữ.";
      setReviewError(message);
      notify(message);
    } finally {
      clearTimeout(timeout);
      submittingRef.current = false;
      setReviewing(false);
    }
  };

  const useSuggestion = () => {
    if (!review) return;
    changeText(review.suggestedText);
    notify("Đã đưa bản gợi ý vào ô soạn bài. Bạn có thể chỉnh tiếp và chấm lại.");
  };

  const insertChar = (char: string) => {
    const element = editorRef.current;
    const start = element?.selectionStart ?? text.length;
    const end = element?.selectionEnd ?? text.length;
    changeText(`${text.slice(0, start)}${char}${text.slice(end)}`);
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + char.length, start + char.length);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            Practice 4 Skills · Writing
          </p>
          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
            Luyện viết · Schreiben
          </h1>
          <p className="mt-1 text-sm text-muted">
            Viết câu hoặc đoạn văn A1, nhận phản hồi có cấu trúc và lưu lại bản gốc.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="soft">A1 · Lektion 1</Badge>
          <Badge tone={aiConfigured ? "success" : "warning"}>
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {aiConfigured ? `Gemini · ${aiModel}` : "Chấm demo cục bộ"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/lektion/1"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Về tổng quan Lektion 1
        </Link>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1">
          {[
            { id: "sentence" as const, label: "Đặt câu" },
            { id: "paragraph" as const, label: "Viết đoạn" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeType(item.id)}
              aria-pressed={type === item.id}
              className={cn(
                "h-7 rounded-md px-3 text-[11px] font-semibold transition-colors",
                type === item.id ? "bg-primary text-white" : "text-muted hover:text-navy",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          {/* Prompt */}
          <Card className="overflow-hidden">
            <div className="border-b border-line bg-gradient-to-br from-[#eef4ff] to-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="soft">{prompt.type === "sentence" ? "Đặt câu" : "Viết đoạn"}</Badge>
                <Badge tone="neutral">{prompt.wordGuidance}</Badge>
                {savedReview ? (
                  <Badge tone="success">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Đã có phản hồi lưu
                  </Badge>
                ) : null}
              </div>
              <h2 className="mt-2 text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-navy">
                {prompt.title}
              </h2>
              <p className="mt-1 max-w-2xl text-[12px] leading-6 text-muted">{prompt.instruction}</p>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {prompt.requirements.map((requirement) => (
                  <li key={requirement} className="flex gap-2 text-[11px] leading-5 text-[#3f4d63]">
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {requirement}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {prompt.targetVocabulary.map((word) => (
                  <span key={word} className="rounded-full border border-[#d6e3ff] bg-white px-2 py-0.5 text-[9px] font-semibold text-[#2457b8]">
                    {word}
                  </span>
                ))}
                {prompt.targetGrammar.map((item) => (
                  <span key={item} className="rounded-full border border-[#cfe4de] bg-primary-soft px-2 py-0.5 text-[9px] font-semibold text-primary">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="writing-editor" className="text-[12px] font-bold text-navy">
                  Bài viết của bạn
                </label>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span className={cn(words < 8 && "text-warning")}>{words} từ</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Tự lưu nháp
                  </span>
                </div>
              </div>

              <textarea
                ref={editorRef}
                id="writing-editor"
                value={text}
                onChange={(event) => changeText(event.target.value)}
                rows={7}
                lang="de"
                spellCheck={false}
                placeholder="Ich heiße … Ich komme aus … Ich spreche …"
                className="mt-2 w-full resize-y rounded-xl border border-line bg-white p-4 text-[15px] leading-7 text-navy placeholder:text-[13px] placeholder:text-[#98a5b8] focus:border-primary/50 focus:outline-none"
              />

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold text-muted">Ký tự Đức:</span>
                {["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => insertChar(char)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-[12px] font-semibold text-navy hover:border-primary/30 hover:text-primary"
                    aria-label={`Chèn ký tự ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Button onClick={submit} disabled={!text.trim() || reviewing}>
                  {reviewing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                  {reviewing ? "Đang phân tích…" : "Chấm bằng AI"}
                </Button>
                {review ? (
                  <Button variant="secondary" onClick={useSuggestion}>
                    <Wand2 className="h-4 w-4" aria-hidden="true" />
                    Dùng bản gợi ý
                  </Button>
                ) : null}
                {review && changedSinceReview ? (
                  <Badge tone="warning">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    Có thay đổi chưa chấm
                  </Badge>
                ) : null}
                <p className="ml-auto inline-flex max-w-xs items-center gap-1.5 text-[10px] text-muted">
                  <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {aiConfigured
                    ? `Khi bấm chấm, bài viết và đề được gửi tới Google Gemini (${aiModel}).`
                    : "Chưa cấu hình Gemini; bài được chấm bằng quy tắc cục bộ trên máy chủ."}
                </p>
              </div>

              {reviewError ? (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#f6c9c3] bg-danger-soft p-3">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden="true" />
                  <p className="text-[11px] leading-5 text-danger">{reviewError}</p>
                </div>
              ) : null}

              {reviewing ? (
                <div className="mt-3 rounded-xl border border-[#d6e3ff] bg-soft p-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#2457b8]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Đang kiểm tra ngữ pháp, từ vựng và mức độ đáp ứng đề…
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-2 w-full animate-pulse rounded bg-white/80" />
                    <div className="h-2 w-4/5 animate-pulse rounded bg-white/80" />
                    <div className="h-2 w-2/3 animate-pulse rounded bg-white/60" />
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Review */}
          {review ? (
            <div ref={reviewRef} className="scroll-mt-24 space-y-4">
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 gap-0 sm:grid-cols-[auto_1fr]">
                  <div className="flex items-center justify-center border-b border-line bg-gradient-to-br from-primary-soft/70 to-[#f8fbff] p-5 sm:border-b-0 sm:border-r">
                    <div className="text-center">
                      <ProgressRing value={review.score * 10} size={104} stroke={9}>
                        <span className="text-[26px] font-extrabold leading-none tracking-[-0.03em] text-navy">
                          {review.score}
                        </span>
                        <span className="mt-0.5 text-[9px] font-semibold text-muted">trên 10</span>
                      </ProgressRing>
                      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.13em] text-muted">Điểm tham khảo</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="success">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Đã chấm
                      </Badge>
                      <Badge tone="neutral">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatRelativeTime(review.createdAt)}
                      </Badge>
                      <Badge tone={reviewIsDemo ? "warning" : "soft"}>
                        {reviewIsDemo ? "Local demo" : review.model}
                      </Badge>
                    </div>
                    <h2 className="mt-2 text-[18px] font-bold text-navy">Kết quả bài viết</h2>
                    <p className="mt-1 text-[12px] leading-6 text-[#3f4d63]">{review.summary}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {review.criteria.map((criterion) => (
                        <div key={criterion.id} className="rounded-lg border border-line bg-[#fbfcff] p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-navy">{criterion.label}</span>
                            <span className="text-[10px] font-semibold text-muted">{criterion.score}/10</span>
                          </div>
                          <ProgressBar value={criterion.score * 10} className="mt-1.5" label={criterion.label} />
                          <p className="mt-1.5 text-[9px] leading-4 text-muted">{criterion.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[15px] font-bold text-navy">Lỗi cụ thể & cách sửa</h2>
                  <Badge tone={review.errors.length ? "warning" : "success"}>
                    {review.errors.length ? `${review.errors.length} ghi chú` : "Không phát hiện lỗi"}
                  </Badge>
                </div>

                {review.errors.length === 0 ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#b9e4ce] bg-success-soft p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <p className="text-[11px] leading-5 text-[#065f46]">
                      Không phát hiện lỗi theo bộ quy tắc demo. Hãy đối chiếu thêm với mẫu câu và nhờ giáo viên
                      kiểm tra khi cần độ chính xác cao.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {review.errors.map((error, index) => (
                      <li key={`${error.excerpt}-${index}`} className="rounded-xl border border-line bg-[#fbfcff] p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={error.type === "grammar" ? "danger" : error.type === "task" ? "warning" : "soft"}>
                            {errorTypeLabels[error.type]}
                          </Badge>
                          <span className="text-[11px] font-semibold text-danger line-through decoration-danger/50">
                            {error.excerpt}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted" aria-hidden="true" />
                          <span className="text-[11px] font-bold text-success">{error.correction}</span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5 text-[#3f4d63]">{error.explanation}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Bản viết gợi ý</p>
                    <SpeechButton text={review.suggestedText} id={`suggested-${prompt.id}`} label="bản gợi ý" variant="chip" />
                  </div>
                  <div className="mt-1.5 rounded-xl border border-[#b9e4ce] bg-success-soft/60 p-3 text-[13px] leading-6 text-[#08503d]">
                    {review.suggestedText}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={submit}>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Chấm lại bài hiện tại
                  </Button>
                  <Button variant="secondary" onClick={useSuggestion}>
                    <Wand2 className="h-4 w-4" aria-hidden="true" />
                    Áp dụng gợi ý
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowOriginal((value) => !value)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-muted hover:text-navy"
                    aria-expanded={showOriginal}
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    {showOriginal ? "Ẩn bài gốc đã chấm" : "Xem bài gốc đã chấm"}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showOriginal && "rotate-180")} aria-hidden="true" />
                  </button>
                </div>

                {showOriginal ? (
                  <div className="mt-3 rounded-xl border border-line bg-[#fbfcff] p-3 text-[12px] leading-6 text-[#3f4d63]">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
                      Bản gốc tại thời điểm chấm
                    </p>
                    {reviewedText}
                  </div>
                ) : null}
              </Card>

              <div className="flex items-start gap-2.5 rounded-xl border border-[#f0e3b7] bg-warning-soft p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-bold text-[#7c5100]">Lưu ý về điểm số</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#7c5100]">
                    Điểm 0–10 chỉ là gợi ý nội bộ, không đại diện kết quả kỳ thi hay đánh giá CEFR chính thức.
                    {reviewIsDemo
                      ? " Kết quả này do bộ quy tắc cục bộ tạo ra nên có thể bỏ sót lỗi."
                      : " Kết quả do AI tạo ra và đã được kiểm tra cấu trúc JSON; hãy đối chiếu với giáo viên khi cần độ chính xác cao."}{" "}
                    Bài gốc luôn được giữ lại và không bị thay thế.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-5">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#5272a8]" aria-hidden="true" />
                <div>
                  <p className="text-[12px] font-bold text-navy">Chưa có phản hồi cho bài này</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">
                    Viết bài rồi nhấn “Chấm bằng AI” để xem nhận xét tổng quan, lỗi cụ thể, bản gợi ý và điểm tham
                    khảo. Bài gốc của bạn không bị thay thế.
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { step: "1", title: "Viết bài", description: "Tối thiểu 3 câu cho đề đặt câu." },
                  { step: "2", title: "Chấm bài", description: "Nhận phản hồi có cấu trúc." },
                  { step: "3", title: "Viết lại", description: "Áp dụng gợi ý và chấm lần nữa." },
                ].map((item) => (
                  <div key={item.step} className="rounded-xl border border-line bg-[#fbfcff] p-3">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-soft text-[9px] font-bold text-[#2457b8]">
                      {item.step}
                    </span>
                    <p className="mt-1.5 text-[11px] font-bold text-navy">{item.title}</p>
                    <p className="mt-0.5 text-[9px] leading-4 text-muted">{item.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Mục tiêu bài viết</p>
            </div>
            <p className="mt-2 text-[12px] leading-5 text-[#3f4d63]">{prompt.instruction}</p>
            <div className="mt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Độ dài gợi ý</p>
              <p className="mt-0.5 text-[12px] font-semibold text-navy">{prompt.wordGuidance}</p>
            </div>
            <div className="mt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Từ vựng mục tiêu</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {prompt.targetVocabulary.map((word) => (
                  <span key={word} className="rounded-full bg-soft px-2 py-0.5 text-[9px] font-semibold text-[#2457b8]">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Ngữ pháp mục tiêu</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {prompt.targetGrammar.map((item) => (
                  <span key={item} className="rounded-full bg-primary-soft px-2 py-0.5 text-[9px] font-semibold text-primary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-line bg-[#fbfcff] p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Mẫu tham khảo</p>
              <p className="mt-1 text-[11px] leading-5 text-[#3f4d63]">{prompt.sample}</p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Checklist trước khi chấm</p>
            </div>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-[#3f4d63]">
              {[
                "Đã giới thiệu tên bằng “Ich heiße …”.",
                "Đã nói quê quán với “Ich komme aus …”.",
                "Động từ được chia đúng với ngôi ich.",
                "Danh từ được viết hoa chữ cái đầu.",
                "Có dấu câu cuối mỗi câu.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-1 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          {savedReview ? (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Lần chấm gần nhất</p>
                <Badge tone="success">{savedReview.review.score}/10</Badge>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-muted">{savedReview.review.summary}</p>
              <p className="mt-2 text-[10px] text-muted">
                {formatRelativeTime(savedReview.updatedAt)} · {savedReview.review.model}
              </p>
              <button
                type="button"
                onClick={() => {
                  setReview(savedReview.review);
                  setReviewedText(savedReview.original);
                  setShowOriginal(false);
                }}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                Xem lại phản hồi
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </Card>
          ) : null}

          <div className="rounded-xl border border-[#d6e3ff] bg-soft p-4">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2457b8]" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-bold text-navy">Quyền riêng tư</p>
                <p className="mt-1 text-[10px] leading-4 text-[#4d6488]">
                  {aiConfigured
                    ? `Khi bấm chấm, bài viết và đề liên quan được gửi tới Google Gemini (${aiModel}). Gemini free tier có thể dùng nội dung để cải thiện sản phẩm, nên đừng nhập thông tin cá nhân nhạy cảm. Kết quả được lưu cục bộ trên trình duyệt của bạn.`
                    : "Chưa cấu hình Gemini nên bài viết không được gửi đi đâu. Bài được chấm bằng bộ quy tắc cục bộ trên máy chủ."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <p className="text-[10px] text-muted">Đổi đề khác?</p>
            <button
              type="button"
              onClick={() => changeType(type === "sentence" ? "paragraph" : "sentence")}
              className={buttonClass({ size: "sm", variant: "secondary" })}
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              {type === "sentence" ? "Sang viết đoạn" : "Sang đặt câu"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
