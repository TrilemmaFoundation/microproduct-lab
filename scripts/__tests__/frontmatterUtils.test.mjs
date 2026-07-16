import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {extractFrontmatter, stripFrontmatter} from '../frontmatterUtils.mjs';

describe('frontmatterUtils', () => {
  it('extracts frontmatter with LF and CRLF delimiters', () => {
    const body = 'title: Mission\ndescription: Example';
    assert.equal(extractFrontmatter(`---\n${body}\n---\n\nBody\n`), body);
    assert.equal(extractFrontmatter(`---\r\n${body}\r\n---\r\n\r\nBody\r\n`), body);
    assert.equal(extractFrontmatter('Body only'), null);
  });

  it('strips frontmatter while preserving trim behavior', () => {
    const body = '---\ntitle: T\n---\n\n  Body  \n';
    assert.equal(stripFrontmatter(body), '\n  Body  \n');
    assert.equal(stripFrontmatter(body, {trim: false}), '\n  Body  \n');
    assert.equal(stripFrontmatter(body, {trim: true}), 'Body');
    assert.equal(stripFrontmatter('Plain text', {trim: true}), 'Plain text');
    assert.equal(stripFrontmatter('Plain text'), 'Plain text');
    assert.equal(stripFrontmatter('---\ntitle: Incomplete\nBody', {trim: true}), '---\ntitle: Incomplete\nBody');
  });
});
