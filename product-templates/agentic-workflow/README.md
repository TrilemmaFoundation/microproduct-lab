---
title: agentic-workflow · Readme
description: Documentation fragment for starter agentic-workflow (h71c914d21).
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---

## Overview

Starter for durable workflow automation where bots and humans share explicit state graphs.

## Getting started

- Model states, escalation trees, compensating transactions in `architecture.md`.
- Capture human-in-loop obligations and SLA clocks in `evaluation.md`.

## Repository hygiene

- Never ship silent autonomous side effects until `demo.md` documents rollback drills.
- Replace `src/` and `tests/` placeholders with orchestration glue.
- Upgrade `.github/workflows/checks.yml` when integration tests stabilize.
