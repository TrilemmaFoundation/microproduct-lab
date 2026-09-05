import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function checkDesignContract(root, peers = []) {
  const design = resolve(root, 'src/design');
  const manifest = JSON.parse(readFileSync(resolve(design, 'contract.json'), 'utf8'));
  for (const [file, expected] of Object.entries(manifest.sha256)) {
    const bytes = readFileSync(resolve(design, file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `${file}: design contract drift`);
  }
  for (const peer of peers) {
    const other = JSON.parse(readFileSync(resolve(peer, 'src/design/contract.json'), 'utf8'));
    assert.deepEqual(other, manifest, `${peer}: design versions differ`);
    for (const file of Object.keys(manifest.sha256)) {
      assert.equal(readFileSync(resolve(peer, 'src/design', file), 'utf8'), readFileSync(resolve(design, file), 'utf8'), `${peer}/${file}: design copies differ`);
    }
  }
  const name = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).name;
  const adapter = name === 'trilemma-foundation' ? 'tailwind-ui-kit.preset.ts' : name === 'data' ? 'src/app/globals.css' : 'src/css/custom.css';
  const mappings = name === 'trilemma-foundation'
    ? { '--color-background': '--tf-background', '--color-foreground': '--tf-foreground', '--color-action-primary-hover-foreground': '--tf-action-primary-hover-foreground' }
    : name === 'data'
      ? { '--background': '--tf-ghost-white', '--foreground': '--tf-ink-black', '--primary': '--tf-soft-periwinkle', '--primary-foreground': '--tf-primary-navy' }
      : { '--ifm-background-color': '--tf-ghost-white', '--ifm-font-color-base': '--tf-ink-black', '--ifm-color-primary': '--tf-azure-bold' };
  const content = readFileSync(resolve(root, adapter), 'utf8').replace(/[\s"']/g, '');
  for (const [property, token] of Object.entries(mappings)) {
    assert.ok(content.includes(`${property}:var(${token})`), `${adapter}: ${property} must consume ${token}`);
  }
  return manifest.version;
}

/* node:coverage disable */
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const peersAt = process.argv.indexOf('--peers');
  const version = checkDesignContract(process.cwd(), peersAt === -1 ? [] : process.argv.slice(peersAt + 1));
  console.log(`Design contract ${version}: verified`);
}
/* node:coverage enable */
