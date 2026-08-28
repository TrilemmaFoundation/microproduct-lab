---
title: "A Builder's Guide to the Modern Data Stack"
sidebar_label: Modern Data Stack
description: "Modern data infrastructure is not a list of products. Reason from product constraints before choosing a warehouse, orchestrator, or lakehouse."
slug: /playbook/frame/modern-data-stack
tags: [playbook, frame]
last_reviewed: 2026-08-28
authors: [matt-faltyn]
---

Modern data infrastructure is not a list of products.

Before choosing a warehouse, orchestrator, transformation framework, streaming platform, or lakehouse, you need to understand what the product actually requires from its data.

How much arrives? How quickly does it need to become useful? What history must survive? Can the system be rebuilt? Who consumes the output? What happens when something fails?

This is a first-pass builder's framework, not a catalog of data tools. The point is to catch unnecessary architecture during Frame, before infrastructure becomes the product.

## The Mistake Builders Actually Make

You find several useful data sources.

You need to ingest them regularly.

So you choose a cloud warehouse.

Then a transformation framework.

Then an orchestrator.

Then an observability platform.

Then perhaps Kafka, because real time sounds better than batch.

Soon the pipeline has more moving parts than the product it exists to support.

The distinction is simple:

**Architecture is a response to constraints. Tooling is an implementation.**

And:

**Modern does not mean distributed.**

A Python process that downloads five files, writes Parquet, transforms them with DuckDB, and publishes a dataset every morning can be an entirely modern data system.

So can a multi-petabyte lakehouse with distributed compute and continuous event ingestion.

The difference is not maturity. The difference is requirements.

Build Trilemma's thesis is "Turn Data Into Value." The data engine can be the most valuable part of a technical product. But every additional component in that engine creates another thing to configure, monitor, pay for, understand, and recover when it fails.

Complexity needs to earn its place.

## What a Data Stack Actually Does

You do not need an encyclopedia of infrastructure categories. You need a working map of the responsibilities that show up in real data products.

| Responsibility | Question |
| --- | --- |
| Access | Where does the data come from, and how can it be retrieved? |
| Ingest | How does new data enter the system? |
| Store | What state and history must persist? |
| Transform | How does raw input become useful information? |
| Orchestrate | What runs when, in what order, and after what dependencies? |
| Validate | How do we know expected properties still hold? |
| Observe | How do we detect failures and unexpected behavior? |
| Serve | How does the product consume the result? |

Security, metadata, lineage, privacy, and cost cut across the entire system.

The important point is that these are **logical responsibilities**, not necessarily separate products.

A small microproduct might implement almost all of them with:

```text
API / files
    ↓
Python / dlt
    ↓
Parquet
    ↓
DuckDB
    ↓
Application
```

A loader such as dlt can replace the ad-hoc download step: connect to an API or file source, write raw and normalized datasets, and keep load metadata. The architecture is still a Python process writing files. The product did not become a platform.

A larger analytical product might look more like:

```text
Sources
    ↓
Ingestion
    ↓
Object storage / warehouse
    ↓
Transformation
    ↓
Canonical datasets
    ↓
API / application / analytics / models
```

And a sufficiently large system might split every box into independently operated infrastructure.

Do not confuse the diagram with a shopping list.

## Tools

These names are current implementations of the responsibilities above. They are not a recommended architecture.

| Tool | Responsibility | Default | Earns its place when |
| --- | --- | --- | --- |
| dlt | Ingest | Green | A Python loader is cheaper than hand-rolled extractors, and you want source schema, load IDs, and a raw copy |
| DuckDB | Transform | Green | Analytical work can run inside the pipeline, notebook, or application |
| Apache Iceberg | Store | Yellow | You need snapshots, schema evolution, or concurrent writers on object storage |
| Apache Polaris | Store | Yellow | More than one engine must find and govern the same Iceberg tables |
| DQX | Validate | Yellow | Quality checks must run at Spark or Databricks scale |
| OpenLineage | Observe | Yellow | Many jobs depend on each other and blast radius is an operational question |
| SLayer | Serve | Yellow | Applications or agents need named metrics instead of warehouse SQL |
| Apache Ossie | Serve | Yellow | The same metric and dimension definitions must move between tools |

The implementation does not change the test. Finish the sentence "We need this because..." before adding a row to the stack.

## Reason From the Product Backward

Do not start with:

"What should our modern data stack be?"

Start with:

"What does the product need the data system to guarantee?"

