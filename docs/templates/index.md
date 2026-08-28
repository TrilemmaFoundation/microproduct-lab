---
title: Product templates overview
description: Starter repositories for scaffolding microproducts—from data apps to agentic workflows.
content_kind: reference
slug: /
last_reviewed: 2026-08-28
authors: [trilemma-foundation]
---

Build Trilemma hosts opinionated starters under **`product-templates/`** in [microproduct-lab](https://github.com/TrilemmaFoundation/microproduct-lab). Each starter includes README, AGENTS guidance, YAML metadata stubs, Markdown contracts, `src/` and `tests/` placeholders, and GitHub Actions (stub workflows until you attach a toolchain).

:::info Legacy markdown templates

The top-level **`templates/`** folder is for documentation scaffolding (for example playbook modules)—not runnable product repos.

:::

## Starter index

Each row links into the canonical repository paths.

| Template | Archetype | Audience | Highlights |
| --- | --- | --- | --- |
| [**data-app**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/data-app) | [data-to-decision-tool](/archetypes/data-to-decision-tool) | Engineers shipping decision tools atop structured datasets | Opinionated Markdown contracts plus placeholder app layout |
| [**llm-app**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/llm-app) | [agentic-research-product](/archetypes/agentic-research-product) | Teams combining retrieval/classification workflows | Mirrors standard agent files for LLM-first delivery |
| [**analytics-api**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/analytics-api) | [forecasting-product](/archetypes/forecasting-product) | Builders exposing reusable APIs around analytics | Highlights data contracts meant for integrations |
| [**dashboard-to-tool**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/dashboard-to-tool) | [data-to-decision-tool](/archetypes/data-to-decision-tool) | Teams converting passive dashboards | Focus on decision outcomes and evaluation |
| [**research-to-product**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/research-to-product) | [benchmark-evaluation-product](/archetypes/benchmark-evaluation-product) | Researchers hardening notebook insights | Emphasizes reproducibility and promotion path |
| [**capstone-project**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/capstone-project) | [workflow-automation-product](/archetypes/workflow-automation-product) | Students and faculty partners | Adds classroom-friendly README framing |
| [**benchmark-suite**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/benchmark-suite) | [benchmark-evaluation-product](/archetypes/benchmark-evaluation-product) | Evaluation-heavy teams | Evaluation + metrics docs first |
| [**agentic-workflow**](https://github.com/TrilemmaFoundation/microproduct-lab/tree/main/product-templates/agentic-workflow) | [workflow-automation-product](/archetypes/workflow-automation-product) | Operators orchestrating autonomous agents | Captures escalation + human review hooks |

:::caution Stub CI workflows

Starter `.github/workflows/checks.yml` files intentionally perform placeholder steps so you can choose **npm**, **pnpm**, **uv**, etc. Swap them once you finalize your stack.

:::

## References

- [Archetypes](/archetypes) — pick patterns before scaffolding.
- [Standards](/standards) — required files & maturity semantics.
- [Contribute workflow](/contribute) — submissions for this registry.
