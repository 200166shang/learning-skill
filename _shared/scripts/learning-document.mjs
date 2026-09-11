#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  commitLearningDocument, inspectLearningDocument, LEARNING_DOCUMENT_INPUT_SCHEMA, recoverLearningDocument,
} from "../lib/learning-document-runtime.mjs";

const HELP = `usage:
  learning-document.mjs inspect <workspace> [--document notes/topic.md] [--section NAME] [--max-bytes N]
  learning-document.mjs commit <workspace> --input draft.json
  learning-document.mjs recover <workspace>
  learning-document.mjs schema

inspect and schema are read-only. commit creates a document or appends/replaces one exact,
unique section using expectedRevision and operationId. recover completes an interrupted commit.
Use expectedRevision "absent", mode "create", and title for a new document.`;

function value(args, flag) {
  const index = args.indexOf(flag); if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`${flag} requires a value`);
  return args[index + 1];
}
function rejectUnknown(args, positional, flags) {
  const consumed = new Set(positional); for (const flag of flags) { const index = args.indexOf(flag); if (index >= 0) { consumed.add(index); consumed.add(index + 1); } }
  for (let index = 0; index < args.length; index += 1) if (!consumed.has(index)) throw new Error(`unknown argument: ${args[index]}`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args[0] === "help") { console.log(HELP); process.exit(0); }
try {
  const command = args[0];
  if (command === "schema") { if (args.length !== 1) throw new Error("schema accepts no arguments"); console.log(JSON.stringify(LEARNING_DOCUMENT_INPUT_SCHEMA, null, 2)); }
  else if (command === "inspect") {
    if (!args[1]) throw new Error("inspect requires <workspace>");
    const documentRef = value(args, "--document"), section = value(args, "--section"), rawMax = value(args, "--max-bytes");
    const maxBytes = rawMax === undefined ? undefined : Number(rawMax); if (rawMax !== undefined && (!Number.isInteger(maxBytes) || maxBytes < 1)) throw new Error("--max-bytes must be a positive integer");
    rejectUnknown(args, [0, 1], ["--document", "--section", "--max-bytes"]);
    console.log(JSON.stringify(inspectLearningDocument(args[1], { documentRef, section, maxBytes }), null, 2));
  } else if (command === "commit") {
    if (!args[1]) throw new Error("commit requires <workspace>"); const input = value(args, "--input"); if (!input) throw new Error("commit requires --input <draft.json>");
    rejectUnknown(args, [0, 1], ["--input"]); console.log(JSON.stringify(commitLearningDocument(args[1], JSON.parse(readFileSync(input, "utf8"))), null, 2));
  } else if (command === "recover") {
    if (!args[1] || args.length !== 2) throw new Error("recover requires exactly <workspace>"); console.log(JSON.stringify(recoverLearningDocument(args[1]), null, 2));
  } else throw new Error(`unknown command: ${command}`);
} catch (error) { console.error(error.message); if (error.candidates) console.error(`candidates: ${JSON.stringify(error.candidates)}`); process.exit(1); }
