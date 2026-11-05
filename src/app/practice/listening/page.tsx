import type { Metadata } from "next";
import { ListeningView } from "./listening-view";

export const metadata: Metadata = {
  title: "Luyện nghe · Dictation",
};

export default function ListeningPage() {
  return <ListeningView />;
}