For each material data flow, answer:

1. **Sources** — Where does the data originate?
2. **Volume** — How much data exists now, and how quickly will it grow?
3. **Freshness** — Does the user need updates in seconds, minutes, hours, or days?
4. **History** — Which previous states need to remain available?
5. **Replay** — Can the system be reconstructed from its source inputs?
6. **Transformation** — What computation turns the input into something valuable?
7. **Consumers** — Is the output for an application, API, analyst, model, download, or another pipeline?
8. **Concurrency** — How many readers and writers need simultaneous access?
9. **Reliability** — What happens if a source disappears or a job fails halfway through?
10. **Privacy** — Does any data require restricted access, deletion, or special handling?
11. **Cost** — What is an acceptable cost to ingest, refresh, store, and serve it?
12. **Portability** — How difficult would replacing one component be?

That turns the data stack from an industry diagram into an architectural decision.

A dataset refreshed once per day is a different problem from a live event feed.

A public dashboard is a different serving problem from a feature needed inside an API request.

A pipeline that can be replayed from immutable source data is a different operational system from one whose database contains the only surviving copy of history.

If you cannot answer these questions, you are not choosing architecture yet.

You are choosing technology by reputation.

## Raw Data Is Your Escape Hatch

Transformations change.

Business logic changes.

Schemas change.

Models change.

The closest thing you have to an escape hatch is the ability to reproduce the system from durable source inputs.

A useful default shape is:

```text
Source
  ↓
Raw
  ↓
Normalized
  ↓
Canonical
  ↓
Product
```

"Raw" does not mean dumping everything forever without thought. Storage costs money, licenses can restrict retention, and privacy constraints can require deletion or minimization.

It means preserving enough source state, when practical and permitted, that downstream logic can be corrected without pretending the past never happened.

Suppose a scoring pipeline contains a bug for three weeks.

If the underlying observations still exist, you can fix the transformation and replay the affected period.

If only the incorrect scores were retained, you have an incident and a history problem.

This is why ingestion timestamps, source identifiers, source versions, and provenance often matter more than another dashboard.

Ingestion libraries earn their place when they make that provenance cheap. dlt, for example, can retain source schema, load identifiers, and a raw copy so a later transformation can be replayed. The escape hatch is the retained source state, not the brand of the loader.

You do not know every transformation you will want tomorrow.

Preserve your ability to change your mind.

## Transformations Are Product Logic

A common organizational mistake is treating transformations as plumbing.

They are frequently the opposite.

Consider:

```text
Raw transactions
      ↓
Normalized events
      ↓
Entity resolution
      ↓
Features
      ↓
Risk score
      ↓
User-facing decision
```

The application might contain very little unique logic. Most of the product's value is encoded in the transformations between the first row and the final score.

That logic deserves the same engineering discipline as application code:

* version control
* review
* deterministic behavior where possible
* explicit inputs and outputs
* tests
* documented assumptions
* reproducible builds
* observable failures

SQL is code.

A notebook used to create a production dataset is code.

A ten-line normalization rule that changes which entities appear in a product is product logic.

Treat it accordingly.

## Warehouse, Lakehouse, or Something Smaller

The modern data stack is often presented as an architectural progression:

```text
Database
   ↓
Warehouse
   ↓
Lake
   ↓
Lakehouse
   ↓
Distributed everything
```

That is the wrong mental model.

These are different design choices with different tradeoffs.

### Relational Database

A relational database can be enough when the dataset is moderate, the application already depends on it, and operational and analytical workloads remain manageable.

Postgres is not disqualified because someone invented a newer category.

### Analytical Database or Warehouse

A dedicated analytical system becomes useful when you need substantial analytical queries, multiple data sources, larger transformations, independent analytical workloads, or separation from the application's operational database.

The important capability is not the word "warehouse." It is solving the workload cleanly.

### Object Storage and Columnar Files

Object storage plus formats such as Parquet can provide cheap durable storage, portability, and efficient analytical scans.

For many data products, this is enough to create a surprisingly capable architecture.

### Lakehouse

A lakehouse architecture can add transactional table semantics, schema evolution, snapshots, concurrent writers, and interoperability on top of object storage.

Apache Iceberg is the open table format most often used for those capabilities. Apache Polaris is a catalog for Iceberg tables: a shared place to register names, locations, and access so more than one engine can read and write the same tables. A catalog is how engines agree on what a table is. It is not a reason to introduce Iceberg when one process writes a file and another reads it.

