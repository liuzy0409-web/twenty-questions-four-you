import { results } from "./results";
import type { ResultType } from "./scoring";

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  for (const character of text) {
    if (ctx.measureText(line + character).width > maxWidth && line) {
      ctx.fillText(line, x, y); y += lineHeight; line = character;
    } else line += character;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

export async function generateCard(type: ResultType): Promise<Blob> {
  await document.fonts.ready;
  const report = results[type];
  // Export colors are read from the same semantic tokens as the website.
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("此浏览器暂不支持图片生成");
  ctx.fillStyle = token("--background"); ctx.fillRect(0, 0, 1080, 1440);
  ctx.strokeStyle = token(`--house-${type}`); ctx.lineWidth = 2; ctx.strokeRect(48, 48, 984, 1344);
  ctx.strokeStyle = token("--border"); ctx.strokeRect(62, 62, 956, 1316);
  ctx.textAlign = "center";
  ctx.fillStyle = token("--muted-foreground"); ctx.font = '22px "Noto Sans SC", sans-serif';
  ctx.fillText("K-POP SORTING HAT  /  我的分院档案", 540, 132);
  ctx.fillStyle = token("--foreground"); ctx.font = '36px "Noto Serif SC", serif';
  ctx.fillText("K-pop 自己的分院帽", 540, 202);
  ctx.save(); ctx.translate(540, 370);
  ctx.strokeStyle = token(`--house-${type}`); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 98, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  for (let n = 0; n < 8; n += 1) {
    const angle = n * Math.PI / 4 - Math.PI / 2;
    const radius = n % 2 === 0 ? 69 : 20;
    const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius;
    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.stroke(); ctx.restore();
  ctx.fillStyle = token(`--house-${type}`); ctx.font = '104px "Noto Serif SC", serif';
  ctx.fillText(report.name, 540, 574);
  ctx.fillStyle = token("--muted-foreground"); ctx.font = '24px "Noto Sans SC", sans-serif'; ctx.fillText(report.english, 540, 628);
  ctx.fillStyle = token("--foreground"); ctx.font = '30px "Noto Sans SC", sans-serif'; ctx.fillText(report.member, 540, 694);
  ctx.font = '34px "Noto Serif SC", serif'; wrap(ctx, report.motto, 540, 800, 790, 58);
  ctx.fillStyle = token("--muted-foreground"); ctx.font = '28px "Noto Sans SC", sans-serif';
  wrap(ctx, report.description, 540, 956, 810, 49);
  ctx.fillStyle = token(`--house-${type}`); ctx.font = '23px "Noto Sans SC", sans-serif'; ctx.fillText(report.keywords.join("  ·  "), 540, 1218);
  ctx.fillStyle = token("--muted-foreground"); ctx.font = '19px "Noto Sans SC", sans-serif';
  ctx.fillText("知心 · 性情 · 大气 · 巧思，你是哪一种 K-pop 成分？", 540, 1304);
  ctx.font = '16px "Noto Sans SC", sans-serif'; ctx.fillText("娱乐向测试 · 不代表成员真实私下性格", 540, 1348);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("图片生成失败，请重试")), "image/png"));
}

export function downloadCard(blob: Blob, type: ResultType) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `K-pop分院帽-${results[type].name}.png`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export async function shareCard(blob: Blob, type: ResultType) {
  const file = new File([blob], `K-pop分院帽-${results[type].name}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({ files: [file], title: "K-pop 自己的分院帽" }); return true;
  }
  return false;
}