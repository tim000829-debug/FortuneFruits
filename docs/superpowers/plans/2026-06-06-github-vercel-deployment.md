# Fortune Fruits GitHub and Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the GitHub-backed Fortune Fruits static website to `fortune-fruits-tw.vercel.app` with automatic production deployments from `master`.

**Architecture:** GitHub remains the source of truth and Vercel's native Git integration watches the repository. The static files deploy from the repository root with no build command, while feature branches receive preview deployments.

**Tech Stack:** Git, GitHub, Vercel Git integration, static HTML/CSS/JavaScript

---

### Task 1: Verify Repository State

**Files:**
- Inspect: repository root

- [ ] **Step 1: Confirm the local branch matches GitHub**

Run:

```powershell
git status -sb
git remote -v
git rev-parse --short HEAD
```

Expected: branch is `master`, status is clean, and `origin` points to
`tim000829-debug/FortuneFruits.git`.

- [ ] **Step 2: Run the static website checks**

Run:

```powershell
node tests/static-site.test.js
node tests/commerce-behavior.test.js
node --check commerce.js
node --check script.js
```

Expected: both test scripts pass and both syntax checks exit with code 0.

### Task 2: Authenticate and Create the Vercel Project

**Files:**
- Generated locally by Vercel: `.vercel/project.json`
- Existing ignore file: `.gitignore`

- [ ] **Step 1: Check Vercel CLI availability and authentication**

Run:

```powershell
vercel --version
vercel whoami
```

Expected: the CLI prints a version and the active Vercel account. If no account
is active, run `vercel login` and complete the browser authorization.

- [ ] **Step 2: Create or link the named Vercel project**

Run:

```powershell
vercel link --yes --project fortune-fruits-tw
```

Expected: `.vercel/project.json` identifies the `fortune-fruits-tw` project.
If the name is unavailable, stop and ask Tim to choose another name.

- [ ] **Step 3: Ensure Vercel metadata remains untracked**

Run:

```powershell
git status --short
git check-ignore .vercel/project.json
```

Expected: `.vercel/project.json` is ignored and no unrelated source files were
changed.

### Task 3: Connect GitHub and Configure Production

**Files:**
- Vercel project settings: remote configuration

- [ ] **Step 1: Connect the GitHub repository**

Use the Vercel project settings or connected Vercel API to import:

```text
Repository: tim000829-debug/FortuneFruits
Production branch: master
Root directory: .
Framework preset: Other
Build command: none
Output directory: .
```

Expected: Vercel reports the Git repository as connected and identifies
`master` as the production branch.

- [ ] **Step 2: Trigger the initial production deployment**

Run:

```powershell
vercel --prod --yes
```

Expected: deployment reaches `READY` and receives the production alias
`fortune-fruits-tw.vercel.app`.

### Task 4: Verify the Production Site

**Files:**
- Verify: `index.html`
- Verify: `products.html`
- Verify: `checkout.html`

- [ ] **Step 1: Inspect deployment metadata**

Run:

```powershell
vercel inspect https://fortune-fruits-tw.vercel.app
```

Expected: status is `READY`, target is production, and the deployment commit
matches GitHub `master`.

- [ ] **Step 2: Verify all public pages**

Open:

```text
https://fortune-fruits-tw.vercel.app/
https://fortune-fruits-tw.vercel.app/products.html
https://fortune-fruits-tw.vercel.app/checkout.html
```

Expected: each page returns HTTP 200, images and styles load, navigation works,
and no browser console errors appear.

- [ ] **Step 3: Verify the Apps Script dependency remains reachable**

Open the configured Apps Script endpoint and confirm its JSON response contains:

```json
{
  "ok": true,
  "sheets": ["Inquiries", "Orders"]
}
```

Expected: the endpoint is reachable from the deployed site without adding a
Vercel environment variable.

### Task 5: Verify Automatic GitHub Synchronization

**Files:**
- Create and remove only if required: `docs/deployment-check.txt`

- [ ] **Step 1: Use deployment metadata to confirm Git integration**

Inspect the Vercel deployment and project settings.

Expected: the deployment source names
`tim000829-debug/FortuneFruits` and production branch `master`.

- [ ] **Step 2: Perform a harmless synchronization test only if metadata is insufficient**

Create `docs/deployment-check.txt` containing:

```text
Vercel Git synchronization verified on 2026-06-06.
```

Commit and push:

```powershell
git add docs/deployment-check.txt
git commit -m "Verify Vercel Git deployment"
git push origin master
```

Expected: Vercel automatically creates a new production deployment without a
manual CLI deployment.

- [ ] **Step 3: Report the final deployment**

Report the production URL, Vercel project name, deployed commit, synchronization
status, and whether any custom domain action remains.
