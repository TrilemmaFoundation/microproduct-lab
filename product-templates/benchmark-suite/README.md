---
title: benchmark-suite · Readme
description: Documentation fragment for starter benchmark-suite (g81c41d891).
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---

## Overview

Opinionated layout for repeatable benchmark harnesses, leaderboards, and regression spotting.

## Getting started

- Freeze dataset licensing + provenance in `data-contract.md` before leaderboard publication.
- Document statistical thresholds and rerun policies in `evaluation.md`.

## Repository hygiene

- Keep `architecture.md` honest about GPUs, quotas, anonymization pipelines.
- Replace `src/` and `tests/` placeholders with deterministic runners.
- Upgrade `.github/workflows/checks.yml` when CI needs hardware secrets.
