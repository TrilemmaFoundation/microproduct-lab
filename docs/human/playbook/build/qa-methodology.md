---
title: QA Methodology
description: Phase 2 QA track for validating agent-assisted builds and ensuring progress.
slug: /playbook/qa-methodology
tags: [playbook, qa]
last_reviewed: 2026-06-07
authors: [trilemma-foundation]
---

## QA Track in Build

Delivering high-quality microproducts to users requires effort in ideation,
implementation, and operation. This guide focuses on the implementation phase,
where QA enables fast execution without sacrificing reliability. QA is a dedicated
track inside Phase 2, not a post-build afterthought. Its purpose is to create
effective feedback loops, prevent regression, and support timely delivery of a
product that meets or exceeds initial expectations.

## Disclaimer

Like much of the content in this knowledge base, our QA guidelines and templates
do not prescribe a single doctrine or toolchain. Instead, they consolidate
lessons from other microproducts into opinionated defaults: guiding principles,
reference architecture, and pragmatic best practices. This is a working document,
and we welcome alternatives and improvements through contributions.

## QA Philosophy

We draw inspiration from successful engineering organizations and adapt ideas
from shift-left testing, continuous testing, and behavior-driven development
(BDD) to the realities of modern AI-assisted microproduct development.

Our quality assurance methodology has the following characteristics:

1. [Practical Software Design](#practical-software-design)
2. [Automation](#automation)
3. [Feedback Mechanisms Drive Development](#feedback-mechanisms-drive-development)

Which are explored further below.

### Practical Software Design

Low coupling, deep vertical slices, and intentional project organization promote
effective testing and visibility.

Applying software design principles is critical to making a project testable and
allowing it to grow in a way that avoids regressions and remains legible to
stakeholders.

Independent components, often organized as vertical slices, make it easier to
reason about where business rules and behaviors live in the system. They also
help agents build or extend capabilities without affecting unrelated areas.

Building small pieces of functionality end to end also ensures incremental
progress and allows testing and feedback at each step. This does not strictly
require UI-to-database slices; a helper class with a clear purpose and a test
suite that expresses business requirements is equally valuable. Such classes
should be treated as first-class components of the system.

Well-designed systems embrace business-domain concepts and terminology in their
specifications, tests, and documentation. Dependencies between modules should be
apparent to domain experts.

Finally, use-case focused design allows feature delivery QA and regression testing
to mirror actual usage patterns and prioritize value-adding capabilities.

### Automation

Automated tests, CI/CD pipelines, and other AI-assisted workflows facilitate
rapid development as the codebase and feature set grow.

### Feedback Mechanisms Drive Development

Deterministic checks at specific points in the change lifecycle give useful
signals to agents and human reviewers, balancing correctness with development
friction.

There are several good points in the change lifecycle to install quality checks,
including:

- Agent loop (run on each message or code change)
- Human QA check (feature branch)
- Pre-commit/pre-push hooks
- Pull request
- CI/CD pipeline
- Release

Static analysis tools, tests, and automated code review are invaluable for
keeping project quality and entropy in check. The right toolset and enforcement
points vary by team and project, but choosing them deliberately is part of the
transition from prototype to product.

Furthermore, we embrace such checks not as gates but as drivers. Feedback cycles
form an engine that produces increasingly higher-quality artifacts and eventually
the actual product. Automated checks combined with agents with the tools to respond
to feedback makes a surprisingly simple but effective multi-agent orchestration
setup.

## Agent-Assisted Testing Guidance

- Prioritize tests for the highest-value workflow and failure modes first.
- Use known sample datasets to validate deterministic expectations.
- Require human review for ambiguous or high-risk agent-generated changes.

## Repository Entropy Controls

- Enforce consistent architecture and naming conventions.
- Gate merges with required checks and explicit reviewer accountability.
- Track defect recurrence and unstable areas to prevent drift.

## Risk-Tiered Checklists and Release Gates

Apply checks by risk tier:

- Low risk: functional path test and basic regression check.
- Medium risk: error-path, integration, and accessibility spot checks.
- High risk: full critical-path validation, rollback readiness, and monitoring checks.

## Release Readiness Checklist

- Critical user path passes in representative conditions.
- Known high-impact defects are resolved or explicitly mitigated.
- Observability is in place for new high-risk code paths.
- Rollback and incident response owner are identified.

## Contributor Expansion Areas

- QA automation patterns for agent-first repositories.
- Post-release quality review templates.

[Propose an improvement](https://github.com/TrilemmaFoundation/microproduct-lab/pulls)
