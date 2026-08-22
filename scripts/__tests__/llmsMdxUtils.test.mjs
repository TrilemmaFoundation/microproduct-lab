import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  stripFrontmatterAndMdxForLlms,
  stripMdxForPlainText,
  stripYamlFrontmatter,
} from '../llmsMdxUtils.mjs';

describe('llmsMdxUtils', () => {
  it('stripMdxForPlainText preserves prose between separated components', () => {
    const input = `
<FirstComponent prop="a" />

Important prose between components must survive.

<SecondComponent prop="b" />
`;
    const out = stripMdxForPlainText(input);
    assert.match(out, /Important prose between components must survive/);
    assert.doesNotMatch(out, /FirstComponent/);
    assert.doesNotMatch(out, /SecondComponent/);
  });

  it('stripMdxForPlainText removes imports, self-closing JSX, and paired component blocks', () => {
    const input = `
import Foo from '@site/x';

import {
  PlaybookTree,
  humanPlaybookTree,
} from '@site/src/components/PlaybookTree';

# Hello

<ExampleWidget />

<OtherComp prop="x" />

<PlaybookTree
  nodes={humanPlaybookTree}
  initialSelectedId="request-for-microproducts"
/>

Text after.

<ExampleWidget>
  nested
</ExampleWidget>

<ul>
  {authors.map((author) => (
    <li key={author.id}>{author.name}</li>
  ))}
</ul>

End.
`;
    const out = stripMdxForPlainText(input);
    assert.match(out, /# Hello/);
    assert.match(out, /Text after/);
    assert.match(out, /End/);
    assert.doesNotMatch(out, /import Foo/);
    assert.doesNotMatch(out, /PlaybookTree/);
    assert.doesNotMatch(out, /ExampleWidget/);
    assert.doesNotMatch(out, /<OtherComp/);
    assert.doesNotMatch(out, /authors\.map/);
  });

  it('stripMdxForPlainText preserves plain HTML blocks without JSX expressions', () => {
    const input = `
# Title

<ul>
  <li>One</li>
  <li>Two</li>
</ul>
`;
    const out = stripMdxForPlainText(input);
    assert.match(out, /<ul>/);
    assert.match(out, /<li>One<\/li>/);
  });

  it('stripMdxForPlainText removes nested same-name JSX components', () => {
    const out = stripMdxForPlainText('<List><List>a</List></List>\nProse');
    assert.equal(out, 'Prose');
    assert.doesNotMatch(out, /<\/List>/);
  });

  it('stripMdxForPlainText preserves instructional import-shaped prose', () => {
    const out = stripMdxForPlainText("import values from 'config' carefully\nKeep");
    assert.match(out, /import values from 'config' carefully/);
    assert.match(out, /Keep/);
  });

  it('stripMdxForPlainText preserves fenced JSX-like tokens when the closer has trailing spaces', () => {
    const dirty = '# C\n\n```json\n{\n  "a": "<Foo />"\n}\n```  \n\nAfter';
    const clean = '# C\n\n```json\n{\n  "a": "<Foo />"\n}\n```\n\nAfter';
    assert.match(stripMdxForPlainText(dirty), /"a": "<Foo \/>"/);
    assert.match(stripMdxForPlainText(clean), /"a": "<Foo \/>"/);
  });

  it('stripMdxForPlainText preserves fenced code blocks containing braces', () => {
    const input = `
# Configure the build

\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
\`\`\`

Adjust the config to match your project.
`;
    const out = stripMdxForPlainText(input);
    assert.match(out, /"buildCommand": "npm run build"/);
    assert.match(out, /"outputDirectory": "dist"/);
    assert.match(out, /^\{$/m);
    assert.match(out, /^\}$/m);
    assert.match(out, /Adjust the config/);
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
