#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import {resolveHumanSourceFile} from './agentDocsUtils.mjs';
import {flattenPlaybookNodes} from './playbookTreeUtils.mjs';

const HUMAN_DOCS_ROOT = 'docs/human';

function walkMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function loadPlaybookTree(root) {
  const treePath = path.join(root, 'src', 'data', 'humanPlaybook.data.json');
  return JSON.parse(fs.readFileSync(treePath, 'utf8'));
}

function docIdToRelativePath(docId) {
  return `${HUMAN_DOCS_ROOT}/${docId}`;
}

/**
 * @param {string} [root]
 */
export function collectPlaybookTreeErrors(root = path.resolve(import.meta.dirname, '..')) {
  const errors = [];
  const humanDocsRoot = path.join(root, HUMAN_DOCS_ROOT);
  const treePath = path.join(root, 'src', 'data', 'humanPlaybook.data.json');

  if (!fs.existsSync(treePath)) {
    errors.push(`${treePath}: human playbook tree is missing`);
    return errors;
  }

  if (!fs.existsSync(humanDocsRoot)) {
    errors.push(`${humanDocsRoot}: human docs root is missing`);
    return errors;
  }

  const tree = loadPlaybookTree(root);
  const nodes = flattenPlaybookNodes(tree);
  const docIds = new Set(
    nodes.map((node) => node.docId).filter((docId) => typeof docId === 'string'),
  );
  const referencedPaths = new Set();

  for (const docId of docIds) {
    try {
      const sourcePath = resolveHumanSourceFile(humanDocsRoot, docId);
      referencedPaths.add(path.relative(root, sourcePath).split(path.sep).join('/'));
    } catch (error) {
      errors.push(`${docIdToRelativePath(docId)}: ${error.message}`);
    }
  }

  for (const filePath of walkMarkdownFiles(humanDocsRoot)) {
    const relativePath = path.relative(root, filePath).split(path.sep).join('/');
    if (!referencedPaths.has(relativePath)) {
      errors.push(`${relativePath}: not referenced by humanPlaybook.data.json`);
    }
  }

  return errors;
}

/* node:coverage disable */
function isMain() {
  return Boolean(
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href,
  );
}

if (isMain()) {
  const errors = collectPlaybookTreeErrors();
  if (errors.length > 0) {
    console.error('Playbook tree validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Playbook tree validation passed.');
  }
}
/* node:coverage enable */
