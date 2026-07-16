/**
 * MDX/Markdown helpers for scripts/generate-llms-full.mjs (plain-text LLM bundles).
 */

const FENCE_SPLIT_REGEX = /(^```[^\n]*\n[\s\S]*?\n```$)/gm;

/** Strip MDX import lines and JSX display components for plain-text context bundles. */
export function stripMdxForPlainText(text) {
  const segments = text.split(FENCE_SPLIT_REGEX);

  const out = segments
    .map((segment, index) => {
      // Odd indices are the fenced code blocks captured by the split regex; leave them untouched.
      if (index % 2 === 1) {
        return segment;
      }
      return stripJsxFromProse(segment);
    })
    .join('');

  return out.replace(/\n{3,}/g, '\n\n').trim();
}

function stripJsxFromProse(text) {
  return text
    .replace(/^import\s+(?:.|\n)*?from\s+['"][^'"]+['"];?\s*\n?/gm, '')
    .replace(/<[A-Z][\s\S]*?\/>/g, '')
    .replace(/<[A-Z][A-Za-z0-9]*\b[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, '')
    .replace(/<UniversityMarquee\b[\s\S]*?<\/UniversityMarquee>/g, '')
    .replace(
      /<(?:ul|ol|div|span|section|article)\b[^>]*>[\s\S]*?<\/(?:ul|ol|div|span|section|article)>/gi,
      (block) => (block.includes('{') ? '' : block),
    );
}

export function stripYamlFrontmatter(text) {
  if (!text.startsWith('---\n')) {
    return text.trim();
  }

  const end = text.indexOf('\n---\n', 4);
  if (end === -1) {
    return text.trim();
  }

  return text.slice(end + 5).trim();
}

export function stripFrontmatterAndMdxForLlms(text) {
  return stripMdxForPlainText(stripYamlFrontmatter(text));
}
