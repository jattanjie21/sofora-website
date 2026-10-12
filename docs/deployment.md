# Deploying to Vercel and Convex

The repo deploys as **two Vercel projects** (website and staff portal) from the same GitHub repo, plus **one Convex production deployment** that both use.

| Piece | Where | Notes |
| --- | --- | --- |
| Public website (`apps/web`) | Vercel project, e.g. `sofora-web` → `soforaccu.com` | Deploys the Convex backend on every production build |
| Staff portal (`apps/portal`) | Vercel project, e.g. `sofora-portal` → `portal.soforaccu.com` | Build only, points at the same Convex deployment |
| Backend (`convex/`) | Convex production deployment | Database, files, auth, emails |

Each app has a `vercel.json` (build command, SPA rewrites, caching and security headers). The build command runs `scripts/vercel-build.sh`: with `CONVEX_DEPLOY_KEY` set it runs `convex deploy` and then builds against that deployment; otherwise it only builds with `VITE_CONVEX_URL`.

## 1. Convex production deployment

In the [Convex dashboard](https://dashboard.convex.dev) open the project, switch to **Production**, and:

1. **Settings → URL & Deploy Key → Generate production deploy key.** Keep it for step 2.
2. **Settings → Environment Variables**, add:

| Variable | Value |
| --- | --- |
| `SITE_URL` | The portal's address, e.g. `https://portal.soforaccu.com` (used by sign-in and the "Open in portal" links in emails) |
| `JWT_PRIVATE_KEY`, `JWKS` | Convex Auth keys. Generate with `npx @convex-dev/auth --prod` from the repo root (or follow the [Convex Auth guide](https://labs.convex.dev/auth/setup)) |
| `RESEND_API_KEY` | A Resend API key for the verified `soforaccu.com` domain |
| `EMAIL_LIVE` | `true` (without it every email goes to the test address instead of applicants and staff) |
| `EMAIL_FROM` | Optional, default `Sofora CCU <noreply@soforaccu.com>` |
| `RESEND_WEBHOOK_SECRET` | Optional, for delivered/bounced status (step 5) |

**Never set `DEV_LOGINS` in production.** It enables the `admin` / `admin` login.

## 2. Vercel: the website project

1. **Add New → Project**, import `jattanjie21/sofora-website`.
2. **Root Directory:** `apps/web`. Framework preset: Vite. Leave the build and output settings alone; `vercel.json` sets them.
3. **Environment Variables:**
   - `CONVEX_DEPLOY_KEY` = the production deploy key, for the **Production** environment only.
   - `VITE_CONVEX_URL` = the production URL (`https://<name>.convex.cloud`, from the Convex dashboard), for **Preview** and **Development**. Preview builds then build only, without deploying the backend.
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1` (all environments), so Vercel uses the pnpm version in `package.json`.
4. Deploy, then add the domain (`soforaccu.com`, `www.soforaccu.com`) under **Settings → Domains**.

## 3. Vercel: the portal project

Same repo, a second project:

1. **Root Directory:** `apps/portal`.
2. **Environment Variables:** `VITE_CONVEX_URL` = the production Convex URL (all environments) and `ENABLE_EXPERIMENTAL_COREPACK` = `1`. **No deploy key**, so only the website project deploys the backend.
3. Add the domain, e.g. `portal.soforaccu.com`, and make sure `SITE_URL` in Convex matches it.

Deploy the website project first on a fresh setup, so the backend exists before the portal is used.

## 4. First administrator (once)

The production database starts empty. From the repo root, with the production deploy key:

```sh
export CONVEX_DEPLOY_KEY='prod:…'
TOKEN=$(openssl rand -hex 32)
HASH=$(printf %s "$TOKEN" | shasum -a 256 | cut -d' ' -f1)
pnpm exec convex run setup:initialize "{\"administratorEmail\":\"you@soforaccu.com\",\"invitationHash\":\"$HASH\"}"
echo "https://portal.soforaccu.com/login#invitation=$TOKEN&email=you%40soforaccu.com"
```

This seeds every website page with the default content, creates the application counters and the first administrator. Open the printed link to choose a password (it expires after seven days). It only works while there are no staff yet.

Then sign in to the portal, open **Settings** and add the team email addresses.

## 5. Resend webhook (optional, recommended)

In Resend, **Webhooks → Add endpoint**: `https://<name>.convex.site/resend-webhook` (the production `.convex.site` address), with all `email.*` events. Copy the signing secret into `RESEND_WEBHOOK_SECRET` in Convex. The portal's email log then shows Delivered / Bounced instead of Sent.

## After deploying

- Visit the website, send a contact message, and check the confirmation email and the team alert arrive, and that the message shows in the portal Contact inbox.
- Portal → Settings → **Send test email** to check the Resend setup.
- Old WordPress URLs (`/about-us/`, `/loan-services/`, …) are handled by the React router; every path falls back to `index.html`.

## Every push afterwards

Pushing to `main` deploys both Vercel projects. The website build runs `convex deploy`, which pushes the backend functions and schema first. If a schema change doesn't match existing data the deploy fails and the site isn't updated; see "Change the Convex schema when data already exists" in `AGENTS.md`.