Those capabilities can be valuable.

They also solve specific problems.

If one process writes a 2 GB dataset once per day and one process reads it, adding a distributed lakehouse is not architectural maturity.

It is overhead.

### Embedded Analytics

Tools such as DuckDB make another category worth taking seriously: analytical systems that run inside the application, pipeline, notebook, or worker instead of requiring a permanently operated database service.

This can collapse several traditional stack layers for smaller products.

The lesson is not "use DuckDB."

The lesson is:

**Choose the smallest architecture that satisfies the workload.**

These systems are alternatives and escalation paths, not levels in a technology skill tree.

## Batch Until the Product Requires Streaming

Streaming is one of the easiest ways to turn an ordinary data problem into a distributed systems problem.

There is a useful continuum:

```text
Daily batch
     ↓
Hourly batch
     ↓
Micro-batch
     ↓
Change data capture
     ↓
Continuous event streaming
```

Moving right should require increasing product value.

If a weather dashboard refreshes every ten minutes, there may be no useful distinction between processing an event in 30 milliseconds and processing it in three minutes.

If a fraud system needs to block a transaction while authorization is still pending, there probably is.

Streaming introduces questions that simple batch pipelines can often avoid:

* What happens when events arrive late?
* What happens when an event arrives twice?
* Does ordering matter?
* Where is processing state stored?
* How are checkpoints recovered?
* How do consumers replay history?
* What happens when a downstream system becomes slower than the producer?
* How do schemas change while producers and consumers remain live?

None of these make streaming bad.

They make streaming expensive in engineering attention.

**If the user can wait fifteen minutes, do not accidentally build a fifteen-millisecond architecture.**

Freshness is a product requirement, not a leaderboard.

## Orchestration Is Dependency Management

An orchestrator is not valuable because it draws a graph.

It is valuable when the graph represents real operational dependencies.

Suppose a pipeline is:

```text
Fetch source A ──┐
                 ├─→ Normalize → Join → Score → Publish
Fetch source B ──┘
```

Now ask:

What happens if source B fails?

Should source A be fetched again?

Can `Normalize` safely run twice?

Can yesterday's partition be rebuilt independently?

Does `Publish` happen if `Score` only partially succeeds?

Can a failed week be backfilled without rerunning the entire history?

Those are orchestration questions.

A cron job can be a perfectly good orchestrator when the answer is simple.

A dedicated orchestration system becomes valuable as dependencies, retries, partitions, backfills, concurrency, and failure recovery become difficult to reason about manually.

Again, complexity follows the problem.

## Contracts, Tests, Monitoring, and Lineage Are Different Things

"Data quality" is often used to describe several different controls.

Keep them separate.

| Concept | Question |
| --- | --- |
| Contract | What is this data supposed to look like? |
| Test | Does a known invariant hold? |
| Monitoring | Is the system operating within expected limits? |
| Observability | Is something unusual happening that we did not explicitly anticipate? |
| Lineage | What produced this data, and what depends on it? |
| Documentation | What does this data actually mean? |

Suppose a dataset normally contains between 900,000 and 1.1 million rows per day.

A contract might say that `event_id` is non-null and unique.

A test can verify both properties.

Monitoring can alert when the scheduled job does not complete.

Observability can flag that today's output contains only 83,000 rows even though no explicit test failed.

Lineage can show that seven downstream models and two user-facing pages depend on that output.

Documentation can explain what an `event` actually represents.

These mechanisms overlap, but they are not interchangeable.

A hundred schema tests do not tell you whether a perfectly valid upstream API quietly stopped sending half of Europe.

OpenLineage is a standard for the lineage column: jobs emit what they read and wrote, and a collector can show what produced a dataset and what depends on it. That answers blast radius. It does not answer whether the data is correct.

A quality engine such as DQX can encode tests and quarantine invalid rows, especially on Spark or Databricks workloads. That is still the test column, not lineage, not a contract, and not documentation. If the pipeline is a Python job and a DuckDB transform, a few explicit assertions are the smaller version of the same idea.

## The Serving Boundary Matters

The data pipeline does not end when a table exists.

It ends when something useful consumes the result.

That might be:

```text
Canonical dataset
    ├──→ Web application
    ├──→ Public API
    ├──→ BI dashboard
    ├──→ ML model
    ├──→ Agent / semantic layer
    ├──→ Download
    └──→ Another pipeline
```

Each consumer creates a different contract.

An analyst may tolerate a query taking thirty seconds.

An application endpoint may not.

