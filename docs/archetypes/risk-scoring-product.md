---
title: "Archetype: Risk scoring product"
description: Prioritize cases, assets, or actions when downside risk dominates decisions.
content_kind: reference
slug: risk-scoring-product
last_reviewed: 2026-08-28
authors: [trilemma-foundation]
---


## Use when

The product helps users prioritize entities, cases, assets, decisions, or actions based on risk.

## Common users

- Analysts
- Operators
- Reviewers
- Researchers
- Decision-makers

## Minimal MVP

- Input form or dataset
- Risk scoring logic
- Explanation layer
- Output score
- Suggested action
- Basic audit trail

## Required files

Follow the [folder contract](/standards/folder-contract):

- `README.md`
- `AGENTS.md`
- `product.yaml`
- `product-brief.md`
- `architecture.md`
- `data-contract.md`
- `evaluation.md`
- `roadmap.md`
- `demo.md`
- `src/`
- `tests/`

## Evaluation

- Calibration
- Precision/recall
- False-negative cost
- Human usefulness
- Explainability
- Stability over time

## Reference products

- SurgRisk

## Common mistakes

- Producing a score with no recommended action
- Hiding assumptions
- Ignoring false negatives
- Optimizing only for model accuracy
- Failing to explain the result

## Agent prompt

You are building a risk scoring microproduct. First identify the target user, the entity being scored, the consequence of false positives and false negatives, and the action the user should take from the score. Then build the smallest version that produces a score, explanation, and recommended next step.
