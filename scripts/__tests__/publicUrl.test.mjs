import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import {validatePublicHttpsUrl} from '../publicUrl.mjs';

test('accepts public HTTPS URLs', () => {
  assert.equal(validatePublicHttpsUrl('https://docs.example.com/path?q=1#section'), null);
});

test('rejects unsafe or non-public URLs', () => {
  const invalidUrls = [
    'http://example.com',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'https://user:password@example.com',
    'https://localhost',
    'https://docs.localhost',
    'https://service.local',
    'https://service.internal',
    'https://127.0.0.1',
    'https://[::1]',
    'https://169.254.169.254/latest/meta-data/',
    'not a URL',
  ];

  for (const value of invalidUrls) {
    assert.notEqual(validatePublicHttpsUrl(value), null, value);
  }
});

test('schema requires HTTPS for every public URL field', () => {
  const root = path.resolve(import.meta.dirname, '../..');
  const schema = JSON.parse(
    fs.readFileSync(path.join(root, 'static/schemas/product.schema.json'), 'utf8'),
  );
  const registry = JSON.parse(
    fs.readFileSync(path.join(root, 'static/registry.json'), 'utf8'),
  );
  const ajv = new Ajv2020({strict: false});
  addFormats(ajv);
  const validate = ajv.compile(schema);

  assert.equal(validate(registry.products[0]), true);
  for (const field of ['repo', 'site', 'docs', 'agent_entrypoint']) {
    assert.equal(validate({...registry.products[0], [field]: 'http://example.com'}), false, field);
  }
});
