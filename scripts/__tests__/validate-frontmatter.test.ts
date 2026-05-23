import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const validatorScript = path.resolve(process.cwd(), 'scripts/validate-frontmatter.mjs');

function writeFile(root: string, filePath: string, content: string) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

function baseTemplate(frontmatterBody: string) {
  return `---\n${frontmatterBody}\n---\n\nBody\n`;
}

function setupFixture(missionFrontmatter: string) {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'frontmatter-validator-'));

  writeFile(
    fixtureDir,
    'src/data/authors.ts',
    [
      'export const authors = [',
      "  {id: 'trilemma-foundation', name: 'Trilemma Foundation'},",
      '];',
    ].join('\n'),
  );

  writeFile(
    fixtureDir,
    'docs/human/intro/mission.md',
    baseTemplate(missionFrontmatter),
  );

  writeFile(
    fixtureDir,
    'docs/showcase/microproducts.md',
    `${baseTemplate(
      [
        'title: Microproducts Showcase',
        'description: Community-maintained table of microproducts being built.',
        'slug: /',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    )}\n| Name | Description | Team | Link |\n| --- | --- | --- | --- |\n`,
  );

  writeFile(
    fixtureDir,
    'templates/playbook-module.md',
    baseTemplate(
      [
        'title: Playbook Module',
        'description: Template entry',
        'last_reviewed: 2026-03-05',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    ),
  );

  fs.mkdirSync(path.join(fixtureDir, 'product-templates'), { recursive: true });

  return fixtureDir;
}

function runValidator(cwd: string) {
  return spawnSync('node', [validatorScript], {
    cwd,
    encoding: 'utf8',
  });
}

describe('validate-frontmatter tags handling', () => {
  it('passes when tags are missing', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Frontmatter validation passed.');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('passes with inline tags list', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'tags: [intro, mission]',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(0);
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('passes with block-list tags', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'tags:',
        '  - intro',
        '  - mission',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(0);
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails when tags are not a list', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'tags: mission',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('tags must be a YAML list of strings');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails when tags list contains non-string values', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'tags: [intro, 123]',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('tags must contain only string values');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });
});

describe('validate-frontmatter authors handling', () => {
  it('passes with valid author IDs', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(0);
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails when authors are missing', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'last_reviewed: 2026-03-04',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("missing required frontmatter field 'authors'");
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails when authors are not a list', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'last_reviewed: 2026-03-04',
        'authors: trilemma-foundation',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('authors must be a YAML list of strings');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails when authors contain non-string values', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'last_reviewed: 2026-03-04',
        'authors: [123]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('authors must contain only string values');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails when author IDs are unknown', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'last_reviewed: 2026-03-04',
        'authors: [unknown-author]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("unknown author ID 'unknown-author'");
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });
});

describe('validate-frontmatter content_kind handling', () => {
  it('passes for foundation pages without authors', () => {
    const fixtureDir = setupFixture(
      [
        'title: Human Overview',
        'description: A tree map for reading and contributing.',
        'content_kind: foundation',
        'last_reviewed: 2026-05-22',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(0);
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails for module pages without authors', () => {
    const fixtureDir = setupFixture(
      [
        'title: Data Stack',
        'description: A granular playbook module.',
        'content_kind: module',
        'last_reviewed: 2026-05-22',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("missing required frontmatter field 'authors'");
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('fails for invalid content_kind values', () => {
    const fixtureDir = setupFixture(
      [
        'title: Mission',
        'description: Why this open knowledge hub exists and what success looks like.',
        'content_kind: blog',
        'last_reviewed: 2026-03-04',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('content_kind must be one of foundation, module, reference');
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('passes for reference pages with foundation attribution', () => {
    const fixtureDir = setupFixture(
      [
        'title: Authors',
        'description: People and organizations contributing to Build Trilemma docs.',
        'content_kind: reference',
        'last_reviewed: 2026-05-22',
        'authors: [trilemma-foundation]',
      ].join('\n'),
    );

    const result = runValidator(fixtureDir);
    expect(result.status).toBe(0);
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });
});
