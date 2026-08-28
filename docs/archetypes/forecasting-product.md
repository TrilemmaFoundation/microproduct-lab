---
title: "Archetype: Forecasting product"
description: Future-state projections grounded in reproducible assumptions and bands.
content_kind: reference
slug: forecasting-product
last_reviewed: 2026-08-28
authors: [trilemma-foundation]
---


## Use when

Teams must rehearse futures (demand, risk, capex) with explicit confidence language.

## Common users

- Finance partners
- Supply planners
- Climate / operations researchers

## Minimal MVP

- Baseline statistical or ML forecaster with backtests
- Scenario knobs (macros, outages)
- Visualized prediction intervals
- Data freeze + reproducible run ID

## Required files

Follow the [folder contract](/standards/folder-contract):

- `README.md`
- `AGENTS.md`
- `product.yaml`
- `product-brief.md`
- `architecture.md`
- `data-contract.md`
- `evaluation.md`
- `roadmap.md`
- `demo.md`
- `src/`
- `tests/`

## Evaluation

- CRPS / quantile losses when probabilistic
- Business-weighted errors on tail events
- Stability across refresh cadences

## Reference products

- Internal planning consoles with audited scenarios

## Common mistakes

- Stating point estimates without uncertainty
- Omitted linkage between drivers and forecasts
- Unversioned preprocessing pipelines

## Agent prompt

You are building a forecasting microproduct. Document drivers, horizons, cadence, and evaluation metrics before tuning models—ship the reproducible forecasting bundle first.
