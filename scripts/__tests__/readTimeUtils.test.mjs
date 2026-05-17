import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateReadMinutes,
  countReadableWords,
  stripFrontmatter,
  stripMdxBoilerplate,
} from '../readTimeUtils.mjs';

test('stripFrontmatter removes yaml frontmatter', () => {
  const content = '---\ntitle: Example\n---\n\nVisible body';
  assert.equal(stripFrontmatter(content).trim(), 'Visible body');
});

test('stripMdxBoilerplate removes import and export lines', () => {
  const content = [
    "import Widget from '@site/src/Widget';",
    'export const value = 1;',
    '',
    'Readable words remain.',
  ].join('\n');

  assert.equal(stripMdxBoilerplate(content).trim(), 'Readable words remain.');
});

test('calculateReadMinutes returns a minimum of one minute', () => {
  assert.equal(calculateReadMinutes('short'), 1);
});

test('calculateReadMinutes rounds up using 225 words per minute', () => {
  const content = Array.from({length: 226}, (_, index) => `word${index}`).join(' ');
  assert.equal(calculateReadMinutes(content), 2);
});

test('countReadableWords ignores markdown link targets', () => {
  assert.equal(countReadableWords('[Read docs](https://example.com) now'), 3);
});
