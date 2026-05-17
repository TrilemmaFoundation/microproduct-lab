import fs from 'node:fs';
import path from 'node:path';

const WORDS_PER_MINUTE = 225;

export function stripFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return content;
  }

  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return content;
  }

  return content.slice(endIndex + 5);
}

export function stripMdxBoilerplate(content) {
  return content
    .replace(/^import\s.+?;?\s*$/gm, '')
    .replace(/^export\s.+?;?\s*$/gm, '')
    .replace(/<[^>\n]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_~|[\]{}()]/g, ' ');
}

export function countReadableWords(content) {
  const words = stripMdxBoilerplate(stripFrontmatter(content))
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  return words.length;
}

export function calculateReadMinutes(content) {
  return Math.max(1, Math.ceil(countReadableWords(content) / WORDS_PER_MINUTE));
}

export function buildDocReadTimes({siteDir, docRoots}) {
  const readTimes = {};

  for (const docRoot of docRoots) {
    const absoluteRoot = path.join(siteDir, docRoot);
    if (!fs.existsSync(absoluteRoot)) {
      continue;
    }

    for (const filePath of walkMarkdownFiles(absoluteRoot)) {
      const relativePath = path.relative(siteDir, filePath).split(path.sep).join('/');
      const source = `@site/${relativePath}`;
      const content = fs.readFileSync(filePath, 'utf8');
      readTimes[source] = calculateReadMinutes(content);
    }
  }

  return readTimes;
}

function walkMarkdownFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}
