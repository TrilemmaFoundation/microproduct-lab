---
title: Deploy Quickstart
description: Ship your microproduct for free using GitHub and the Vercel Hobby plan.
slug: /playbook/deploy-quickstart
tags: [playbook, build, deploy]
last_reviewed: 2026-08-19
authors: [trilemma-foundation]
---

## When to Use This Module

Use this guide during Phase 2 (Build) when you have a release candidate ready to
ship. It walks through deploying a microproduct using only GitHub and the
Vercel free **Hobby** plan. It works for any static site or Vercel-supported
web app — no paid services required.

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account on the free Hobby plan
- A microproduct repository that builds successfully on your machine

## 1. Push to GitHub

Create a new repository on GitHub and push your microproduct code:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If you started from a [product template](/templates), fork or copy the starter
into its own repository first.

## 2. Import into Vercel

1. Sign in to [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New…** → **Project**.
3. Select **Import Git Repository** and choose your microproduct repo.
4. Grant Vercel access to the repository if prompted.

## 3. Configure the Build

Vercel auto-detects most frameworks (Next.js, Vite, Astro, Docusaurus, etc.)
and fills in the build command and output directory. Review the settings before
deploying:

| Setting | Typical value |
| --- | --- |
| Framework Preset | Auto-detected |
| Build Command | `npm run build` |
| Output Directory | `dist`, `build`, or `.next` (depends on framework) |
| Install Command | `npm install` |

If auto-detection does not match your project, add a `vercel.json` at the repo
root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

Adjust `buildCommand` and `outputDirectory` to match your project.

## 4. Deploy

Click **Deploy**. Vercel builds your project and assigns a production URL
(e.g. `your-repo.vercel.app`). Every push to `main` triggers an automatic
redeploy.

## 5. Preview Deployments

Open a pull request on GitHub and Vercel creates a unique preview URL for that
branch. Share the preview link for review before merging to `main`.

## Hobby Plan Limits

The Vercel Hobby plan is free and suitable for personal and non-commercial
microproducts. Confirm current figures on the [Hobby plan](https://vercel.com/docs/plans/hobby)
and [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
before you plan around them:

- **Fast Data Transfer**: up to 100 GB per month
- **Active CPU**: up to 4 CPU-hrs per month
- **Provisioned Memory**: up to 360 GB-hrs per month
- **Function invocations**: up to 1 million per month
- **Builds**: Hobby has no monthly build-minute quota. Each deployment is
  capped at 45 minutes of build time, with one concurrent build.
- **Commercial use**: Hobby is for personal projects; commercial products need
  the Pro plan

If your microproduct outgrows these limits, review Vercel's pricing before
upgrading.

## Next Step

Once deployed, move into [Operate](/docs/playbook/operate) to own distribution,
learning, and iteration after launch.

[Propose an improvement](https://github.com/TrilemmaFoundation/microproduct-lab/pulls)
