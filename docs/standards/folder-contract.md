---
title: Folder contract
description: Standard microproduct repository layout mandated for Trilemma-aligned projects.
content_kind: reference
slug: folder-contract
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---

Every microproduct—even experimental prototypes—is easier to shepherd when it conforms to one predictable repo shape.

```text
products/
  <product-id>/
    README.md
    AGENTS.md
    product.yaml
    product-brief.md
    architecture.md
    data-contract.md
    evaluation.md
    roadmap.md
    demo.md
    src/
    tests/
```

In practice your repository root **is** the `<product-id>` folder—omit the redundant `products/` prefix unless you deliberately group multiples in a monorepo.

## Markdown contract purposes

| File               | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `README.md`        | Orientation, onboarding, badges, screenshots         |
| `AGENTS.md`        | Product-local instructions tuned for collaborator agents |
| `product.yaml`     | Machine-readable mirror of `/schemas/product.schema.json` |
| `product-brief.md` | Users, pains, wedge, non-goals                       |
| `architecture.md`  | Bounded context diagrams, integrations, infra      |
| `data-contract.md` | Inputs, freshness, lineage, privacy tiers           |
| `evaluation.md`    | Metrics, thresholds, rollback triggers               |
| `roadmap.md`       | Next bets and explicit rejects                       |
| `demo.md`          | Scripts for humans *and* bots to replay happy paths  |

## Implementation directories

| Path     | Responsibility                                            |
| -------- | --------------------------------------------------------- |
| `src/`   | Application code respecting the documented architecture |
| `tests/` | Unit, contract, synthesis, smoke—match maturity depth    |

Agents must keep these files synced when scope changes—even if temporarily stubbed—to avoid silent divergence between humans and tooling.
