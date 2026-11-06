import type { Metadata } from "next";
import { getWritingAiConfig } from "@/lib/writing-ai-config";
import { WritingView } from "./writing-view";

export const metadata: Metadata = {
  title: "Luyện viết · Writing",
};

export default function WritingPage() {
  const config = getWritingAiConfig();
  return (
    <WritingView
      aiConfigured={Boolean(config)}
      aiModel={config?.model ?? "local-demo-v1"}
      aiLabel={config?.label ?? "AI"}
    />
  );
}
