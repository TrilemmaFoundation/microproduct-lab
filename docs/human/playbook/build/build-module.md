---
title: Delivery Workflow
description: Phase 2 module for translating scope into focused build tasks and working product slices.
slug: /playbook/build-module
tags: [playbook, build]
last_reviewed: 2026-07-16
authors: [trilemma-foundation]
---

## When to Use This Module

Use this module during Phase 2 (Build) after Frame outputs are validated. It
covers how to translate scope into implementable slices, run delivery workflows,
and reach a pilot-ready MVP.

## Key Decisions

### Outcomes Before Tasks

Define outcomes first, then slice work into verifiable deliverables. Each slice
needs a clear task contract: context, constraints, acceptance criteria, and
review owner. Keep backlog priorities tied to user impact and release goals.

### Task Slicing and Review Cadence

- **Task slicing**: keep units small enough to implement and validate within one review cycle.
- **Handoff contracts**: require clear inputs, expected outputs, and failure conditions.
- **Review cadence**: run daily execution review and weekly scope/risk review.

### Execution Sequence

1. Implement one end-to-end core workflow.
2. Add instrumentation for activation and completion metrics.
3. Add resilience for key failure paths.
4. Prepare a pilot release for a narrow user segment.

## Required Artifacts

### Definition of Done (MVP)

- Core task completion in under three minutes for target users.
- Critical paths covered by build-phase quality gates.
- Meaningful telemetry and user feedback loop in place.
- Pilot release feedback translated into a prioritized iteration plan.

## Pitfalls

- Slicing work by technical layer instead of user-facing outcomes.
- Starting implementation before acceptance criteria are written.
- Skipping instrumentation until after the pilot release.

## Contribute Here

The following topics are open contribution areas:

- PM operating templates for AI-assisted teams.
- Sprint and release rituals for high-velocity repos.
- Examples of strong implementation task specs.

## Next Step

Validate delivery quality with [QA Methodology](./qa-methodology), then use the
[Release Checklist](./release) before deploying.

[Propose an improvement](https://github.com/TrilemmaFoundation/microproduct-lab/pulls)
