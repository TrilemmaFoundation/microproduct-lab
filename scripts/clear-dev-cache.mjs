/**
 * Drops Docusaurus generated output and the bundler cache without removing
 * the production build folder — avoids ENOENT / @generated churn on dev start when
 * .docusaurus is out of sync with the bundler cache.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = ['.docusaurus', path.join('node_modules', '.cache')];

for (const rel of targets) {
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) {
    continue;
  }
  fs.rmSync(absolute, { recursive: true, force: true });
  process.stdout.write(`cleared ${rel}\n`);
}
