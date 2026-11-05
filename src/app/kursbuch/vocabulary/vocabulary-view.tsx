"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Info,
  Languages,
  Lightbulb,
  Search,
  Sparkles,
  Volume2,
} from "lucide-react";
import { grammarTopics, vocabulary, type PartOfSpeech, type VocabularyItem } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { cn, normalizeGerman } from "@/lib/utils";
import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  SpeechButton,
  buttonClass,
  useToast,
} from "@/components/ui";

const posFilters: { id: "all" | PartOfSpeech; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "noun", label: "Danh từ" },
  { id: "verb", label: "Động từ" },
  { id: "phrase", label: "Cụm từ" },
];

const articleColor = {
  der: "text-[#2457b8]",
  die: "text-[#b23a6b]",
  das: "text-[#067647]",
};

function Headword({ item }: { item: VocabularyItem }) {
  if (!item.article) {
    return <span className="text-[36px] font-extrabold leading-none tracking-[-0.03em] text-ink">{item.lemma}</span>;
  }
  const noun = item.lemma.replace(`${item.article} `, "");
  return (
    <span className="flex flex-wrap items-baseline gap-2">
      <span className={cn("text-[22px] font-bold", articleColor[item.article])}>{item.article}</span>
      <span className="text-[36px] font-extrabold leading-none tracking-[-0.03em] text-ink">{noun}</span>
    </span>
  );
}

function MetadataRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <span className="text-[11px] text-muted">{label}</span>
      <span className={cn("text-[12px] font-semibold", value ? "text-navy" : "text-[#9aa6b8]")}>
        {value || "chưa cập nhật"}
      </span>
    </div>
  );
}