A downloadable dataset needs stable fields and clear versioning.

A model may require point-in-time correct historical features.

A public API creates compatibility obligations that an internal table does not.

An agent that generates SQL is another consumer, and a more dangerous one: it can invent joins and redefine metrics on every run. When several surfaces need the same measures and dimensions, a semantic layer such as SLayer can sit on the serving boundary so applications and agents ask for named metrics instead of writing warehouse SQL. Apache Ossie is a vendor-neutral specification for writing those metric and dimension definitions down, so "revenue" can mean the same thing in a dashboard, an API, and an agent.

Shared semantics are a serving contract. They are not a reason to stand up a semantic platform before anyone shares a definition.

This is why serving should be designed during Frame rather than added after the pipeline exists.

A table is not automatically a product interface.

Decide which outputs are stable contracts and which are implementation details.

## Complexity Is a Budget

Use this as the Frame-phase takeaway.

### Green

Start here when the requirements allow it:

* scheduled batch ingestion, including a Python loader such as dlt
* Python and SQL
* relational or analytical databases
* Parquet and object storage
* version-controlled transformations
* simple scheduling
* explicit schemas and contracts
* basic data tests
* logs and alerts
* one clear serving boundary

Green does not mean primitive.

Green means every major component has an obvious reason to exist.

### Yellow

Add when a concrete requirement justifies it:

* dedicated orchestration
* change data capture
* micro-batch pipelines
* distributed compute
* lakehouse table formats such as Apache Iceberg
* multiple compute engines
* semantic layers such as SLayer, and semantic interchange such as Apache Ossie
* centralized catalogs such as Apache Polaris
* dedicated data observability platforms
* complex lineage infrastructure such as OpenLineage
* distributed quality engines such as DQX

Yellow is not a warning against the technology.

The [tools table](#tools) is the index. The implementation does not change the test.

Yellow means you should be able to finish this sentence:

> "We need this because..."

If the answer is "because this is what modern data teams use," the architecture is not framed yet.

### Red

Do not make these assumptions by default:

* Kafka because the product should be "real time"
* Spark because the dataset is called big data
* Kubernetes for three scheduled data jobs
* a lakehouse, or Iceberg tables in Polaris, with one writer and one consumer
* five managed data services around a small warehouse
* a feature store without an online feature-serving problem
* a semantic layer, or Ossie models, before anyone needs shared semantic definitions
* OpenLineage before there are downstream dependencies to map
* data mesh infrastructure for a team that fits around one table

Red does not mean bad technology.

It means **unjustified technology**.

A sophisticated solution to a problem you do not have is still the wrong architecture.

## What Frame Now Requires

[Frame](/docs/playbook/frame) should answer the data architecture before Build turns assumptions into infrastructure.

For every material data product, record the architecture in `architecture.md`. The [folder contract](/standards/folder-contract) now treats data architecture as part of that file: sources, freshness, storage, transformation, serving, reliability, and complexity justification.

```yaml
data_architecture:
  sources:
    - ...

  volume:
    current: ...
    expected_growth: ...

  freshness_requirement: ...

  ingestion:
    method: ...
    frequency: ...

  storage:
    system: ...
    raw_retained: true
    history_retained: ...
    retention_period: ...

  transformation:
    method: ...
    incremental: ...
    reproducible: true

  orchestration:
    method: ...
    retry_strategy: ...
    backfill_strategy: ...

  serving:
    consumers:
      - ...
    interface: ...

  reliability:
    replayable_from_source: ...
    source_failure_behavior: ...

  quality:
    contracts: ...
    tests: ...
    monitoring: ...
    lineage: ...

  cost:
    expected_monthly: ...
    ceiling: ...

  complexity:
    streaming_required: false
    distributed_compute_required: false
    justification: ...
```

Individual inputs still belong in `data-contract.md`: source, provenance, schema, freshness, usage rights, privacy constraints, and other properties of the data itself. [Data Licensing](/docs/playbook/frame/data-licensing) covers the usage-rights half of that contract.

The distinction is useful:

`data-contract.md` describes **what data enters and leaves the system**.

`architecture.md` describes **what the system does with it**.

Neither document needs to predict the future perfectly.

They need to make today's assumptions visible.

A good data stack is not the one with the most recognizable architecture diagram. It is the one that can reliably ingest the truth, preserve what matters, transform it reproducibly, detect when something goes wrong, and deliver something useful.

Add another system when the product creates a reason for it.

Not before.
