/**
 * Shared frontmatter parsing helpers for validators and generators.
 */

export function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1] ?? null;
}

/** @param {string} content @param {{ trim?: boolean }} [options] */
export function stripFrontmatter(content, {trim = false} = {}) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return trim ? content.trim() : content;
  }

  const body = content.slice(match[0].length);
  return trim ? body.trim() : body;
}
