import type { Metadata } from "next";
import { getGeminiModel, isGeminiConfigured } from "@/lib/writing-ai-config";
import { WritingView } from "./writing-view";

export const metadata: Metadata = {
  title: "Luyện viết · Writing",
};

export default function WritingPage() {
  const aiConfigured = isGeminiConfigured();
  return (
    <WritingView
      aiConfigured={aiConfigured}
      aiModel={aiConfigured ? getGeminiModel() : "local-demo-v1"}
    />
  );
}
