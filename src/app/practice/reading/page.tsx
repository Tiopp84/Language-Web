import type { Metadata } from "next";
import { ReadingView } from "./reading-view";

export const metadata: Metadata = {
  title: "Luyện đọc · Reading",
};

export default function ReadingPage() {
  return <ReadingView />;
}
