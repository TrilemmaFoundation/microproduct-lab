#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

/** Deep page used to assert per-page Open Graph URL identity. */
export const OG_URL_SAMPLE_PAGE =
  'docs/intro/what-is-a-microproduct/index.html';

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

/**
 * Extract og:url and canonical href from minified Docusaurus HTML.
 * Supports quoted and unquoted attribute values.
 * @param {string} html
 * @returns {{ogUrl: string | null, canonical: string | null}}
 */
export function extractOgUrlAndCanonical(html) {
  const ogMatch = html.match(
    /property=(?:og:url|"og:url")\s+content=(?:"([^"]+)"|([^\s>]+))/i,
  );
  const canonicalMatch = html.match(
    /rel=(?:canonical|"canonical")\s+href=(?:"([^"]+)"|([^\s>]+))/i,
  );
  return {
    ogUrl: ogMatch?.[1] ?? ogMatch?.[2] ?? null,
    canonical: canonicalMatch?.[1] ?? canonicalMatch?.[2] ?? null,
  };
}

function collectOgUrlErrors(buildRoot, errors) {
  const samplePath = path.join(buildRoot, OG_URL_SAMPLE_PAGE);
  if (!fs.existsSync(samplePath)) {
    errors.push(`Missing Open Graph sample page: build/${OG_URL_SAMPLE_PAGE}`);
    return;
  }

  const html = fs.readFileSync(samplePath, 'utf8');
  const {ogUrl, canonical} = extractOgUrlAndCanonical(html);
  if (!ogUrl) {
    errors.push(`Missing og:url on build/${OG_URL_SAMPLE_PAGE}`);
  }
  if (!canonical) {
    errors.push(`Missing canonical link on build/${OG_URL_SAMPLE_PAGE}`);
  }
  if (ogUrl && canonical && ogUrl !== canonical) {
    errors.push(
      `og:url does not match canonical on build/${OG_URL_SAMPLE_PAGE}: ${ogUrl} !== ${canonical}`,
    );
  }
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

  collectOgUrlErrors(buildRoot, errors);
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
