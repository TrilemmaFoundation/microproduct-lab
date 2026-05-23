---
title: "Archetype: Ranking recommendation engine"
description: Ordered lists with calibrated explanations for humans who must defend picks.
content_kind: reference
slug: ranking-recommendation-engine
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---


## Use when

Users must prioritize entities (jobs, securities, incidents) with interchangeable scoring knobs.

## Common users

- Talent teams
- Merchandisers
- Security triage desks

## Minimal MVP

- Feature store or tabular ingestion
- Scoring pipeline with versioning
- Explain-this-rank UX
- Human override + feedback capture

## Required files

- `product.yaml`
- `product-brief.md`
- `data-contract.md`
- `evaluation.md`
- `demo.md`

## Evaluation

- NDCG / precision@k when labels exist
- Fairness slices when regulated
- Stability when features refresh

## Reference products

- OddsFox-style ranking surfaces (see showcase)

## Common mistakes

- Black-box scores without counterfactuals
- Ignoring cold-start coverage
- Optimizing offline metrics that ignore business guardrails

## Agent prompt

You are building a ranking microproduct. First define the user task, label availability, and failure costs for false positives vs false negatives. Only then implement scoring, explanations, and feedback capture.
