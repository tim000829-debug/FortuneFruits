# Fortune Fruits GitHub and Vercel Deployment Design

## Goal

Publish the Fortune Fruits static website through Vercel while keeping GitHub as
the source of truth. Future pushes to the production branch must automatically
update the public website.

## Repository

- GitHub repository: `tim000829-debug/FortuneFruits`
- Production branch: `master`
- Project root: repository root
- Site type: static HTML, CSS, and JavaScript

## Vercel Project

- Preferred project name: `fortune-fruits-tw`
- Initial production domain: `fortune-fruits-tw.vercel.app`
- Framework preset: Other / static site
- Build command: none
- Output directory: repository root

If the preferred Vercel project name or generated domain is unavailable, stop
and let Tim choose an alternative instead of silently selecting another name.

## Deployment Flow

Vercel's native GitHub integration will connect directly to the repository.
Pushes to `master` create production deployments. Pushes to other branches and
pull requests create preview deployments.

GitHub remains the canonical source. Direct production deployments from an
uncommitted local working tree are not part of the normal workflow.

## Domain Strategy

The site launches first on the free Vercel domain. A custom `.com` or `.com.tw`
domain can be attached later without changing the repository, Apps Script
endpoint, or deployment flow. Tim will approve the final custom domain before
purchase or DNS changes.

## Existing Backend Connection

The deployed static site continues sending inquiries and orders to the current
Google Apps Script web app. No secrets are required in Vercel because the
endpoint is already referenced by the browser-side JavaScript.

## Verification

After deployment:

1. Confirm the production deployment reports `READY`.
2. Open the production URL and verify the home, products, and checkout pages.
3. Confirm static assets load without console errors.
4. Confirm the deployed commit matches GitHub `master`.
5. Make a harmless GitHub update only if needed to verify automatic redeploy.

## Failure Handling

- If Vercel authentication is missing, pause for account login.
- If GitHub authorization is missing, request access only to the FortuneFruits
  repository where possible.
- If `fortune-fruits-tw.vercel.app` is unavailable, ask Tim for another name.
- If deployment fails, inspect the build logs and fix only deployment-related
  configuration before retrying.
