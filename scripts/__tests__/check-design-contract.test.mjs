import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { checkDesignContract } from '../check-design-contract.mjs';

const temporary = [];
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture(name = 'microproduct-lab') {
  const root = mkdtempSync(join(tmpdir(), 'design-contract-')); temporary.push(root);
  cpSync('src/design', join(root, 'src/design'), { recursive: true });
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name }));
  const adapters = {
    'microproduct-lab': ['src/css/custom.css', '--ifm-background-color:var(--tf-ghost-white);--ifm-font-color-base:var(--tf-ink-black);--ifm-color-primary:var(--tf-azure-bold)'],
    'data': ['src/app/globals.css', '--background:var(--tf-ghost-white);--foreground:var(--tf-ink-black);--primary:var(--tf-soft-periwinkle);--primary-foreground:var(--tf-primary-navy)'],
    'trilemma-foundation': ['tailwind-ui-kit.preset.ts', '"--color-background":"var(--tf-background)","--color-foreground":"var(--tf-foreground)","--color-action-primary-hover-foreground":"var(--tf-action-primary-hover-foreground)"'],
  };
  const [file, text] = adapters[name];
  mkdirSync(join(root, file, '..'), { recursive: true });
  writeFileSync(join(root, file), text);
  return root;
}
test('all framework mappings accept the same independent contract', () => {
  const website = fixture('trilemma-foundation'); const data = fixture('data'); const lab = fixture();
  assert.equal(checkDesignContract(website, [data, lab]), '1.1.0');
  assert.equal(checkDesignContract(data), '1.1.0');
  assert.equal(checkDesignContract(lab), '1.1.0');
});
test('detects local token drift', () => {
  const root = fixture(); writeFileSync(join(root, 'src/design/tokens.css'), 'changed');
  assert.throws(() => checkDesignContract(root), /design contract drift/);
});
test('detects a mismatched peer version', () => {
  const root = fixture(); const peer = fixture(); const path = join(peer, 'src/design/contract.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8')); manifest.version = '2.0.0'; writeFileSync(path, JSON.stringify(manifest));
  assert.throws(() => checkDesignContract(root, [peer]), /design versions differ/);
});
test('detects peer bytes changed without updating the manifest', () => {
  const root = fixture(); const peer = fixture(); writeFileSync(join(peer, 'src/design/tokens.css'), 'changed');
  assert.throws(() => checkDesignContract(root, [peer]), /design copies differ/);
});
test('rejects a framework mapping that bypasses canonical colors', () => {
  const root = fixture(); writeFileSync(join(root, 'src/css/custom.css'), '--ifm-background-color:white;');
  assert.throws(() => checkDesignContract(root), /must consume/);
});
