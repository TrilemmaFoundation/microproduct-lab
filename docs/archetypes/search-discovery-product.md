---
title: "Archetype: Search discovery product"
description: High-recall retrieval with transparent ranking signals.
content_kind: reference
slug: search-discovery-product
last_reviewed: 2026-05-04
authors: [trilemma-foundation]
---


## Use when

Knowledge workers must discover needles in large unstructured corpora with guardrails.

## Common users

- Support engineers deflecting tickets
- Researchers hunting literature
- Regulators probing filings

## Minimal MVP

- Index + refresh cadence documented
- Query UI with facets / filters
- Snippet grounding for every hit
- Judging harness for relevance

## Required files

- `product.yaml`
- `product-brief.md`
- `data-contract.md`
- `evaluation.md`
- `demo.md`

## Evaluation

- Offline nDCG / ERR with human judgments
- Latency envelopes (p95)
- Coverage for tail queries

## Reference products

- Internal enterprise search portals

## Common mistakes

- Returning generative blobs without citations
- Stale embeddings without alerting
- Skipping multilingual or security redaction needs

## Agent prompt

You are building search microproduct clarity. Decide corpora boundaries, freshness SLAs, and citation requirements prior to fiddling with vector databases.
