"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WritingReview } from "@/lib/writing-review";

const STORAGE_KEY = "language-web:progress:v1";

export type SkillName = "reading" | "listening";

export interface ExerciseAttempt {
  exerciseId: string;
  correct: number;
  total: number;
  completedAt: string;
  answers: Record<string, string | string[]>;
}

export interface SkillAttempt {
  contentId: string;
  skill: SkillName;
  correct: number;
  total: number;
  completedAt: string;
}

export interface WritingRecord {
  promptId: string;
  original: string;
  review: WritingReview;
  updatedAt: string;
}

export type ActivityType =
  | "vocabulary"
  | "grammar"
  | "exercise"
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  meta: string;
  href: string;
  at: string;
}

export interface ProgressData {
  version: 1;
  vocabLearned: string[];
  grammarRead: string[];
  exerciseAttempts: Record<string, ExerciseAttempt>;
  readingAttempts: Record<string, SkillAttempt>;
  listeningAttempts: Record<string, SkillAttempt>;
  writingDrafts: Record<string, string>;
  writingRecords: Record<string, WritingRecord>;
  speakingChecks: Record<string, string[]>;
  activity: ActivityEntry[];
}

const emptyProgress: ProgressData = {
  version: 1,
  vocabLearned: [],
  grammarRead: [],
  exerciseAttempts: {},
  readingAttempts: {},
  listeningAttempts: {},
  writingDrafts: {},
  writingRecords: {},
  speakingChecks: {},
  activity: [],
};

function isProgressData(value: unknown): value is ProgressData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProgressData>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.vocabLearned) &&
    Array.isArray(candidate.grammarRead) &&
    typeof candidate.exerciseAttempts === "object" &&
    typeof candidate.writingDrafts === "object" &&
    Array.isArray(candidate.activity)
  );
}

function loadProgress(): { data: ProgressData; error: string | null } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: emptyProgress, error: null };
    const parsed = JSON.parse(raw);
    if (!isProgressData(parsed)) {
      return {
        data: emptyProgress,
        error: "Dữ liệu tiến độ cũ không đúng định dạng. Đã bắt đầu với dữ liệu trống.",
      };
    }
    return { data: { ...emptyProgress, ...parsed }, error: null };
  } catch {
    return {
      data: emptyProgress,
      error:
        "Không đọc được tiến độ đã lưu trong trình duyệt. Bạn vẫn có thể học, nhưng tiến độ mới có thể không được giữ lại.",
    };
  }
}

function pushActivity(
  data: ProgressData,
  entry: Omit<ActivityEntry, "id" | "at">,
): ActivityEntry[] {
  const next: ActivityEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  };
  return [next, ...data.activity].slice(0, 12);
}

