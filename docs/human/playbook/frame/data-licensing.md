---
title: "A Builder's Guide to Data Licensing"
sidebar_label: Data Licensing
description: "Access is not permission. Before treating a dataset as a product input, document the rights you have to store, transform, combine, serve, and commercialize it."
slug: /playbook/frame/data-licensing
tags: [playbook, frame]
last_reviewed: 2026-08-26
authors: [matt-faltyn]
---

Access to data is not permission to build with it.

Before treating a dataset as an input to a product, you need to understand what rights you actually have to ingest, transform, combine, redistribute, and commercialize it. This is a first-pass builder's framework, not legal advice. The point is to catch a Frame-phase failure before architecture is locked.

## The Mistake Builders Actually Make

You find an API or a downloadable CSV.

It is publicly accessible.

You build an application around it.

You put MIT on the GitHub repository.

That does not necessarily mean the data can legally be copied, redistributed, or used commercially.

The distinction is simple and routinely ignored:

**Publicly accessible is not public domain. Public domain is not open data.**

And:

**Your software license is not your data license.**

Software licensing intuition does not transfer cleanly to data. Legal systems treat data differently from code, which is why common open-source software licenses often fail as data licenses. The [Community Data License Agreement](https://cdla.dev/) exists for that reason.

Build Trilemma's thesis is "Turn Data Into Value." The [Request for Microproducts](/docs/request-for-microproducts) argues that the data engine is often the most valuable part of a technical product. If that engine is built on a source you cannot store, combine, or commercialize, the product is a demo with a countdown.

## What Can Actually Be Protected

A dataset is not one legal object. It is several overlapping layers.

| Layer | Question |
| --- | --- |
| Individual facts | Are the individual observations protected? |
| Dataset or database | Are the selection, arrangement, or database itself protected? |
| Individual contents | Does it contain text, photos, or descriptions with separate copyrights? |
| Contract | Did API or website Terms of Service impose additional restrictions? |
| Privacy | Does it contain personal data? |
| Database rights | Does a jurisdiction provide special database protection? |

Jurisdiction matters.

In the United States, individual plain facts are generally not copyrightable, though a sufficiently original selection or arrangement of facts can be. The [U.S. Copyright Office](https://www.copyright.gov/register/tx-databases.html) treats automated databases on that basis.

In the European Union, an additional [sui generis database right](https://digital-strategy.ec.europa.eu/en/policies/protection-databases) can protect databases where substantial investment went into obtaining, verifying, or presenting their contents, even when the database is not original enough for copyright.

The lesson is not a lecture on copyright. It is this:

**"The underlying facts aren't copyrighted" is not a sufficient licensing analysis.**

## Licenses You Will Actually Encounter

You do not need an encyclopedia of licenses. You need a working map of the statuses that show up in real product work.

| License or status | Practical meaning for a builder |
| --- | --- |
| **CC0** | Usually the easiest case. Designed to maximize unrestricted reuse. |
| **CC BY 4.0** | Broad reuse, including commercial reuse, with attribution requirements. |
| **CDLA Permissive 2.0** | Data-specific permissive license. Broad use, analysis, modification, and sharing. |
| **ODC-BY** | Open database use with attribution. |
| **ODbL** | Open, but share-alike obligations can apply to adapted databases. |
| **CC BY-SA** | Broad use, but share-alike requirements matter. |
| **CC BY-NC** | Commercial use restricted. Often a problem for products. |
| **Custom license** | Read it. Do not infer permissions from the dataset being free. |
| **No stated license** | Treat as unresolved, not automatically reusable. |
| **Public domain** | Generally highly reusable, but verify what exactly is in the public domain. |

[Creative Commons](https://creativecommons.org/faq/) supports CC 4.0 licenses for databases and database rights. CC0 is intended to maximize reuse. [ODbL](https://opendatacommons.org/licenses/odbl/index.html) combines attribution with share-alike obligations for databases. [CDLA-Permissive-2.0](https://www.linuxfoundation.org/press/press-release/enabling-easier-collaboration-on-open-data-for-ai-and-ml-with-cdla-permissive-2-0) is worth knowing because it was designed for data and computational use, including machine learning.

Do not spend Frame time cataloging every Creative Commons permutation. Spend it answering whether your intended product use is allowed.

## Reason From the Product Backward

Do not start with "What license is this?"

Start with "What am I going to do with this data?"

For each source, answer:

1. **Access** — Can I retrieve it programmatically?
2. **Store** — Can I retain a local copy?
3. **Transform** — Can I normalize, enrich, or derive new fields?
4. **Combine** — Can I merge it with other datasets?
5. **Serve** — Can my product expose information derived from it?
6. **Redistribute** — Can users download the underlying or transformed data?
7. **Commercialize** — Can the product eventually charge money?
8. **Attribute** — What attribution or notices must appear?
9. **Share alike** — Must any transformed database be released under the same license?
10. **Update** — Can the source's license or API terms change?

That turns licensing from a legal abstraction into an architectural constraint. A source you can query but not store is a different product than a source you can warehouse. A source you can analyze but not redistribute is a different product than an open download.

If you cannot answer these questions, you do not yet have a data input. You have a hope.

## Derived Data Is the Hard Part

Builders frequently assume:

"I'm not redistributing the raw data, so I'm fine."

Sometimes that distinction matters enormously. Sometimes it does not solve the problem.

The product is a spectrum:

```text
Raw source → cleaned copy → joined database → aggregates → scores → predictions → user-facing decisions
```

The question is where the source license's obligations stop.

[ODbL](https://opendatacommons.org/licenses/odbl/1-0/) distinguishes databases, derivative databases, and "Produced Works." A map rendered from OpenStreetMap is not the same object as a modified OSM extract you ship as a download. The exact architecture of the product can change the answer.

[CDLA-Permissive-2.0](https://www.linuxfoundation.org/press/press-release/enabling-easier-collaboration-on-open-data-for-ai-and-ml-with-cdla-permissive-2-0) deliberately gives broad freedom to computational "Results." That is one reason it is useful for analytical and machine-learning products: the license was written with derived output in mind.

This is more valuable than memorizing "ODbL is share-alike." Share-alike is the label. The architecture is the constraint.

## Compatibility When Sources Combine

A microproduct will commonly combine five or ten sources.

Each source being individually usable does not necessarily mean the combined dataset can be distributed however you want.

```text
Dataset A ─ CC0 ───────────┐
Dataset B ─ CC BY 4.0 ─────┤
Dataset C ─ ODbL ──────────┼─→ Unified dataset → API → Product
Dataset D ─ Custom Terms ──┘
```

The relevant question becomes:

What obligations survive into the unified dataset, and into what the product exposes?

Attribution can travel. Share-alike can travel. A custom term that forbids bulk storage can make the whole pipeline unusable even if every other source is CC0. The [CDLA compatibility guidance](https://cdla.dev/faq-resources/compatibility/) illustrates that combining and re-sharing datasets can preserve upstream obligations such as CC BY attribution.

Design the join before you write the join.

## License, Terms of Service, and Privacy Are Different Layers

Inspect all three:

```text
Dataset license
+
API / website Terms of Service
+
privacy / regulatory constraints
```

A technically open dataset retrieved through a service may have access conditions. A public API on the internet is not an implicit grant to create a permanent commercial dataset from it.

A data license also does not override privacy law. If the rows contain personal data, permission to copy the file is not permission to process the people.

This is why license identifiers are useful and insufficient. `ODbL-1.0` tells you something. It does not tell you whether yesterday's Terms of Service still allow the extraction you need.

## A Traffic-Light Framework

Use this as the Frame-phase takeaway.

### Green

Proceed normally:

- CC0
- Clear public-domain dedication
- CC BY 4.0 with manageable attribution
- CDLA-Permissive-2.0
- Similarly permissive open-government licenses

The [Open Definition](https://opendefinition.org/od/2.0/en/) is a useful baseline: genuinely open data must permit use, redistribution, and modification.

### Yellow

Understand the consequences before architecture is locked:

- ODbL
- Share-alike licenses
- Non-commercial licenses
- Custom government licenses
- Mixed-license datasets
- Uncertain derived-data treatment

Yellow is not a veto. Yellow is a design input. If share-alike applies to the unified database, that belongs in the architecture brief, not in a comment three months later.

### Red

Do not make it a core dependency until resolved:

- No identifiable license
- Explicit prohibition on your intended use
- Unclear ownership
- Incompatible redistribution requirements
- Terms that prohibit the extraction or storage you need

Red means the product is not framed yet. Access without rights is a brittle assumption, not a data engine.

## What Frame Now Requires

[Frame](/docs/playbook/frame) now treats access and usage rights as one gate.

**Every material external data dependency must have a known provenance and documented usage rights before the project moves from Frame to Build.**

Record those rights in `data-contract.md`. The [folder contract](/standards/folder-contract) now treats licensing as part of the data contract, alongside inputs, freshness, lineage, and privacy. For each external input, capture the source, license, license URL, access method, commercial use, redistribution, attribution, share-alike, and the date terms were reviewed:

```yaml
source: OpenStreetMap
url: ...
license: ODbL-1.0
license_url: ...
access_method: API
commercial_use: true
redistribution: conditional
attribution_required: true
share_alike: true
terms_reviewed: 2026-08-26
notes: ...
```

A dataset whose legal usability is unknown is an undocumented dependency. [What counts as a good microproduct](/standards/what-counts-as-good) already requires observable inputs, honest assumptions, and reproducibility. Usage rights are the same class of fact.

You found the data. The Frame question is whether you can actually use it.
