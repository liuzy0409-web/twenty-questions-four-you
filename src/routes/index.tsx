import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Gem, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseIcon } from "@/components/quiz/house-icon";
import { ResultView } from "@/components/quiz/result-view";
import hat from "@/assets/sorting-hat.png.asset.json";
import { questions } from "@/lib/quiz/questions";
import { results } from "@/lib/quiz/results";
import { calculateResult, isResultType, types } from "@/lib/quiz/scoring";
import { clearProgress, emptyProgress, loadProgress, saveProgress, type Progress } from "@/lib/quiz/progress";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { result?: string | undefined; step?: string | undefined } => ({
    result: isResultType(search["result"]) ? search["result"] : undefined,
    step: search["step"] === "quiz" ? "quiz" : undefined,
  }),
  head: ({ match }) => {
    const type = match.search.result;
    const title = isResultType(type) ? `${results[type].name}｜K-pop 自己的分院帽` : "K-pop 自己的分院帽｜知心 · 性情 · 大气 · 巧思测试";
    const description = isResultType(type) ? results[type].summary : "20 道 K-pop 情境题，3–5 分钟发现你的粉丝人格。知心、性情、大气、巧思，你是哪一种成分？";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: Index,
});

function Index() {
  const { result, step } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ownResult, setOwnResult] = useState<string | null>(null);
  useEffect(() => { const previous = loadProgress(); if (previous) { setProgress(previous); setSaved(previous.answers.some((a) => a !== null)); } setReady(true); }, []);
  useEffect(() => {
    if (ready && step === "quiz") {
      saveProgress(progress);
      setSaved(progress.answers.some((answer) => answer !== null));
    }
  }, [progress, ready, step]);
  const home = () => { navigate({ search: {} }); window.scrollTo(0, 0); };
  const start = (fresh = false) => {
    if (fresh) { clearProgress(); setProgress(emptyProgress()); setSaved(false); }
    setOwnResult(null); navigate({ search: { step: "quiz" } }); window.scrollTo(0, 0);
  };
  const question = questions[progress.index];
  const selected = progress.answers[progress.index];
  const next = () => {
    if (selected === null || !ready) return;
    if (progress.index === 19) {
      const computed = calculateResult(progress.answers); setOwnResult(computed.type);
      clearProgress(); setSaved(false); setProgress(emptyProgress());
      navigate({ search: { result: computed.type } }); window.scrollTo(0, 0);
    } else { setProgress((old) => ({ ...old, index: old.index + 1 })); window.scrollTo(0, 0); }
  };
  return <div className="site-shell">
    <header className="site-header"><Button variant="ghost" className="brand h-auto px-0 hover:bg-transparent" onClick={home} aria-label="返回分院帽首页"><Sparkles className="brand-mark" /><span className="text-left"><span className="brand-name">K-pop 自己的分院帽</span><span className="brand-caption">K-POP SORTING HAT</span></span></Button><div className="header-note"><Star size={12} /><span className="note-long">只测你，不测爱豆</span><span>FOR EVERY FAN</span></div></header>
    {isResultType(result) ? <ResultView key={result} type={result} shared={ownResult !== result} onRestart={() => start(true)} onHome={home} /> : step === "quiz" && question ? <main className="quiz-page fade-in">
      <div className="quiz-meta"><span>分院进行中 · {question.theme}</span><span className="question-count">{String(progress.index + 1).padStart(2, "0")} <small>/ 20</small></span></div>
      <div className="progress-track"><progress value={progress.index + 1} max={20} aria-label="答题进度" /></div>
      <div key={progress.index} className="fade-in"><div className="ritual-label">听见你的第一直觉</div><h1 className="question-title">{question.title}</h1>
      <div className="question-options">{question.options.map((option, index) => <Button key={index} variant="option" aria-pressed={selected === index} disabled={!ready} onClick={() => setProgress((old) => ({ ...old, answers: old.answers.map((answer, i) => i === old.index ? index : answer) }))}><span className="option-letter">{selected === index ? <Check size={15} /> : String.fromCharCode(65 + index)}</span><span>{option}</span></Button>)}</div></div>
      <div className="question-navigation"><Button variant="ghost" disabled={progress.index === 0} onClick={() => setProgress((old) => ({ ...old, index: Math.max(0, old.index - 1) }))}><ArrowLeft />上一题</Button><Button variant="ritual" disabled={selected === null || !ready} onClick={next}>{progress.index === 19 ? "揭晓我的分院" : "下一题"}<ArrowRight /></Button></div>
      <p className="quiz-hint">没有标准答案，只有你的真实成分。✧</p>
    </main> : <main>
      <section className="home-hero fade-in"><img className="hero-art" src={hat.url} alt="原创紫水晶魔法分院帽，环绕银色星轨" fetchPriority="high" /><div className="hero-topline">A LITTLE MAGIC. A LOT OF YOU.</div><div className="art-space"><span className="art-annotation left">EST. 2026</span><span className="art-annotation right">YOUR TRUE SELF</span></div><div className="ritual-label">属于 K-pop 粉丝的分院仪式</div><h1 className="home-title">K-pop 自己的分院帽</h1><p className="home-subtitle"><em>知心、性情、大气、巧思，</em>你是哪一种 K-pop 成分？</p><p className="home-intro">欢迎来到 K-pop 分院帽！<br />不管你是追了十年的老粉，还是刚刚入坑的新粉；不管你是唯粉、团粉、全员推，<br className="hidden sm:block" />还是今天喜欢这个明天爬墙那个，都可以来测测自己的成分。</p><div className="test-facts"><span><Gem size={13} />20 道情境题</span><span><Clock3 size={13} />约 3–5 分钟</span><span><Sparkles size={13} />4 种人格结果</span></div><Button variant="ritual" onClick={() => start()} disabled={!ready}><Sparkles />{saved ? "继续我的分院" : "开始分院"}<ArrowRight /></Button><p className="start-footnote">准备好接受分院了吗？让你的直觉替你回答。</p></section>
      <section className="house-section"><div className="section-heading"><h2><Sparkles size={15} />四种成分，四种闪耀方式</h2><span>THE FOUR HOUSES</span></div><div className="house-grid">{types.map((type, i) => <article className={`house house-${type} house-preview`} key={type}><span className="house-index">0{i + 1}</span><HouseIcon type={type} className="house-icon" /><h3>{results[type].name}</h3><div className="member">{results[type].member}</div><p>{results[type].teaser}</p></article>)}</div></section>
    </main>}
    <footer className="site-footer"><span>✧ 娱乐向人格测试 · 不代表成员真实私下性格</span><span>每一种喜欢，都有自己的光。 &nbsp; K-POP SORTING HAT</span></footer>
  </div>;
}
