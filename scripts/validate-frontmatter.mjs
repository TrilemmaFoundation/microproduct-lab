import fs from 'node:fs';
import path from 'node:path';

const docsRoot = path.resolve('docs');
const templatesRoot = path.resolve('templates');
const productTemplatesRoot = path.resolve('product-templates');
const baseRequiredFields = ['title', 'description', 'last_reviewed'];
const contentKinds = new Set(['foundation', 'module', 'reference']);
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const errors = [];
const authorIds = loadAuthorIds();

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      validateFile(fullPath);
    }
  }
}

function extractFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return null;
  }
  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return null;
  }
  return content.slice(4, endIndex);
}

function hasField(frontmatter, field) {
  const pattern = new RegExp(`^${field}:`, 'm');
  return pattern.test(frontmatter);
}

function readYamlScalar(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  if (!match) {
    return null;
  }

  const value = match[1].trim();
  if (!isYamlStringScalar(value)) {
    return null;
  }

  return value.replace(/^['"]|['"]$/g, '');
}

function isYamlStringScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.length >= 2;
  }

  if (/^[\[{]/.test(trimmed)) {
    return false;
  }

  if (/^(true|false|null|~)$/i.test(trimmed)) {
    return false;
  }

  if (/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return false;
  }

  return true;
}

function splitInlineList(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const items = [];
  let current = '';
  let quote = null;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const previous = i > 0 ? value[i - 1] : '';

    if (quote) {
      current += char;
      if (char === quote && previous !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === ',') {
      items.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (quote) {
    return null;
  }

  items.push(current.trim());
  return items;
}

function readYamlList(frontmatter, field, filePath, {required = false} = {}) {
  const lines = frontmatter.split('\n');
  const fieldIndex = lines.findIndex((line) => new RegExp(`^${field}:\\s*`).test(line));
  if (fieldIndex === -1) {
    if (required) {
      errors.push(`${filePath}: missing required frontmatter field '${field}'`);
    }
    return null;
  }

  const fieldLine = lines[fieldIndex];
  const fieldValue = fieldLine.replace(new RegExp(`^${field}:\\s*`), '').trim();

  if (fieldValue.startsWith('[') && fieldValue.endsWith(']')) {
    const items = splitInlineList(fieldValue.slice(1, -1));
    if (!items) {
      errors.push(`${filePath}: ${field} must be a YAML list of strings`);
      return null;
    }
    for (const item of items) {
      if (!isYamlStringScalar(item)) {
        errors.push(`${filePath}: ${field} must contain only string values`);
        return null;
      }
    }
    return items.map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
  }

  if (!fieldValue) {
    let foundListItem = false;
    const items = [];

    for (let i = fieldIndex + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line.trim()) {
        continue;
      }

      if (!/^\s+/.test(line)) {
        break;
      }

      const listItem = line.trim().match(/^-\s+(.+)$/);
      if (!listItem) {
        errors.push(`${filePath}: ${field} must be a YAML list of strings`);
        return null;
      }

      foundListItem = true;
      if (!isYamlStringScalar(listItem[1])) {
        errors.push(`${filePath}: ${field} must contain only string values`);
        return null;
      }
      items.push(listItem[1].trim().replace(/^['"]|['"]$/g, ''));
    }

    if (!foundListItem) {
      errors.push(`${filePath}: ${field} must be a YAML list of strings`);
      return null;
    }
    return items;
  }

  errors.push(`${filePath}: ${field} must be a YAML list of strings`);
  return null;
}

function validateTags(frontmatter, filePath) {
  readYamlList(frontmatter, 'tags', filePath);
}

function validateAuthors(frontmatter, filePath) {
  const authors = readYamlList(frontmatter, 'authors', filePath);
  if (!authors) {
    return;
  }

  if (authors.length === 0) {
    errors.push(`${filePath}: authors must contain at least one author ID`);
    return;
  }

  for (const author of authors) {
    if (!authorIds.has(author)) {
      errors.push(`${filePath}: unknown author ID '${author}'`);
    }
  }
}

function validateContentKind(frontmatter, filePath) {
  const rawContentKind = readYamlScalar(frontmatter, 'content_kind');
  if (hasField(frontmatter, 'content_kind') && !rawContentKind) {
    errors.push(`${filePath}: content_kind must be a string value`);
    return 'module';
  }

  const contentKind = rawContentKind ?? 'module';
  if (!contentKinds.has(contentKind)) {
    errors.push(
      `${filePath}: content_kind must be one of ${[...contentKinds].join(', ')}`,
    );
    return 'module';
  }

  return contentKind;
}

function loadAuthorIds() {
  const authorsPath = path.resolve('src/data/authors.ts');
  if (!fs.existsSync(authorsPath)) {
    errors.push(`${authorsPath}: author registry is missing`);
    return new Set();
  }

  const content = fs.readFileSync(authorsPath, 'utf8');
  const ids = [...content.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  if (ids.length === 0) {
    errors.push(`${authorsPath}: author registry must define at least one author ID`);
  }

  return new Set(ids);
}

function validateFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const frontmatter = extractFrontmatter(raw);

  if (!frontmatter) {
    errors.push(`${filePath}: missing frontmatter block`);
    return;
  }

  const contentKind = validateContentKind(frontmatter, filePath);

  for (const field of baseRequiredFields) {
    if (!hasField(frontmatter, field)) {
      errors.push(`${filePath}: missing required frontmatter field '${field}'`);
    }
  }

  if (contentKind === 'module' && !hasField(frontmatter, 'authors')) {
    errors.push(`${filePath}: missing required frontmatter field 'authors'`);
  }

  validateTags(frontmatter, filePath);
  if (hasField(frontmatter, 'authors')) {
    validateAuthors(frontmatter, filePath);
  }

  const dateMatch = frontmatter.match(/^last_reviewed:\s*(.+)$/m);
  if (!dateMatch) {
    errors.push(`${filePath}: missing last_reviewed value`);
  } else {
    const value = dateMatch[1].trim().replace(/^['"]|['"]$/g, '');
    if (!dateRegex.test(value)) {
      errors.push(`${filePath}: invalid last_reviewed format '${value}', expected YYYY-MM-DD`);
    }
  }
}

function validateShowcaseTable() {
  const showcasePath = path.resolve('docs/showcase/microproducts.md');
  if (!fs.existsSync(showcasePath)) {
    errors.push('docs/showcase/microproducts.md: file is missing');
    return;
  }

  const content = fs.readFileSync(showcasePath, 'utf8');
  const expected = '| Name | Description | Team | Link |';

  if (!content.includes(expected)) {
    errors.push(
      `${showcasePath}: table header must be exactly '${expected}'`,
    );
  }
}

for (const [label, root] of [
  ['docs', docsRoot],
  ['templates', templatesRoot],
  ['product-templates', productTemplatesRoot],
]) {
  if (!fs.existsSync(root)) {
    errors.push(`${label} directory does not exist`);
    continue;
  }
  walk(root);
}

validateShowcaseTable();

if (errors.length > 0) {
  console.error('Frontmatter validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Frontmatter validation passed.');
