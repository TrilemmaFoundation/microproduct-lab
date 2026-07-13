import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import {JSON_SCHEMA, load} from 'js-yaml';

const baseRequiredFields = ['title', 'description', 'last_reviewed'];
const contentKinds = new Set(['foundation', 'module', 'reference']);
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

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

export function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1] ?? null;
}

function parseFrontmatter(content, filePath, errors) {
  const source = extractFrontmatter(content);
  if (source === null) {
    errors.push(`${filePath}: missing frontmatter block`);
    return null;
  }

  try {
    const value = load(source, {schema: JSON_SCHEMA});
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${filePath}: frontmatter must be a YAML mapping`);
      return null;
    }
    return value;
  } catch (error) {
    errors.push(`${filePath}: invalid YAML frontmatter (${error.message})`);
    return null;
  }
}

function validateStringList(frontmatter, field, filePath, errors) {
  const value = frontmatter[field];
  if (typeof value === 'undefined') {
    return null;
  }
  if (!Array.isArray(value)) {
    errors.push(`${filePath}: ${field} must be a YAML list of strings`);
    return null;
  }
  if (value.some((item) => typeof item !== 'string')) {
    errors.push(`${filePath}: ${field} must contain only string values`);
    return null;
  }
  return value;
}

export function isValidReviewedDate(value) {
  if (typeof value !== 'string' || !dateRegex.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function loadAuthorIds(root, errors) {
  const authorsPath = path.join(root, 'src', 'data', 'authors.json');
  if (!fs.existsSync(authorsPath)) {
    errors.push(`${authorsPath}: author registry is missing`);
    return new Set();
  }

  try {
    const authors = JSON.parse(fs.readFileSync(authorsPath, 'utf8'));
    if (!Array.isArray(authors)) {
      throw new TypeError('author registry must be an array');
    }
    const ids = authors
      .map((author) => author?.id)
      .filter((id) => typeof id === 'string' && id.length > 0);
    if (ids.length === 0) {
      errors.push(`${authorsPath}: author registry must define at least one author ID`);
    }
    return new Set(ids);
  } catch (error) {
    errors.push(`${authorsPath}: invalid author registry (${error.message})`);
    return new Set();
  }
}

function validateFile(filePath, authorIds, errors) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(raw, filePath, errors);
  if (!frontmatter) {
    return;
  }

  for (const field of baseRequiredFields) {
    if (!Object.hasOwn(frontmatter, field)) {
      errors.push(`${filePath}: missing required frontmatter field '${field}'`);
    }
  }

  const rawContentKind = frontmatter.content_kind;
  let contentKind = 'module';
  if (typeof rawContentKind !== 'undefined') {
    if (typeof rawContentKind !== 'string') {
      errors.push(`${filePath}: content_kind must be a string value`);
    } else if (!contentKinds.has(rawContentKind)) {
      errors.push(
        `${filePath}: content_kind must be one of ${[...contentKinds].join(', ')}`,
      );
    } else {
      contentKind = rawContentKind;
    }
  }

  if (contentKind === 'module' && !Object.hasOwn(frontmatter, 'authors')) {
    errors.push(`${filePath}: missing required frontmatter field 'authors'`);
  }

  validateStringList(frontmatter, 'tags', filePath, errors);
  const authors = validateStringList(frontmatter, 'authors', filePath, errors);
  if (authors) {
    if (authors.length === 0) {
      errors.push(`${filePath}: authors must contain at least one author ID`);
    }
    for (const author of authors) {
      if (!authorIds.has(author)) {
        errors.push(`${filePath}: unknown author ID '${author}'`);
      }
    }
  }

  if (!Object.hasOwn(frontmatter, 'last_reviewed')) {
    errors.push(`${filePath}: missing last_reviewed value`);
  } else if (!isValidReviewedDate(frontmatter.last_reviewed)) {
    errors.push(
      `${filePath}: invalid last_reviewed '${String(frontmatter.last_reviewed)}', expected valid YYYY-MM-DD`,
    );
  }
}

function validateShowcaseTable(root, errors) {
  const showcasePath = path.join(root, 'docs', 'showcase', 'microproducts.md');
  if (!fs.existsSync(showcasePath)) {
    errors.push('docs/showcase/microproducts.md: file is missing');
    return;
  }

  const expected = '| Name | Description | Team | Link |';
  if (!fs.readFileSync(showcasePath, 'utf8').includes(expected)) {
    errors.push(`${showcasePath}: table header must be exactly '${expected}'`);
  }
}

export function collectFrontmatterErrors(root = process.cwd()) {
  const errors = [];
  const authorIds = loadAuthorIds(root, errors);

  for (const directory of ['docs', 'templates', 'product-templates']) {
    const directoryPath = path.join(root, directory);
    if (!fs.existsSync(directoryPath)) {
      errors.push(`${directory} directory does not exist`);
      continue;
    }
    for (const filePath of walkMarkdownFiles(directoryPath)) {
      validateFile(filePath, authorIds, errors);
    }
  }

  validateShowcaseTable(root, errors);
  return errors;
}

function isMain() {
  return Boolean(
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href,
  );
}

if (isMain()) {
  const errors = collectFrontmatterErrors();
  if (errors.length > 0) {
    console.error('Frontmatter validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Frontmatter validation passed.');
  }
}
