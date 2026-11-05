"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Headphones,
  Info,
  Lightbulb,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { readingPassage, vocabulary } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  ProgressRing,
  SpeechButton,
  buttonClass,
  useToast,
} from "@/components/ui";

const optionLetters = ["A", "B", "C", "D"];

function HighlightedPassage({ text }: { text: string }) {
  const terms = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of vocabulary) {
      const word = item.lemma.replace(/^(der|die|das)\s+/u, "");
      if (word.length >= 4) map.set(word.toLocaleLowerCase("de-DE"), `${item.lemma} — ${item.meaningVi}`);
    }
    return map;
  }, []);

  const pattern = useMemo(() => {
    const escaped = [...terms.keys()].sort((a, b) => b.length - a.length).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return escaped.length ? new RegExp(`\\b(${escaped.join("|")})\\b`, "giu") : null;
  }, [terms]);

  if (!pattern) return <>{text}</>;

  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) => {
        const label = terms.get(part.toLocaleLowerCase("de-DE"));
        if (label) {
          return (
            <abbr
              key={`${part}-${index}`}
              title={label}
              className="cursor-help border-b border-dotted border-primary/50 text-[#173d36] no-underline"
            >
              {part}
            </abbr>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

export function ReadingView() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { data, saveSkillAttempt } = useProgress();
  const { notify } = useToast();

  const allAnswered = readingPassage.questions.every((question) => answers[question.id]);
  const correctCount = readingPassage.questions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;
  const percent = Math.round((correctCount / readingPassage.questions.length) * 100);
  const lastAttempt = data.readingAttempts[readingPassage.id];
  const passageText = readingPassage.paragraphs.map((paragraph) => paragraph.de).join(" ");

  const submit = () => {
    if (!allAnswered) return;
    const correct = readingPassage.questions.filter(
      (question) => answers[question.id] === question.answer,
    ).length;
    setSubmitted(true);
    saveSkillAttempt(
      "reading",
      readingPassage.id,
      correct,
      readingPassage.questions.length,
      `Đọc hiểu: ${readingPassage.title}`,
    );
    notify(`Đã lưu kết quả Reading: ${correct}/${readingPassage.questions.length} câu đúng.`);
  };

  const retry = () => {
    setSubmitted(false);
    setAnswers({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Practice 4 Skills · Reading
          </p>
          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
            Luyện đọc · Lesen
          </h1>
          <p className="mt-1 text-sm text-muted">
            Đọc đoạn văn A1, trả lời câu hỏi và xem giải thích ngay sau khi nộp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="soft">A1 · Lektion 1</Badge>
          <Badge tone="neutral">{readingPassage.questions.length} câu hỏi</Badge>
          {lastAttempt ? (
            <Badge tone="success">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Gần nhất {Math.round((lastAttempt.correct / lastAttempt.total) * 100)}%
            </Badge>
          ) : null}
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
        <p className="inline-flex items-center gap-1.5 text-[10px] text-muted">
          <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
          Có thể nghe toàn bộ đoạn đọc bằng Web Speech API
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Passage */}
        <Card className="h-fit overflow-hidden xl:sticky xl:top-[92px]">
          <div className="border-b border-line bg-gradient-to-br from-[#f3f7ff] to-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone="soft">Bài đọc · {readingPassage.lessonId.replace("-", " ")}</Badge>
              <SpeechButton text={passageText} id="reading-full" label="đoạn đọc" variant="chip" />
            </div>
            <h2 className="mt-2 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-navy">
              {readingPassage.title}
            </h2>
            <p className="mt-1 text-[11px] text-muted">{readingPassage.subtitle}</p>
          </div>

          <div className="p-5">
            <div className="space-y-3 text-[14px] leading-7 text-[#2f3d52]" lang="de">
              {readingPassage.paragraphs.map((paragraph) => (
                <p key={paragraph.de}>
                  <HighlightedPassage text={paragraph.de} />
                </p>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-line bg-[#fbfcff] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Từ vựng trong bài</p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {["Name", "Polen", "Schweiz", "Lehrerin", "Deutsch", "Österreich"].map((word) => {
                  const item = vocabulary.find((entry) => entry.lemma.endsWith(word));
                  return (
                    <li key={word} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-navy">{item?.lemma ?? word}</p>
                        <p className="truncate text-[9px] text-muted">{item?.meaningVi ?? "Địa danh / từ trong bài"}</p>
                      </div>
                      <SpeechButton text={word} id={`read-voc-${word}`} label={word} />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#f0e3b7] bg-warning-soft p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c5100]">Mẹo đọc hiểu</p>
                <p className="mt-1 text-[11px] leading-5 text-[#7c5100]">{readingPassage.tip}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Câu hỏi đọc hiểu</p>
              <p className="mt-0.5 text-[12px] text-navy">
                {submitted
                  ? `Kết quả: ${correctCount}/${readingPassage.questions.length} câu đúng`
                  : `Đã trả lời ${Object.keys(answers).length}/${readingPassage.questions.length} câu`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {submitted ? (
                <Button variant="secondary" size="sm" onClick={retry}>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Làm lại
                </Button>
              ) : (
                <Button size="sm" onClick={submit} disabled={!allAnswered}>
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Nộp bài
                </Button>
              )}
            </div>
          </Card>

          {submitted ? (
            <Card className="flex items-center gap-4 border-[#b9e4ce] bg-success-soft/50 p-4">
              <ProgressRing value={percent} size={74} stroke={7}>
                <span className="text-[15px] font-extrabold text-navy">{percent}%</span>
              </ProgressRing>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-navy">
                  {percent === 100 ? "Đọc hiểu chính xác!" : percent >= 60 ? "Khá tốt, xem lại các câu sai." : "Hãy đọc lại đoạn văn và thử lần nữa."}
                </p>
                <p className="mt-0.5 text-[11px] leading-5 text-muted">
                  Kết quả đã lưu trên trình duyệt. Giải thích chi tiết ở từng câu bên dưới.
                  {lastAttempt ? ` Lần trước: ${formatRelativeTime(lastAttempt.completedAt)}.` : ""}
                </p>
              </div>
            </Card>
          ) : null}

          <div className="space-y-3">
            {readingPassage.questions.map((question, index) => {
              const selected = answers[question.id];
              const isCorrect = submitted && selected === question.answer;
              const isWrong = submitted && selected !== question.answer;
              return (
                <Card key={question.id} className={cn("p-4", submitted && isWrong && "border-[#f0c9c3]")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f4fa] text-[10px] font-bold text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Badge tone="neutral">{question.type === "truefalse" ? "Đúng / Sai" : "Trắc nghiệm"}</Badge>
                    {submitted ? (
                      <Badge tone={isCorrect ? "success" : "danger"}>
                        {isCorrect ? <Check className="h-3 w-3" aria-hidden="true" /> : <X className="h-3 w-3" aria-hidden="true" />}
                        {isCorrect ? "Đúng" : "Sai"}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-5 text-navy">{question.prompt}</p>
                  <div
                    className={cn("mt-3 grid gap-2", question.type === "truefalse" && "sm:grid-cols-2")}
                    role="radiogroup"
                    aria-label={question.prompt}
                  >
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selected === option.id;
                      const optionIsAnswer = question.answer === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={submitted}
                          onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[12px] font-medium transition-colors",
                            submitted && optionIsAnswer && "border-success bg-success-soft text-success",
                            submitted && isSelected && !optionIsAnswer && "border-danger bg-danger-soft text-danger",
                            !submitted && isSelected && "border-primary bg-primary-soft/60 text-navy",
                            !submitted && !isSelected && "border-line bg-white text-[#3f4d63] hover:border-[#c9d5e8]",
                            submitted && !optionIsAnswer && !isSelected && "border-line bg-white text-muted opacity-70",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold",
                              submitted && optionIsAnswer
                                ? "border-success bg-success text-white"
                                : submitted && isSelected
                                  ? "border-danger bg-danger text-white"
                                  : isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-[#dbe3f0] bg-white text-muted",
                            )}
                          >
                            {submitted && optionIsAnswer ? (
                              <Check className="h-3 w-3" aria-hidden="true" />
                            ) : submitted && isSelected ? (
                              <X className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              optionLetters[optionIndex] ?? optionIndex + 1
                            )}
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {submitted ? (
                    <div
                      className={cn(
                        "mt-3 rounded-lg border p-3",
                        isCorrect ? "border-[#b9e4ce] bg-success-soft/60" : "border-[#f3c1ba] bg-danger-soft/60",
                      )}
                    >
                      <p className={cn("flex items-center gap-1.5 text-[10px] font-bold", isCorrect ? "text-success" : "text-danger")}>
                        {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Info className="h-3.5 w-3.5" aria-hidden="true" />}
                        {isCorrect ? "Chính xác" : `Đáp án đúng: ${question.options.find((option) => option.id === question.answer)?.label}`}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-[#3f4d63]">{question.explanation}</p>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>

          {!submitted && !allAnswered ? (
            <p className="text-center text-[10px] text-muted">
              Trả lời tất cả {readingPassage.questions.length} câu để bật nút nộp bài.
            </p>
          ) : null}

          {submitted ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3">
              <p className="text-[11px] text-muted">Bạn có thể chuyển thẳng sang kỹ năng khác.</p>
              <div className="flex gap-2">
                <Link href="/practice/listening" className={buttonClass({ size: "sm", variant: "secondary" })}>
                  <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                  Luyện nghe
                </Link>
                <Link href="/practice/writing" className={buttonClass({ size: "sm" })}>
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Luyện viết
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
