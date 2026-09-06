---
title: "A Builder's Guide to Microproduct Deployment"
sidebar_label: Microproduct Deployment
description: "GitHub stores the code. Vercel runs the application. For many web-based microproducts, that is enough deployment architecture to get a product into users' hands."
slug: /playbook/operate/microproduct-deployment
tags: [playbook, operate]
last_reviewed: 2026-09-06
authors: [matt-faltyn]
---

Modern tools make it remarkably easy to build a software product.

Making that product available to someone else should not be the hard part.

Historically, deploying even a relatively simple web application could require knowledge of servers, networking, containers, reverse proxies, certificates, build pipelines and cloud infrastructure. Those skills remain important for many systems, but applying all of them to every small application introduces unnecessary operational complexity.

Microproducts call for a different default.

For many web-based microproducts, the deployment architecture can be reduced to two systems:

**GitHub stores the code. Vercel runs the application.**

This is not the right architecture for every software system. It is, however, a very useful starting point for getting small products into users' hands quickly while retaining a surprisingly capable deployment workflow.

## Localhost Is Not a Product

Building software locally creates an application.

Deployment turns that application into something other people can use.

This distinction sounds obvious, but modern AI development tools have made the gap increasingly noticeable. It is now possible to generate a polished application locally in minutes while leaving its deployment as an unspecified future problem.

A microproduct should instead be designed to cross this boundary quickly.

```text
Idea
  ↓
Build
  ↓
Local Application
  ↓
Deploy
  ↓
User
```

The earlier a product is deployed, the earlier it can be tested in its real environment.

A deployed application has a real URL. It runs outside the developer's machine. External APIs behave more like they will in production. Authentication callbacks can use real domains. Mobile devices can access it. Other people can interact with it.

Most importantly, deployment creates the conditions required for actual user feedback.

In that sense, deployment is not merely an infrastructure task.

**Deployment is the beginning of operation.**

## Deployment Complexity Should Match Product Complexity

Software infrastructure has a tendency to expand.

A small application can quickly acquire:

- Docker images;
- container registries;
- deployment scripts;
- cloud accounts;
- staging servers;
- load balancers;
- infrastructure-as-code;
- CI configuration;
- monitoring systems;
- custom networking.

Each may be perfectly reasonable in the appropriate system.

The problem is adopting them before the product requires them.

Microproducts are deliberately constrained products. Their infrastructure should generally follow the same principle.

If an application has a modest number of users, a conventional web architecture and no unusual infrastructure requirements, deployment should ideally be close to:

```text
git push
```

Everything beyond this should have a reason.

## A Simple Default: GitHub + Vercel

