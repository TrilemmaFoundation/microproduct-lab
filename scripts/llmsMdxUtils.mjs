/**
 * MDX/Markdown helpers for scripts/generate-llms-full.mjs (plain-text LLM bundles).
 */

import {stripFrontmatter as stripFrontmatterBody} from './frontmatterUtils.mjs';

/** Strip display JSX from prose while preserving fenced code byte-for-byte. */
export function stripMdxForPlainText(text) {
  const segments = [];
  let prose = '';
  let fence = '';
  for (const line of text.split(/(?<=\n)/)) {
    if (fence) {
      segments.push(line);
      const closing = line.match(/^ {0,3}(`+|~+)[ \t]*\r?\n?$/);
      if (closing && closing[1][0] === fence[0] && closing[1].length >= fence.length) {
        fence = '';
      }
    } else {
      const opening = line.match(/^ {0,3}(`{3,}|~{3,})([^\r\n]*)/);
      if (opening && !(opening[1][0] === '`' && opening[2].includes('`'))) {
        const cleaned = stripJsxFromProse(prose).replace(/\n{3,}/g, '\n\n');
        segments.push(segments.length ? cleaned : cleaned.trimStart(), line);
        prose = '';
        fence = opening[1];
      } else {
        prose += line;
      }
    }
  }
  const tail = stripJsxFromProse(prose).replace(/\n{3,}/g, '\n\n').trimEnd();
  segments.push(segments.length ? tail : tail.trimStart());
  return segments.join('');
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
  return stripMdxForPlainText(stripFrontmatterBody(text));
}
