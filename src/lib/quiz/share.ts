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
  if (!copied) throw new Error("复制未成功，请长按地址栏复制链接");
}
export async function shareResult(type: ResultType) {
  if (navigator.share) {
    await navigator.share({ title: "K-pop 自己的分院帽", text: results[type].summary, url: resultUrl(type, window.location.origin) });
    return "shared";
  }
  await copyResultLink(type);
  return "copied";
}