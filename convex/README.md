# Backend map

One Convex backend serves the public website and the staff portal. Push changes with `pnpm backend:push` (or keep `npm start` running, which watches and pushes). Generated types live in `_generated/`; never edit them.

## Files

| File | Functions | Notes |
| --- | --- | --- |
| `schema.ts` | — | Tables: `staff`, `invitations`, `pages`, `applications`, `activity`, `counts`, `media`, plus Convex Auth tables. |
| `validators.ts` | — | Shared validators. `documentKey` comes from `pageIds` in `apps/web/src/data/copy.ts`. |
| `lib/access.ts` | helpers | `staffQuery` / `staffMutation` (require an active signed-in staff member), `requirePermission`, `log` (activity feed), input checks `text` / `email`, `hash`. |
| `content.ts` | `published` (public), `workspace`, `save` | Each page is one `pages` row holding its fields as JSON (`published`). `save` validates and writes straight to the live site; `revision` stops two people overwriting each other. |
| `applications.ts` | `submit` (public), `add`, `list`, `detail`, `totals`, `recentActivity`, `save`, `update` | `submit` is the public form: consent, spam trap, rate limits (200/hour overall, 5/hour per email). `update` handles assign, note, review, request information, recommend, decide. |
| `staff.ts` | `me` (public), `list`, `save`, `profile`, `invite` | Staff records are separate from auth `users`; `invite` creates a single-use activation link. |
| `media.ts` | `uploadUrl`, `register`, `url`, `urls` | Photo uploads (PNG/JPEG/WebP, 2 MB) into Convex storage, referenced in content as `storage:<id>`. |
| `auth.ts`, `auth.config.ts`, `http.ts` | — | Convex Auth with passwords. Accounts can only be created from an invitation (or the dev login below). |
| `setup.ts` | `initialize`, `resetPages`, `addMissingPages` (internal) | `initialize` creates the first admin and seeds pages once. `resetPages` replaces all pages with the defaults. `addMissingPages` adds default rows only for pages that have none. |
| `devLogins.ts` | `seed` (internal) | Creates/resets the `admin` / `admin` login. Only runs where `DEV_LOGINS=true`. Called by `npm start`. |

Internal functions run from the CLI, for example `pnpm exec convex run setup:resetPages`.

## Conventions

- Permissions are defined once in `apps/portal/src/data/types.ts` (`can()`) and checked here with `requirePermission`; the portal uses the same function to hide controls.
- Content validation is shared too: `contentError` and `applyDocument` in `apps/portal/src/data/content.ts`, plus the structural checks in `content.ts`.
- Use indexes (`withIndex`) and bounded `.take(n)` reads. `take` silently truncates, so keep limits above the real row counts.
- Changing the schema when rows already exist: see "Recipes" in the root `AGENTS.md`.
