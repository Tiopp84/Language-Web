import type { Metadata } from "next";
import { Suspense } from "react";
import { VocabularyView } from "./vocabulary-view";

export const metadata: Metadata = {
  title: "Từ vựng Kursbuch",
};

export default function VocabularyPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-muted">Đang tải từ vựng…</div>}>
      <VocabularyView />
    </Suspense>
  );
}
