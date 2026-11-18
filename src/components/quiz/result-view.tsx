import { quizContent as content } from "@/data/quizContent";
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
    catch (error) { if (error instanceof Error && error.name === "AbortError") return; setNotice(error instanceof Error ? error.message : content.errors.operation); }
  }
  async function createCard() {
    if (busy) return; setBusy(true);
    await act(async () => {
      const blob = await generateCard(type);
      setCard({ blob, url: URL.createObjectURL(blob) });
    }); setBusy(false);
  }
  const sections = [
    [content.result.sections[0], report.behavior], [content.result.sections[1], report.social],
    [content.result.sections[2], report.hidden], [content.result.sections[3], report.strength],
    [content.result.sections[4], report.contrast], [content.result.sections[5], report.roast],
  ];
  return <main className={`result-page house house-${type} fade-in`}>
    <div className="result-intro">
      <div className="ritual-label">{shared ? content.result.sharedRitual : content.result.ownRitual}</div>
      <div className="result-seal"><HouseIcon type={type} /></div>
      <p className="text-xs text-muted-foreground">{shared ? content.result.sharedLabel : content.result.ownLabel}</p>
      <h1 className="result-name">{report.name}</h1>
      <div className="result-english">{report.english}</div>
      <p className="result-member">{content.result.memberLabel} · {report.member}</p>
      <div className="keyword-list">{report.keywords.map((word) => <span key={word}>✧ {word}</span>)}</div>
      <h2 className="result-motto">「{report.motto}」</h2>
      <p className="result-description">{report.description}</p>
    </div>
    <div className="report-grid">{sections.map(([title, text]) => <section className="report-section" key={title}><h3>{title}</h3><p>{text}</p></section>)}</div>
    <p className="share-summary">{report.summary}</p>
    <div className="result-actions">
      <Button ref={generateRef} variant="ritual" onClick={createCard} disabled={busy}><Sparkles />{busy ? content.result.generating : content.result.generate}</Button>
      <Button variant="outline" size="lg" onClick={() => act(() => copyResultLink(type), content.result.copiedLong)}><Copy />{content.result.copy}</Button>
      <Button variant="outline" size="lg" onClick={() => act(async () => { const action = await shareResult(type); if (action === "copied") setNotice(content.result.copied); })}><Share2 />{content.result.share}</Button>
    </div>
    <div className="secondary-actions"><Button variant="ghost" onClick={onRestart}>{shared ? <ArrowRight /> : <RotateCcw />}{shared ? content.result.tryOwn : content.result.restart}</Button><Button variant="ghost" onClick={onHome}><Home />{content.result.home}</Button></div>
    <p className="disclaimer">{content.result.disclaimer[0]}<br />{content.result.disclaimer[1]}</p>
    {notice && <div className="notice" role="status">{notice}</div>}
    {card && <div className="card-dialog" onClick={() => setCard(null)}><div ref={dialogRef} className="card-dialog-content" role="dialog" aria-modal="true" aria-label={content.result.dialogLabel} onClick={(event) => event.stopPropagation()}>
      <Button className="card-close" variant="ghost" size="icon" aria-label={content.result.closeCard} onClick={() => setCard(null)}><X /></Button>
      <img src={card.url} alt={`${report.name}${content.result.cardAltSuffix}`} />
      <div className="card-dialog-actions"><Button variant="ritual" onClick={() => downloadCard(card.blob, type)}><Download />{content.result.download}</Button><Button variant="outline" onClick={() => act(async () => { if (!await shareCard(card.blob, type)) { downloadCard(card.blob, type); setNotice(content.result.downloaded); } })}><Share2 />{content.result.shareImage}</Button></div>
    </div></div>}
  </main>;
}