"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Lightbulb,
  ListChecks,
  PenLine,
  Sparkles,
  Target,
} from "lucide-react";
import { exercises, grammarTopics } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { normalizeForCompare } from "@/lib/utils";
import {
  AnswerFeedback,
  Badge,
  Button,
  Card,
  ProgressBar,
  SpeechButton,
  buttonClass,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const microQuizzes: Record<string, { prompt: string; answer: string; acceptable: string[]; explanation: string }> = {
  "gram-sein": {
    prompt: "Ich ______ Minh Anh. (sein)",
    answer: "bin",
    acceptable: ["bin"],
    explanation: "Ngôi ich của sein là bin.",
  },
  "gram-praesens": {
    prompt: "Du ______ aus Vietnam. (kommen)",
    answer: "kommst",
    acceptable: ["kommst"],
    explanation: "Ngôi du: komm- + -st → kommst.",
  },
  "gram-w-frage": {
    prompt: "______ heißen Sie? (từ hỏi tên lịch sự)",
    answer: "Wie",
    acceptable: ["wie"],
    explanation: "Wie heißen Sie? = Ông/bà tên là gì?",
  },
};

const contextPairs: Record<string, { de: string; vi: string }[]> = {
  "gram-sein": [
    { de: "Ich bin Minh Anh.", vi: "Tôi là Minh Anh." },
    { de: "Bist du Paco?", vi: "Bạn là Paco phải không?" },
    { de: "Sie ist Frau Weber.", vi: "Cô ấy là cô Weber." },
  ],
  "gram-praesens": [
    { de: "Wie heißt du?", vi: "Bạn tên là gì?" },
    { de: "Woher kommst du?", vi: "Bạn đến từ đâu?" },
    { de: "Wo wohnst du?", vi: "Bạn sống ở đâu?" },
  ],
  "gram-w-frage": [
    { de: "Wie heißen Sie?", vi: "Ông/bà tên là gì?" },
    { de: "Woher kommen Sie?", vi: "Ông/bà đến từ đâu?" },
    { de: "Welche Sprachen sprechen Sie?", vi: "Ông/bà nói ngôn ngữ nào?" },
  ],
};

export function GrammarView() {
  const [selectedId, setSelectedId] = useState(grammarTopics[0].id);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const { data, hydrated, isGrammarRead, toggleGrammarRead } = useProgress();
  const { notify } = useToast();

  const selected = grammarTopics.find((topic) => topic.id === selectedId) ?? grammarTopics[0];
  const read = isGrammarRead(selected.id);
  const quiz = microQuizzes[selected.id];
  const quizCorrect = quiz ? normalizeForCompare(quizAnswer) === normalizeForCompare(quiz.answer) : false;
  const linkedExercises = exercises.filter((exercise) => selected.linkedExerciseIds.includes(exercise.id));
  const readCount = data.grammarRead.length;
  const readPercent = (readCount / grammarTopics.length) * 100;

  const selectTopic = (id: string) => {
    setSelectedId(id);
    setQuizAnswer("");
    setQuizChecked(false);
  };

  const markRead = () => {
    toggleGrammarRead(selected.id, selected.title);
    notify(read ? `Đã bỏ đánh dấu chủ điểm “${selected.title}”.` : `Đã đánh dấu đã đọc “${selected.title}”.`);
  };

  const pairs = contextPairs[selected.id] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Kursbuch · Lektion 1
          </p>
          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
            Ngữ pháp Kursbuch
          </h1>
          <p className="mt-1 text-sm text-muted">
            Quy tắc ngắn gọn, công thức và ví dụ thực hành theo ngữ cảnh A1.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-line bg-white px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-navy">
              Đã đọc {hydrated ? readCount : "—"}/{grammarTopics.length}
              <span className="text-[10px] font-normal text-muted">({hydrated ? Math.round(readPercent) : 0}%)</span>
            </div>
            <ProgressBar value={hydrated ? readPercent : 0} className="mt-1.5 w-32" label="Tiến độ ngữ pháp" />
          </div>
          <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-[11px] font-semibold text-navy">
            Lektion
            <select
              defaultValue="1"
              aria-label="Chọn Lektion"
              className="rounded bg-transparent text-[11px] font-bold text-primary focus:outline-none"
            >
              <option value="1">1 – Guten Tag!</option>
            </select>
          </label>
        </div>
      </div>

      {/* Topic tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 thin-scrollbar" role="tablist" aria-label="Chủ điểm ngữ pháp">
        {grammarTopics.map((topic, index) => {
          const active = topic.id === selected.id;
          const topicRead = isGrammarRead(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTopic(topic.id)}
              className={cn(
                "flex min-w-[220px] flex-1 items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors",
                active
                  ? "border-primary/30 bg-primary-soft/50 shadow-sm"
                  : "border-line bg-white hover:border-[#cfdcef]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  active ? "bg-primary text-white" : "bg-[#f1f4fa] text-muted",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold leading-4 text-navy">{topic.title}</span>
                <span className="mt-0.5 block text-[10px] text-muted">{topic.subtitle}</span>
              </span>
              {topicRead ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Main study panel */}
        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge tone="soft">Chủ điểm {grammarTopics.findIndex((topic) => topic.id === selected.id) + 1}</Badge>
                <h2 className="mt-2 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-navy">
                  {selected.title}
                </h2>
                <p className="mt-1 text-[12px] text-muted">{selected.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={markRead}
                className={buttonClass({ size: "sm", variant: read ? "secondary" : "primary" })}
              >
                {read ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {read ? "Đã đọc" : "Đánh dấu đã đọc"}
              </button>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Quy tắc</p>
              <ol className="mt-2 space-y-2">
                {selected.rule.map((rule, index) => (
                  <li key={rule} className="flex gap-2.5 text-[13px] leading-6 text-[#3f4d63]">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft text-[10px] font-bold text-[#2457b8]">
                      {index + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </div>

            {selected.formula ? (
              <div className="mt-5 rounded-xl border border-[#cfe4de] bg-primary-soft px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Công thức</p>
                <p className="mt-1 font-mono text-[13px] font-semibold leading-6 text-[#0b4a41]">
                  {selected.formula}
                </p>
              </div>
            ) : null}
          </Card>

          {selected.table ? (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                  Bảng chia / mẫu câu
                </p>
                <Badge tone="neutral">Präsens</Badge>
              </div>
              <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full min-w-[520px] text-[12px]">
                  <thead>
                    <tr className="bg-[#fbfcff]">
                      {selected.table.headers.map((header) => (
                        <th key={header} className="border-b border-line px-4 py-2.5 text-left font-bold text-navy">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.table.rows.map((row, index) => (
                      <tr key={row.join("-")} className={index % 2 === 1 ? "bg-[#fcfdff]" : "bg-white"}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${cell}-${cellIndex}`}
                            className={cn(
                              "border-b border-line px-4 py-2.5 last:border-b-0",
                              cellIndex === 0 ? "font-semibold text-muted" : "font-semibold text-navy",
                              cellIndex === 1 && "text-primary",
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Ví dụ minh họa</p>
              <span className="text-[10px] text-muted">{selected.examples.length} câu · nghe được</span>
            </div>
            <ul className="mt-3 space-y-2">
              {selected.examples.map((example, index) => (
                <li key={example.de} className="flex items-start gap-3 rounded-xl border border-line bg-white p-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f1f4fa] text-[10px] font-bold text-muted">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-5 text-navy">{example.de}</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-muted">{example.vi}</p>
                    {example.note ? (
                      <p className="mt-1 rounded-md bg-warning-soft px-2 py-1 text-[10px] leading-4 text-[#7c5100]">
                        {example.note}
                      </p>
                    ) : null}
                  </div>
                  <SpeechButton text={example.de} id={`gram-ex-${selected.id}-${index}`} label={example.de} />
                </li>
              ))}
            </ul>
          </Card>

          {selected.exception ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#f0e3b7] bg-warning-soft p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="text-[12px] font-bold text-[#7c5100]">Lưu ý quan trọng</p>
                <p className="mt-1 text-[12px] leading-5 text-[#7c5100]">{selected.exception}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Ngữ cảnh thực hành</p>
            <p className="mt-1 text-[12px] text-muted">3 cặp câu hỏi & trả lời tương ứng với chủ điểm.</p>
            <ul className="mt-3 space-y-2">
              {pairs.map((pair, index) => (
                <li key={pair.de} className="rounded-xl border border-line bg-[#fbfcff] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold leading-5 text-navy">{pair.de}</p>
                      <p className="mt-0.5 text-[10px] leading-4 text-muted">{pair.vi}</p>
                    </div>
                    <SpeechButton text={pair.de} id={`gram-pair-${selected.id}-${index}`} label={pair.de} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {quiz ? (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Kiểm tra nhanh</p>
              </div>
              <form
                className="mt-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuizChecked(true);
                }}
              >
                <label htmlFor="micro-quiz" className="text-[12px] font-semibold leading-5 text-navy">
                  {quiz.prompt}
                </label>
                <input
                  id="micro-quiz"
                  value={quizAnswer}
                  onChange={(event) => {
                    setQuizAnswer(event.target.value);
                    setQuizChecked(false);
                  }}
                  autoComplete="off"
                  className="mt-2 h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-navy focus:border-primary/40 focus:outline-none"
                  placeholder="Nhập đáp án…"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button type="submit" size="sm" disabled={!quizAnswer.trim()}>
                    Kiểm tra
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswer("");
                      setQuizChecked(false);
                    }}
                    className="text-[11px] font-semibold text-muted hover:text-navy"
                  >
                    Làm lại
                  </button>
                </div>
              </form>
              {quizChecked ? (
                <div className="mt-3">
                  <AnswerFeedback
                    correct={quizCorrect}
                    title={quizCorrect ? "Chính xác!" : "Chưa đúng"}
                    explanation={quizCorrect ? quiz.explanation : `Đáp án đúng: “${quiz.answer}”. ${quiz.explanation}`}
                  />
                </div>
              ) : null}
            </Card>
          ) : null}

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-[12px] font-bold text-navy">Luyện tập chủ điểm này</p>
            </div>
            <ul className="mt-2 space-y-1.5">
              {linkedExercises.map((exercise) => (
                <li key={exercise.id}>
                  <Link
                    href={`/arbeitsbuch/${exercise.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold text-[#2457b8] hover:bg-[#f3f7ff]"
                  >
                    <span className="truncate">{exercise.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/arbeitsbuch" className={buttonClass({ size: "sm", variant: "soft", className: "mt-2 w-full" })}>
              Mở thư viện bài tập
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Card>

          <div className="rounded-xl border border-[#d6e3ff] bg-soft p-4">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#2457b8]" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-bold text-navy">Cách học hiệu quả</p>
                <p className="mt-1 text-[10px] leading-4 text-[#4d6488]">
                  Đọc quy tắc → nghe ví dụ → tự đặt 2 câu mới → làm bài tập liên quan. Không cần học thuộc lòng
                  bảng chia ngay lần đầu.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold text-navy">Âm thanh</p>
              <p className="text-[10px] text-muted">Giọng tiếng Đức của trình duyệt</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted">
              <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
              Web Speech
            </span>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-[11px] text-muted">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Chủ điểm này liên kết trực tiếp tới bài tập có tag ngữ pháp tương ứng.
        </p>
        <div className="flex gap-2">
          <Link href="/kursbuch/vocabulary" className={buttonClass({ size: "sm", variant: "secondary" })}>
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Ôn từ vựng
          </Link>
          <Link href="/arbeitsbuch" className={buttonClass({ size: "sm" })}>
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            Luyện tập
          </Link>
        </div>
      </div>
    </div>
  );
}
