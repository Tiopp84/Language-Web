"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Info,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Waves,
} from "lucide-react";
import { listeningItem } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { evaluateDictation, type DictationResult } from "@/lib/grading";
import { cn, formatRelativeTime, wordCount } from "@/lib/utils";
import { useGermanSpeech } from "@/lib/use-speech";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  buttonClass,
  useToast,
} from "@/components/ui";

const waveform = Array.from({ length: 52 }, (_, index) => 22 + ((index * 41 + 17) % 74));

function TokenLine({
  result,
  side,
}: {
  result: DictationResult;
  side: "user" | "target";
}) {
  const ops = result.ops.filter((op) => (side === "user" ? op.type !== "missing" : op.type !== "extra"));

  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-[14px] leading-7" lang="de">
      {ops.map((op, index) => {
        if (op.type === "missing") {
          return (
            <span
              key={`${side}-${index}`}
              className="rounded border border-dashed border-[#d9a514] bg-warning-soft px-1.5 py-0.5 text-[13px] font-semibold text-[#8a5c00]"
              title="Từ còn thiếu trong bài của bạn"
            >
              {op.target.raw}
            </span>
          );
        }
        if (op.type === "extra") {
          return (
            <span
              key={`${side}-${index}`}
              className="rounded bg-danger-soft px-1.5 py-0.5 text-[13px] font-semibold text-danger line-through decoration-danger/60"
              title="Từ thừa so với bản gốc"
            >
              {op.user.raw}
            </span>
          );
        }
        if (op.type === "wrong") {
          return (
            <span
              key={`${side}-${index}`}
              className="rounded bg-danger-soft px-1.5 py-0.5 text-[13px] font-semibold text-danger underline decoration-danger/50 decoration-wavy underline-offset-2"
              title={`Sai từ. Bản gốc: ${op.target.raw}`}
            >
              {side === "user" ? op.user.raw : op.target.raw}
            </span>
          );
        }
        return (
          <span
            key={`${side}-${index}`}
            className={cn(
              "rounded px-1.5 py-0.5 text-[13px] font-semibold",
              op.caseMismatch
                ? "border border-[#e7c76a] bg-warning-soft text-[#7c5100]"
                : "bg-success-soft text-success",
            )}
            title={op.caseMismatch ? `Chú ý chữ hoa: nên viết “${op.target.raw}”` : "Đúng"}
          >
            {side === "user" ? op.user.raw : op.target.raw}
          </span>
        );
      })}
    </p>
  );
}

