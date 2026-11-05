import type { Metadata } from "next";
import { WritingView } from "./writing-view";

export const metadata: Metadata = {
  title: "Luyện viết · Writing",
};

export default function WritingPage() {
  return <WritingView />;
}
