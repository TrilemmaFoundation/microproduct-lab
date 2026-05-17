---
title: llm-app · Readme
description: Documentation fragment for starter llm-app (b13a73125e).
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---

## Overview

Opinionated starting point for retrieval-heavy LLM copilots with citations embedded in Markdown contracts.

## Getting started

- Enumerate allowable tools/models and escalation paths inside `architecture.md`.
- Capture dataset licenses and grounding rules in `data-contract.md`.

## Repository hygiene

- Keep `evaluation.md` current before expanding context windows arbitrarily.
- Replace `src/` and `tests/` placeholders with runnable code.
- Upgrade `.github/workflows/checks.yml` when your toolchain is pinned.
