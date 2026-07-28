import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';

import {collectRegistryErrors} from '../validate-registry.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const schema = fs.readFileSync(
  path.join(repoRoot, 'static/schemas/product.schema.json'),
  'utf8',
);

function writeFile(root, filePath, content) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), {recursive: true});
  fs.writeFileSync(fullPath, content, 'utf8');
}

function product(archetype = 'known-archetype') {
  return {
    id: 'example',
    name: 'Example',
    status: 'prototype',
    maturity: 2,
    scope: 'community',
    archetype,
    problem: 'Validate starter metadata.',
    target_users: ['builders'],
    primary_decision: 'Whether to use the starter.',
    inputs: ['metadata'],
    outputs: ['validated metadata'],
    tags: ['example'],
  };
}

function registry(products = [product('known-archetype')]) {
  return {
    version: '1.0.0',
    canonical_url: 'https://build.trilemma.foundation/registry.json',
    description: 'Machine-readable registry of Trilemma and external microproducts.',
    products,
  };
}

describe('registry and starter validation', () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-validator-'));
    writeFile(root, 'static/schemas/product.schema.json', schema);
    writeFile(root, 'static/registry.json', JSON.stringify(registry()));
    writeFile(root, 'docs/archetypes/known-archetype.md', '# Known\n');
    writeFile(root, 'docs/archetypes/index.md', '# Index\n');
    writeFile(root, 'product-templates/starter/product.yaml', JSON.stringify(product()));
    writeFile(root, 'product-templates/README.md', 'not a template directory\n');
  });

  afterEach(() => {
    fs.rmSync(root, {recursive: true, force: true});
  });

  it('accepts catalog starters and documented registry archetypes', () => {
    writeFile(
      root,
      'static/registry.json',
      JSON.stringify(registry([{...product('known-archetype'), site: 'https://example.com'}])),
    );
    assert.deepEqual(collectRegistryErrors(root), []);
  });

  it('accepts same-origin URLs that resolve to files under static/', () => {
    writeFile(root, 'static/registry.json', JSON.stringify(registry([{
      ...product('known-archetype'),
      agent_entrypoint: 'https://build.trilemma.foundation/registry.json',
    }])));
    assert.deepEqual(collectRegistryErrors(root), []);
  });

  it('rejects missing same-origin static paths and directory URLs', () => {
    writeFile(root, 'static/registry.json', JSON.stringify(registry([{
      ...product('known-archetype'),
      agent_entrypoint: 'https://build.trilemma.foundation/products/missing/AGENTS.md',
      docs: 'https://build.trilemma.foundation/schemas/',
    }])));
    const errors = collectRegistryErrors(root);
    assert.ok(
      errors.some((error) =>
        error.includes('does not exist under static/ (products/missing/AGENTS.md)'),
      ),
    );
    assert.ok(
      errors.some((error) =>
        error.includes('must point to an existing file under static/'),
      ),
    );
  });

  it('rejects same-origin URLs whose decoded path escapes static/', () => {
    // Encoded slashes + `..` survive URL parsing and escape after decodeURIComponent.
    writeFile(root, 'static/registry.json', JSON.stringify(registry([{
      ...product('known-archetype'),
      agent_entrypoint:
        'https://build.trilemma.foundation/a/b%2f%2e%2e%2f%2e%2e%2f%2e%2e%2foutside.md',
    }])));
    assert.ok(
      collectRegistryErrors(root).some((error) =>
        error.includes('path escapes static/'),
      ),
    );
  });

  it('reports undocumented archetypes in registry products', () => {
    writeFile(
      root,
      'static/registry.json',
      JSON.stringify(registry([product('unknown-archetype')])),
    );
    assert.ok(
      collectRegistryErrors(root).some((error) =>
        error.includes("registry.json: products[0].archetype 'unknown-archetype' is not a documented archetype"),
      ),
    );
  });

  it('reports schema, URL, and starter-catalog failures', () => {
    writeFile(
      root,
      'static/registry.json',
      JSON.stringify(registry([{id: 'broken', site: 'http://localhost'}])),
    );
    writeFile(
      root,
      'product-templates/starter/product.yaml',
      JSON.stringify({...product('unknown-archetype'), docs: 'https://127.0.0.1'}),
    );

    const errors = collectRegistryErrors(root);
    assert.ok(errors.some((error) => error.includes('failed schema')));
    assert.ok(errors.some((error) => error.includes('must use HTTPS')));
    assert.ok(errors.some((error) => error.includes('must use a public hostname')));
    assert.ok(errors.some((error) => error.includes("'unknown-archetype' is not a documented archetype")));
  });

  it('reports invalid registry roots and canonical fields', () => {
    writeFile(root, 'static/registry.json', '[]');
    assert.ok(
      collectRegistryErrors(root).some((error) => error.includes('root must be an object')),
    );

    writeFile(
      root,
      'static/registry.json',
      JSON.stringify({version: '2', canonical_url: 'wrong', description: 'wrong', products: {}}),
    );
    const errors = collectRegistryErrors(root);
    assert.ok(errors.some((error) => error.includes('unexpected version')));
    assert.ok(errors.some((error) => error.includes('canonical_url mismatch')));
    assert.ok(errors.some((error) => error.includes('description must match')));
    assert.ok(errors.some((error) => error.includes('products must be an array')));
  });

  it('reports unreadable registry and schema data', () => {
    writeFile(root, 'static/registry.json', 'not json');
    assert.ok(
      collectRegistryErrors(root).some((error) => error.includes('registry.json: invalid JSON')),
    );

    writeFile(root, 'static/schemas/product.schema.json', 'not json');
    assert.ok(
      collectRegistryErrors(root).some((error) =>
        error.includes('product.schema.json: invalid JSON'),
      ),
    );

    writeFile(root, 'static/schemas/product.schema.json', JSON.stringify({type: 'invalid'}));
    assert.ok(
      collectRegistryErrors(root).some((error) =>
        error.includes('product.schema.json: invalid schema'),
      ),
    );
  });

  it('reports malformed and null starter YAML documents', () => {
    writeFile(root, 'product-templates/starter/product.yaml', 'id: [\n');
    assert.ok(
      collectRegistryErrors(root).some((error) => error.includes('invalid YAML')),
    );

    writeFile(root, 'product-templates/starter/product.yaml', 'null\n');
    assert.ok(
      collectRegistryErrors(root).some((error) => error.includes('failed schema')),
    );
  });

  it('validates non-object starter values through the schema', () => {
    writeFile(root, 'product-templates/starter/product.yaml', '[]\n');
    assert.ok(
      collectRegistryErrors(root).some((error) => error.includes('failed schema')),
    );
  });

  it('reports missing archetype and template directories', () => {
    fs.rmSync(path.join(root, 'docs/archetypes'), {recursive: true});
    fs.rmSync(path.join(root, 'product-templates'), {recursive: true});

    const errors = collectRegistryErrors(root);
    assert.ok(errors.includes('docs/archetypes directory does not exist'));
    assert.ok(errors.includes('product-templates directory does not exist'));
  });
});
