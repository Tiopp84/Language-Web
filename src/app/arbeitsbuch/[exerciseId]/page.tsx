import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exercises } from "@/data/content";
import { ExerciseRunner } from "./exercise-runner";

export function generateStaticParams() {
  return exercises.map((exercise) => ({ exerciseId: exercise.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}): Promise<Metadata> {
  const { exerciseId } = await params;
  const exercise = exercises.find((item) => item.id === exerciseId);
  return { title: exercise ? exercise.title : "Bài tập" };
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const exercise = exercises.find((item) => item.id === exerciseId);
  if (!exercise) notFound();
  return <ExerciseRunner exercise={exercise} />;
}
