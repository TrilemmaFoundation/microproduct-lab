---
title: "Archetype: Simulation backtesting product"
description: Counterfactual experiments that stress decisions before capital is deployed.
content_kind: reference
slug: simulation-backtesting-product
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---


## Use when

Strategies must be exercised across historical regimes with transparent assumptions—common in allocation, lending, robotics, trading.

## Common users

- Quant researchers validating policies
- Product strategists forecasting outcomes
- University capstone cohorts benchmarking ideas

## Minimal MVP

- Scenario configuration surface
- Deterministic simulator with seed control
- Performance analytics + drawdown summaries
- Exportable run artifacts

## Required files

- `product.yaml`
- `product-brief.md`
- `data-contract.md`
- `evaluation.md`
- `demo.md`

## Evaluation

- Out-of-sample stability
- Sensitivity to parameter priors
- Runtime cost envelopes

## Reference products

- Stacking Sats

## Common mistakes

- Silent look-ahead bias
- Omitting friction (fees, latency, liquidity)
- Toy simulators unrelated to production constraints

## Agent prompt

You are building a simulation microproduct. Document data windows, lookahead controls, friction models, random seeds, and success metrics prior to widening feature scope.