export function VocabularyView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [pos, setPos] = useState<"all" | PartOfSpeech>("all");
  const [selectedId, setSelectedId] = useState(vocabulary[0]?.id ?? "");
  const { data, hydrated, isVocabLearned, toggleVocabLearned } = useProgress();
  const { notify } = useToast();

  useEffect(() => {
    const next = searchParams.get("q");
    if (next !== null) setQuery(next);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeGerman(query).toLocaleLowerCase("de-DE");
    return vocabulary.filter((item) => {
      if (pos !== "all" && item.pos !== pos) return false;
      if (!normalizedQuery) return true;
      const haystack = [item.lemma, item.meaningVi, item.note ?? "", ...item.examples.map((example) => example.de)]
        .join(" ")
        .toLocaleLowerCase("de-DE");
      return haystack.includes(normalizedQuery);
    });
  }, [query, pos]);

  useEffect(() => {
    if (filtered.length === 0) return;
    if (!filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = vocabulary.find((item) => item.id === selectedId) ?? filtered[0] ?? vocabulary[0];
  const learnedCount = data.vocabLearned.length;
  const learnedPercent = vocabulary.length ? (learnedCount / vocabulary.length) * 100 : 0;
  const selectedLearned = selected ? isVocabLearned(selected.id) : false;
  const linkedGrammar = selected
    ? grammarTopics.find((topic) => selected.topicIds.includes(topic.id))
    : undefined;

  const markLearned = () => {
    if (!selected) return;
    toggleVocabLearned(selected.id, selected.lemma);
    notify(selectedLearned ? `Đã bỏ đánh dấu “${selected.lemma}”.` : `Đã đánh dấu học “${selected.lemma}”.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Kursbuch · Lektion 1
          </p>
          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
            Từ vựng Kursbuch
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tra nghĩa, loại từ, mạo từ, số nhiều và nghe phát âm chuẩn tiếng Đức.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="soft">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {vocabulary.length} từ · A1
          </Badge>
          <div className="rounded-xl border border-line bg-white px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-navy">
              Đã học {hydrated ? learnedCount : "—"}/{vocabulary.length}
              <span className="text-[10px] font-normal text-muted">({hydrated ? Math.round(learnedPercent) : 0}%)</span>
            </div>
            <ProgressBar value={hydrated ? learnedPercent : 0} className="mt-1.5 w-32" label="Tiến độ từ vựng" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3.5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-[#fbfcff] px-2.5 text-[11px] font-semibold text-navy">
              CEFR
              <select className="rounded bg-transparent text-[11px] font-bold text-primary focus:outline-none" defaultValue="A1" aria-label="Chọn trình độ CEFR">
                <option value="A1">A1</option>
              </select>
            </label>
            <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-[#fbfcff] px-2.5 text-[11px] font-semibold text-navy">
              Lektion
              <select className="rounded bg-transparent text-[11px] font-bold text-primary focus:outline-none" defaultValue="1" aria-label="Chọn Lektion">
                <option value="1">1 – Guten Tag!</option>
              </select>
            </label>
          </div>

          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b99ad]"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm từ vựng tiếng Đức hoặc nghĩa tiếng Việt..."
              aria-label="Tìm từ vựng"
              className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-navy placeholder:text-[#98a5b8] focus:border-primary/40 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {posFilters.map((filter) => {
              const count =
                filter.id === "all"
                  ? vocabulary.length
                  : vocabulary.filter((item) => item.pos === filter.id).length;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPos(filter.id)}
                  aria-pressed={pos === filter.id}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition-colors",
                    pos === filter.id
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-white text-muted hover:text-navy",
                  )}
                >
                  {filter.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px]",
                      pos === filter.id ? "bg-white/20" : "bg-[#f1f4fa] text-[#8b99ad]",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Two-panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        {/* List */}
        <Card className="flex max-h-[calc(100dvh-220px)] min-h-[420px] flex-col overflow-hidden xl:sticky xl:top-[92px]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Danh sách từ · {filtered.length}
            </p>
            <span className="text-[10px] text-muted">Chọn để xem chi tiết</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 thin-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-3">
                <EmptyState
                  icon={<Search className="h-6 w-6" />}
                  title="Không tìm thấy từ phù hợp"
                  description="Thử bỏ bộ lọc loại từ hoặc tìm bằng nghĩa tiếng Việt."
                />
              </div>
            ) : (
              <ul className="space-y-1">
                {filtered.map((item) => {
                  const active = item.id === selected?.id;
                  const learned = isVocabLearned(item.id);
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "flex items-center gap-1 rounded-xl border p-1 transition-colors",
                        active ? "border-primary/30 bg-primary-soft/40" : "border-transparent hover:bg-[#f7f9fd]",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left"
                        aria-pressed={active}
                      >
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                            learned
                              ? "border-primary bg-primary text-white"
                              : "border-[#dbe3f0] bg-white text-[#a9b5c8]",
                          )}
                          aria-label={learned ? "Đã học" : "Chưa học"}
                        >
                          {learned ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-1.5">
                            {item.article ? (
                              <span className={cn("text-[10px] font-bold", articleColor[item.article])}>{item.article}</span>
                            ) : null}
                            <span className="truncate text-[13px] font-bold text-navy">
                              {item.article ? item.lemma.replace(`${item.article} `, "") : item.lemma}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-muted">{item.meaningVi}</span>
                        </span>
                        <Badge tone={item.pos === "verb" ? "primary" : item.pos === "noun" ? "soft" : "neutral"} className="hidden sm:inline-flex">
                          {item.posLabel}
                        </Badge>
                      </button>
                      <SpeechButton text={item.lemma} id={`list-${item.id}`} label={item.lemma} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="border-t border-line p-3">
            <div className="flex items-start gap-2 rounded-xl bg-[#fbfcff] p-2.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-[10px] leading-4 text-muted">
                Mẹo: luôn học danh từ kèm mạo từ (der/die/das) và dạng số nhiều. Đây là thông tin bắt buộc khi
                dùng danh từ trong câu.
              </p>
            </div>
          </div>
        </Card>

        {/* Detail */}
        {selected ? (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="border-b border-line bg-gradient-to-br from-[#fbfdff] to-[#f2f7ff] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="soft">{selected.posLabel}</Badge>
                      <Badge tone="neutral">Lektion 1</Badge>
                      {selectedLearned ? (
                        <Badge tone="success">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          Đã học
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <Headword item={selected} />
                    </div>
                    <p className="mt-1 text-[12px] text-muted">Phiên âm: {selected.phonetic}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <SpeechButton
                      text={selected.lemma}
                      id={`detail-${selected.id}`}
                      label={selected.lemma}
                      variant="inline"
                    >
                      Nghe chuẩn
                    </SpeechButton>
                    <SpeechButton
                      text={selected.lemma}
                      id={`detail-slow-${selected.id}`}
                      label={selected.lemma}
                      rate={0.7}
                      variant="chip"
                      className=""
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-line bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Nghĩa tiếng Việt</p>
                  <p className="mt-1 text-[20px] font-bold text-navy">{selected.meaningVi}</p>
                  {selected.note ? (
                    <p className="mt-2 text-[11px] leading-5 text-muted">{selected.note}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_0.9fr]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Thông tin từ</p>
                  <div className="mt-2">
                    {selected.pos === "noun" ? (
                      <>
                        <MetadataRow label="Mạo từ" value={selected.article} />
                        <MetadataRow label="Giống" value={selected.gender === "m" ? "Giống đực (maskulin)" : selected.gender === "f" ? "Giống cái (feminin)" : selected.gender === "n" ? "Giống trung (neutrum)" : undefined} />
                        <MetadataRow label="Số nhiều" value={selected.plural} />
                      </>
                    ) : selected.pos === "verb" ? (
                      <>
                        <MetadataRow label="Nguyên thể" value={selected.verbForms?.infinitiv ?? selected.lemma} />
                        <MetadataRow label="Loại" value={selected.verbForms?.note ?? "Động từ có quy tắc"} />
                        <MetadataRow label="Ngôi du" value={selected.verbForms?.present.du} />
                      </>
                    ) : (
                      <>
                        <MetadataRow label="Loại từ" value={selected.posLabel} />
                        <MetadataRow label="Mạo từ / số nhiều" value="Không áp dụng" />
                      </>
                    )}
                    <MetadataRow label="CEFR" value="A1" />
                    <MetadataRow label="Nguồn" value="Biên soạn mới · rights_status: original" />
                  </div>
                </div>

                {selected.verbForms ? (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                      Chia hiện tại (Präsens)
                    </p>
                    <div className="mt-2 overflow-hidden rounded-xl border border-line">
                      <table className="w-full text-[12px]">
                        <tbody>
                          {Object.entries(selected.verbForms.present).map(([pronoun, form], index) => (
                            <tr key={pronoun} className={index % 2 === 0 ? "bg-[#fbfcff]" : "bg-white"}>
                              <th scope="row" className="w-24 border-b border-line px-3 py-2 text-left font-semibold text-muted last:border-b-0">
                                {pronoun}
                              </th>
                              <td className="border-b border-line px-3 py-2 font-bold text-navy last:border-b-0">{form}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Ghi chú sử dụng</p>
                    <div className="mt-2 rounded-xl border border-line bg-[#fbfcff] p-4 text-[12px] leading-6 text-[#3f4d63]">
                      {selected.note ?? "Từ này không có bảng chia động từ. Hãy xem ví dụ và nghe phát âm để dùng đúng ngữ cảnh."}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Ví dụ sử dụng</p>
                <Badge tone="neutral">{selected.examples.length} câu</Badge>
              </div>
              <ul className="mt-3 space-y-2">
                {selected.examples.map((example, index) => (
                  <li
                    key={example.de}
                    className="flex items-start gap-3 rounded-xl border border-line bg-white p-3"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f1f4fa] text-[10px] font-bold text-muted">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold leading-5 text-navy">{example.de}</p>
                      <p className="mt-0.5 text-[11px] leading-5 text-muted">{example.vi}</p>
                    </div>
                    <SpeechButton text={example.de} id={`ex-${selected.id}-${index}`} label={example.de} />
                  </li>
                ))}
              </ul>
            </Card>

            {linkedGrammar ? (
              <Card className="border-[#d6e3ff] bg-soft p-4">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2457b8]" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-navy">Ngữ pháp liên quan: {linkedGrammar.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#4d6488]">{linkedGrammar.subtitle}</p>
                    <Link
                      href="/kursbuch/grammar"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#2457b8] hover:underline"
                    >
                      Xem chủ điểm ngữ pháp
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Card>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={markLearned}
                className={buttonClass({ variant: selectedLearned ? "secondary" : "primary" })}
              >
                {selectedLearned ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                {selectedLearned ? "Đã học từ này" : "Đánh dấu đã học"}
              </button>
              <Link href="/arbeitsbuch?tab=custom" className={buttonClass({ variant: "soft" })}>
                Luyện tập từ này
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/practice/listening"
                className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-navy"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                Nghe hội thoại bài 1
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-[11px] text-muted">
          Bạn có thể chuyển thẳng sang Ngữ pháp hoặc Arbeitsbuch mà không cần học hết từ vựng.
        </p>
        <div className="flex gap-2">
          <Link href="/kursbuch/grammar" className={buttonClass({ size: "sm", variant: "secondary" })}>
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            Học ngữ pháp
          </Link>
          <Link href="/arbeitsbuch" className={buttonClass({ size: "sm" })}>
            Làm bài tập
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
