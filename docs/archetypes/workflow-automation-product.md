---
title: "Archetype: Workflow automation product"
description: Choreographed human + bot steps that must stay auditable and idempotent.
content_kind: reference
slug: workflow-automation-product
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---


## Use when

Operational playbooks bundle approvals, integrations, retries, or compensating transactions.

## Common users

- Customer onboarding teams
- Loan operations
- IT service desks

## Minimal MVP

- Step graph with explicit states
- Human task surfaces with SLAs
- Idempotent side effects + dead-letter handling
- Traceability export

## Required files

- `product.yaml`
- `product-brief.md`
- `data-contract.md`
- `evaluation.md`
- `demo.md`

## Evaluation

- End-to-end cycle time
- Stuck-state rate
- Rework percentage after automation

## Reference products

- BPMN-inspired internal copilots

## Common mistakes

- Chat-only flows with no durable state machine
- Missing rollback when third parties fail
- Secrets embedded in prompts

## Agent prompt

You are building a workflow microproduct. Model states, triggers, human gates, and compensating actions before wiring integrations.
