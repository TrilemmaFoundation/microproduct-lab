#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {JSON_SCHEMA, load} from 'js-yaml';

import {validatePublicHttpsUrl} from './publicUrl.mjs';
import {EXPECTED_REGISTRY_ROOT, SITE_HOST} from './registryRootExpectations.mjs';

const publicUrlFields = ['repo', 'site', 'docs', 'agent_entrypoint'];

/**
 * Same-origin build.trilemma.foundation URLs must resolve to a real file under static/.
 * @param {string} root
 * @param {string} value
 * @param {string} label
 * @param {string} field
 * @param {string[]} errors
 */
function validateSameOriginStaticPath(root, value, label, field, errors) {
  // Caller already ran validatePublicHttpsUrl, so URL parsing succeeds.
  const url = new URL(value);

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (hostname !== SITE_HOST) {
    return;
  }

  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!relative || relative.endsWith('/')) {
    errors.push(
      `${label}.${field} must point to an existing file under static/ on ${SITE_HOST}`,
    );
    return;
  }

  const staticRoot = path.resolve(root, 'static');
  const candidate = path.resolve(staticRoot, relative);
  if (candidate !== staticRoot && !candidate.startsWith(`${staticRoot}${path.sep}`)) {
    errors.push(`${label}.${field} path escapes static/`);
    return;
  }

  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    errors.push(
      `${label}.${field} does not exist under static/ (${relative})`,
    );
  }
}

function validateProduct(product, label, validateSchema, errors, archetypes, root) {
  if (!validateSchema(product)) {
    const message = validateSchema.errors
      ?.map((error) => `${error.instancePath || '/'} ${error.message}`)
      .join('; ');
    errors.push(`${label} failed schema: ${message}`);
  }

  for (const field of publicUrlFields) {
    if (typeof product?.[field] !== 'string') {
      continue;
    }
    const urlError = validatePublicHttpsUrl(product[field]);
    if (urlError) {
      errors.push(`${label}.${field} ${urlError}`);
      continue;
    }
    validateSameOriginStaticPath(root, product[field], label, field, errors);
  }

  if (
    archetypes &&
    typeof product?.archetype === 'string' &&
    !archetypes.has(product.archetype)
  ) {
    errors.push(`${label}.archetype '${product.archetype}' is not a documented archetype`);
  }
}

function loadJson(filePath, label, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${label}: invalid JSON (${error.message})`);
    return null;
  }
}

function loadYaml(filePath, label, errors) {
  try {
    return load(fs.readFileSync(filePath, 'utf8'), {schema: JSON_SCHEMA});
  } catch (error) {
    errors.push(`${label}: invalid YAML (${error.message})`);
    return undefined;
  }
}

function documentedArchetypes(root, errors) {
  const archetypesRoot = path.join(root, 'docs', 'archetypes');
  if (!fs.existsSync(archetypesRoot)) {
    errors.push('docs/archetypes directory does not exist');
    return new Set();
  }
  return new Set(
    fs
      .readdirSync(archetypesRoot)
      .filter((name) => name.endsWith('.md') && name !== 'index.md')
      .map((name) => path.basename(name, '.md')),
  );
}

export function collectRegistryErrors(root = path.resolve(import.meta.dirname, '..')) {
  const errors = [];
  const registryPath = path.join(root, 'static', 'registry.json');
  const schemaPath = path.join(root, 'static', 'schemas', 'product.schema.json');
  const registry = loadJson(registryPath, 'registry.json', errors);
  const schema = loadJson(schemaPath, 'product.schema.json', errors);

  if (!schema) {
    return errors;
  }

  let validateSchema;
  try {
    const ajv = new Ajv2020({strict: true, allErrors: true});
    addFormats(ajv);
    validateSchema = ajv.compile(schema);
  } catch (error) {
    errors.push(`product.schema.json: invalid schema (${error.message})`);
    return errors;
  }

  const archetypes = documentedArchetypes(root, errors);

  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    errors.push('registry.json: root must be an object.');
  } else {
    if (registry.version !== EXPECTED_REGISTRY_ROOT.version) {
      errors.push(
        `registry.json: unexpected version '${registry.version}' (expected ${EXPECTED_REGISTRY_ROOT.version})`,
      );
    }
    if (registry.canonical_url !== EXPECTED_REGISTRY_ROOT.canonical_url) {
      errors.push('registry.json: canonical_url mismatch (expected canonical build URL).');
    }
    if (registry.description !== EXPECTED_REGISTRY_ROOT.description) {
      errors.push('registry.json: description must match canonical copy.');
    }
    if (!Array.isArray(registry.products)) {
      errors.push('registry.json: products must be an array.');
    } else {
      registry.products.forEach((product, index) => {
        validateProduct(
          product,
          `registry.json: products[${index}]`,
          validateSchema,
          errors,
          archetypes,
          root,
        );
      });
    }
  }
  const templatesRoot = path.join(root, 'product-templates');
  if (!fs.existsSync(templatesRoot)) {
    errors.push('product-templates directory does not exist');
    return errors;
  }
  for (const entry of fs.readdirSync(templatesRoot, {withFileTypes: true})) {
    if (!entry.isDirectory()) {
      continue;
    }
    const relativePath = `product-templates/${entry.name}/product.yaml`;
    const product = loadYaml(path.join(root, relativePath), relativePath, errors);
    if (typeof product !== 'undefined') {
      validateProduct(product, relativePath, validateSchema, errors, archetypes, root);
    }
  }

  return errors;
}

/* node:coverage disable */
function isMain() {
  return Boolean(
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href,
  );
}

if (isMain()) {
  const errors = collectRegistryErrors();
  if (errors.length > 0) {
    console.error('Registry validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Registry validation passed.');
  }
}
/* node:coverage enable */
