import { quizContent as content } from "@/data/quizContent";
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
    const title = isResultType(type) ? `${results[type].name}｜${content.brand.name}` : content.meta.title;
    const description = isResultType(type) ? results[type].summary : content.meta.description;
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
    if (selected === null || selected === undefined || !ready) return;
    if (progress.index === 19) {
      const computed = calculateResult(progress.answers); setOwnResult(computed.type);
      clearProgress(); setSaved(false); setProgress(emptyProgress());
      navigate({ search: { result: computed.type } }); window.scrollTo(0, 0);
    } else { setProgress((old) => ({ ...old, index: old.index + 1 })); window.scrollTo(0, 0); }
  };
  return <div className="site-shell">
    <header className="site-header"><Button variant="ghost" className="brand h-auto px-0 hover:bg-transparent" onClick={home} aria-label={content.header.homeLabel}><Sparkles className="brand-mark" /><span className="text-left"><span className="brand-name">{content.brand.name}</span><span className="brand-caption">{content.brand.english}</span></span></Button><div className="header-note"><Star size={12} /><span className="note-long">{content.header.note}</span><span>{content.header.audience}</span></div></header>
    {isResultType(result) ? <ResultView key={result} type={result} shared={ownResult !== result} onRestart={() => start(true)} onHome={home} /> : step === "quiz" && question ? <main className="quiz-page fade-in">
      <div className="quiz-meta"><span>{content.quiz.inProgress} · {question.theme}</span><span className="question-count">{String(progress.index + 1).padStart(2, "0")} <small>/ 20</small></span></div>
      <div className="progress-track"><progress value={progress.index + 1} max={20} aria-label={content.quiz.progressLabel} /></div>
      <div key={progress.index} className="fade-in"><div className="ritual-label">{content.quiz.ritual}</div><h1 className="question-title">{question.title}</h1>
      <div className="question-options">{question.options.map((option, index) => <Button key={index} variant="option" aria-pressed={selected === index} disabled={!ready} onClick={() => setProgress((old) => ({ ...old, answers: old.answers.map((answer, i) => i === old.index ? index : answer) }))}><span className="option-letter">{selected === index ? <Check size={15} /> : content.quiz.letters[index]}</span><span>{option}</span></Button>)}</div></div>
      <div className="question-navigation"><Button variant="ghost" disabled={progress.index === 0} onClick={() => setProgress((old) => ({ ...old, index: Math.max(0, old.index - 1) }))}><ArrowLeft />{content.quiz.previous}</Button><Button variant="ritual" disabled={selected === null || !ready} onClick={next}>{progress.index === 19 ? content.quiz.finish : content.quiz.next}<ArrowRight /></Button></div>
      <p className="quiz-hint">{content.quiz.hint}</p>
    </main> : <main>
      <section className="home-hero fade-in"><img className="hero-art" src={hat.url} alt={content.home.imageAlt} fetchPriority="high" /><div className="hero-topline">{content.home.topline}</div><div className="art-space"><span className="art-annotation left">{content.home.leftAnnotation}</span><span className="art-annotation right">{content.home.rightAnnotation}</span></div><div className="ritual-label">{content.home.ritual}</div><h1 className="home-title">{content.brand.name}</h1><p className="home-subtitle"><em>{content.home.subtitleLead}</em>{content.home.subtitleEnd}</p><p className="home-intro">{content.home.intro[0]}<br />{content.home.intro[1]}<br className="hidden sm:block" />{content.home.intro[2]}</p><div className="test-facts"><span><Gem size={13} />{content.home.facts[0]}</span><span><Clock3 size={13} />{content.home.facts[1]}</span><span><Sparkles size={13} />{content.home.facts[2]}</span></div><Button variant="ritual" onClick={() => start()} disabled={!ready}><Sparkles />{saved ? content.home.resume : content.home.start}<ArrowRight /></Button><p className="start-footnote">{content.home.footnote}</p></section>
      <section className="house-section"><div className="section-heading"><h2><Sparkles size={15} />{content.home.housesTitle}</h2><span>{content.home.housesEnglish}</span></div><div className="house-grid">{types.map((type, i) => <article className={`house house-${type} house-preview`} key={type}><span className="house-index">0{i + 1}</span><HouseIcon type={type} className="house-icon" /><h3>{results[type].name}</h3><div className="member">{results[type].member}</div><p>{results[type].teaser}</p></article>)}</div></section>
    </main>}
    <footer className="site-footer"><span>{content.footer.disclaimer}</span><span>{content.footer.motto} &nbsp; {content.brand.english}</span></footer>
  </div>;
}
