import type { Metadata } from "next";
import { SpeakingView } from "./speaking-view";

export const metadata: Metadata = {
  title: "Luyện nói · Speaking",
};

export default function SpeakingPage() {
  return <SpeakingView />;
}
