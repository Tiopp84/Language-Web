"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BookText,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  History,
  Languages,
  Lightbulb,
  Lock,
  Mic,
  NotebookPen,
  PenLine,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { exercises, grammarTopics, lessonList, vocabulary } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { formatRelativeTime } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  ProgressBar,
  SectionHeading,
  buttonClass,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const activityIcons = {
  vocabulary: <Languages className="h-3.5 w-3.5" aria-hidden="true" />,
  grammar: <BookText className="h-3.5 w-3.5" aria-hidden="true" />,
  exercise: <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />,
  listening: <Headphones className="h-3.5 w-3.5" aria-hidden="true" />,
  reading: <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />,
  writing: <PenLine className="h-3.5 w-3.5" aria-hidden="true" />,
  speaking: <Mic className="h-3.5 w-3.5" aria-hidden="true" />,
};

export default function DashboardPage() {
  const { data, hydrated, resetProgress } = useProgress();
  const { notify } = useToast();
  const [resetOpen, setResetOpen] = useState(false);

  const vocabLearned = data.vocabLearned.length;
  const grammarRead = data.grammarRead.length;
  const exerciseDone = Object.keys(data.exerciseAttempts).length;
  const vocabPercent = vocabulary.length ? (vocabLearned / vocabulary.length) * 100 : 0;
  const grammarPercent = grammarTopics.length ? (grammarRead / grammarTopics.length) * 100 : 0;
  const exercisePercent = exercises.length ? (exerciseDone / exercises.length) * 100 : 0;
  const overall = Math.round((vocabPercent + grammarPercent + exercisePercent) / 3);

  const lessonProgress = useMemo(() => {
    const skillDone =
      Object.keys(data.readingAttempts).length +
      Object.keys(data.listeningAttempts).length +
      Object.keys(data.writingRecords).length +
      Object.keys(data.speakingChecks).length;
    return Math.min(100, Math.round(overall * 0.85 + Math.min(15, skillDone * 3)));
  }, [data, overall]);

  const show = (value: number) => (hydrated ? value : "—");

  const reset = () => {
    resetProgress();
    setResetOpen(false);
    notify("Đã đặt lại toàn bộ tiến độ học tập.");
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Học tập hiệu quả A1 chủ động
            <span className="text-[#b6c0cf]">•</span>
            <span className="text-muted">Giáo trình Menschen</span>
          </p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[36px]">
            Chào mừng trở lại!
          </h1>
          <p className="mt-1 text-sm text-muted">Hôm nay bạn muốn học gì?</p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 card-shadow">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-soft text-[#2457b8]">
            <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Trình độ hiện tại</p>
            <p className="text-[13px] font-bold text-navy">CEFR A1 (Menschen)</p>
          </div>
          <Link
            href="/lektion/1"
            className="ml-2 inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-[11px] font-semibold text-navy hover:bg-[#f7f9fd]"
          >
            Đổi
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Progress summary */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.15fr_1fr_1fr_1fr]">
          <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
                Tiến độ tổng quan
              </p>
              <Badge tone="soft">Lektion 1</Badge>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-ink">
                {show(lessonProgress)}%
              </span>
              <span className="pb-1 text-[11px] leading-4 text-muted">đã hoàn thành mục tiêu bài 1</span>
            </div>
            <ProgressBar value={hydrated ? lessonProgress : 0} className="mt-4 h-2" label="Tiến độ Lektion 1" />
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
              <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Tiến độ tính từ hoạt động đã lưu trên trình duyệt này
            </div>
          </div>

          <Link href="/kursbuch/vocabulary" className="group border-b border-line p-5 hover:bg-[#fbfcff] lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-muted">Từ vựng</p>
              <Languages className="h-4 w-4 text-[#5272a8] transition-transform group-hover:scale-110" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[26px] font-extrabold leading-none tracking-[-0.03em] text-ink">
              {show(vocabLearned)}
            </p>
            <p className="mt-1 text-[10px] text-muted">/ {vocabulary.length} từ đã nạp</p>
            <ProgressBar value={hydrated ? vocabPercent : 0} className="mt-3" label="Tiến độ từ vựng" />
          </Link>

          <Link href="/kursbuch/grammar" className="group border-b border-line p-5 hover:bg-[#fbfcff] lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-muted">Ngữ pháp</p>
              <BookText className="h-4 w-4 text-[#5272a8] transition-transform group-hover:scale-110" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[26px] font-extrabold leading-none tracking-[-0.03em] text-ink">
              {show(grammarRead)}
            </p>
            <p className="mt-1 text-[10px] text-muted">/ {grammarTopics.length} chủ điểm nắm vững</p>
            <ProgressBar value={hydrated ? grammarPercent : 0} className="mt-3" label="Tiến độ ngữ pháp" />
          </Link>

          <Link href="/arbeitsbuch" className="group p-5 hover:bg-[#fbfcff]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-muted">Bài tập</p>
              <ClipboardCheck className="h-4 w-4 text-[#5272a8] transition-transform group-hover:scale-110" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[26px] font-extrabold leading-none tracking-[-0.03em] text-ink">
              {show(exerciseDone)}
            </p>
            <p className="mt-1 text-[10px] text-muted">/ {exercises.length} bài đã làm</p>
            <ProgressBar value={hydrated ? exercisePercent : 0} className="mt-3" label="Tiến độ bài tập" />
          </Link>
        </div>
      </Card>

      {/* Continue learning */}
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <Badge tone="success">Đang học dở</Badge>
          <h2 className="mt-2 text-lg font-bold text-navy">Lektion 1: Guten Tag!</h2>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] leading-5 text-muted">
            <BookText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Ngữ pháp: Chia động từ ở thì hiện tại (Präsens: sein, heißen, kommen)
          </p>
          <p className="mt-2 text-[11px] text-muted">Thời gian ước tính: 15 phút · Bao gồm 6 bộ bài luyện tập</p>
        </div>
        <Link href="/lektion/1" className={buttonClass({ size: "lg" })}>
          Tiếp tục ngay
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Card>

      {/* Modules */}
      <section>
        <SectionHeading
          title="Module học tập chính"
          description="Ba trụ cột theo cấu trúc chuẩn giáo trình Menschen A1. Bạn có thể học bất kỳ module nào trước."
        />
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <Card className="flex flex-col p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-[#2457b8]">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Module 01</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy">1. Kursbuch</h3>
            <p className="mt-1 text-[12px] leading-5 text-muted">
              Học từ vựng và ngữ pháp trọng tâm theo giáo trình chuẩn quốc tế.
            </p>
            <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Từ vựng (Wortschatz)</dt>
                <dd className="font-semibold text-navy">{vocabulary.length} từ</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Ngữ pháp (Grammatik)</dt>
                <dd className="font-semibold text-navy">{grammarTopics.length} chủ điểm</dd>
              </div>
            </dl>
            <Link href="/kursbuch/vocabulary" className={buttonClass({ variant: "soft", className: "mt-4 w-full" })}>
              Khám phá Kursbuch
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Card>

          <Card className="flex flex-col p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f0ff] text-[#6246c7]">
                <NotebookPen className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Module 02</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy">2. Arbeitsbuch</h3>
            <p className="mt-1 text-[12px] leading-5 text-muted">
              Luyện tập và củng cố với hệ thống bài tập phong phú, bám sát mục tiêu từng bài.
            </p>
            <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Bài tập theo sách</dt>
                <dd className="font-semibold text-navy">3 bộ</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Bài tập mở rộng</dt>
                <dd className="font-semibold text-navy">3 bộ tự tạo</dd>
              </div>
            </dl>
            <Link href="/arbeitsbuch" className={buttonClass({ variant: "soft", className: "mt-4 w-full" })}>
              Bắt đầu bài tập
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Card>

          <Card className="flex flex-col p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Module 03</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy">3. Practice 4 Skills</h3>
            <p className="mt-1 text-[12px] leading-5 text-muted">
              Thực hành Nghe chép chính tả, Đọc hiểu, Viết có AI hỗ trợ và Tự luyện Nói.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-[12px]">
              {[
                { icon: <Headphones className="h-3.5 w-3.5" />, label: "Hören" },
                { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Lesen" },
                { icon: <PenLine className="h-3.5 w-3.5" />, label: "Schreiben" },
                { icon: <Mic className="h-3.5 w-3.5" />, label: "Sprechen" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-1.5 text-muted">
                  <span className="text-[#5272a8]">{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>
            <Link href="/practice/listening" className={buttonClass({ variant: "soft", className: "mt-4 w-full" })}>
              Luyện kỹ năng
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Card>
        </div>
      </section>

      {/* Lessons + Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <SectionHeading
            title="Danh sách bài học (Lektion)"
            description="Giai đoạn hiện tại có nội dung hoàn chỉnh cho Lektion 1."
            action={
              <span className="text-[11px] font-semibold text-muted">
                {lessonList.length} bài đang hiển thị
              </span>
            }
          />
          <div className="mt-4 space-y-2">
            {lessonList.map((item) => {
              const available = "available" in item ? item.available !== false : true;
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3.5 transition-colors",
                    available ? "hover:border-[#cfdcef]" : "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold",
                      available ? "bg-primary text-white" : "bg-[#eef1f7] text-[#8c99ad]",
                    )}
                  >
                    {String(item.number).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-bold text-navy">
                        Lektion {item.number}: {item.title}
                      </p>
                      {available ? <Badge tone="primary">Đang học · {show(lessonProgress)}%</Badge> : null}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted">{item.subtitle}</p>
                  </div>
                  {available ? (
                    <Link
                      href={`/lektion/${item.number}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-[#f3f6fc] hover:text-navy"
                      aria-label={`Mở Lektion ${item.number}`}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f6fa] px-2 py-1 text-[10px] font-semibold text-[#8c99ad]">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      Sắp có
                    </span>
                  )}
                </Card>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-[#d5ddeb] bg-[#fbfcff] px-4 py-3">
            <p className="text-[11px] text-muted">
              Các Lektion tiếp theo sẽ được thêm bằng dữ liệu, không cần sửa giao diện.
            </p>
            <Link href="/lektion/1" className="text-[11px] font-bold text-primary hover:underline">
              Xem mục tiêu Lektion 1 →
            </Link>
          </div>
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy">Hoạt động gần đây</h2>
              <History className="h-4 w-4 text-[#8795ab]" aria-hidden="true" />
            </div>
            <p className="mt-0.5 text-[11px] text-muted">Nhật ký ôn tập tuần này</p>

            {data.activity.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={<Sparkles className="h-6 w-6" />}
                  title="Chưa có hoạt động"
                  description="Bắt đầu với một từ vựng hoặc một bộ bài tập, tiến độ sẽ xuất hiện tại đây."
                  action={
                    <Link href="/kursbuch/vocabulary" className={buttonClass({ size: "sm", variant: "soft" })}>
                      Học từ đầu
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-1">
                {data.activity.slice(0, 6).map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={entry.href}
                      className="flex items-start gap-2.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#f7f9fd]"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-soft text-[#5272a8]">
                        {activityIcons[entry.type]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold text-navy">{entry.title}</span>
                        <span className="mt-0.5 block text-[10px] text-muted">
                          {formatRelativeTime(entry.at)} · {entry.meta}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="border-[#f0e3b7] bg-warning-soft p-4">
            <div className="flex gap-2.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="text-[12px] font-bold text-[#7c5100]">Mẹo học nhanh Lektion 1</p>
                <p className="mt-1 text-[11px] leading-5 text-[#7c5100]">
                  Học 20 phút mỗi ngày mang lại hiệu quả bền vững hơn học dồn. Hãy đọc to các mẫu câu
                  “Wie heißen Sie?” và “Woher kommen Sie?”.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold text-navy">Dữ liệu học tập</p>
              <p className="text-[10px] text-muted">Lưu cục bộ trên trình duyệt này</p>
            </div>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-semibold text-danger hover:bg-danger-soft"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Đặt lại
            </button>
          </div>
        </aside>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Đặt lại toàn bộ tiến độ?"
        description="Thao tác này không thể hoàn tác trên trình duyệt hiện tại."
        width="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={reset}>
              Xóa toàn bộ tiến độ
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-[#f3c1ba] bg-danger-soft p-3 text-[12px] leading-5 text-danger">
          <p className="font-bold">Sẽ bị xóa:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Từ vựng và ngữ pháp đã đánh dấu học</li>
            <li>Kết quả tất cả bài tập, Reading, Listening</li>
            <li>Bản nháp và phản hồi Writing</li>
            <li>Danh sách tự đánh giá Speaking</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
