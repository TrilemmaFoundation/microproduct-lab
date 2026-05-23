---
title: "Archetype: Data-to-decision tool"
description: Convert governed datasets into a narrow choice surface for operators.
content_kind: reference
slug: data-to-decision-tool
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---


## Use when

Operational teams must choose among a constrained set of actions using curated facts (not exploratory analytics).

## Common users

- Analysts bridging policy and spreadsheets
- Field operators executing playbooks
- Compliance reviewers auditing outcomes

## Minimal MVP

- Dataset intake with validation rules
- Decision matrix or rules engine
- Transparent rationale / citations to source rows
- Immutable decision log
- Rollback or appeal workflow

## Required files

- `product.yaml`
- `product-brief.md`
- `data-contract.md`
- `evaluation.md`
- `demo.md`

## Evaluation

- Decision latency vs manual baseline
- Override rate and override reasons
- Data freshness violations
- Drift when upstream schemas change

## Reference products

- Internal policy copilots with signed evidence trails

## Common mistakes

- Shipping another dashboard without default actions
- Hiding provenance when models assist ranking
- Skipping negative tests for malformed inputs

## Agent prompt

You are building a data-to-decision microproduct. Identify the enforcing policy, quantify acceptable latency, enumerate every regulated field, then implement the smallest flow that renders a justified action with citations and logging.
