"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Lightbulb,
  ListChecks,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  grammarTopics,
  shadowingItems,
  speakingExamPrompts,
  speakingSelfCheck,
} from "@/data/content";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  SpeechButton,
  buttonClass,
  useToast,
} from "@/components/ui";

type Mode = "shadowing" | "exam";

export function SpeakingView() {
  const [mode, setMode] = useState<Mode>("shadowing");
  const [topic, setTopic] = useState("all");
  const [selectedShadowingId, setSelectedShadowingId] = useState(shadowingItems[0].id);
  const [selectedExamId, setSelectedExamId] = useState(speakingExamPrompts[0].id);
  const [showTranscript, setShowTranscript] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  const { data, hydrated, saveSpeakingChecks } = useProgress();
  const { notify } = useToast();

  const topics = useMemo(
    () => ["all", ...Array.from(new Set(shadowingItems.map((item) => item.topic)))],
    [],
  );

  const filteredShadowing = useMemo(
    () => shadowingItems.filter((item) => topic === "all" || item.topic === topic),
    [topic],
  );

  const shadowing = shadowingItems.find((item) => item.id === selectedShadowingId) ?? shadowingItems[0];
  const exam = speakingExamPrompts.find((item) => item.id === selectedExamId) ?? speakingExamPrompts[0];
  const selectedId = mode === "shadowing" ? shadowing.id : exam.id;
  const selectedTitle = mode === "shadowing" ? shadowing.text : exam.title;
  const savedChecks = data.speakingChecks[selectedId] ?? [];
  const grammarReminder = grammarTopics[1];

  useEffect(() => {
    if (!hydrated) return;
    setChecks(data.speakingChecks[selectedId] ?? []);
    // Chỉ nạp lại khi đổi nội dung luyện hoặc khi dữ liệu cục bộ vừa hydrate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, hydrated]);

  useEffect(() => {
    setShowTranscript(false);
  }, [selectedShadowingId, mode]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setTopic("all");
    if (next === "shadowing") setSelectedShadowingId(shadowingItems[0].id);
    else setSelectedExamId(speakingExamPrompts[0].id);
  };

  const toggleCheck = (criterion: string) => {
    setChecks((previous) =>
      previous.includes(criterion)
        ? previous.filter((item) => item !== criterion)
        : [...previous, criterion],
    );
  };

  const saveCheck = () => {
    saveSpeakingChecks(selectedId, checks, selectedTitle);
    notify(`Đã lưu tự đánh giá: ${checks.length}/${speakingSelfCheck.length} tiêu chí.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <Mic className="h-3.5 w-3.5" aria-hidden="true" />
            Practice 4 Skills · Speaking
          </p>
          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
            Luyện nói · Sprechen
          </h1>
          <p className="mt-1 text-sm text-muted">
            Shadowing và đề nói A1 để tự luyện. Không chấm điểm, không chữa lỗi, không gửi giọng nói lên server.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="soft">A1 · Lektion 1</Badge>
          <Badge tone="warning">
            <MicOff className="h-3 w-3" aria-hidden="true" />
            Không chấm điểm
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
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-[10px] font-semibold text-navy">
            Chủ đề
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              aria-label="Chọn chủ đề nói"
              className="rounded bg-transparent text-[10px] font-bold text-primary focus:outline-none"
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "Tất cả chủ đề" : item}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1">
            <button
              type="button"
              onClick={() => switchMode("shadowing")}
              aria-pressed={mode === "shadowing"}
              className={cn(
                "h-7 rounded-md px-3 text-[10px] font-semibold transition-colors",
                mode === "shadowing" ? "bg-primary text-white" : "text-muted hover:text-navy",
              )}
            >
              Shadowing ({shadowingItems.length})
            </button>
            <button
              type="button"
              onClick={() => switchMode("exam")}
              aria-pressed={mode === "exam"}
              className={cn(
                "h-7 rounded-md px-3 text-[10px] font-semibold transition-colors",
                mode === "exam" ? "bg-primary text-white" : "text-muted hover:text-navy",
              )}
            >
              Đề nói A1 ({speakingExamPrompts.length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        {/* Workspace */}
        <div className="space-y-4">
          {mode === "shadowing" ? (
            <>
              <Card className="overflow-hidden">
                <div className="border-b border-line bg-gradient-to-br from-[#f3f7ff] to-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">
                      <Volume2 className="h-3 w-3" aria-hidden="true" />
                      Shadowing
                    </Badge>
                    <Badge tone="neutral">{shadowing.topic}</Badge>
                  </div>
                  <p className="mt-3 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-navy" lang="de">
                    {shadowing.text}
                  </p>
                  {showTranscript ? (
                    <p className="mt-1 text-[12px] text-muted">{shadowing.translation}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted">Nghe trước, tự nhắc lại, rồi mới mở bản dịch.</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <SpeechButton
                      text={shadowing.text}
                      id={`shadow-main-${shadowing.id}`}
                      label={shadowing.text}
                      variant="inline"
                    >
                      Nghe câu mẫu
                    </SpeechButton>
                    <SpeechButton
                      text={shadowing.text}
                      id={`shadow-slow-${shadowing.id}`}
                      label={shadowing.text}
                      rate={0.7}
                      variant="chip"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTranscript((value) => !value)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-navy"
                      aria-pressed={showTranscript}
                    >
                      {showTranscript ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                      {showTranscript ? "Ẩn bản dịch" : "Hiện bản dịch"}
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="rounded-xl border border-[#d6e3ff] bg-soft p-3">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2457b8]" aria-hidden="true" />
                      <div>
                        <p className="text-[11px] font-bold text-navy">Cách luyện shadowing</p>
                        <ol className="mt-1 list-inside list-decimal space-y-0.5 text-[11px] leading-5 text-[#4d6488]">
                          <li>Nghe câu mẫu một lần ở tốc độ chuẩn.</li>
                          <li>Nghe lại và nhắc theo ngay khi giọng đọc vừa dứt.</li>
                          <li>Thử nói lại mà không nhìn transcript, sau đó kiểm tra bản dịch.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">
                    Danh sách mẫu câu · {filteredShadowing.length}
                  </p>
                  <span className="text-[10px] text-muted">Chọn câu để luyện</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {filteredShadowing.map((item, index) => {
                    const active = item.id === shadowing.id;
                    const saved = (data.speakingChecks[item.id]?.length ?? 0) > 0;
                    return (
                      <li
                        key={item.id}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2 transition-colors",
                          active ? "border-primary/30 bg-primary-soft/40" : "border-line bg-white hover:bg-[#fbfcff]",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedShadowingId(item.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                          aria-pressed={active}
                        >
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                              active ? "bg-primary text-white" : "bg-[#f1f4fa] text-muted",
                            )}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-semibold text-navy" lang="de">
                              {item.text}
                            </span>
                            <span className="block truncate text-[10px] text-muted">
                              {item.topic} · {item.translation}
                            </span>
                          </span>
                          {saved ? <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" /> : null}
                        </button>
                        <SpeechButton text={item.text} id={`shadow-list-${item.id}`} label={item.text} />
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </>
          ) : (
            <>
              <Card className="overflow-hidden">
                <div className="border-b border-line bg-gradient-to-br from-[#f3f7ff] to-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">
                      <GraduationCap className="h-3 w-3" aria-hidden="true" />
                      A1 Speaking Practice
                    </Badge>
                    <Badge tone="neutral">{exam.topic}</Badge>
                  </div>
                  <h2 className="mt-3 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-navy">
                    {exam.title}
                  </h2>
                  <ul className="mt-3 space-y-1.5">
                    {exam.instructions.map((instruction) => (
                      <li key={instruction} className="flex gap-2 text-[12px] leading-5 text-[#3f4d63]">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {instruction}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Từ khóa gợi ý</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {exam.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full border border-line bg-white px-2 py-0.5 text-[9px] font-semibold text-[#2457b8]">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">
                    Mẫu câu gợi ý (Redemittel)
                  </p>
                  <ul className="mt-2 space-y-2">
                    {exam.template.map((item, index) => (
                      <li key={item.de} className="flex items-start gap-3 rounded-xl border border-line bg-white p-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f1f4fa] text-[10px] font-bold text-muted">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold leading-5 text-navy" lang="de">
                            {item.de}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-5 text-muted">{item.vi}</p>
                        </div>
                        <SpeechButton text={item.de} id={`exam-${exam.id}-${index}`} label={item.de} />
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-xl border border-[#f0e3b7] bg-warning-soft p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                      <p className="text-[11px] leading-5 text-[#7c5100]">
                        Hãy nói thành tiếng trong 1–2 phút. Không có nút chấm điểm hay sửa lỗi: bạn tự đối chiếu với
                        mẫu câu và danh sách tự kiểm tra bên cạnh.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">
                  Thư viện đề nói A1
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {speakingExamPrompts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedExamId(item.id)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        item.id === exam.id
                          ? "border-primary/30 bg-primary-soft/40"
                          : "border-line bg-white hover:border-[#cfdcef]",
                      )}
                    >
                      <p className="text-[12px] font-bold text-navy">{item.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted">{item.topic}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <MicOff className="h-4 w-4 text-[#8795ab]" aria-hidden="true" />
              Không ghi âm, không gửi dữ liệu giọng nói, không chấm phát âm.
            </div>
            <Link href="/practice/writing" className={buttonClass({ size: "sm", variant: "secondary" })}>
              Sang luyện viết
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Dạng đề nói A1</p>
            </div>
            <ul className="mt-2 space-y-1">
              {speakingExamPrompts.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("exam");
                      setSelectedExamId(item.id);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] transition-colors",
                      mode === "exam" && item.id === exam.id
                        ? "bg-primary-soft font-semibold text-navy"
                        : "text-muted hover:bg-[#f7f9fd]",
                    )}
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8795ab]" aria-hidden="true" />
                    <span className="truncate">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 rounded-lg bg-[#fbfcff] px-2 py-1.5 text-[9px] leading-4 text-muted">
              Đề minh hoạ tự biên soạn theo dạng nhiệm vụ Goethe/TELC A1, không phải đề thi chính thức.
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Tự kiểm tra</p>
              </div>
              <Badge tone={checks.length === speakingSelfCheck.length ? "success" : "neutral"}>
                {checks.length}/{speakingSelfCheck.length}
              </Badge>
            </div>
            <p className="mt-1 text-[10px] leading-4 text-muted">
              Tích các tiêu chí bạn đã làm tốt sau khi tự nói thành tiếng.
            </p>
            <ul className="mt-2 space-y-1.5">
              {speakingSelfCheck.map((criterion) => {
                const checked = checks.includes(criterion);
                return (
                  <li key={criterion}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-[10px] leading-4 transition-colors",
                        checked
                          ? "border-primary/25 bg-primary-soft/40 text-navy"
                          : "border-line bg-white text-muted hover:bg-[#fbfcff]",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCheck(criterion)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#006458]"
                      />
                      <span>{criterion}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <Button size="sm" className="mt-3 w-full" onClick={saveCheck} disabled={checks.length === 0}>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Lưu tự đánh giá
            </Button>
            {savedChecks.length ? (
              <p className="mt-1.5 text-center text-[9px] text-success">
                Đã lưu {savedChecks.length}/{speakingSelfCheck.length} tiêu chí cho nội dung này.
              </p>
            ) : null}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Nhắc lại ngữ pháp</p>
            </div>
            <p className="mt-2 text-[12px] font-bold text-navy">Quy tắc chia ngôi “ich”</p>
            <p className="mt-1 text-[11px] leading-5 text-muted">{grammarReminder.subtitle}</p>
            <p className="mt-2 rounded-lg border border-[#cfe4de] bg-primary-soft px-2.5 py-2 font-mono text-[10px] font-semibold text-[#0b4a41]">
              {grammarReminder.formula}
            </p>
            <Link
              href="/kursbuch/grammar"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
            >
              Xem lại ngữ pháp
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </Card>

          <div className="rounded-xl border border-[#cfe4de] bg-primary-soft p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-bold text-[#0b4a41]">Speaking không chấm điểm</p>
                <p className="mt-1 text-[10px] leading-4 text-[#3f6d64]">
                  Không có AI chấm Speaking, không phân tích phát âm, không nhận diện giọng nói. Bạn chủ động luyện
                  và tự đánh giá theo tiêu chí.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Tiến độ Speaking</p>
              <p className="mt-0.5 text-[11px] font-semibold text-navy">
                {hydrated ? Object.keys(data.speakingChecks).length : "—"} nội dung đã tự đánh giá
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-[#8795ab]" aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={() => {
              setChecks([]);
              setShowTranscript(false);
            }}
            className={buttonClass({ size: "sm", variant: "ghost", className: "w-full" })}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Xóa lựa chọn tự kiểm tra trên trang
          </button>
        </aside>
      </div>
    </div>
  );
}
