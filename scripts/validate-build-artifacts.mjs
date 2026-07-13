#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const buildRoot = path.join(root, 'build');
const files = walkFiles(buildRoot);
const sourceMaps = files.filter((filePath) => filePath.endsWith('.map'));
const forbiddenPaths = [...new Set([root, '/vercel/path0'])];
const leakingFiles = files.filter(
  (filePath) =>
    filePath.endsWith('.js') &&
    forbiddenPaths.some((forbiddenPath) =>
      fs.readFileSync(filePath, 'utf8').includes(forbiddenPath),
    ),
);

if (sourceMaps.length || leakingFiles.length) {
  for (const filePath of sourceMaps) {
    console.error(`Source map emitted: ${path.relative(root, filePath)}`);
  }
  for (const filePath of leakingFiles) {
    console.error(`Build path leaked: ${path.relative(root, filePath)}`);
  }
  process.exit(1);
}

console.log('Build artifact validation passed.');

function walkFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }
  return files;
}
