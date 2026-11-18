import { Heart, Sparkles, Sun, Gem } from "lucide-react";
import type { ResultType } from "@/lib/quiz/scoring";

const icons = { knowing: Heart, personality: Sparkles, bold: Sun, creative: Gem };
export function HouseIcon({ type, className }: { type: ResultType; className?: string }) {
  const Icon = icons[type];
  return <Icon className={className} aria-hidden="true" />;
}