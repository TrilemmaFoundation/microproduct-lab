/**
 * MDX/Markdown helpers for scripts/generate-llms-full.mjs (plain-text LLM bundles).
 */

import {stripFrontmatter as stripFrontmatterBody} from './frontmatterUtils.mjs';

const FENCE_SPLIT_REGEX = /(^```[^\n]*\n[\s\S]*?\n```[ \t]*$)/gm;

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
  let out = text
    // Whole-line MDX imports only (do not eat instructional prose after the specifier).
    .replace(/^import\s[\s\S]*?\sfrom\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/<[A-Z][A-Za-z0-9]*\b[^<>]*\/>/g, '');

  // Remove innermost paired components first so nested same-name tags fully clear.
  const innermostPaired =
    /<([A-Z][A-Za-z0-9]*)\b[^>]*>(?:(?!<[A-Z][A-Za-z0-9]*\b)[\s\S])*?<\/\1>/g;
  for (let i = 0; i < 32; i += 1) {
    const next = out.replace(innermostPaired, '');
    if (next === out) {
      break;
    }
    out = next;
  }

  return out.replace(
    /<(?:ul|ol|div|span|section|article)\b[^>]*>[\s\S]*?<\/(?:ul|ol|div|span|section|article)>/gi,
    (block) => (block.includes('{') ? '' : block),
  );
}

export function stripYamlFrontmatter(text) {
  return stripFrontmatterBody(text, {trim: true});
}

export function stripFrontmatterAndMdxForLlms(text) {
  return stripMdxForPlainText(stripYamlFrontmatter(text));
}
