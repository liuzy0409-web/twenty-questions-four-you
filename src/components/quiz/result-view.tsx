import { useEffect, useRef, useState } from "react";
import { ArrowRight, Copy, Download, Home, RotateCcw, Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { results } from "@/lib/quiz/results";
import type { ResultType } from "@/lib/quiz/scoring";
import { copyResultLink, shareResult } from "@/lib/quiz/share";
import { downloadCard, generateCard, shareCard } from "@/lib/quiz/card";
import { HouseIcon } from "./house-icon";

export function ResultView({ type, shared, onRestart, onHome }: { type: ResultType; shared: boolean; onRestart: () => void; onHome: () => void }) {
  const report = results[type];
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState<{ blob: Blob; url: string } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const generateRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => () => { if (card) URL.revokeObjectURL(card.url); }, [card]);
  useEffect(() => {
    if (!card) return;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCard(null);
      if (event.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); generateRef.current?.focus(); };
  }, [card]);
  async function act(action: () => Promise<unknown>, success?: string) {
    try { await action(); if (success) setNotice(success); }
    catch (error) { if (error instanceof Error && error.name === "AbortError") return; setNotice(error instanceof Error ? error.message : "操作未成功，请重试"); }
  }
  async function createCard() {
    if (busy) return; setBusy(true);
    await act(async () => {
      const blob = await generateCard(type);
      setCard({ blob, url: URL.createObjectURL(blob) });
    }); setBusy(false);
  }
  const sections = [
    ["01 / 你的追星行为画像", report.behavior], ["02 / 你的饭圈社交风格", report.social],
    ["03 / 你的隐藏属性", report.hidden], ["04 / 你的优势", report.strength],
    ["05 / 你的反差点", report.contrast], ["06 / 分院帽的友善锐评", report.roast],
  ];
  return <main className={`result-page house house-${type} fade-in`}>
    <div className="result-intro">
      <div className="ritual-label">{shared ? "一份来自朋友的分院档案" : "分院仪式已完成"}</div>
      <div className="result-seal"><HouseIcon type={type} /></div>
      <p className="text-xs text-muted-foreground">{shared ? "TA 的 K-pop 成分是" : "你的 K-pop 成分是"}</p>
      <h1 className="result-name">{report.name}</h1>
      <div className="result-english">{report.english}</div>
      <p className="result-member">对应成员 · {report.member}</p>
      <div className="keyword-list">{report.keywords.map((word) => <span key={word}>✧ {word}</span>)}</div>
      <h2 className="result-motto">「{report.motto}」</h2>
      <p className="result-description">{report.description}</p>
    </div>
    <div className="report-grid">{sections.map(([title, text]) => <section className="report-section" key={title}><h3>{title}</h3><p>{text}</p></section>)}</div>
    <p className="share-summary">{report.summary}</p>
    <div className="result-actions">
      <Button ref={generateRef} variant="ritual" onClick={createCard} disabled={busy}><Sparkles />{busy ? "正在制作你的卡片…" : "生成我的结果卡片"}</Button>
      <Button variant="outline" size="lg" onClick={() => act(() => copyResultLink(type), "结果链接已复制，快分享给同担吧！")}><Copy />复制结果链接</Button>
      <Button variant="outline" size="lg" onClick={() => act(async () => { const action = await shareResult(type); if (action === "copied") setNotice("结果链接已复制"); })}><Share2 />分享结果</Button>
    </div>
    <div className="secondary-actions"><Button variant="ghost" onClick={onRestart}>{shared ? <ArrowRight /> : <RotateCcw />}{shared ? "我也来测" : "重新测试"}</Button><Button variant="ghost" onClick={onHome}><Home />返回首页</Button></div>
    <p className="disclaimer">本测试仅供娱乐，测的是你本人。<br />人格分类不代表对应 aespa 成员真实私下性格。</p>
    {notice && <div className="notice" role="status">{notice}</div>}
    {card && <div className="card-dialog" onClick={() => setCard(null)}><div ref={dialogRef} className="card-dialog-content" role="dialog" aria-modal="true" aria-label="我的分院结果卡片" onClick={(event) => event.stopPropagation()}>
      <Button className="card-close" variant="ghost" size="icon" aria-label="关闭结果卡片" onClick={() => setCard(null)}><X /></Button>
      <img src={card.url} alt={`${report.name}分院结果分享卡片`} />
      <div className="card-dialog-actions"><Button variant="ritual" onClick={() => downloadCard(card.blob, type)}><Download />下载 PNG</Button><Button variant="outline" onClick={() => act(async () => { if (!await shareCard(card.blob, type)) { downloadCard(card.blob, type); setNotice("已下载图片，可保存后分享"); } })}><Share2 />分享图片</Button></div>
    </div></div>}
  </main>;
}