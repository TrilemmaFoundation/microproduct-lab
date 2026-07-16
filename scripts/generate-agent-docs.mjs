#!/usr/bin/env node
/**
 * Generates agent-first mirror docs under docs/agents/human/ from docs/human sources.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  buildAgentMirrorDocument,
  flattenPlaybookNodes,
  metadataFromNode,
  renderAgentMirrorOverview,
  resolveHumanSourceFile,
} from './agentDocsUtils.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const humanPlaybookTree = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'humanPlaybook.data.json'), 'utf8'),
);
const HUMAN_DOCS_ROOT = path.join(ROOT, 'docs', 'human');
const AGENT_MIRROR_ROOT = path.join(ROOT, 'docs', 'agents', 'human');

function ensureCleanOutputDir() {
  fs.rmSync(AGENT_MIRROR_ROOT, {recursive: true, force: true});
  fs.mkdirSync(AGENT_MIRROR_ROOT, {recursive: true});
}

function writeMirrorDoc(docId, content) {
  const outputPath = path.join(AGENT_MIRROR_ROOT, `${docId}.md`);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, content, 'utf8');
}

function generateMirrorDocs() {
  const leaves = flattenPlaybookNodes(humanPlaybookTree).filter((node) => node.docId);
  const written = [];

  for (const node of leaves) {
    const sourcePath = resolveHumanSourceFile(HUMAN_DOCS_ROOT, node.docId);
    const sourceText = fs.readFileSync(sourcePath, 'utf8');
    const metadata = metadataFromNode(sourceText, node);
    const output = buildAgentMirrorDocument(sourceText, metadata);
    writeMirrorDoc(node.docId, output);
    written.push(node.docId);
  }

  const overview = renderAgentMirrorOverview(humanPlaybookTree);
  writeMirrorDoc('index', overview);

  written.sort((a, b) => a.localeCompare(b, 'en'));
  return written;
}

ensureCleanOutputDir();
const generatedDocIds = generateMirrorDocs();
console.warn(
  `generate-agent-docs: wrote ${generatedDocIds.length} mirror docs under ${path.relative(ROOT, AGENT_MIRROR_ROOT)}`,
);