interface ProgressContextValue {
  data: ProgressData;
  hydrated: boolean;
  storageError: string | null;
  clearStorageError: () => void;
  isVocabLearned: (id: string) => boolean;
  toggleVocabLearned: (id: string, label: string) => void;
  isGrammarRead: (id: string) => boolean;
  toggleGrammarRead: (id: string, label: string) => void;
  saveExerciseAttempt: (
    exerciseId: string,
    correct: number,
    total: number,
    answers: Record<string, string | string[]>,
    title: string,
  ) => void;
  saveSkillAttempt: (
    skill: SkillName,
    contentId: string,
    correct: number,
    total: number,
    title: string,
  ) => void;
  saveWritingDraft: (promptId: string, text: string) => void;
  saveWritingReview: (promptId: string, original: string, review: WritingReview, title: string) => void;
  saveSpeakingChecks: (itemId: string, checks: string[], title: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const { data: loaded, error } = loadProgress();
    setData(loaded);
    setStorageError(error);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setStorageError(
        "Không thể lưu tiến độ vào trình duyệt (bộ nhớ đầy hoặc quyền lưu bị chặn). Dữ liệu chưa được ghi lại.",
      );
    }
  }, [data, hydrated]);

  const update = useCallback((mutator: (previous: ProgressData) => ProgressData) => {
    setData((previous) => mutator(previous));
  }, []);

  const isVocabLearned = useCallback(
    (id: string) => data.vocabLearned.includes(id),
    [data.vocabLearned],
  );
  const isGrammarRead = useCallback(
    (id: string) => data.grammarRead.includes(id),
    [data.grammarRead],
  );

  const toggleVocabLearned = useCallback(
    (id: string, label: string) => {
      update((previous) => {
        const learned = previous.vocabLearned.includes(id);
        return {
          ...previous,
          vocabLearned: learned
            ? previous.vocabLearned.filter((item) => item !== id)
            : [...previous.vocabLearned, id],
          activity: learned
            ? previous.activity
            : pushActivity(previous, {
                type: "vocabulary",
                title: `Đã học từ vựng: ${label}`,
                meta: "Kursbuch · Từ vựng",
                href: "/kursbuch/vocabulary",
              }),
        };
      });
    },
    [update],
  );

  const toggleGrammarRead = useCallback(
    (id: string, label: string) => {
      update((previous) => {
        const read = previous.grammarRead.includes(id);
        return {
          ...previous,
          grammarRead: read
            ? previous.grammarRead.filter((item) => item !== id)
            : [...previous.grammarRead, id],
          activity: read
            ? previous.activity
            : pushActivity(previous, {
                type: "grammar",
                title: `Đã học ngữ pháp: ${label}`,
                meta: "Kursbuch · Ngữ pháp",
                href: "/kursbuch/grammar",
              }),
        };
      });
    },
    [update],
  );

  const saveExerciseAttempt = useCallback(
    (
      exerciseId: string,
      correct: number,
      total: number,
      answers: Record<string, string | string[]>,
      title: string,
    ) => {
      update((previous) => ({
        ...previous,
        exerciseAttempts: {
          ...previous.exerciseAttempts,
          [exerciseId]: {
            exerciseId,
            correct,
            total,
            answers,
            completedAt: new Date().toISOString(),
          },
        },
        activity: pushActivity(previous, {
          type: "exercise",
          title: `Hoàn thành: ${title}`,
          meta: `${correct}/${total} câu đúng · Arbeitsbuch`,
          href: `/arbeitsbuch/${exerciseId}`,
        }),
      }));
    },
    [update],
  );

  const saveSkillAttempt = useCallback(
    (
      skill: SkillName,
      contentId: string,
      correct: number,
      total: number,
      title: string,
    ) => {
      update((previous) => {
        const attempt: SkillAttempt = {
          contentId,
          skill,
          correct,
          total,
          completedAt: new Date().toISOString(),
        };
        return {
          ...previous,
          [skill === "reading" ? "readingAttempts" : "listeningAttempts"]: {
            ...(skill === "reading" ? previous.readingAttempts : previous.listeningAttempts),
            [contentId]: attempt,
          },
          activity: pushActivity(previous, {
            type: skill,
            title,
            meta: `${correct}/${total} · Practice 4 Skills`,
            href: `/practice/${skill}`,
          }),
        };
      });
    },
    [update],
  );

  const saveWritingDraft = useCallback(
    (promptId: string, text: string) => {
      update((previous) => ({
        ...previous,
        writingDrafts: { ...previous.writingDrafts, [promptId]: text },
      }));
    },
    [update],
  );

  const saveWritingReview = useCallback(
    (promptId: string, original: string, review: WritingReview, title: string) => {
      update((previous) => ({
        ...previous,
        writingRecords: {
          ...previous.writingRecords,
          [promptId]: {
            promptId,
            original,
            review,
            updatedAt: new Date().toISOString(),
          },
        },
        activity: pushActivity(previous, {
          type: "writing",
          title: `Chấm bài viết: ${title}`,
          meta: `${review.score}/10 · Practice 4 Skills`,
          href: "/practice/writing",
        }),
      }));
    },
    [update],
  );

  const saveSpeakingChecks = useCallback(
    (itemId: string, checks: string[], title: string) => {
      update((previous) => ({
        ...previous,
        speakingChecks: { ...previous.speakingChecks, [itemId]: checks },
        activity: pushActivity(previous, {
          type: "speaking",
          title: `Tự luyện nói: ${title}`,
          meta: `${checks.length} tiêu chí tự đánh giá · Speaking`,
          href: "/practice/speaking",
        }),
      }));
    },
    [update],
  );

  const resetProgress = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // State vẫn được reset; banner lỗi sẽ hiện nếu lần ghi sau thất bại.
    }
    setData(emptyProgress);
    setStorageError(null);
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      data,
      hydrated,
      storageError,
      clearStorageError: () => setStorageError(null),
      isVocabLearned,
      toggleVocabLearned,
      isGrammarRead,
      toggleGrammarRead,
      saveExerciseAttempt,
      saveSkillAttempt,
      saveWritingDraft,
      saveWritingReview,
      saveSpeakingChecks,
      resetProgress,
    }),
    [
      data,
      hydrated,
      storageError,
      isVocabLearned,
      toggleVocabLearned,
      isGrammarRead,
      toggleGrammarRead,
      saveExerciseAttempt,
      saveSkillAttempt,
      saveWritingDraft,
      saveWritingReview,
      saveSpeakingChecks,
      resetProgress,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}
