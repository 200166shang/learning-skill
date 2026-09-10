import { ReactFlowProvider } from "@xyflow/react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { loadNote, loadView, subscribeToView } from "./api/client";
import { LearningGraph } from "./graph/LearningGraph";
import { StackPanel } from "./stack/StackPanel";
import { Timeline } from "./timeline/Timeline";
import type { LearningNode, LearningView, Transition } from "./types";

export default function App() {
  const [view, setView] = useState<LearningView | null>(null);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const [note, setNote] = useState<{ path: string; html: string } | null>(null);

  useEffect(() => {
    loadView().then((payload) => { setView(payload.view); setTransitions(payload.transitions); }).catch((reason) => setError(reason.message));
    return subscribeToView((payload) => { setView(payload.view); setTransitions(payload.transitions); setTransition(payload.transition || null); setError(null); }, setLive);
  }, []);

  const openNode = async (node: LearningNode) => {
    if (!node.notePath) return;
    try { const result = await loadNote(node.notePath); setNote({ path: result.path, html: DOMPurify.sanitize(await marked.parse(result.markdown)) }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
  };

  if (!view) return <main className="boot"><div className="boot-mark">↳</div><p>{error || "Reading the learning trace…"}</p></main>;
  return <main className="app-shell">
    <header className="topbar">
      <div><div className="eyebrow">RECURSIVE UNDERSTANDING / LIVE TRACE</div><h1>Learning Observer</h1></div>
      <div className="top-actions"><button onClick={() => navigator.clipboard.writeText(view.current?.question || "")} disabled={!view.current}>COPY QUESTION</button><button onClick={() => setFocusRequest((value) => value + 1)} disabled={!view.current}>FOCUS CURRENT</button><span className={`live-pill ${live ? "is-live" : ""}`}><i />{live ? "LIVE" : "RECONNECTING"}</span><span className="depth">DEPTH <b>{view.current?.depth || 0}</b></span></div>
    </header>
    {error && <div className="error-banner">{error}</div>}
    <div className="workbench">
      <section className="canvas-panel"><div className="canvas-caption"><span>UNDERSTANDING GRAPH</span><em>{view.graph.nodes.length} explored questions</em></div><ReactFlowProvider><LearningGraph view={view} transition={transition} focusRequest={focusRequest} onNode={openNode} /></ReactFlowProvider></section>
      <StackPanel view={view} />
    </div>
    {view.warnings.length > 0 && <details className="warnings"><summary>{view.warnings.length} model warning{view.warnings.length > 1 ? "s" : ""}</summary>{view.warnings.map((warning) => <p key={warning}>{warning}</p>)}</details>}
    <Timeline transitions={transitions} />
    {note && <div className="note-scrim" onMouseDown={() => setNote(null)}><article className="note-preview" onMouseDown={(event) => event.stopPropagation()}><header><div><span>KNOWLEDGE NOTE / READ ONLY</span><p>{note.path}</p></div><button onClick={() => setNote(null)}>CLOSE</button></header><div className="markdown" dangerouslySetInnerHTML={{ __html: note.html }} /></article></div>}
  </main>;
}
