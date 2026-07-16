---
title: QA Methodology
description: Phase 2 QA track for validating builds and ensuring reliable delivery.
slug: /playbook/qa-methodology
tags: [playbook, qa]
last_reviewed: 2026-07-16
authors: [trilemma-foundation]
---

## When to Use This Module

Use this module during Phase 2 (Build) as a dedicated quality track — not a
post-build afterthought. QA creates effective feedback loops, prevents regression,
and supports timely delivery of a product that meets initial expectations.

These guidelines do not prescribe a single doctrine or toolchain. They consolidate
lessons from other microproducts into opinionated defaults: guiding principles,
reference architecture, and pragmatic best practices.

## Key Decisions

### QA Philosophy

We adapt ideas from shift-left testing, continuous testing, and behavior-driven
development (BDD) to the realities of modern microproduct development. The
methodology has three characteristics:

1. [Practical Software Design](#practical-software-design)
2. [Automation](#automation)
3. [Feedback Mechanisms Drive Development](#feedback-mechanisms-drive-development)

### Practical Software Design

Low coupling, deep vertical slices, and intentional project organization promote
effective testing and visibility.

Independent components — often organized as vertical slices — make it easier to
reason about where business rules and behaviors live. They also help agents build
or extend capabilities without affecting unrelated areas.

Building small pieces of functionality end to end ensures incremental progress
and allows testing at each step. This does not strictly require UI-to-database
slices; a helper class with a clear purpose and a test suite that expresses
business requirements is equally valuable.

Well-designed systems embrace business-domain concepts and terminology in
specifications, tests, and documentation. Dependencies between modules should be
apparent to domain experts.

Use-case focused design allows feature delivery QA and regression testing to
mirror actual usage patterns and prioritize value-adding capabilities.

### Automation

Automated tests, CI/CD pipelines, and AI-assisted workflows facilitate rapid
development as the codebase and feature set grow.

### Feedback Mechanisms Drive Development

Deterministic checks at specific points in the change lifecycle give useful
signals to agents and human reviewers, balancing correctness with development
friction.

Good enforcement points include:

- Agent loop (run on each message or code change)
- Human QA check (feature branch)
- Pre-commit/pre-push hooks
- Pull request
- CI/CD pipeline
- Release

Static analysis tools, tests, and automated code review keep project quality and
entropy in check. The right toolset and enforcement points vary by team and
project, but choosing them deliberately is part of the transition from
prototype to product.

Embrace checks not as gates but as drivers. Feedback cycles form an engine that
produces increasingly higher-quality artifacts. Automated checks combined with
agents that can respond to feedback create a simple but effective multi-agent
orchestration setup.

### Agent-Assisted Testing Guidance

- Prioritize tests for the highest-value workflow and failure modes first.
- Use known sample datasets to validate deterministic expectations.
- Require human review for ambiguous or high-risk agent-generated changes.

### Repository Entropy Controls

- Enforce consistent architecture and naming conventions.
- Gate merges with required checks and explicit reviewer accountability.
- Track defect recurrence and unstable areas to prevent drift.

### Risk-Tiered Checklists and Release Gates

Apply checks by risk tier:

- **Low risk**: functional path test and basic regression check.
- **Medium risk**: error-path, integration, and accessibility spot checks.
- **High risk**: full critical-path validation, rollback readiness, and monitoring checks.

## Required Artifacts

### Release Readiness Checklist

- Critical user path passes in representative conditions.
- Known high-impact defects are resolved or explicitly mitigated.
- Observability is in place for new high-risk code paths.
- Rollback and incident response owner are identified.

## Pitfalls

- Treating QA as a final gate instead of a continuous feedback loop.
- Writing tests that do not express business requirements in domain language.
- Skipping entropy controls until the codebase becomes hard to change.

## Contribute Here

The following topics are open contribution areas:

- QA automation patterns for agent-first repositories.
- Post-release quality review templates.

## Next Step

Use the [Release Checklist](./release) to decide whether a release candidate is
ready to deploy, then follow the [Deploy Quickstart](./deploy-quickstart).

[Propose an improvement](https://github.com/TrilemmaFoundation/microproduct-lab/pulls)
