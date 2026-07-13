---
title: How to Contribute
description: Exact process for proposing and publishing new hub content.
content_kind: reference
slug: /
last_reviewed: 2026-07-13
authors: [trilemma-foundation]
---

## Contribution Workflow

Use Node.js 22 for repository work. Run `nvm use` to select the Node.js 22.18.0
version pinned in `.nvmrc`, then install the locked dependency tree with
`npm ci`.

1. Pick a section and copy the correct template from `templates/`.
2. Add required YAML frontmatter and content. `last_reviewed` must be a real
   calendar date in `YYYY-MM-DD` form.
3. Run `npm run typecheck`, `npm run check`, and `npm run test:coverage` locally.
4. Open a PR and complete the checklist.
5. Committee members review, request changes if needed, and merge.

Frontmatter is parsed as full YAML, so quoted and multiline values, lists,
mappings, numbers, and booleans use normal YAML syntax. Malformed YAML and
duplicate keys fail validation.

Registry link fields (`repo`, `site`, `docs`, and `agent_entrypoint`) must use
public HTTPS domains. Localhost, local or internal domains, credentials, and
IP-address destinations are rejected by registry validation.

Starter `product.yaml` files are validated against the public product schema
and must select an archetype documented in the catalog. External registry
products may use additional archetype names.

`npm run test:coverage` runs Jest for React code and Node's built-in test
runner for scripts. The critical validation, read-time, and LLM transformation
modules must retain 100% line, branch, and function coverage.

## Review Expectations

- Clear structure
- Actionable information
- Correct metadata
