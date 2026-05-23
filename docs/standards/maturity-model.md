---
title: Maturity model
description: Numeric readiness scale shared across docs, submissions, registry metadata, and review checklists.
content_kind: reference
slug: maturity-model
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---

| Level | Label | Meaning |
| ---: | --- | --- |
| 0 | Idea | Problem/opportunity identified |
| 1 | Spec | Product brief and intended user defined |
| 2 | Prototype | Rough working version exists |
| 3 | MVP | Useful end-to-end flow exists |
| 4 | Showcase | Polished enough to reference externally |
| 5 | Maintained product | Documentation, roadmap, telemetry, staffing |

Agents should escalate expectations aggressively as maturity increases—level 5 must never lack evaluation coverage.

## YAML metadata example

```yaml
maturity: 2
maturity_label: prototype
```

**Agent interpretation**: improve usability, backfill sparse docs/tests, articulate the MVP wedge, enumerate missing product risks.

:::tip Registry linkage

`/registry.json` entries include both `maturity` (numeric) and optional human-facing `maturity_label` tokens that map to lower-kebab shorthand for automation.

:::

## Cross-links

- [Folder contract](/standards/folder-contract)
- [`registry.json`](pathname:///registry.json)
- [Archetypes](/archetypes)
