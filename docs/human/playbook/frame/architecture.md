---
title: Architecture
description: Phase 1 module for selecting a practical modern data pipeline and system baseline.
slug: /playbook/architecture
tags: [playbook, architecture]
last_reviewed: 2026-03-05
authors: [trilemma-foundation]
---

## Phase Goal

Define an architecture that is feasible to run, affordable to sustain, and aligned with the product's first year of learning.

## Modern Data Pipeline: Why This Works

A modern data pipeline works for microproducts because it keeps ingestion, transformation, storage, and serving loosely coupled. This reduces coordination cost, improves iteration speed, and supports reliable product analytics from day one.

## Opinionated Baseline Stack

- Frontend: lightweight web UI focused on core workflows.
- API layer: focused endpoints for domain actions.
- Data pipeline: managed ingestion and scheduled transforms.
- Storage: transactional database as source of truth plus analytics-friendly modeled tables.
- Observability: centralized logs, key metrics, and failure alerts.

## Decision Framework: Why This DB?

Evaluate database choices against:

- Access pattern fit: transactional vs analytical workloads.
- Query complexity and latency needs.
- Operational burden for backup, scaling, and reliability.
- Team familiarity and implementation speed.
- Integration fit with pipeline and analytics tooling.

## 12-Month Feasibility Lens

Assess feasibility before building:

- Cost expectations: estimate lean, moderate, and scaled operating bands.
- Team and complexity constraints: match architecture to available engineering capacity.
- Build-vs-buy tradeoffs: buy managed capabilities unless differentiation requires custom build.
- Invalidation risks: identify constraints that make the baseline non-viable.

## Required Artifact: Architecture Decision Brief

Produce a brief that includes:

- Chosen baseline architecture and key alternatives considered.
- Database decision rationale.
- 12-month cost and operational assumptions.
- Risks, mitigations, and implementation handoff notes.

## Contributor Expansion Areas

- Reference architectures by product shape.
- Cost calculators and sizing worksheets.
- Migration patterns when initial architecture limits growth.

## Next Step

For orchestration, transformation, and analytics storage decisions, continue with
[Data Stack & Analytics Engineering](/docs/playbook/data-stack-analytics-engineering).

[Propose an improvement](https://github.com/TrilemmaFoundation/microproduct-lab/pulls)
