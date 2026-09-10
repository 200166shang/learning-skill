import type { LearningView } from "../types";

export function StackPanel({ view }: { view: LearningView }) {
  const current = view.current;
  return <aside className="inspector">
    <section><div className="section-label">CURRENT STACK</div><div className="stack-list">{view.stack.length ? view.stack.map((frame, index) => <div className={`stack-frame ${index === view.stack.length - 1 ? "current-frame" : ""}`} key={frame.id}><span>{String(index + 1).padStart(2, "0")}</span><p>{frame.question}</p>{index < view.stack.length - 1 && <i>↓</i>}</div>) : <p className="muted">No active learning route.</p>}</div></section>
    <section className="signal-card why"><div className="section-label">WHY HERE</div><p>{current?.whyNeeded || "根问题就是当前出发点，不需要额外的下钻理由。"}</p></section>
    <section className="signal-card return"><div className="section-label">RETURN TO</div><p>{current?.resumeCheckpoint || current?.resumeQuestion || "当前位于根问题；完成后进入整体串联。"}</p></section>
  </aside>;
}
