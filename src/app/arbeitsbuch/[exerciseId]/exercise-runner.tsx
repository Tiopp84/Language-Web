"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import type { Exercise, ExerciseQuestion } from "@/data/content";
import { grammarTopics, vocabulary } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { displayCorrectAnswer, isAnswerCorrect } from "@/lib/grading";
import { cn, shuffleStable } from "@/lib/utils";
import {
  AnswerFeedback,
  Badge,
  Button,
  Card,
  ProgressBar,
  ProgressRing,
  SpeechButton,
  buttonClass,
} from "@/components/ui";

const typeLabels: Record<ExerciseQuestion["type"], string> = {
  mcq: "Trắc nghiệm",
  truefalse: "Đúng / Sai",
  fill: "Điền từ",
  order: "Sắp xếp câu",
};

const optionLetters = ["A", "B", "C", "D", "E"];

function QuestionInput({
  question,
  response,
  checked,
  onChange,
}: {
  question: ExerciseQuestion;
  response: string | string[] | undefined;
  checked: boolean;
  onChange: (value: string | string[]) => void;
}) {
  const shuffled = useMemo(
    () => (question.type === "order" ? shuffleStable(question.words ?? [], question.id) : []),
    [question],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  if (question.type === "mcq" || question.type === "truefalse") {
    return (
      <div
        className={cn(
          "mt-4 grid gap-2",
          question.type === "truefalse" ? "sm:grid-cols-2" : "grid-cols-1",
        )}
        role="radiogroup"
        aria-label={question.instruction}
      >
        {question.options?.map((option, index) => {
          const selected = response === option.id;
          const correct = checked && option.id === question.answer;
          const incorrect = checked && selected && option.id !== question.answer;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={checked}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[13px] font-medium transition-colors",
                correct && "border-success bg-success-soft text-success",
                incorrect && "border-danger bg-danger-soft text-danger",
                !checked && selected && "border-primary bg-primary-soft/60 text-navy",
                !checked && !selected && "border-line bg-white text-[#3f4d63] hover:border-[#c9d5e8] hover:bg-[#fbfcff]",
                checked && !correct && !incorrect && "border-line bg-white text-muted opacity-70",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                  correct
                    ? "border-success bg-success text-white"
                    : incorrect
                      ? "border-danger bg-danger text-white"
                      : selected
                        ? "border-primary bg-primary text-white"
                        : "border-[#dbe3f0] bg-white text-muted",
                )}
              >
                {correct ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : incorrect ? (
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                ) : question.type === "truefalse" ? (
                  option.id === "true" ? "R" : "F"
                ) : (
                  optionLetters[index] ?? index + 1
                )}
              </span>
              <span className="flex-1">{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "fill") {
    const value = typeof response === "string" ? response : "";
    const correct = checked && isAnswerCorrect(question, value);

    const insertChar = (char: string) => {
      const element = inputRef.current;
      const start = element?.selectionStart ?? value.length;
      const end = element?.selectionEnd ?? value.length;
      onChange(`${value.slice(0, start)}${char}${value.slice(end)}`);
      requestAnimationFrame(() => {
        element?.focus();
        element?.setSelectionRange(start + char.length, start + char.length);
      });
    };

    return (
      <div className="mt-4">
        <label htmlFor={`fill-${question.id}`} className="sr-only">
          Đáp án cho câu hỏi
        </label>
        <input
          ref={inputRef}
          id={`fill-${question.id}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={checked}
          autoComplete="off"
          spellCheck={false}
          placeholder="Nhập đáp án tiếng Đức…"
          className={cn(
            "h-12 w-full rounded-xl border bg-white px-4 text-[15px] font-semibold text-navy placeholder:text-[13px] placeholder:font-normal placeholder:text-[#98a5b8] focus:outline-none",
            checked && correct && "border-success bg-success-soft focus:border-success",
            checked && !correct && "border-danger bg-danger-soft focus:border-danger",
            !checked && "border-line focus:border-primary/50",
          )}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {["ä", "ö", "ü", "ß"].map((char) => (
            <button
              key={char}
              type="button"
              disabled={checked}
              onClick={() => insertChar(char)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-[12px] font-semibold text-navy hover:border-primary/30 hover:text-primary disabled:opacity-40"
              aria-label={`Chèn ký tự ${char}`}
            >
              {char}
            </button>
          ))}
          <span className="text-[10px] text-muted">Giữ đúng ä, ö, ü, ß</span>
        </div>
      </div>
    );
  }

  const selectedWords = Array.isArray(response) ? response : [];
  const remaining = [...shuffled];
  for (const word of selectedWords) {
    const index = remaining.indexOf(word);
    if (index >= 0) remaining.splice(index, 1);
  }

  return (
    <div className="mt-4 space-y-3">
      <div
        className={cn(
          "flex min-h-[64px] flex-wrap items-center gap-1.5 rounded-xl border-2 border-dashed p-3",
          checked ? "border-line bg-[#fbfcff]" : "border-[#cfdcef] bg-[#fbfcff]",
        )}
        aria-label="Câu trả lời đã sắp xếp"
      >
        {selectedWords.length === 0 ? (
          <span className="text-[12px] text-muted">Chọn các từ bên dưới theo đúng thứ tự…</span>
        ) : (
          selectedWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              type="button"
              disabled={checked}
              onClick={() => onChange(selectedWords.filter((_, itemIndex) => itemIndex !== index))}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary-soft px-2.5 py-1.5 text-[12px] font-semibold text-[#0b4a41] hover:border-primary/40 disabled:cursor-default"
            >
              {word}
              {!checked ? <X className="h-3 w-3 opacity-60" aria-hidden="true" /> : null}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {remaining.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            disabled={checked}
            onClick={() => onChange([...selectedWords, word])}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#3f4d63] transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
          >
            {word}
          </button>
        ))}
      </div>
      {!checked ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-[11px] font-semibold text-muted hover:text-navy"
        >
          Xóa và sắp xếp lại
        </button>
      ) : null}
    </div>
  );
}

function formatResponse(question: ExerciseQuestion, response: string | string[] | undefined) {
  if (response === undefined) return "(chưa trả lời)";
  if (question.type === "order") return Array.isArray(response) ? response.join(" ") : response;
  if (question.type === "mcq" || question.type === "truefalse") {
    return question.options?.find((option) => option.id === response)?.label ?? String(response);
  }
  return String(response);
}

export function ExerciseRunner({ exercise }: { exercise: Exercise }) {
  const { saveExerciseAttempt, data } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = exercise.questions[index];
  const response = answers[question.id];
  const isChecked = Boolean(checked[question.id]);
  const correct = isAnswerCorrect(question, response);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === exercise.questions.length;
  const answered = Array.isArray(response) ? response.length === (question.words?.length ?? 0) : Boolean(response);
  const linkedTopic = grammarTopics.find((topic) => exercise.topicIds.includes(topic.id));
  const linkedVocab = vocabulary.filter((item) => item.topicIds.some((topic) => exercise.topicIds.includes(topic))).slice(0, 3);
  const previousAttempt = data.exerciseAttempts[exercise.id];

  const result = useMemo(() => {
    const correctCount = exercise.questions.filter((item) =>
      isAnswerCorrect(item, answers[item.id]),
    ).length;
    return {
      correctCount,
      total: exercise.questions.length,
      percent: Math.round((correctCount / exercise.questions.length) * 100),
    };
  }, [answers, exercise.questions]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index, finished]);

  const checkAnswer = () => {
    if (!answered) return;
    setChecked((previous) => ({ ...previous, [question.id]: true }));
  };

  const next = () => {
    if (index < exercise.questions.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    const correctCount = exercise.questions.filter((item) => isAnswerCorrect(item, answers[item.id])).length;
    saveExerciseAttempt(
      exercise.id,
      correctCount,
      exercise.questions.length,
      answers,
      exercise.title,
    );
    setFinished(true);
  };

  const retry = () => {
    setAnswers({});
    setChecked({});
    setIndex(0);
    setFinished(false);
  };

  const goTo = (nextIndex: number) => {
    setIndex(nextIndex);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="space-y-5">
        <Link
          href="/arbeitsbuch"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Về thư viện bài tập
        </Link>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_auto]">
            <div className="p-6">
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Đã nộp bài
              </Badge>
              <h1 className="mt-3 text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-navy">
                Hoàn thành: {exercise.title}
              </h1>
              <p className="mt-1 text-[12px] text-muted">
                Kết quả đã được lưu trên trình duyệt này. Bạn có thể làm lại bất cứ lúc nào.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={retry}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Làm lại bài
                </Button>
                <Link href="/arbeitsbuch" className={buttonClass({ variant: "secondary" })}>
                  Về thư viện
                </Link>
                <Link href="/lektion/1" className={buttonClass({ variant: "soft" })}>
                  Tổng quan bài học
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              {previousAttempt ? (
                <p className="mt-3 text-[10px] text-muted">
                  Lần làm trước: {previousAttempt.correct}/{previousAttempt.total} câu đúng.
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-center border-t border-line bg-gradient-to-br from-primary-soft/60 to-[#f8fbff] p-6 md:border-l md:border-t-0">
              <div className="text-center">
                <ProgressRing value={result.percent} size={118} stroke={10}>
                  <span className="text-[24px] font-extrabold tracking-[-0.03em] text-navy">{result.percent}%</span>
                  <span className="mt-0.5 text-[10px] font-semibold text-muted">chính xác</span>
                </ProgressRing>
                <p className="mt-3 text-[12px] font-bold text-navy">
                  {result.correctCount}/{result.total} câu đúng
                </p>
                <p className="mt-0.5 text-[10px] text-muted">
                  {result.percent >= 80 ? "Kết quả tốt, hãy thử bài khó hơn." : "Xem giải thích và thử lại để ghi nhớ."}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-[17px] font-bold text-navy">Xem lại bài làm</h2>
          <div className="mt-3 space-y-2.5">
            {exercise.questions.map((item, itemIndex) => {
              const itemCorrect = isAnswerCorrect(item, answers[item.id]);
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        itemCorrect ? "bg-success text-white" : "bg-danger text-white",
                      )}
                    >
                      {itemCorrect ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted">Câu {itemIndex + 1}</p>
                        <Badge tone="neutral">{typeLabels[item.type]}</Badge>
                      </div>
                      <p className="mt-1 text-[13px] font-semibold leading-5 text-navy">{item.prompt}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div className={cn("rounded-lg border px-3 py-2", itemCorrect ? "border-[#b9e4ce] bg-success-soft" : "border-[#f6c9c3] bg-danger-soft")}>
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Bạn trả lời</p>
                          <p className="mt-0.5 text-[12px] font-semibold text-navy">{formatResponse(item, answers[item.id])}</p>
                        </div>
                        <div className="rounded-lg border border-[#b9e4ce] bg-white px-3 py-2">
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Đáp án</p>
                          <p className="mt-0.5 text-[12px] font-semibold text-success">{displayCorrectAnswer(item)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] leading-5 text-muted">
                        <span className="font-semibold text-navy">Giải thích: </span>
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/arbeitsbuch?tab=${exercise.category}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Thư viện bài tập
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={exercise.category === "workbook" ? "soft" : "primary"}>
            {exercise.category === "workbook" ? "Theo sách" : "Tự tạo"}
          </Badge>
          <Badge tone="neutral">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {exercise.estimatedMinutes} phút
          </Badge>
          <Badge tone="neutral">
            <ClipboardCheck className="h-3 w-3" aria-hidden="true" />
            {exercise.questions.length} câu
          </Badge>
        </div>
      </div>

      <div>
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-navy sm:text-[28px]">
          {exercise.title}
        </h1>
        <p className="mt-1 max-w-3xl text-[12px] leading-5 text-muted">{exercise.description}</p>
      </div>

      {/* Stepper */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {exercise.questions.map((item, itemIndex) => {
              const itemChecked = Boolean(checked[item.id]);
              const itemCorrect = itemChecked && isAnswerCorrect(item, answers[item.id]);
              const active = itemIndex === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(itemIndex)}
                  aria-label={`Đi tới câu ${itemIndex + 1}`}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition-colors",
                    active && "border-primary bg-primary text-white",
                    !active && itemChecked && itemCorrect && "border-success bg-success-soft text-success",
                    !active && itemChecked && !itemCorrect && "border-danger bg-danger-soft text-danger",
                    !active && !itemChecked && "border-line bg-white text-muted hover:border-[#c9d5e8]",
                  )}
                >
                  {itemChecked ? (
                    itemCorrect ? <Check className="h-3 w-3" aria-hidden="true" /> : <X className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    itemIndex + 1
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted">
            Đã kiểm tra {checkedCount}/{exercise.questions.length}
            <div className="w-24">
              <ProgressBar value={(checkedCount / exercise.questions.length) * 100} label="Tiến độ bài làm" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        {/* Question workspace */}
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge tone="soft">Câu {index + 1} / {exercise.questions.length}</Badge>
              <Badge tone="neutral">{typeLabels[question.type]}</Badge>
            </div>
            <SpeechButton text={question.prompt} id={`question-${question.id}`} label="đề bài" variant="chip" />
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            {question.instruction}
          </p>
          <p className="mt-1 whitespace-pre-line text-[16px] font-semibold leading-7 text-navy">
            {question.prompt}
          </p>

          <QuestionInput
            question={question}
            response={response}
            checked={isChecked}
            onChange={(value) => {
              setAnswers((previous) => ({ ...previous, [question.id]: value }));
              if (isChecked) setChecked((previous) => ({ ...previous, [question.id]: false }));
            }}
          />

          {isChecked ? (
            <div className="mt-4">
              <AnswerFeedback
                correct={correct}
                title={correct ? "Chính xác!" : "Chưa chính xác"}
                explanation={question.explanation}
                translation={question.translation}
              >
                {!correct ? (
                  <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-[12px] font-semibold text-navy">
                    Đáp án đúng: <span className="text-success">{displayCorrectAnswer(question)}</span>
                  </p>
                ) : null}
              </AnswerFeedback>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Câu trước
            </Button>
            <button
              type="button"
              onClick={() => {
                setAnswers((previous) => ({ ...previous, [question.id]: "" }));
                setChecked((previous) => ({ ...previous, [question.id]: false }));
              }}
              className="text-[11px] font-semibold text-muted hover:text-navy"
            >
              Làm lại câu này
            </button>
            <div className="ml-auto flex flex-wrap gap-2">
              {!isChecked ? (
                <Button onClick={checkAnswer} disabled={!answered}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Kiểm tra câu trả lời
                </Button>
              ) : index < exercise.questions.length - 1 ? (
                <Button onClick={next}>
                  Câu tiếp theo
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button onClick={next} disabled={!allChecked}>
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  Nộp bài & xem kết quả
                </Button>
              )}
            </div>
          </div>
          {isChecked && index === exercise.questions.length - 1 && !allChecked ? (
            <p className="mt-2 text-right text-[10px] text-warning">
              Hãy kiểm tra tất cả các câu trước khi nộp bài (còn {exercise.questions.length - checkedCount} câu).
            </p>
          ) : null}
        </Card>

        {/* Right context */}
        <aside className="space-y-4">
          {linkedTopic ? (
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Ngữ pháp tham chiếu</p>
              </div>
              <p className="mt-2 text-[13px] font-bold text-navy">{linkedTopic.title}</p>
              <p className="mt-1 text-[11px] leading-5 text-muted">{linkedTopic.subtitle}</p>
              {linkedTopic.formula ? (
                <p className="mt-2 rounded-lg border border-[#cfe4de] bg-primary-soft px-2.5 py-2 font-mono text-[10px] font-semibold leading-4 text-[#0b4a41]">
                  {linkedTopic.formula}
                </p>
              ) : null}
              <Link
                href="/kursbuch/grammar"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                Xem lại lý thuyết
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </Card>
          ) : null}

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Tiến trình câu hỏi</p>
            </div>
            <ul className="mt-2 space-y-1">
              {exercise.questions.map((item, itemIndex) => {
                const itemChecked = Boolean(checked[item.id]);
                const itemCorrect = itemChecked && isAnswerCorrect(item, answers[item.id]);
                const active = itemIndex === index;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(itemIndex)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors",
                        active ? "bg-primary-soft font-semibold text-navy" : "text-muted hover:bg-[#f7f9fd]",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold",
                          active && "border-primary bg-primary text-white",
                          !active && itemChecked && itemCorrect && "border-success bg-success-soft text-success",
                          !active && itemChecked && !itemCorrect && "border-danger bg-danger-soft text-danger",
                          !active && !itemChecked && "border-line bg-white",
                        )}
                      >
                        {itemChecked ? (
                          itemCorrect ? <Check className="h-2.5 w-2.5" aria-hidden="true" /> : <X className="h-2.5 w-2.5" aria-hidden="true" />
                        ) : (
                          itemIndex + 1
                        )}
                      </span>
                      <span className="truncate">
                        {typeLabels[item.type]} · câu {itemIndex + 1}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {linkedVocab.length ? (
            <Card className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Từ vựng liên quan</p>
              <ul className="mt-2 space-y-1">
                {linkedVocab.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-[#f7f9fd]">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-navy">{item.lemma}</p>
                      <p className="truncate text-[10px] text-muted">{item.meaningVi}</p>
                    </div>
                    <SpeechButton text={item.lemma} id={`side-${item.id}`} label={item.lemma} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-bold text-navy">Gợi ý làm bài</p>
                <p className="mt-1 text-[10px] leading-4 text-muted">
                  Chú ý viết hoa danh từ và giữ đúng ä, ö, ü, ß. Với câu sắp xếp, hãy xác định động từ chia ở vị trí
                  2 trong câu trần thuật.
                </p>
              </div>
            </div>
          </Card>

          <div className="rounded-xl border border-line bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Nguồn & quyền</p>
            <p className="mt-1 text-[10px] leading-4 text-muted">{exercise.reference}</p>
            <p className="mt-1 text-[10px] font-semibold text-primary">
              {exercise.sourceKind === "original" ? "Nội dung gốc · publishable" : "Biên soạn tương đương · có tham chiếu"}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold text-navy">Kết quả gần nhất</p>
              <p className="text-[10px] text-muted">
                {previousAttempt
                  ? `${previousAttempt.correct}/${previousAttempt.total} câu đúng`
                  : "Chưa có lần làm nào"}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-[#8795ab]" aria-hidden="true" />
          </div>
        </aside>
      </div>
    </div>
  );
}
