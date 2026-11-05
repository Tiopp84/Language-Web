import type { Metadata } from "next";
import { GrammarView } from "./grammar-view";

export const metadata: Metadata = {
  title: "Ngữ pháp Kursbuch",
};

export default function GrammarPage() {
  return <GrammarView />;
}