One of the simplest deployment models for a modern web application is to keep the project in GitHub and connect that repository directly to [Vercel](https://vercel.com/docs/deployments/git).

The resulting architecture is small:

```text
Local Development
       ↓
     Git
       ↓
    GitHub
       ↓
    Vercel
       ↓
   Production
       ↓
     Users
```

GitHub remains the source of truth for the application's code.

Vercel becomes responsible for turning that code into a running deployment.

For supported frameworks, Vercel detects the project configuration when a repository is imported and supplies appropriate build defaults. Once the Git repository is connected, subsequent Git activity can trigger deployments automatically.

There is no requirement to design a bespoke deployment pipeline before shipping the product.

For a microproduct, that is an important feature.

## The First Deployment

Assume we have already built a working application and pushed it to a GitHub repository.

The first deployment is roughly:

1. Create a Vercel account and connect GitHub.
2. Select **New Project**.
3. Import the GitHub repository.
4. Confirm the detected framework, root directory, and build settings.
5. Add any required environment variables.
6. Deploy.

Vercel creates the project, builds the application and assigns it a production URL. The [first deployment of a new project is always a production deployment](https://vercel.com/docs/deployments/environments), even if it came from a branch that will later be treated as preview.

At this point:

```text
GitHub Repository
       ↓
     Vercel
       ↓
https://product.vercel.app
```

The product is online.

This should happen relatively early in development.

There is little value in spending days perfecting DNS, CI configuration or production infrastructure before establishing that the application can successfully build and run outside the local development environment.

Get the simplest deployment working first.

Then improve it.

## Git Becomes the Deployment Interface

The more important part of the GitHub-Vercel integration appears after the first deployment.

Once connected, Git itself becomes the deployment interface.

The basic model is:

```text
production branch (often main)
  ↓
Production

any other branch
  ↓
Preview

pull request
  ↓
Preview
```

Vercel distinguishes production deployments from preview deployments. There is a single [production branch](https://vercel.com/docs/deployments/git), commonly `main`, although it can be changed in project settings. After the first production deployment exists, pushes and merges to that branch create production deployments. Other branches and pull requests receive isolated [preview deployments](https://vercel.com/docs/deployments/environments) with their own URLs.

This gives even a solo developer a useful deployment pipeline without constructing one manually.

A normal change might look like:

```text
Create Ticket
     ↓
Create Branch
     ↓
Implement
     ↓
Push to GitHub
     ↓
Preview Deployment
     ↓
Validate
     ↓
Merge
     ↓
Production Deployment
```

In the default Git workflow, merging to the production branch is the release. Other promotion and rollback paths exist, but they should remain exceptions.

Deployment becomes a consequence of the normal development process rather than a separate ceremony.

## Preview Before Production

Preview deployments are particularly useful for agentic development.

Coding agents can make substantial changes very quickly. The faster implementation becomes, the more valuable it is to have a cheap way of seeing the exact deployed result before changing production.

Consider an agent implementing a redesigned dashboard.

Locally, the application may work correctly.

The branch is then pushed to GitHub.

Vercel creates a deployment specifically for that branch. Each commit also gets an immutable URL, while the branch keeps a [stable alias](https://vercel.com/docs/deployments/generated-urls) that always points at the latest commit:

```text
main
  ↓
product.com

redesign-dashboard
  ↓
product-git-redesign-dashboard-team.vercel.app
```

The preview can be opened on another computer, tested on a phone, shared with someone else or evaluated as part of a QA process. On new projects, [Standard Deployment Protection](https://vercel.com/docs/deployment-protection) is on by default, so preview URLs are not anonymously public. Reviewers need a Vercel login, a shareable bypass, or an explicit decision to leave protection off.

Further commits update the branch deployment, while production remains unchanged until the work is merged.

This is a substantial quality improvement for very little operational overhead.

It also fits naturally with [ticket-based agentic engineering](/docs/playbook/build/from-chat-to-tickets):

```text
Ticket
  ↓
Agent
  ↓
Branch
  ↓
Preview
  ↓
Review
  ↓
Merge
```

The ticket defines success.

The branch isolates the implementation.

The preview exposes the real result.

The merge becomes the default release decision.

## Secrets Are Not Source

Most real applications need configuration that should not live inside their repository.

Examples include:

- API keys;
- database credentials;
- authentication secrets;
- analytics configuration;
- external service URLs;
- feature configuration.

These values should generally be supplied through [environment variables](https://vercel.com/docs/environment-variables) rather than hardcoded into the application or committed to Git. Versioned deployment settings may still belong in the repository. Secrets and environment-specific values do not.

Vercel allows environment variables to be configured separately across production, preview and development environments. Changes apply to new deployments, not to ones that have already shipped.

Conceptually:

```text
Code
  ↓
GitHub

Secrets / Environment Values
  ↓
Vercel

        ↓

Running Application
```

Separating these concerns gives the same codebase different configuration depending on where it is running.

For example:

```text
Development
DATABASE_URL → local database

Preview
DATABASE_URL → test database

Production
DATABASE_URL → production database
```

This becomes increasingly important as a product grows. Preview does not get a separate database unless you give it one. If Preview and Production share the same writable credentials, a preview can modify production data.

A preview environment should not accidentally send test emails to real users, modify production data or expose production-only credentials simply because it shares the same source code.

Deployment configuration is therefore part of the product architecture, even when the deployment platform makes it easy to manage.

## Add the Domain Last

A Vercel deployment receives a usable deployment URL immediately.

Use it.

A common source of unnecessary friction is treating the custom domain as part of the minimum viable deployment.

It is not.

The better sequence is:

```text
Application
    ↓
Vercel Deployment
    ↓
Verify Production
    ↓
Custom Domain
```

First establish that the application builds and operates correctly.

Then connect the product's domain.

The distinction is useful because DNS problems and application problems are different classes of failure. Solving one at a time keeps deployment easier to reason about.

Once the production application is working, the custom domain becomes the stable public interface used by the product's users.

## Continuous Deployment Without the Ceremony

Continuous deployment sounds more complicated than it needs to be.

At its simplest, it means that a successfully validated change reaching the appropriate Git branch results in a new deployment.

The GitHub-Vercel workflow already gives us most of this:

```text
Code Change
    ↓
Commit
    ↓
Push
    ↓
Build
    ↓
Deployment
```

There is no separate upload step.

There is no production server to SSH into.

There is no directory of release artifacts to manually copy.

The repository records the history of the code. Vercel records which deployment currently serves production. After an [instant rollback](https://vercel.com/docs/deployments/rollback-production-deployment), those two can briefly diverge until a fix is shipped.

For small applications, this reduction in operational surface area matters enormously.

Every custom mechanism that does not exist is also a mechanism that cannot break.

## Do Not Build Infrastructure for Imaginary Scale

Engineers naturally think about future requirements.

This is useful until speculative requirements begin determining present architecture.

A new microproduct probably does not need Kubernetes.

It probably does not need a custom continuous-delivery system.

It probably does not need separate development, integration, staging, pre-production and production clusters.

It probably does not need a dedicated platform engineering function.

It may eventually need some of these things.

That is different.

A useful rule is:

**Infrastructure should be introduced in response to a demonstrated constraint.**

Perhaps the application needs long-running computation that does not fit the deployment model.

Perhaps it requires a specialized database architecture.

Perhaps traffic reaches a scale where cost characteristics change.

Perhaps compliance requirements demand additional control.

Perhaps the product evolves from a microproduct into critical infrastructure.

Those are reasons to change the architecture.

The theoretical possibility of future success is not.

Start with the smallest system that comfortably satisfies today's requirements while leaving reasonable paths for tomorrow.

## Managed Does Not Mean Operationally Free

Vercel removes much of the work involved in deploying an application.

It does not remove responsibility for operating the product.

A successfully deployed application can still:

- return errors;
- expose secrets;
- lose data;
- exceed API quotas;
- depend on unavailable upstream services;
- produce unexpected costs;
- contain security vulnerabilities;
- fail to deliver value to users.

Deployment infrastructure is only one layer of operation.

```text
Deployment
    ↓
Availability
    ↓
Observation
    ↓
User Behaviour
    ↓
Learning
    ↓
Iteration
```

Once the product is live, the focus should progressively move away from whether the infrastructure exists and toward whether the product actually works for its intended users.

This is the purpose of the Operate phase.

The application is now exposed to reality.

Use that information.

## An Agentic Deployment Loop

The Build and Operate phases increasingly form one continuous system.

Ticket-based development gives agents bounded units of work.

Git branches isolate those changes.

Vercel turns branches into running applications.

Humans and agents can validate the result.

Merging promotes accepted work into production.

Usage then generates the next round of product information.

```text
User Need
    ↓
Ticket
    ↓
Agent
    ↓
Code
    ↓
GitHub
    ↓
Preview
    ↓
Review
    ↓
Production
    ↓
Usage
    ↓
Insight
    ↓
Next Ticket
```

This is a remarkably capable software delivery system for how little infrastructure it contains.

More importantly, every component has a clear job.

GitHub preserves code and development history.

Tickets preserve work and intent.

Vercel turns accepted code into running software.

The production application creates feedback from the real world.

The system then loops.

## What Operate Now Requires

For a typical web-based microproduct, deployment does not need to become an independent engineering project.

A useful default is:

```text
GitHub
   ↓
Vercel
   ↓
Preview
   ↓
Production
   ↓
Observe
   ↓
Iterate
```

Before calling a microproduct launched:

- keep the application in a version-controlled repository;
- connect the repository directly to the deployment platform;
- confirm that the production build works outside localhost;
- keep secrets and environment-specific values outside source control;
- give Preview its own data and credentials when the product can mutate anything important;
- use preview deployments to validate meaningful changes, and know how reviewers will access them;
- attach a stable domain once the production deployment works;
- make production changes through the normal Git workflow;
- know how to roll back a bad production deployment;
- add operational complexity only when a real constraint requires it.

The specific deployment platform can change.

The principle should not.

**For a microproduct, deployment should be boring.**

The interesting work begins once users arrive.
