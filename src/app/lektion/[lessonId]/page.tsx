import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonOverview } from "./lesson-overview";

export const metadata: Metadata = {
  title: "Tổng quan Lektion 1",
};

export function generateStaticParams() {
  return [{ lessonId: "1" }];
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  if (lessonId !== "1") notFound();
  return <LessonOverview />;
}
