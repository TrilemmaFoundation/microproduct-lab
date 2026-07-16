/**
 * Generated doc roots relative to the repository root.
 * Keep cspell ignorePaths and lint:markdown --ignore in sync (see comments there).
 */
import path from 'node:path';

export const GENERATED_DOC_ROOTS = ['docs/agents/human'];

/**
 * @param {string} filePath absolute or relative path to a markdown file
 * @param {string} root repository root
 */
export function isUnderGeneratedContentRoot(filePath, root) {
  const relativePath = path.isAbsolute(filePath)
    ? path.relative(root, filePath)
    : filePath;
  const normalized = relativePath.split(path.sep).join('/');
  return GENERATED_DOC_ROOTS.some(
    (generatedRoot) =>
      normalized === generatedRoot || normalized.startsWith(`${generatedRoot}/`),
  );
}