export function ListeningView() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<DictationResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const { data, saveSkillAttempt } = useProgress();
  const { notify } = useToast();
  const { speak, stop, pause, resume, speakingId, paused, supported } = useGermanSpeech();

  const audioId = `listening-${listeningItem.id}`;
  const active = speakingId === audioId;
  const playing = active && !paused;
  const lastAttempt = data.listeningAttempts[listeningItem.id];

  useEffect(() => {
    if (!active && paused) {
      // Trạng thái pause không còn hiệu lực khi utterance đã kết thúc.
    }
  }, [active, paused]);

  const togglePlay = () => {
    if (!supported) return;
    if (active && !paused) {
      pause();
      return;
    }
    if (active && paused) {
      resume();
      return;
    }
    speak(listeningItem.transcript, audioId, { rate: playbackRate, volume });
  };

  const restartAtRate = (rate: number) => {
    setPlaybackRate(rate);
    if (active) {
      speak(listeningItem.transcript, audioId, { rate, volume });
    }
  };

  const changeVolume = (next: number) => {
    setVolume(next);
    if (active) speak(listeningItem.transcript, audioId, { rate: playbackRate, volume: next });
  };

  const insertChar = (char: string) => {
    const element = inputRef.current;
    const start = element?.selectionStart ?? text.length;
    const end = element?.selectionEnd ?? text.length;
    setText(`${text.slice(0, start)}${char}${text.slice(end)}`);
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + char.length, start + char.length);
    });
  };

  const submit = () => {
    const evaluation = evaluateDictation(listeningItem.transcript, text);
    setResult(evaluation);
    saveSkillAttempt(
      "listening",
      listeningItem.id,
      evaluation.correctCount,
      evaluation.targetTokens.length,
      `Nghe chép: ${listeningItem.title}`,
    );
    notify(`Đã lưu kết quả dictation: ${evaluation.accuracy}% chính xác.`);
  };

  const retry = () => {
    setText("");
    setResult(null);
    stop();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
            Practice 4 Skills · Listening
          </p>
          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
            Luyện nghe · Dictation
          </h1>
          <p className="mt-1 text-sm text-muted">
            Nghe đoạn audio và gõ lại chính xác những gì bạn nghe được. Transcript chỉ hiện sau khi nộp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="soft">A1 · Lektion 1</Badge>
          <Badge tone="neutral">1 bài nghe</Badge>
          {lastAttempt ? (
            <Badge tone="success">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Gần nhất {Math.round((lastAttempt.correct / lastAttempt.total) * 100)}%
            </Badge>
          ) : null}
        </div>
      </div>

      <Link
        href="/lektion/1"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-navy"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Về tổng quan Lektion 1
      </Link>

      {/* Audio player */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                <Waves className="h-3 w-3" aria-hidden="true" />
                Dictation
              </Badge>
              <Badge tone="neutral">{listeningItem.title}</Badge>
            </div>
            <p className="mt-2 text-[13px] font-semibold text-navy">{listeningItem.subtitle}</p>
          </div>
          <p className="text-[10px] text-muted">
            {supported ? "Audio mô phỏng bằng giọng tiếng Đức của trình duyệt" : "Trình duyệt không hỗ trợ Web Speech API"}
          </p>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!supported}
              aria-label={playing ? "Tạm dừng audio" : "Phát audio"}
              className={cn(
                "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 disabled:opacity-40",
                playing && "speaking-pulse",
              )}
            >
              {playing ? <Pause className="h-6 w-6" aria-hidden="true" /> : <Play className="ml-0.5 h-6 w-6" aria-hidden="true" />}
            </button>

            <div className="min-w-0 flex-1">
              <div
                className="flex h-12 items-center gap-[3px] overflow-hidden rounded-lg bg-[#f7f9fd] px-2"
                aria-hidden="true"
              >
                {waveform.map((height, index) => (
                  <span
                    key={index}
                    className={cn("flex-1 rounded-full", playing ? "wave-bar bg-primary/70" : "bg-[#b9c8dd]")}
                    style={{
                      height: `${height}%`,
                      animationDelay: `${(index % 9) * 70}ms`,
                      animationPlayState: playing ? "running" : "paused",
                      opacity: playing ? 1 : 0.55,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <Volume2 className="h-3 w-3" aria-hidden="true" />
                  {playing ? "Đang phát…" : active && paused ? "Đã tạm dừng" : "Sẵn sàng phát"}
                </span>
                <span>{playbackRate.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted">Tốc độ:</span>
              {[0.7, 0.85, 1, 1.2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => restartAtRate(rate)}
                  className={cn(
                    "inline-flex h-7 items-center rounded-md border px-2 text-[10px] font-semibold transition-colors",
                    playbackRate === rate
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-white text-muted hover:text-navy",
                  )}
                >
                  {rate === 1 ? "Chuẩn" : `${rate.toFixed(2)}x`}
                </button>
              ))}
            </div>
            <label className="ml-auto flex items-center gap-2 text-[10px] font-semibold text-muted">
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              Âm lượng
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(event) => changeVolume(Number(event.target.value))}
                className="w-24 accent-[#006458]"
                aria-label="Âm lượng audio"
              />
            </label>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Dictation workspace */}
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold text-navy">Bài chép của bạn</h2>
            <span className="text-[10px] text-muted">{wordCount(text)} từ</span>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-muted">
            Nghe đoạn audio và gõ lại chính xác những gì bạn nghe được vào ô bên dưới. Lưu ý viết hoa danh từ và
            dấu câu.
          </p>

          <label htmlFor="dictation-input" className="sr-only">
            Nội dung nghe chép
          </label>
          <textarea
            ref={inputRef}
            id="dictation-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            readOnly={Boolean(result)}
            rows={6}
            lang="de"
            spellCheck={false}
            placeholder="Guten Tag, …"
            className={cn(
              "mt-4 w-full resize-y rounded-xl border bg-white p-4 text-[15px] leading-7 text-navy placeholder:text-[13px] placeholder:text-[#98a5b8] focus:outline-none",
              result
                ? "border-line bg-[#fbfcff]"
                : "border-line focus:border-primary/50",
            )}
          />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold text-muted">Ký tự Đức:</span>
            {["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"].map((char) => (
              <button
                key={char}
                type="button"
                disabled={Boolean(result)}
                onClick={() => insertChar(char)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-[12px] font-semibold text-navy hover:border-primary/30 hover:text-primary disabled:opacity-40"
                aria-label={`Chèn ký tự ${char}`}
              >
                {char}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#d6e3ff] bg-soft p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#2457b8]" aria-hidden="true" />
              <p className="text-[11px] leading-5 text-[#4d6488]">
                Trong tiếng Đức, <strong>tất cả danh từ đều viết hoa chữ cái đầu</strong> (der Name, der Tag, das
                Land). Hãy kiểm tra kỹ dấu chấm và dấu hỏi cuối câu.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {!result ? (
              <Button onClick={submit} disabled={!text.trim()}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Nộp bài & đối chiếu
              </Button>
            ) : (
              <>
                <Button onClick={retry} variant="secondary">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Nghe và làm lại
                </Button>
                <Link href="/practice/reading" className={buttonClass({ variant: "soft" })}>
                  Sang luyện đọc
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setPlaybackRate(0.7);
                speak(listeningItem.transcript, audioId, { rate: 0.7, volume });
              }}
              className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-navy"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              Nghe chậm
            </button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {!result ? (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
                <h2 className="text-[14px] font-bold text-navy">Kết quả đối chiếu</h2>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Sau khi nộp, hệ thống so sánh ở cấp độ từ và đánh dấu từng trường hợp:
              </p>
              <ul className="mt-3 space-y-2 text-[11px] leading-5">
                <li className="flex items-center gap-2">
                  <span className="rounded bg-success-soft px-1.5 py-0.5 font-semibold text-success">đúng</span>
                  Từ khớp với transcript
                </li>
                <li className="flex items-center gap-2">
                  <span className="rounded bg-danger-soft px-1.5 py-0.5 font-semibold text-danger underline decoration-wavy">sai</span>
                  Từ sai hoặc thừa
                </li>
                <li className="flex items-center gap-2">
                  <span className="rounded border border-dashed border-[#d9a514] bg-warning-soft px-1.5 py-0.5 font-semibold text-[#8a5c00]">thiếu</span>
                  Từ có trong bản gốc nhưng bạn chưa gõ
                </li>
                <li className="flex items-center gap-2">
                  <span className="rounded border border-[#e7c76a] bg-warning-soft px-1.5 py-0.5 font-semibold text-[#7c5100]">Chữ hoa</span>
                  Đúng từ nhưng sai chữ hoa
                </li>
              </ul>
              <div className="mt-4 rounded-xl border border-dashed border-[#d5ddeb] bg-[#fbfcff] p-4">
                <p className="text-[11px] font-semibold text-navy">Transcript đang được ẩn</p>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Bạn có thể nghe lại nhiều lần và chỉnh sửa bài chép trước khi nộp. Hệ thống không tự sửa nội dung
                  của bạn.
                </p>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-bold text-navy">Độ chính xác</h2>
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-ink">
                    {result.accuracy}%
                  </span>
                  <span className="pb-1 text-[10px] text-muted">
                    {result.correctCount}/{result.targetTokens.length} từ đúng
                  </span>
                </div>
                <ProgressBar
                  value={result.accuracy}
                  className="mt-3 h-2"
                  tone={result.accuracy >= 80 ? "primary" : "soft"}
                  label="Độ chính xác dictation"
                />

                <dl className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: "Đúng", value: result.correctCount, tone: "text-success" },
                    { label: "Sai", value: result.wrongCount, tone: "text-danger" },
                    { label: "Thiếu", value: result.missingCount, tone: "text-warning" },
                    { label: "Thừa", value: result.extraCount, tone: "text-danger" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-line bg-[#fbfcff] px-3 py-2">
                      <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">{item.label}</dt>
                      <dd className={cn("mt-0.5 text-[18px] font-extrabold", item.tone)}>{item.value}</dd>
                    </div>
                  ))}
                </dl>

                {result.capitalizationIssues.length ? (
                  <div className="mt-3 rounded-lg border border-[#e7c76a] bg-warning-soft px-3 py-2">
                    <p className="text-[10px] font-bold text-[#7c5100]">Chú ý chữ hoa</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-[#7c5100]">
                      {result.capitalizationIssues.join(", ")}
                    </p>
                  </div>
                ) : null}
                {result.punctuationIssue ? (
                  <p className="mt-2 text-[10px] font-semibold text-warning">
                    Dấu câu cuối câu chưa khớp với bản gốc.
                  </p>
                ) : null}
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-bold text-navy">Chi tiết đoạn văn</h2>
                  <Badge tone="success">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Đã lưu
                  </Badge>
                </div>

                <div className="mt-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Bạn đã gõ</p>
                  <div className="mt-1 rounded-lg border border-line bg-[#fbfcff] p-2.5">
                    <TokenLine result={result} side="user" />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
                    Bản gốc đối chiếu
                  </p>
                  <div className="mt-1 rounded-lg border border-[#b9e4ce] bg-success-soft/40 p-2.5">
                    <TokenLine result={result} side="target" />
                  </div>
                  <p className="mt-1 text-[10px] italic leading-4 text-muted">{listeningItem.translation}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success" /> đúng
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-danger" /> sai/thừa
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#d9a514]" /> thiếu/chữ hoa
                  </span>
                  {lastAttempt ? (
                    <span className="ml-auto">{formatRelativeTime(lastAttempt.completedAt)}</span>
                  ) : null}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
                  <h2 className="text-[13px] font-bold text-navy">Ghi chú ngữ pháp & phát âm</h2>
                </div>
                <ul className="mt-2 space-y-2">
                  {listeningItem.notes.map((note) => (
                    <li key={note} className="flex gap-2 text-[11px] leading-5 text-[#3f4d63]">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {note}
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          <div className="rounded-xl border border-line bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Audio & bản quyền</p>
            <p className="mt-1 text-[10px] leading-4 text-muted">
              Audio trong bản demo được đọc bằng Web Speech API từ transcript tự biên soạn. Khi bổ sung tệp thu
              âm, tệp cần có quyền sử dụng và transcript khớp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
