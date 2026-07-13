import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  stripFrontmatterAndMdxForLlms,
  stripMdxForPlainText,
  stripYamlFrontmatter,
} from '../llmsMdxUtils.mjs';

describe('llmsMdxUtils', () => {
  it('stripMdxForPlainText removes imports, self-closing JSX, and UniversityMarquee blocks', () => {
    const input = `
import Foo from '@site/x';

# Hello

<UniversityMarquee />

<OtherComp prop="x" />

Text after.

<UniversityMarquee>
  nested
</UniversityMarquee>

End.
`;
    const out = stripMdxForPlainText(input);
    assert.match(out, /# Hello/);
    assert.match(out, /Text after/);
    assert.match(out, /End/);
    assert.doesNotMatch(out, /import Foo/);
    assert.doesNotMatch(out, /UniversityMarquee/);
    assert.doesNotMatch(out, /<OtherComp/);
  });

  it('stripFrontmatterAndMdxForLlms strips frontmatter then MDX', () => {
    const input = `---
title: T
---

import X from 'y';

Body <Foo /> tail.
`;
    const out = stripFrontmatterAndMdxForLlms(input);
    assert.match(out, /Body/);
    assert.match(out, /tail/);
    assert.doesNotMatch(out, /title:/);
    assert.doesNotMatch(out, /import X/);
    assert.doesNotMatch(out, /<Foo/);
  });

  it('stripYamlFrontmatter preserves plain text and malformed blocks', () => {
    assert.equal(stripYamlFrontmatter('Plain text'), 'Plain text');
    assert.equal(
      stripYamlFrontmatter('---\ntitle: Incomplete\nBody'),
      '---\ntitle: Incomplete\nBody',
    );
  });
});
