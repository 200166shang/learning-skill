#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LearningService } from "./learning-service.mjs";
import { watchLearningFiles } from "./watcher.mjs";
import { detectRuntimeTransition } from "../../_shared/lib/runtime-transition.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "..", "dist");
const workspace = path.resolve(process.argv[2] || process.cwd());
const host = process.env.LEARNING_WEB_HOST || "127.0.0.1";
const port = Number(process.env.LEARNING_WEB_PORT || 4174);
const service = new LearningService(workspace);
const clients = new Set();
let view = service.buildView();
let transitions = [];

const json = (response, status, payload) => { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); response.end(JSON.stringify(payload)); };
const sendEvent = (response, event, payload) => response.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);

function refresh() {
  const next = service.buildView();
  const transition = detectRuntimeTransition(view.stack, next.stack);
  if (transition) transitions = [transition, ...transitions].slice(0, 30);
  view = next;
  for (const client of clients) sendEvent(client, "view", { view, transitions, transition });
}

function serveStatic(request, response) {
  const requested = request.url === "/" ? "index.html" : decodeURIComponent(request.url.slice(1));
  let target = path.resolve(dist, requested);
  if (!target.startsWith(`${dist}${path.sep}`)) { response.writeHead(403); return response.end("Forbidden"); }
  if (!existsSync(target) || statSync(target).isDirectory()) target = path.join(dist, "index.html");
  if (!existsSync(target)) { response.writeHead(503, { "content-type": "text/plain; charset=utf-8" }); return response.end("Web build not found. Run npm run build in web/ first."); }
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
  response.writeHead(200, { "content-type": types[path.extname(target)] || "application/octet-stream" });
  createReadStream(target).pipe(response);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
  if (request.method !== "GET") return json(response, 405, { error: "read-only observer" });
  if (url.pathname === "/api/view") return json(response, 200, { view, transitions });
  if (url.pathname === "/api/note") {
    try { return json(response, 200, await service.readNote(url.searchParams.get("path"))); }
    catch (error) { return json(response, error.statusCode || 500, { error: error.message }); }
  }
  if (url.pathname === "/events") {
    response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    clients.add(response);
    sendEvent(response, "view", { view, transitions, transition: null });
    request.on("close", () => clients.delete(response));
    return;
  }
  serveStatic(request, response);
});

const watcher = watchLearningFiles(workspace, refresh);
server.listen(port, host, () => process.stdout.write(`Learning Observer: http://${host}:${port}\nWorkspace: ${workspace}\n`));
const shutdown = async () => {
  for (const client of clients) client.end();
  clients.clear();
  await watcher.close();
  server.close();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
