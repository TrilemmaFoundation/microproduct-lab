---
title: "Archetype: Benchmark evaluation product"
description: Compare competing models, pipelines, or policies with fair harnesses.
content_kind: reference
slug: benchmark-evaluation-product
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---


## Use when

Buyers must pick among vendors, models, or strategies using apples-to-apples evidence.

## Common users

- ML platform leads
- Procurement science teams
- Competition governance boards

## Minimal MVP

- Frozen evaluation dataset(s) with licenses noted
- Runner that logs hardware + software fingerprint
- Leaderboard with confidence intervals
- Regression tests when baselines move

## Required files

- `product.yaml`
- `product-brief.md`
- `data-contract.md`
- `evaluation.md`
- `demo.md`

## Evaluation

- Statistical significance on primary metric
- Robustness sweeps (noise, latency)
- Reproducibility score (rerun variance)

## Reference products

- GLUE-style leaderboards adapted to private data

## Common mistakes

- Leaderboards without versioned data
- Cherry-picked slices
- Ignoring cost-to-serve

## Agent prompt

You are building a benchmark microproduct. Freeze datasets, document licensing, script the harness, and only then publish comparative tables with uncertainty.
