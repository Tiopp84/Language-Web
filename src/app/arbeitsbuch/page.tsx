import type { Metadata } from "next";
import { Suspense } from "react";
import { ArbeitsbuchView } from "./arbeitsbuch-view";

export const metadata: Metadata = {
  title: "Thư viện bài tập Arbeitsbuch",
};

export default function ArbeitsbuchPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-muted">Đang tải bài tập…</div>}>
      <ArbeitsbuchView />
    </Suspense>
  );
}
