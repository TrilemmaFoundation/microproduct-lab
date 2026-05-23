# Microproduct lab (Build Trilemma)

This repository is the **Build Trilemma** site—patterns, templates, standards, registry, and playbooks for humans and AI agents—served from `https://build.trilemma.foundation`. Microproducts remain focused apps that turn data into usable tools and real utility.

This repository is an open knowledge hub to help builders learn, contribute, and ship microproducts through community-reviewed playbooks, resources, and examples.

## Start Here

- **Site routing:** On the deployed site, `/` is an audience chooser. Use `/docs/human-overview` as the human entry point and `/agents` as the agent web hub (paths match this repo’s Docusaurus routes). Stable machine-readable URLs such as `/registry.json` and `/schemas/product.schema.json` are summarized on the agents hub.
- Read: [What is a Microproduct?](docs/human/playbook/intro/what-is-a-microproduct.mdx)
- Learn the process: [Playbook](docs/human/playbook/frame/ideation.md)
- Explore examples: [Showcase](docs/showcase/microproducts.md)
- Contribute: [How to contribute](docs/contribute/how-to-contribute.md)
- Agent-facing files in the static site root: `static/AGENTS.md`, `static/llms.txt`, and generated `static/llms-full.txt` (created on `npm run build`)

## Local Development

Requires Node.js 22.18 or newer.

```bash
npm install
npm run dev
```

`npm run dev` runs a short pre-step that removes `.docusaurus` and `node_modules/.cache` so the first dev compile does not hit stale generated files. Use `npm run clear` for a full Docusaurus clean (including `build/`).

## Validation

```bash
npm run check
```

This runs:

- spelling check (`cspell` on `docs/`, `product-templates/`, `templates/`)
- frontmatter validation (`docs/`, `templates/`, `product-templates/`)
- registry JSON validation against `static/schemas/product.schema.json` (`validate:registry`)
- markdown lint for `docs/**/*.md` and `docs/**/*.mdx`, plus `README.md`, `CONTRIBUTING.md`, `templates/**/*.md`, `product-templates/**/*.md`, and `products/**/*.md`
- `generate-llms-full` followed by a production Docusaurus build (static + link checks)

## Tests

CI runs `npm run check` then `npm run test:coverage`. Locally:

```bash
npm run test:coverage
```

`npm test` and `npm run test:coverage` run **Jest** (React pages and utilities) and **Node’s built-in test runner** for `scripts/llmsMdxUtils.mjs`.

## Spelling Check

We use `cspell` to automatically check for spelling mistakes in the docs, which
helps prevent noisy review comments. This tool is integrated into IDEs, which
highlight spelling errors similarly to other linting or quality issues. If
you find that a word is not recognized, you have the option to add it to our
dictionary which is included in version control. Examples of domain-specific but
legitimate words that might be added include the term "Microproduct" itself.

Example: `echo "microproduct" >> project-words.txt`

Many IDEs support auto-fixing the issue. Here's what it looks like in VSCode:
![cspell auto-fix screenshot](static/tooling/cspell/cspell_auto_fix.png)

Make sure to add to dictionary file and not just editor settings so that the
change is picked up in the checker script and can be used by others.
