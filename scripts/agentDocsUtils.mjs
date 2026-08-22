/**
 * Helpers for scripts/generate-agent-docs.mjs.
 */

import fs from 'node:fs';
import path from 'node:path';

import {JSON_SCHEMA, dump, load} from 'js-yaml';

import {extractFrontmatter} from './frontmatterUtils.mjs';
import {
  stripFrontmatterAndMdxForLlms,
} from './llmsMdxUtils.mjs';
import {flattenPlaybookNodes} from './playbookTreeUtils.mjs';

export {flattenPlaybookNodes};

/**
 * @param {string} rootDir
 * @param {string} candidatePath
 */
export function assertPathInside(rootDir, candidatePath) {
  const root = path.resolve(rootDir);
  const candidate = path.resolve(candidatePath);
  if (candidate === root || candidate.startsWith(`${root}${path.sep}`)) {
    return candidate;
  }
  throw new Error(`Path escapes root '${root}': ${candidate}`);
}

/** @param {string} docId */
export function sectionFromDocId(docId) {
  if (docId === 'authors') {
    return 'authors';
  }
  if (docId === 'human-overview') {
    return 'overview';
  }

  const playbookMatch = docId.match(/^playbook\/([^/]+)\//);
  if (playbookMatch) {
    return playbookMatch[1];
  }

  return 'other';
}

/** @param {string} humanTo */
export function agentSlugFromHumanTo(humanTo) {
  if (!humanTo.startsWith('/docs')) {
    throw new Error(`Expected human route to start with /docs, received '${humanTo}'`);
  }
  const slug = humanTo.slice('/docs'.length);
  return slug.length > 0 ? slug : '/';
}

/**
 * @param {string} humanDocsRoot
 * @param {string} docId
 */
export function resolveHumanSourceFile(humanDocsRoot, docId) {
  for (const extension of ['.md', '.mdx']) {
    const filePath = assertPathInside(
      humanDocsRoot,
      path.join(humanDocsRoot, `${docId}${extension}`),
    );
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  throw new Error(`Source not found for docId '${docId}' under ${humanDocsRoot}`);
}

/**
 * @param {string} sourceText
 * @param {{
 *   title: string;
 *   description: string;
 *   slug: string;
 *   canonicalHumanUrl: string;
 *   section: string;
 *   sourceDocId: string;
 * }} metadata
 */
export function buildAgentMirrorDocument(sourceText, metadata) {
  const body = stripFrontmatterAndMdxForLlms(sourceText);
  const frontmatter = dump(
    {
      title: metadata.title,
      description: metadata.description,
      slug: metadata.slug,
      canonical_human_url: metadata.canonicalHumanUrl,
      section: metadata.section,
      source_doc_id: metadata.sourceDocId,
      content_kind: 'mirror',
    },
    {lineWidth: -1, noRefs: true, schema: JSON_SCHEMA},
  ).trimEnd();

  const preamble = `> **Agent-first mirror** of [${metadata.title}](${metadata.canonicalHumanUrl}). Prose is identical; MDX interactive elements removed.\n\n`;

  return `---\n${frontmatter}\n---\n\n${preamble}${body}\n`;
}

/**
 * @param {string} sourceText
 * @param {import('../src/data/humanPlaybook').PlaybookTreeNode} node
 */
export function metadataFromNode(sourceText, node) {
  if (!node.docId || !node.to) {
    throw new Error(`Playbook node '${node.id}' is missing docId or to`);
  }

  const parsed = parseSourceFrontmatter(sourceText);
  const title = typeof parsed.title === 'string' ? parsed.title : node.title;
  const description =
    typeof parsed.description === 'string' ? parsed.description : node.description;
  const slug =
    typeof parsed.slug === 'string'
      ? parsed.slug
      : agentSlugFromHumanTo(node.to);

  return {
    title,
    description,
    slug,
    canonicalHumanUrl: node.to,
    section: sectionFromDocId(node.docId),
    sourceDocId: node.docId,
  };
}

/** @param {string} sourceText */
export function parseSourceFrontmatter(sourceText) {
  const source = extractFrontmatter(sourceText);
  if (!source) {
    return {};
  }
  try {
    const value = load(source, {schema: JSON_SCHEMA});
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value;
  } catch {
    return {};
  }
}

/**
 * @param {import('../src/data/humanPlaybook').PlaybookTreeNode[]} nodes
 */
export function renderAgentMirrorOverview(nodes) {
  const lines = [
    '---',
    'title: Human Docs Mirror',
    'description: Agent-first browsable mirror of the human playbook and supporting docs.',
    'slug: /human',
    'content_kind: mirror',
    '---',
    '',
    '> Generated index of the human docs mirror. Each page is a mechanical transform of the canonical human doc.',
    '',
    '## Playbook mirror',
    '',
  ];

  for (const node of nodes) {
    appendOverviewNode(lines, node, 0);
  }

  return `${lines.join('\n')}\n`;
}

/**
 * @param {string[]} lines
 * @param {import('../src/data/humanPlaybook').PlaybookTreeNode} node
 * @param {number} depth
 */
function appendOverviewNode(lines, node, depth) {
  if (node.docId && node.to) {
    const slug = agentSlugFromHumanTo(node.to);
    const indent = '  '.repeat(depth);
    lines.push(`${indent}- [${node.title}](/agents${slug}) — ${node.description}`);
  }

  if (node.children?.length) {
    if (!node.docId) {
      lines.push(`${'  '.repeat(depth)}### ${node.title}`);
      lines.push('');
      lines.push(node.description);
      lines.push('');
    }
    for (const child of node.children) {
      appendOverviewNode(lines, child, node.docId ? depth + 1 : depth);
    }
  }
}
