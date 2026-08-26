---
title: What counts as a good microproduct
description: Qualitative guardrails complementing structured metadata and automated checks.
content_kind: reference
slug: what-counts-as-good
last_reviewed: 2026-08-26
authors: [trilemma-foundation]
---

Good microproducts share several observable traits—most of them discoverable directly from Markdown contracts plus live demos:

- Narrow decision surface with observable inputs and outputs documented in [/standards/folder-contract#markdown-contract-purposes](/standards/folder-contract#markdown-contract-purposes).
- Transparent evaluation—even qualitative rubrics—in [/standards/folder-contract#markdown-contract-purposes](/standards/folder-contract#markdown-contract-purposes).
- Honest acknowledgement of brittle assumptions surfaced in README + AGENTS files.
- Repro instructions that do not rely on unpublished secrets (`demo.md`).
- Material external data dependencies have documented provenance and usage rights in `data-contract.md`.

## Signals that should block promotion

| Anti-pattern | Why it fails |
| --- | --- |
| Dashboards without actions | Humans cannot automate follow-ups |
| Vague personas | Unable to prioritize roadmap |
| Implicit model drift | Silent failures undermine trust |
| Missing agent entrypoints | Blocks hybrid human/agent teams |
| Unknown or incompatible data usage rights | A legally unusable dataset is an undocumented dependency; Frame is incomplete until it is resolved |

Treat this page as prose backing the actionable items listed in `/AGENTS.md`.
