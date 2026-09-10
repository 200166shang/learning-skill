import type { Transition } from "../types";

export function Timeline({ transitions }: { transitions: Transition[] }) {
  const latest = transitions[0];
  return <footer className="timeline"><div className="section-label">LATEST TRANSITION</div>{latest ? <div className="timeline-event"><strong>{latest.type}</strong><time>{new Date(latest.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time><span>{latest.from || "Start"}</span><b>→</b><span>{latest.to || "Root complete"}</span></div> : <p className="muted">Watching for DIVE, BACKTRACK, or route changes…</p>}</footer>;
}
