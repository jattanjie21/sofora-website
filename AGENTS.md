# Sofora website: guide for agents

Read this first. It is kept current; `README.md` has the full human-facing detail. If you change how something works, update this file in the same change.

## What this is

- `apps/web` (`@sofora/web`, port 5173): public website for Sofora Cooperative Credit Union. A faithful copy of the old WordPress site at soforaccu.com (same menu, wording, photos, old URLs such as `/about-us/`), rebuilt in React. Services were reorganised into one `/services/` hub with a page per product (`/services/car-loan/`); `/loan-services/` and `/saving/` redirect into it.
- `apps/portal` (`@sofora/portal`, port 5174): staff portal. Edit website content (save = live, no drafts), work membership/loan applications, manage staff.
- `convex/`: one Convex backend for both apps. Dev deployment `jovial-ptarmigan-163` (see root `.env.local`). See `convex/README.md` for the backend map.

## Run and check

- `npm start` / `npm stop`: Convex + both apps in the background; logs in `.dev/logs/`. Opens the browser.
- Portal login (dev only): `admin` / `admin`. Created by `convex/devLogins.ts`, only where the Convex env var `DEV_LOGINS=true` (set on the dev deployment, never production).
- `pnpm typecheck`, `pnpm build`: both must pass. There are no automated tests.
- `pnpm screenshot /services/ out.png [width]`: screenshot a public page (needs `npm start`). Use this to check visual changes.

## Where to change things

| To change | Edit |
| --- | --- |
| Any website text or image (defaults) | `apps/web/src/data/copy.ts`: one row per field `[page, section, label, key, default, kind]`. The portal editor is generated from these rows. |
| Loans, savings products (and their pages' text), FAQs, board, staff, partners, contact details, portal image picker | `apps/web/src/data/content.ts` (`servicePath`/`applyPath` give a product's page and Apply link) |
| Page layout | `apps/web/src/pages/*` (routes in `apps/web/src/App.tsx`) |
| Header, menu, footer | `apps/web/src/components/Layout.tsx` |
| Services hub and product pages | `apps/web/src/pages/Services.tsx` |
| Shared blocks (slider, page header, photo hero `HeroBanner`, closing `CtaBanner`, product cards, people grid, FAQ) | `apps/web/src/components/ui.tsx` |
| Colours, fonts, all public styling | `apps/web/src/styles.css` (tokens at the top) |
| Site search | `apps/web/src/data/search.ts` (client-side over live content; results at `/?s=`) |
| Editable page list in the portal, per-page validation | `apps/portal/src/data/content.ts` (`documents`, `applyDocument`, `contentError`) |
| Portal editor UI for lists and photos | `apps/portal/src/components/ContentFields.tsx` |
| Roles and permissions (shared by portal and backend) | `apps/portal/src/data/types.ts` (`can()`) |
| Content storage and server validation | `convex/content.ts` |
| Public application forms | `apps/web/src/pages/Apply.tsx` → `convex/applications.ts` |

## Recipes

- **Add a text/image field:** add a row to `copy.ts`, use `c["page.key"]` in the page. Nothing else; stored pages fall back to defaults for new keys.
- **Add a website page:** add its id to `pageIds` in `copy.ts`, rows for its fields, a route in `App.tsx`, an entry in `documents` (portal `data/content.ts`), and a path in `search.ts`. Then run `pnpm exec convex run setup:addMissingPages`, because the database has no row for the new page (it leaves existing pages alone).
- **Add a field to every loan/savings product:** add it to `Product` and each product in `content.ts`, and to `productFields` (portal `data/content.ts`), which drives the editor and both validations. Stored products get the default for new fields (`withProductDefaults` in `convex/content.ts`), so no reset is needed.
- **Change a default label that is already stored:** saved pages keep their old value. Give the row a new key so the new default shows (as done for `shared.nav-forms-downloads`).
- **Reset dev content to defaults** (wipes content edits): `pnpm exec convex run setup:resetPages`.
- **Change the Convex schema when data already exists:** a push fails if existing documents don't match. Loosen the field (optional / `v.string()`), push with `pnpm exec convex dev --once --typecheck disable` if types break, migrate the data with an internal mutation, then tighten and push again. Never use `--typecheck disable` for the final push.
- **Images:** put files in `apps/web/public/images/` with flat names (validation only accepts `/images/<name>`), compress large JPEGs, and add them to `imageLibrary` in `content.ts` so the portal offers them.

## Known pitfalls

- **Automated browsers often can't open the Convex websocket** ("Connection closed before receiving a handshake response"), so the public site stays on "Loading Sofora…" and the portal can't log in. This is the agent environment, not a bug. Use `pnpm screenshot`, or call functions with `ConvexHttpClient` from Node (sign in with the `auth:signIn` action using admin/admin).
- **Convex CLI network calls fail intermittently** (`fetch failed`). Retry before debugging. Don't pipe into `tail` when the exit code matters.
- **Query limits:** `.take(n)` silently truncates. Pages are read with `take(50)`; there are 15 pages. Raise limits if you add more.
- **Backend code is dense** (many one-line functions in `convex/`). Read whole functions before editing.
- **zsh:** never name a shell variable `path`; it overwrites `PATH`.

## Docs status

- `README.md`: current.
- `convex/README.md`: current backend map.
- `docs/content-sources.md`: where the old-site content and images came from.
- `docs/portal-design.md`: current portal and content architecture.
- `docs/portal-walkthrough.md`: current manual test walkthrough.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
