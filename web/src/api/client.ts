import type { ViewPayload } from "../types";

export async function loadView(): Promise<ViewPayload> {
  const response = await fetch("/api/view");
  if (!response.ok) throw new Error(`View request failed (${response.status})`);
  return response.json();
}

export async function loadNote(notePath: string): Promise<{ path: string; markdown: string }> {
  const response = await fetch(`/api/note?path=${encodeURIComponent(notePath)}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Note request failed (${response.status})`);
  return payload;
}

export function subscribeToView(onView: (payload: ViewPayload) => void, onState: (live: boolean) => void) {
  const source = new EventSource("/events");
  source.addEventListener("open", () => onState(true));
  source.addEventListener("error", () => onState(false));
  source.addEventListener("view", (event) => onView(JSON.parse((event as MessageEvent).data)));
  return () => source.close();
}
