---
title: "Archetype: Agentic research product"
description: Multi-step investigations where autonomous agents gather evidence under policy.
content_kind: reference
slug: agentic-research-product
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---


## Use when

Open-ended questions need iterative retrieval, tooling, synthesis, yet must remain attributable.

## Common users

- Strategy teams scouting markets
- Policy analysts assembling briefs
- Engineers doing incident archaeology

## Minimal MVP

- Planner with capped tool budget
- Citation-required answers
- Human checkpoint before irreversible actions
- Session transcripts for auditing

## Required files

- `product.yaml`
- `product-brief.md`
- `data-contract.md`
- `evaluation.md`
- `demo.md`

## Evaluation

- Groundedness audits
- Time saved vs purely manual paths
- Policy violation rate under red teaming

## Reference products

- Internal research copilots with hardened toolkits

## Common mistakes

- Unguarded autonomous posting or purchasing
- Flattened context without provenance graphs
- No kill switch for expensive toolchains

## Agent prompt

You are building agentic research software. Establish allowed tools, spend caps, human approvals, citation rules, logging, then implement the shortest reliable investigation loop.
