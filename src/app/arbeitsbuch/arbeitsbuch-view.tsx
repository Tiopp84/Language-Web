"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Filter,
  Lightbulb,
  NotebookPen,
  RotateCcw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { exercises, grammarTopics } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  buttonClass,
} from "@/components/ui";

type Tab = "workbook" | "custom";

export function ArbeitsbuchView() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "custom" ? "custom" : "workbook");
  const [topic, setTopic] = useState("all");
  const [status, setStatus] = useState<"all" | "done" | "new">("all");
  const [query, setQuery] = useState("");
  const { data, hydrated } = useProgress();

  useEffect(() => {
    const next = searchParams.get("tab");
    if (next === "custom" || next === "workbook") setTab(next);
  }, [searchParams]);

  const changeTab = (next: Tab) => {
    setTab(next);
    setTopic("all");
    setStatus("all");
    setQuery("");
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url.toString());
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de-DE");
    return exercises.filter((exercise) => {
      if (exercise.category !== tab) return false;
      if (topic !== "all" && !exercise.topicIds.includes(topic)) return false;
      const attempt = data.exerciseAttempts[exercise.id];
      if (status === "done" && !attempt) return false;
      if (status === "new" && attempt) return false;
      if (!normalizedQuery) return true;
      return `${exercise.title} ${exercise.description}`.toLocaleLowerCase("de-DE").includes(normalizedQuery);
    });
  }, [tab, topic, status, query, data.exerciseAttempts]);

  const tabExercises = exercises.filter((exercise) => exercise.category === tab);
  const totalDone = Object.keys(data.exerciseAttempts).length;
  const attempts = Object.values(data.exerciseAttempts);
  const averageScore = attempts.length
    ? Math.round(
        (attempts.reduce((sum, attempt) => sum + attempt.correct / Math.max(1, attempt.total), 0) /
          attempts.length) *
          100,
      )
    : 0;
  const totalQuestions = exercises.reduce((sum, exercise) => sum + exercise.questions.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
            Arbeitsbuch · Lektion 1
          </p>
          <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
            Thư viện bài tập
          </h1>
          <p className="mt-1 text-sm text-muted">
            Chọn bài tập theo sách hoặc bài tự tạo. Làm độc lập, không cần học Kursbuch trước.
          </p>
        </div>
        <Badge tone="soft">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {exercises.length} bộ · {totalQuestions} câu hỏi
        </Badge>
      </div>

      {/* Banner metrics */}
      <Card className="overflow-hidden">
        <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border-b border-line bg-gradient-to-br from-[#eef4ff] to-white p-5 sm:border-r xl:border-b-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5272a8]">Tổng quan</p>
            <p className="mt-2 text-[24px] font-extrabold tracking-[-0.03em] text-navy">
              {hydrated ? totalDone : "—"}
              <span className="text-[13px] font-semibold text-muted"> / {exercises.length} bài</span>
            </p>
            <ProgressBar
              value={hydrated ? (totalDone / exercises.length) * 100 : 0}
              className="mt-2"
              label="Tiến độ bài tập"
            />
          </div>
          <div className="border-b border-line p-5 sm:border-r xl:border-b-0">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
              Điểm trung bình
              <BarChart3 className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-[24px] font-extrabold tracking-[-0.03em] text-navy">
              {hydrated && attempts.length ? `${averageScore}%` : "—"}
            </p>
            <p className="mt-1 text-[10px] text-muted">Tính trên các bài đã hoàn thành</p>
          </div>
          <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
              Bài tập theo sách
              <BookOpenCheck className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-[24px] font-extrabold tracking-[-0.03em] text-navy">
              {exercises.filter((exercise) => exercise.category === "workbook").length} bộ
            </p>
            <p className="mt-1 text-[10px] text-muted">Biên soạn tương đương, có mã tham chiếu</p>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
              Bài tập tự tạo
              <ClipboardCheck className="h-4 w-4 text-[#5272a8]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-[24px] font-extrabold tracking-[-0.03em] text-navy">
              {exercises.filter((exercise) => exercise.category === "custom").length} bộ
            </p>
            <p className="mt-1 text-[10px] text-muted">Nội dung gốc, rights_status: original</p>
          </div>
        </div>
      </Card>

      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Nhóm bài tập">
        {[
          { id: "workbook" as const, label: "Bài tập theo sách", icon: <BookOpenCheck className="h-4 w-4" />, count: exercises.filter((exercise) => exercise.category === "workbook").length },
          { id: "custom" as const, label: "Bài tập tự tạo", icon: <ClipboardCheck className="h-4 w-4" />, count: exercises.filter((exercise) => exercise.category === "custom").length },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => changeTab(item.id)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-[12px] font-bold transition-colors",
              tab === item.id
                ? "border-primary bg-primary text-white"
                : "border-line bg-white text-muted hover:border-[#cfdcef] hover:text-navy",
            )}
          >
            {item.icon}
            {item.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                tab === item.id ? "bg-white/20 text-white" : "bg-[#f1f4fa] text-[#8b99ad]",
              )}
            >
              {item.count}
            </span>
          </button>
        ))}
        <p className="ml-auto hidden items-center gap-1.5 text-[10px] text-muted sm:flex">
          <Target className="h-3.5 w-3.5" aria-hidden="true" />
          Làm lại không giới hạn, kết quả gần nhất được giữ
        </p>
      </div>

      {/* Filter toolbar */}
      <Card className="p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted" aria-hidden="true" />
            <label className="sr-only" htmlFor="topic-filter">
              Chủ điểm kiến thức
            </label>
            <select
              id="topic-filter"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="h-9 max-w-full min-w-0 rounded-lg border border-line bg-white px-2.5 text-[11px] font-semibold text-navy focus:border-primary/40 focus:outline-none"
            >
              <option value="all">Tất cả chủ điểm</option>
              {grammarTopics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="status-filter">
              Trạng thái
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | "done" | "new")}
              className="h-9 max-w-full min-w-0 rounded-lg border border-line bg-white px-2.5 text-[11px] font-semibold text-navy focus:border-primary/40 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="done">Đã hoàn thành</option>
              <option value="new">Chưa làm</option>
            </select>
          </div>

          <div className="relative min-w-0 flex-1 lg:ml-auto lg:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b99ad]"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm bài tập…"
              aria-label="Tìm bài tập"
              className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-navy placeholder:text-[#98a5b8] focus:border-primary/40 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Exercise list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Không có bài tập phù hợp"
          description="Thử đổi nhóm bài tập, bỏ bộ lọc trạng thái hoặc xóa từ khóa tìm kiếm."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((exercise, index) => {
            const attempt = data.exerciseAttempts[exercise.id];
            const percent = attempt ? Math.round((attempt.correct / attempt.total) * 100) : 0;
            return (
              <Card key={exercise.id} className="p-4 transition-shadow hover:shadow-lg">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-extrabold",
                      attempt ? "bg-primary text-white" : "bg-[#eef2fa] text-[#6d7d96]",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[14px] font-bold text-navy">{exercise.title}</h2>
                      {attempt ? (
                        <Badge tone="success">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          Hoàn thành · {percent}%
                        </Badge>
                      ) : (
                        <Badge tone="neutral">Chưa làm</Badge>
                      )}
                      <Badge tone={exercise.category === "workbook" ? "soft" : "primary"}>
                        {exercise.category === "workbook" ? "Theo sách" : "Tự tạo"}
                      </Badge>
                    </div>
                    <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted">{exercise.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <ClipboardCheck className="h-3 w-3" aria-hidden="true" />
                        {exercise.questions.length} câu hỏi
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {exercise.estimatedMinutes} phút
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpenCheck className="h-3 w-3" aria-hidden="true" />
                        {exercise.reference}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exercise.topicIds.map((topicId) => {
                        const topicItem = grammarTopics.find((item) => item.id === topicId);
                        return (
                          <span
                            key={topicId}
                            className="rounded-full border border-line bg-[#fbfcff] px-2 py-0.5 text-[9px] font-semibold text-[#6a7890]"
                          >
                            {topicItem?.title ?? topicId}
                          </span>
                        );
                      })}
                    </div>
                    {attempt ? (
                      <div className="mt-2.5 flex items-center gap-2">
                        <ProgressBar value={percent} className="max-w-xs flex-1" label={`Kết quả ${exercise.title}`} />
                        <span className="text-[10px] font-semibold text-muted">
                          {attempt.correct}/{attempt.total} câu đúng
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
                    <Link
                      href={`/arbeitsbuch/${exercise.id}`}
                      className={buttonClass({ size: "sm", variant: attempt ? "secondary" : "primary" })}
                    >
                      {attempt ? <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                      {attempt ? "Làm lại" : "Làm bài"}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    {attempt ? (
                      <span className="hidden text-center text-[9px] text-muted sm:block">
                        Điểm gần nhất {percent}%
                      </span>
                    ) : (
                      <span className="hidden text-center text-[9px] text-muted sm:block">
                        {tabExercises.length} bộ trong nhóm
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Helper */}
      <div className="flex flex-wrap items-start gap-3 rounded-xl border border-[#f0e3b7] bg-warning-soft p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-[#7c5100]">Về hai nhóm bài tập</p>
          <p className="mt-1 text-[11px] leading-5 text-[#7c5100]">
            “Bài tập theo sách” được biên soạn tương đương mục tiêu của Menschen Arbeitsbuch và có mã tham chiếu
            để đối chiếu bản in. “Bài tập tự tạo” là nội dung gốc của Language Web, không sao chép nguyên văn sách.
            Kết quả được lưu riêng theo từng bài.
          </p>
        </div>
        <Link href="/lektion/1" className={buttonClass({ size: "sm", variant: "secondary" })}>
          Về tổng quan bài
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
