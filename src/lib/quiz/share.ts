import { quizContent as content } from "@/data/quizContent";
import { results } from "./results";
import type { ResultType } from "./scoring";

export function resultUrl(type: ResultType, origin: string) {
  const url = new URL("/", origin);
  url.searchParams.set("result", type);
  return url.toString();
}
export async function copyResultLink(type: ResultType) {
  const url = resultUrl(type, window.location.origin);
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); return; }
  const field = document.createElement("textarea");
  field.value = url;
  field.className = "clipboard-field";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error(content.errors.copy);
}
export async function shareResult(type: ResultType) {
  if (navigator.share) {
    await navigator.share({ title: content.brand.name, text: results[type].summary, url: resultUrl(type, window.location.origin) });
    return "shared";
  }
  await copyResultLink(type);
  return "copied";
}