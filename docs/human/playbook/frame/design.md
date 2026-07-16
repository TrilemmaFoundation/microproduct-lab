---
title: Design
description: Translate requirements and learnings into concrete specifications before implementation.
slug: /playbook/design
tags: [playbook, frame, design]
last_reviewed: 2026-07-16
authors: [trilemma-foundation]
---

## When to Use This Module

Use this module during Phase 1 (Frame) after you have a problem brief and before
you commit to architecture. Design converts requirements, stakeholder input,
domain expertise, and production observations into concrete specifications that
become implementation tasks.

Design happens before the initial build sprint and in response to future
enhancement or fix requests. Good design up front reduces rework and produces
higher-quality deliverables. Design artifacts are as valuable as working code.

## Key Decisions

### Specifications Over Guesswork

Requirements gathering, feature requests, bug reports, and analytics insights all
feed the development pipeline. Your job is to convert those learnings into clear
software specifications — including, but not limited to, mockups and visual
representations of user interfaces.

### Prototyping

Working prototypes are powerful for early user feedback and gap discovery. Design
before coding does not mean prototypes are off limits. Coding agents make it
easier than ever to create quick, throwaway prototypes that communicate intent
and reduce unknowns.

Avoid the temptation to ship prototypes. Let them serve their purpose, then feed
the learnings into the canonical implementation.

### Code Organization

Component organization affects clarity, testability, and maintainability. Consider
structure during design, not only during implementation. Domain expertise and
design tools can reveal natural abstractions, terminology, and boundaries.

Two common patterns:

1. **Layered (traditional)**: modules organized by technical layer (UI, API, DB)
   or models that mix business rules with storage and presentation logic.
2. **Vertical slices**: modules align with use cases, top to bottom.

We prefer vertical slice architecture because microproducts are driven by user
value and should be organized and tested accordingly. Deep modules also work
well in agent-assisted workflows and enable incremental, verifiable progress.

Teams should choose the style that fits their project. Architecture patterns can
be mixed. Lean on vertical slicing as a default; consider alternatives for
exceptionally complex domains.

## Required Artifacts

- Design specifications that translate requirements into implementable changes.
- Module boundaries and communication architecture for frontend, API, and data layers.
- Prototypes or mockups when visual communication reduces ambiguity.

## Pitfalls

- Skipping design and coding directly from a problem brief.
- Shipping throwaway prototypes as production code.
- Organizing by technical layer when user-facing slices would be clearer.

## Contribute Here

The following topics are open contribution areas:

- Design specification templates for microproducts.
- Prototyping workflows with coding agents.
- Vertical slice architecture examples by product shape.

## Next Step

Continue to [Architecture](./architecture) to pick a data pipeline and system
baseline, or return to the [Frame](./frame) overview.

[Propose an improvement](https://github.com/TrilemmaFoundation/microproduct-lab/pulls)
