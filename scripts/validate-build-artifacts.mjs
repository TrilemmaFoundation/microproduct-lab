#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

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

export function collectBuildArtifactErrors(
  root = path.resolve(import.meta.dirname, '..'),
  forbiddenPaths = [root, '/vercel/path0'],
) {
  const buildRoot = path.join(root, 'build');
  if (!fs.existsSync(buildRoot)) {
    return ['Build directory missing: build'];
  }

  const errors = [];
  for (const filePath of walkFiles(buildRoot)) {
    const relativePath = path.relative(root, filePath);
    if (filePath.endsWith('.map')) {
      errors.push(`Source map emitted: ${relativePath}`);
    }
    if (
      filePath.endsWith('.js') &&
      forbiddenPaths.some((forbiddenPath) =>
        fs.readFileSync(filePath, 'utf8').includes(forbiddenPath),
      )
    ) {
      errors.push(`Build path leaked: ${relativePath}`);
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
  const errors = collectBuildArtifactErrors();
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
  } else {
    console.log('Build artifact validation passed.');
  }
}
/* node:coverage enable */
