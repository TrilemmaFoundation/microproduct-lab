#!/usr/bin/env node
/**
 * Concatenates key site sources into static/llms-full.txt deterministically (no timestamps).
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  stripFrontmatterAndMdxForLlms,
  stripYamlFrontmatter,
} from './llmsMdxUtils.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'static', 'llms-full.txt');

/** @param {string} rel relative to ROOT */
function readRel(rel, label, transform = stripYamlFrontmatter) {
  const fp = path.join(ROOT, rel);
  const body = transform(fs.readFileSync(fp, 'utf8'));

  const header = `\n\n===== ${label} (${rel}) =====\n\n`;
  return `${header}${body}`;
}

const sources = [
  ['static/AGENTS.md', 'Agent instructions', stripYamlFrontmatter],
  ['static/llms.txt', 'Discovery file'],
  ['static/registry.json', 'Machine-readable registry'],
  ['static/schemas/product.schema.json', 'Product schema'],

  [
    'docs/human/playbook/intro/what-is-a-microproduct.mdx',
    'Microproduct definition',
    stripFrontmatterAndMdxForLlms,
  ],
  ['docs/human/playbook/intro/mission.md', 'Mission', stripYamlFrontmatter],
  ['docs/templates/index.md', 'Templates overview', stripYamlFrontmatter],
  ['docs/agents/index.md', 'Agents hub', stripYamlFrontmatter],

  ['docs/archetypes/index.md', 'Archetypes overview', stripYamlFrontmatter],

  ['docs/contribute/how-to-contribute.md', 'Contribution workflow', stripYamlFrontmatter],

  ['docs/showcase/microproducts.md', 'Showcase summaries', stripYamlFrontmatter],

  ['docs/standards/folder-contract.md', 'Standard folder contract', stripYamlFrontmatter],
  ['docs/standards/maturity-model.md', 'Maturity model', stripYamlFrontmatter],
  ['docs/standards/what-counts-as-good.md', 'What counts as a good microproduct', stripYamlFrontmatter],
];

const archetypeDir = path.join(ROOT, 'docs', 'archetypes');
const archetypeFiles = fs
  .readdirSync(archetypeDir)
  .filter((name) => name.endsWith('.md') && name !== 'index.md')
  .sort((a, b) => a.localeCompare(b, 'en'));

for (const file of archetypeFiles) {
  const id = path.basename(file, '.md');
  const rel = path.join('docs', 'archetypes', file);
  sources.push([rel, `Archetype: ${id}`, stripYamlFrontmatter]);
}

sources.sort(([a], [b]) => a.localeCompare(b, 'en'));

let out = `# Build Trilemma — llms-full compressed context\n\n`;
out += `# Canonical URL: https://build.trilemma.foundation\n`;
out +=
  '# Sources are concatenated in deterministic order.\nDo not rely on headings alone for citations—verify against the canonical site URLs.\n';

for (const [rel, label, transform] of sources) {
  out += readRel(rel, label, transform);
}

fs.writeFileSync(OUTPUT, `${out}\n`, 'utf8');
console.warn(`generate-llms-full: wrote ${path.relative(process.cwd(), OUTPUT)}`);
