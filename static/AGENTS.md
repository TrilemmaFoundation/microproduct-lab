# Build Trilemma — Agent Instructions

## Purpose

Build Trilemma is the AI-agent control panel for building microproducts, inside or outside Trilemma Foundation.

A microproduct is a focused software tool that turns data, models, workflows, or domain knowledge into usable utility for a specific user decision or task.

## Site routes

- `/` — Audience chooser (agents vs humans).
- `/agents` — Web control plane for AI agents (start here in the browser).
- `/docs/human-overview` — Default human overview and playbook tree.

## Primary agent objective

Help users design, scaffold, build, validate, and improve microproducts using Trilemma's canonical standards, templates, schemas, and review workflows.

## What agents should do

When helping build a microproduct:

1. Identify the target user.
2. Identify the specific problem or decision.
3. Select the closest microproduct archetype.
4. Choose the appropriate template.
5. Generate or update the standard product files.
6. Keep scope narrow and shippable.
7. Prefer working software over speculative architecture.
8. Include tests, documentation, and evaluation criteria.
9. Validate against the product schema.
10. Prepare the project for human review.

## Canonical resources

- Product registry: /registry.json
- Templates: /templates
- Archetypes: /archetypes
- Standards: /standards
- Contribution guide: /contribute
- Product schema: /schemas/product.schema.json
- Full LLM context: /llms-full.txt

## Required microproduct files

Each microproduct should include:

- README.md
- AGENTS.md
- product.yaml
- product-brief.md
- architecture.md
- data-contract.md
- evaluation.md
- roadmap.md
- demo.md

## Good microproduct characteristics

A good microproduct:

- Solves one clear problem.
- Serves a clearly defined user.
- Produces a useful output.
- Can be explained quickly.
- Can be tested or evaluated.
- Is small enough to ship.
- Has a clear path from data/input to action/output.

## Bad microproduct characteristics

Avoid:

- Generic dashboards with no decision support.
- Broad platforms with unclear users.
- Unvalidated AI wrappers.
- Unstructured notebooks with no product path.
- Overbuilt architecture before a useful MVP exists.
- Hidden assumptions.
- Missing README, schema, or evaluation criteria.

## Build workflow

1. Read product.yaml.
2. Read product-brief.md.
3. Inspect the selected template.
4. Confirm the archetype.
5. Generate the minimum useful implementation.
6. Add or update tests.
7. Add demo instructions.
8. Validate metadata.
9. Summarize remaining gaps.

## Default implementation bias

Prefer:

- Simple architecture.
- Clear file structure.
- Typed interfaces.
- Reproducible setup.
- Observable outputs.
- Small PRs.
- Human-readable explanations.

Avoid:

- Premature microservices.
- Excessive dependencies.
- Unclear abstractions.
- Hidden API requirements.
- Non-reproducible notebooks.
- Vague "AI-powered" claims.
