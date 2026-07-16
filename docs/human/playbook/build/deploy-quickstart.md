---
title: Deploy Quickstart
description: Ship your microproduct for free using GitHub and the Vercel Hobby plan.
slug: /playbook/deploy-quickstart
tags: [playbook, build, deploy]
last_reviewed: 2026-07-16
authors: [trilemma-foundation]
---

This guide walks through deploying a microproduct using only GitHub and the
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

## 3. Configure the build

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

## 5. Preview deployments

Open a pull request on GitHub and Vercel creates a unique preview URL for that
branch. Share the preview link for review before merging to `main`.

## Hobby plan limits

The Vercel Hobby plan is free and suitable for personal and non-commercial
microproducts. Be aware of these constraints:

- **Bandwidth**: 100 GB per month
- **Build minutes**: 6,000 per month
- **Serverless execution**: 100 GB-hours per month
- **Commercial use**: Hobby is for personal projects; commercial products need
  the Pro plan

If your microproduct outgrows these limits, review Vercel's pricing before
upgrading.

## What comes next

Once deployed, move into [Operate](/docs/playbook/operate) to own distribution,
learning, and iteration after launch.

[Propose an improvement](https://github.com/TrilemmaFoundation/microproduct-lab/pulls)
