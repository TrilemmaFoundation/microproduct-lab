import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import {
  agentSlugFromHumanTo,
  buildAgentMirrorDocument,
  flattenPlaybookNodes,
  metadataFromNode,
  parseSourceFrontmatter,
  renderAgentMirrorOverview,
  resolveHumanSourceFile,
  sectionFromDocId,
  stripAgentMirrorBody,
  stripAgentMirrorFrontmatter,
} from '../agentDocsUtils.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const humanPlaybookTree = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'humanPlaybook.data.json'), 'utf8'),
);

describe('agentDocsUtils', () => {
  it('derives sections and agent slugs from human routes', () => {
    assert.equal(sectionFromDocId('playbook/intro/mission'), 'intro');
    assert.equal(sectionFromDocId('playbook/frame/design'), 'frame');
    assert.equal(sectionFromDocId('playbook/build/build'), 'build');
    assert.equal(sectionFromDocId('playbook/operate/operate'), 'operate');
    assert.equal(sectionFromDocId('resources/index'), 'resources');
    assert.equal(sectionFromDocId('authors/index'), 'authors');
    assert.equal(sectionFromDocId('human-overview'), 'overview');
    assert.equal(sectionFromDocId('unknown/path'), 'other');
    assert.equal(agentSlugFromHumanTo('/docs/intro/mission'), '/intro/mission');
    assert.equal(agentSlugFromHumanTo('/docs'), '/');
    assert.throws(() => agentSlugFromHumanTo('/agents/foo'), /Expected human route/);
  });

  it('flattens the playbook tree and resolves human source files', () => {
    const leaves = flattenPlaybookNodes(humanPlaybookTree).filter((node) => node.docId);
    assert.ok(leaves.length >= 17);
    const humanDocsRoot = path.join(ROOT, 'docs', 'human');
    const sourcePath = resolveHumanSourceFile(
      humanDocsRoot,
      'playbook/intro/our-approach',
    );
    assert.match(sourcePath, /our-approach\.md$/);
    assert.throws(
      () => resolveHumanSourceFile(humanDocsRoot, 'missing/doc'),
      /Source not found/,
    );
  });

  it('builds mirror metadata and documents with stripped MDX', () => {
    const sourceText = `---
title: Source Title
description: Source description
slug: /intro/example
---

import Foo from 'bar';

# Heading

<PlaybookTree />

Body text.
`;
    const node = {
      id: 'example',
      title: 'Fallback Title',
      description: 'Fallback description',
      docId: 'playbook/intro/example',
      to: '/docs/intro/example',
    };

    const metadata = metadataFromNode(sourceText, node);
    assert.deepEqual(metadata, {
      title: 'Source Title',
      description: 'Source description',
      slug: '/intro/example',
      canonicalHumanUrl: '/docs/intro/example',
      section: 'intro',
      sourceDocId: 'playbook/intro/example',
    });

    const output = buildAgentMirrorDocument(sourceText, metadata);
    assert.match(output, /^---\n/);
    assert.match(output, /content_kind: mirror/);
    assert.match(output, /canonical_human_url: \/docs\/intro\/example/);
    assert.match(output, /Agent-first mirror/);
    assert.match(output, /# Heading/);
    assert.match(output, /Body text/);
    assert.doesNotMatch(output, /import Foo/);
    assert.doesNotMatch(output, /<PlaybookTree/);
  });

  it('falls back to tree metadata when frontmatter is missing', () => {
    const node = {
      id: 'mission',
      title: 'Mission',
      description: 'Mission description',
      docId: 'playbook/intro/mission',
      to: '/docs/intro/mission',
    };
    const metadata = metadataFromNode('Plain body without frontmatter', node);
    assert.equal(metadata.title, 'Mission');
    assert.equal(metadata.slug, '/intro/mission');
    assert.throws(
      () => metadataFromNode('Body', {id: 'bad', title: 'Bad', description: 'Bad'}),
      /missing docId or to/,
    );
  });

  it('falls back when frontmatter fields are not strings', () => {
    const node = {
      id: 'mission',
      title: 'Mission',
      description: 'Mission description',
      docId: 'playbook/intro/mission',
      to: '/docs/intro/mission',
    };
    const sourceText = `---
title: 123
description: false
slug: 99
---

Body
`;
    const metadata = metadataFromNode(sourceText, node);
    assert.equal(metadata.title, 'Mission');
    assert.equal(metadata.description, 'Mission description');
    assert.equal(metadata.slug, '/intro/mission');
  });

  it('parses malformed frontmatter safely and renders overview links', () => {
    assert.deepEqual(parseSourceFrontmatter('no frontmatter'), {});
    assert.deepEqual(parseSourceFrontmatter('---\n- not\na map\n---\n'), {});
    assert.deepEqual(parseSourceFrontmatter('---\n- one\n- two\n---\n'), {});
    assert.deepEqual(parseSourceFrontmatter('---\nnull\n---\n'), {});
    assert.deepEqual(parseSourceFrontmatter('---\n42\n---\n'), {});
    const overview = renderAgentMirrorOverview(humanPlaybookTree);
    assert.match(overview, /Human Docs Mirror/);
    assert.match(overview, /\/agents\/intro\/our-approach/);
    assert.match(overview, /\/agents\/human-overview/);
    assert.match(overview, /### Playbook/);
    const customOverview = renderAgentMirrorOverview([
      {
        id: 'root',
        title: 'Root',
        description: 'Root description',
        docId: 'human-overview',
        to: '/docs/human-overview',
        children: [
          {
            id: 'section',
            title: 'Section',
            description: 'Section description',
            children: [
              {
                id: 'leaf',
                title: 'Leaf',
                description: 'Leaf description',
                docId: 'playbook/intro/sample',
                to: '/docs/intro/sample',
              },
            ],
          },
        ],
      },
    ]);
    assert.match(customOverview, /\/agents\/human-overview/);
    assert.match(customOverview, /  - \[Leaf\]/);
  });

  it('exposes mirror stripping helpers', () => {
    const input = `---
title: T
---

import X from 'y';

Body <Foo /> tail.
`;
    assert.match(stripAgentMirrorFrontmatter(input), /import X/);
    assert.match(stripAgentMirrorBody(input), /Body/);
    assert.doesNotMatch(stripAgentMirrorBody(input), /import X/);
  });

  it('generates deterministic mirror docs in a temp directory', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-docs-'));
    const humanDocsRoot = path.join(tempRoot, 'docs', 'human');
    const mirrorRoot = path.join(tempRoot, 'docs', 'agents', 'human');
    fs.mkdirSync(path.join(humanDocsRoot, 'playbook', 'intro'), {recursive: true});
    fs.writeFileSync(
      path.join(humanDocsRoot, 'playbook', 'intro', 'sample.md'),
      `---
title: Sample
description: Sample description
slug: /intro/sample
---

# Sample body
`,
      'utf8',
    );

    const node = {
      id: 'sample',
      title: 'Sample',
      description: 'Sample description',
      docId: 'playbook/intro/sample',
      to: '/docs/intro/sample',
    };
    const sourcePath = resolveHumanSourceFile(humanDocsRoot, node.docId);
    const output = buildAgentMirrorDocument(
      fs.readFileSync(sourcePath, 'utf8'),
      metadataFromNode(fs.readFileSync(sourcePath, 'utf8'), node),
    );
    const outputPath = path.join(mirrorRoot, 'playbook', 'intro', 'sample.md');
    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    fs.writeFileSync(outputPath, output, 'utf8');

    const written = fs.readFileSync(
      path.join(mirrorRoot, 'playbook', 'intro', 'sample.md'),
      'utf8',
    );
    assert.match(written, /source_doc_id: playbook\/intro\/sample/);
    assert.match(written, /# Sample body/);
  });
});
