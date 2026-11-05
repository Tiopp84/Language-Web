"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookText,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Headphones,
  Lightbulb,
  Mic,
  NotebookPen,
  PenLine,
  Sparkles,
  Target,
} from "lucide-react";
import { exercises, grammarTopics, lesson, vocabulary } from "@/data/content";
import { useProgress } from "@/lib/progress";
import { Badge, Card, ProgressBar, ProgressRing, SectionHeading, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

function CourseCard({
  eyebrow,
  title,
  description,
  meta,
  progress,
  href,
  icon,
  tone,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: string;
  progress: number;
  href: string;
  icon: React.ReactNode;
  tone: "blue" | "violet" | "green" | "amber";
}) {
  const tones = {
    blue: "bg-soft text-[#2457b8]",
    violet: "bg-[#f2f0ff] text-[#6246c7]",
    green: "bg-primary-soft text-primary",
    amber: "bg-warning-soft text-warning",
  };
  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
          {icon}
        </span>
        {progress >= 100 ? (
          <Badge tone="success">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Hoàn thành
          </Badge>
        ) : progress > 0 ? (
          <Badge tone="primary">Đang học</Badge>
        ) : (
          <Badge tone="neutral">Chưa học</Badge>
        )}
      </div>
      {eyebrow ? (
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
      ) : null}
      <h3 className="mt-1 text-[14px] font-bold leading-5 text-navy">{title}</h3>
      <p className="mt-1 flex-1 text-[11px] leading-5 text-muted">{description}</p>
      {meta ? <p className="mt-2 text-[10px] font-semibold text-[#5272a8]">{meta}</p> : null}
      <ProgressBar value={progress} className="mt-3" label={title} />
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted">{Math.round(progress)}%</span>
        <Link href={href} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
          Mở
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

export function LessonOverview() {
  const { data, hydrated } = useProgress();
  const vocabPercent = (data.vocabLearned.length / vocabulary.length) * 100;
  const grammarPercent = (data.grammarRead.length / grammarTopics.length) * 100;
  const exercisePercent = (Object.keys(data.exerciseAttempts).length / exercises.length) * 100;
  const readingDone = Object.keys(data.readingAttempts).length;
  const listeningDone = Object.keys(data.listeningAttempts).length;
  const writingDone = Object.keys(data.writingRecords).length;
  const speakingDone = Object.keys(data.speakingChecks).length;
  const skillCount = readingDone + listeningDone + writingDone + speakingDone;
  const overall = Math.round(
    (vocabPercent + grammarPercent + exercisePercent + Math.min(100, skillCount * 25)) / 4,
  );
  const safe = (value: number) => (hydrated ? Math.round(value) : 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Tổng quan bài học</p>
          <h1 className="mt-1 text-[26px] font-extrabold tracking-[-0.03em] text-ink sm:text-[30px]">
            A1 – Lektion 1: Guten Tag!
          </h1>
        </div>
        <Badge tone="soft">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {lesson.bookReference}
        </Badge>
      </div>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-6 sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Mục tiêu của bài
            </p>
            <h2 className="mt-2 max-w-lg text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-navy sm:text-[28px]">
              Chào hỏi, giới thiệu bản thân và làm quen bằng tiếng Đức
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-6 text-muted">{lesson.subtitle}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex gap-2 text-[12px] leading-5 text-[#3f4d63]">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  {objective}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/kursbuch/vocabulary" className={buttonClass({ size: "lg" })}>
                Tiếp tục học ngay
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/arbeitsbuch" className={buttonClass({ variant: "secondary", size: "lg" })}>
                Làm bài tập
              </Link>
            </div>
          </div>

          <div className="relative min-h-[240px] overflow-hidden border-t border-line bg-[#eef3ff] lg:border-l lg:border-t-0">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5 p-3">
              <div className="flex flex-col justify-between rounded-xl bg-[#123e5c] p-3 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">Begrüßung</span>
                <div>
                  <p className="text-xl font-extrabold leading-tight">Guten Tag!</p>
                  <p className="mt-1 text-[10px] text-white/70">Chào hỏi trang trọng</p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl bg-[#dbe8ff] p-3 text-[#183c6b]">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5c7ba6]">Herkunft</span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">Woher kommen Sie?</p>
                  <p className="mt-1 text-[10px] text-[#5c7ba6]">Hỏi quê quán</p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl bg-[#e8f5ef] p-3 text-[#0d4f45]">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5c8c80]">Sprachen</span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">Ich spreche Deutsch.</p>
                  <p className="mt-1 text-[10px] text-[#5c8c80]">Giới thiệu ngôn ngữ</p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl bg-[#f5efdf] p-3 text-[#6b511d]">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9c8552]">Wohnort</span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">Ich wohne in Berlin.</p>
                  <p className="mt-1 text-[10px] text-[#9c8552]">Nơi sinh sống</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-5 right-5 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <ProgressRing value={safe(overall)} size={58} stroke={6}>
                  <span className="text-[12px] font-extrabold text-navy">{safe(overall)}%</span>
                </ProgressRing>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted">Tiến độ bài</p>
                  <p className="text-[12px] font-bold text-navy">Lektion 1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress detail anchor */}
      <section id="tien-do" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Tiến độ từng phần"
          title="Bạn đang ở đâu trong bài học?"
          description="Mỗi module hoạt động độc lập. Không cần hoàn thành phần này trước khi mở phần khác."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Từ vựng",
              value: `${data.vocabLearned.length}/${vocabulary.length}`,
              progress: vocabPercent,
              href: "/kursbuch/vocabulary",
              icon: <BookText className="h-4 w-4" />,
            },
            {
              label: "Ngữ pháp",
              value: `${data.grammarRead.length}/${grammarTopics.length}`,
              progress: grammarPercent,
              href: "/kursbuch/grammar",
              icon: <BookOpen className="h-4 w-4" />,
            },
            {
              label: "Bài tập",
              value: `${Object.keys(data.exerciseAttempts).length}/${exercises.length}`,
              progress: exercisePercent,
              href: "/arbeitsbuch",
              icon: <ClipboardCheck className="h-4 w-4" />,
            },
            {
              label: "4 kỹ năng",
              value: `${skillCount}/4`,
              progress: Math.min(100, skillCount * 25),
              href: "/practice/listening",
              icon: <Headphones className="h-4 w-4" />,
            },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="h-full p-4 transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                  {item.label}
                  <span className="text-[#5272a8]">{item.icon}</span>
                </div>
                <p className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-ink">
                  {hydrated ? item.value : "—"}
                </p>
                <ProgressBar value={hydrated ? item.progress : 0} className="mt-3" label={item.label} />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 1 Kursbuch */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-soft text-[10px] font-extrabold text-[#2457b8]">
            1
          </span>
          <h2 className="text-[17px] font-bold text-navy">Kursbuch — Kiến thức nền tảng</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CourseCard
            eyebrow="Từ vựng trọng tâm"
            title="Từ vựng Lektion 1"
            description="Chào hỏi, cảm ơn, tạm biệt, tên quốc gia, các thứ trong tuần và số đếm căn bản 0–20."
            meta={`${vocabulary.length} từ · ${data.vocabLearned.length} từ đã học`}
            progress={safe(vocabPercent)}
            href="/kursbuch/vocabulary"
            icon={<LanguageIcon />}
            tone="blue"
          />
          <CourseCard
            eyebrow="Ngữ pháp trọng tâm"
            title="Chia động từ & đại từ nhân xưng"
            description="Quy tắc chia động từ cơ bản ở thì hiện tại (sein, heißen, kommen, sprechen) và cách dùng ich, du, Sie."
            meta={`${grammarTopics.length} chủ điểm · ${data.grammarRead.length} đã đọc`}
            progress={safe(grammarPercent)}
            href="/kursbuch/grammar"
            icon={<BookOpen className="h-4.5 w-4.5" aria-hidden="true" />}
            tone="violet"
          />
        </div>
      </section>

      {/* Section 2 Arbeitsbuch */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f2f0ff] text-[10px] font-extrabold text-[#6246c7]">
            2
          </span>
          <h2 className="text-[17px] font-bold text-navy">Arbeitsbuch — Luyện tập & củng cố</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CourseCard
            eyebrow="Bài tập theo sách"
            title="Bài tập sách bài tập (Bài 1 – Bài 3)"
            description="Bài tập điền đuôi động từ, đối thoại hoàn chỉnh, ghép đôi từ vựng theo mục tiêu giáo trình."
            meta="3 bộ · 15 câu hỏi"
            progress={safe(
              (Object.keys(data.exerciseAttempts).filter((id) => id.startsWith("wb-")).length / 3) * 100,
            )}
            href="/arbeitsbuch?tab=workbook"
            icon={<NotebookPen className="h-4.5 w-4.5" aria-hidden="true" />}
            tone="violet"
          />
          <CourseCard
            eyebrow="Bài tập tự tạo"
            title="Bài tập tự tạo củng cố"
            description="Bộ bài tập trắc nghiệm thông minh: phản xạ chia động từ nhanh và xử lý hội thoại đời sống."
            meta="3 bộ · 13 câu hỏi"
            progress={safe(
              (Object.keys(data.exerciseAttempts).filter((id) => id.startsWith("ct-")).length / 3) * 100,
            )}
            href="/arbeitsbuch?tab=custom"
            icon={<ClipboardCheck className="h-4.5 w-4.5" aria-hidden="true" />}
            tone="amber"
          />
        </div>
      </section>

      {/* Section 3 Practice */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-extrabold text-primary">
            3
          </span>
          <h2 className="text-[17px] font-bold text-navy">Practice 4 Skills — Luyện bốn kỹ năng</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CourseCard
            eyebrow="1. Nghe (Hören)"
            title="Nghe chép chính tả"
            description="Hội thoại chào hỏi tại sân bay và quán cà phê. So sánh từ đúng, sai, thiếu và thừa."
            meta="1 bài nghe"
            progress={listeningDone ? 100 : 0}
            href="/practice/listening"
            icon={<Headphones className="h-4.5 w-4.5" aria-hidden="true" />}
            tone="green"
          />
          <CourseCard
            eyebrow="2. Đọc (Lesen)"
            title="Đọc hiểu hồ sơ cá nhân"
            description="Đọc phần tự giới thiệu của Jan và Nicole, trả lời câu hỏi đúng/sai và trắc nghiệm."
            meta="1 bài đọc · 4 câu hỏi"
            progress={readingDone ? 100 : 0}
            href="/practice/reading"
            icon={<BookOpen className="h-4.5 w-4.5" aria-hidden="true" />}
            tone="blue"
          />
          <CourseCard
            eyebrow="3. Viết (Schreiben)"
            title="Viết đoạn giới thiệu bản thân"
            description="Viết 3–5 câu tự giới thiệu: họ tên, đến từ đâu, nơi sinh sống và ngôn ngữ đang nói."
            meta="2 đề · Phản hồi có cấu trúc"
            progress={writingDone ? 100 : 0}
            href="/practice/writing"
            icon={<PenLine className="h-4.5 w-4.5" aria-hidden="true" />}
            tone="violet"
          />
          <CourseCard
            eyebrow="4. Nói (Sprechen)"
            title="Shadowing & đề nói A1"
            description="Nghe, nhắc lại và tự luyện hội thoại theo mẫu. Không chấm điểm, không gửi giọng nói lên server."
            meta="6 mẫu câu · 3 đề"
            progress={speakingDone ? 100 : 0}
            href="/practice/speaking"
            icon={<Mic className="h-4.5 w-4.5" aria-hidden="true" />}
            tone="amber"
          />
        </div>
      </section>

      <Card className="flex flex-wrap items-center gap-3 border-[#f0e3b7] bg-warning-soft p-4">
        <Lightbulb className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-[#7c5100]">Mẹo học nhanh Lektion 1</p>
          <p className="mt-0.5 text-[11px] leading-5 text-[#7c5100]">
            Đọc to các mẫu câu chào hỏi, sau đó tự giới thiệu bản thân mà không nhìn giấy. Việc nghe lại và
            nhắc lại giúp ghi nhớ trật tự từ tự nhiên hơn.
          </p>
        </div>
        <Link href="/practice/speaking" className={buttonClass({ size: "sm", variant: "secondary" })}>
          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          Luyện nói
        </Link>
      </Card>
    </div>
  );
}

function LanguageIcon() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="text-[12px] font-extrabold">A</span>
      <span className="text-[10px] font-bold">文</span>
    </span>
  );
}
