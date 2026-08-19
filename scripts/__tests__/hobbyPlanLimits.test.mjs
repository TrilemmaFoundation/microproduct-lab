import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import {
  DEPLOY_QUICKSTART_RELATIVE_PATH,
  OBSOLETE_HOBBY_QUOTA_PATTERNS,
  REQUIRED_HOBBY_LIMIT_MARKERS,
  collectDeployQuickstartHobbyLimitErrors,
  collectHobbyLimitDocErrors,
} from '../hobbyPlanLimits.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const validHobbySection = [
  'See [Hobby plan](https://vercel.com/docs/plans/hobby) and',
  '[fair use](https://vercel.com/docs/limits/fair-use-guidelines).',
  '',
  '- **Fast Data Transfer**: up to 100 GB per month',
  '- **Active CPU**: up to 4 CPU-hrs per month',
  '- **Provisioned Memory**: up to 360 GB-hrs per month',
].join('\n');

const obsoleteHobbySection = [
  '- **Bandwidth**: 100 GB per month',
  '- **Build minutes**: 6,000 per month',
  '- **Serverless execution**: 100 GB-hours per month',
].join('\n');

describe('hobbyPlanLimits', () => {
  it('accepts the committed deploy-quickstart Hobby section', () => {
    assert.deepEqual(collectDeployQuickstartHobbyLimitErrors(ROOT), []);
    const markdown = fs.readFileSync(
      path.join(ROOT, DEPLOY_QUICKSTART_RELATIVE_PATH),
      'utf8',
    );
    assert.deepEqual(collectHobbyLimitDocErrors(markdown), []);
  });

  it('uses the default label when none is provided', () => {
    const errors = collectHobbyLimitDocErrors(obsoleteHobbySection);
    assert.ok(errors.every((error) => error.startsWith(`${DEPLOY_QUICKSTART_RELATIVE_PATH}:`)));
  });

  it('rejects retired Hobby quota copy', () => {
    const errors = collectHobbyLimitDocErrors(obsoleteHobbySection, 'fixture.md');
    assert.ok(errors.some((error) => error.includes("must not list a Hobby 'Build minutes' monthly quota")));
    assert.ok(errors.some((error) => error.includes('must not claim a 6,000-per-month Hobby quota')));
    assert.ok(
      errors.some((error) => error.includes("must not list a Hobby 'Serverless execution' quota")),
    );
    assert.ok(
      errors.some((error) => error.includes('must not claim 100 GB-hours of Hobby serverless execution')),
    );
  });

  it('requires current Hobby markers and canonical Vercel links', () => {
    const errors = collectHobbyLimitDocErrors('Hobby is free.', 'fixture.md');
    assert.ok(errors.some((error) => error.includes('must mention Fast Data Transfer')));
    assert.ok(errors.some((error) => error.includes('must mention Active CPU')));
    assert.ok(errors.some((error) => error.includes('must mention Provisioned Memory')));
    assert.ok(errors.some((error) => error.includes('must link to the Vercel Hobby plan docs')));
    assert.ok(errors.some((error) => error.includes('must link to the Vercel fair use guidelines')));
  });

  it('accepts a complete replacement section', () => {
    assert.deepEqual(collectHobbyLimitDocErrors(validHobbySection, 'fixture.md'), []);
  });

  it('skips validation when the playbook file is absent', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hobby-limits-missing-'));
    try {
      assert.deepEqual(collectDeployQuickstartHobbyLimitErrors(root), []);
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  });

  it('reports errors from a present playbook file', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hobby-limits-present-'));
    try {
      const filePath = path.join(root, DEPLOY_QUICKSTART_RELATIVE_PATH);
      fs.mkdirSync(path.dirname(filePath), {recursive: true});
      fs.writeFileSync(filePath, obsoleteHobbySection, 'utf8');
      const errors = collectDeployQuickstartHobbyLimitErrors(root);
      assert.ok(errors.some((error) => error.startsWith(`${filePath}:`)));
      assert.ok(errors.some((error) => error.includes('Build minutes')));
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  });

  it('accepts a present playbook file with current Hobby copy', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hobby-limits-valid-'));
    try {
      const filePath = path.join(root, DEPLOY_QUICKSTART_RELATIVE_PATH);
      fs.mkdirSync(path.dirname(filePath), {recursive: true});
      fs.writeFileSync(filePath, validHobbySection, 'utf8');
      assert.deepEqual(collectDeployQuickstartHobbyLimitErrors(root), []);
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  });

  it('reports missing Hobby markers when the playbook file is empty', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hobby-limits-empty-'));
    try {
      const filePath = path.join(root, DEPLOY_QUICKSTART_RELATIVE_PATH);
      fs.mkdirSync(path.dirname(filePath), {recursive: true});
      fs.writeFileSync(filePath, '', 'utf8');
      const errors = collectDeployQuickstartHobbyLimitErrors(root);
      assert.equal(errors.length, REQUIRED_HOBBY_LIMIT_MARKERS.length);
      assert.ok(errors.every((error) => error.startsWith(`${filePath}:`)));
      for (const {message} of REQUIRED_HOBBY_LIMIT_MARKERS) {
        assert.ok(errors.some((error) => error.includes(message)));
      }
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  });

  it('rejects unbolded and unpunctuated retired quota phrases', () => {
    const nearMisses = [
      {id: 'build-minutes-heading', snippet: 'Build minutes: none'},
      {id: 'six-thousand-per-month', snippet: '6000 per month'},
      {id: 'serverless-execution-heading', snippet: 'Serverless execution quota'},
      {id: 'hundred-gb-hours', snippet: '100 GB hours'},
    ];
    assert.equal(nearMisses.length, OBSOLETE_HOBBY_QUOTA_PATTERNS.length);

    for (const {id, snippet} of nearMisses) {
      const rule = OBSOLETE_HOBBY_QUOTA_PATTERNS.find((pattern) => pattern.id === id);
      assert.ok(rule, `missing obsolete quota rule ${id}`);
      const errors = collectHobbyLimitDocErrors(`${validHobbySection}\n${snippet}`, 'fixture.md');
      assert.deepEqual(errors, [`fixture.md: ${rule.message}`]);
    }
  });

  it('rejects each retired quota phrase on its own', () => {
    const retiredSnippets = [
      {id: 'build-minutes-heading', snippet: '**Build minutes**'},
      {id: 'six-thousand-per-month', snippet: '6,000 per month'},
      {id: 'serverless-execution-heading', snippet: '**Serverless execution**'},
      {id: 'hundred-gb-hours', snippet: '100 GB-hours'},
    ];
    assert.equal(retiredSnippets.length, OBSOLETE_HOBBY_QUOTA_PATTERNS.length);

    for (const {id, snippet} of retiredSnippets) {
      const rule = OBSOLETE_HOBBY_QUOTA_PATTERNS.find((pattern) => pattern.id === id);
      assert.ok(rule, `missing obsolete quota rule ${id}`);
      const errors = collectHobbyLimitDocErrors(`${validHobbySection}\n${snippet}`, 'fixture.md');
      assert.deepEqual(errors, [`fixture.md: ${rule.message}`]);
    }
  });

  it('rejects retired quota copy regardless of case', () => {
    const errors = collectHobbyLimitDocErrors(
      `${validHobbySection}\n- **BUILD MINUTES**: 6,000 PER MONTH\n- **serverless execution**: 100 gb-hours`,
      'fixture.md',
    );
    assert.equal(errors.length, OBSOLETE_HOBBY_QUOTA_PATTERNS.length);
    for (const {message} of OBSOLETE_HOBBY_QUOTA_PATTERNS) {
      assert.ok(errors.some((error) => error.includes(message)));
    }
  });

  it('does not treat current Hobby wording as retired quotas', () => {
    const markdown = [
      validHobbySection,
      '- **Builds**: Hobby has no monthly build-minute quota.',
      '- **Function invocations**: up to 1 million per month',
      '- **Provisioned Memory**: up to 360 GB-hrs per month',
    ].join('\n');
    assert.deepEqual(collectHobbyLimitDocErrors(markdown, 'fixture.md'), []);
  });

  it('reports each missing required Hobby marker independently', () => {
    for (const {needle, message} of REQUIRED_HOBBY_LIMIT_MARKERS) {
      const markdown = validHobbySection.replace(needle, '');
      assert.deepEqual(collectHobbyLimitDocErrors(markdown, 'fixture.md'), [
        `fixture.md: ${message}`,
      ]);
    }
  });

  it('requires exact Hobby metric names and https Vercel URLs', () => {
    const markdown = validHobbySection
      .replace('Fast Data Transfer', 'fast data transfer')
      .replace('Active CPU', 'active cpu')
      .replace('Provisioned Memory', 'provisioned memory')
      .replaceAll('https://vercel.com/', 'http://vercel.com/');
    const errors = collectHobbyLimitDocErrors(markdown, 'fixture.md');
    assert.equal(errors.length, REQUIRED_HOBBY_LIMIT_MARKERS.length);
    for (const {message} of REQUIRED_HOBBY_LIMIT_MARKERS) {
      assert.ok(errors.some((error) => error.includes(message)));
    }
  });

  it('treats empty markdown as missing every required marker', () => {
    const errors = collectHobbyLimitDocErrors('', 'fixture.md');
    assert.equal(errors.length, REQUIRED_HOBBY_LIMIT_MARKERS.length);
    assert.equal(
      errors.filter((error) => error.includes('must not')).length,
      0,
    );
  });

  it('keeps reporting obsolete quotas on repeated checks', () => {
    const first = collectHobbyLimitDocErrors(obsoleteHobbySection, 'fixture.md');
    const second = collectHobbyLimitDocErrors(obsoleteHobbySection, 'fixture.md');
    assert.deepEqual(first, second);
    assert.equal(
      first.filter((error) => error.includes('must not')).length,
      OBSOLETE_HOBBY_QUOTA_PATTERNS.length,
    );
  });
});
