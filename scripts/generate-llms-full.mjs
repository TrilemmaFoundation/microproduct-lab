#!/usr/bin/env node
/**
 * Concatenates key site sources into static/llms-full.txt deterministically (no timestamps).
 */

import fs from 'node:fs';
import path from 'node:path';

import {buildLlmsFullSources} from './llmsFullSources.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'static', 'llms-full.txt');

/** @param {string} rel relative to ROOT */
function readRel(rel, label, transform) {
  const fp = path.join(ROOT, rel);
  const body = transform(fs.readFileSync(fp, 'utf8'));

  const header = `\n\n===== ${label} (${rel}) =====\n\n`;
  return `${header}${body}`;
}

const sources = buildLlmsFullSources(ROOT);

let out = `# Build Trilemma — llms-full compressed context\n\n`;
out += `# Canonical URL: https://build.trilemma.foundation\n`;
out +=
  '# Sources are concatenated in deterministic order.\nDo not rely on headings alone for citations—verify against the canonical site URLs.\n';

for (const [rel, label, transform] of sources) {
  out += readRel(rel, label, transform);
}

fs.writeFileSync(OUTPUT, `${out}\n`, 'utf8');
console.warn(`generate-llms-full: wrote ${path.relative(process.cwd(), OUTPUT)}`);
