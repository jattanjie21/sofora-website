# Sofora website

Working on this with an AI assistant? `AGENTS.md` (loaded by `CLAUDE.md`) has a short map of where everything lives, recipes and known pitfalls.

A rebuild of Sofora Cooperative Credit Union’s public website and a staff portal for managing its content and applications. It uses React, Vite, TypeScript and a pnpm/Turborepo monorepo, with [Convex](https://convex.dev) as the shared backend.

## Quick start

Use Node.js 24 and pnpm 11.22.0 (recorded in `.node-version` and `package.json`).

```sh
npm start   # Start Convex, the website and the portal in the background
npm stop    # Stop all three
```

| App            | URL                     |
| -------------- | ----------------------- |
| Public website | `http://127.0.0.1:5173` |
| Staff portal   | `http://127.0.0.1:5174` |

Log in to the portal with username **admin** and password **admin** (development only; see [Dev login](#dev-login)).

`npm start` opens both in your default browser. It installs dependencies if `node_modules` is missing. It refuses to start if the apps are already running, if port 5173 or 5174 is busy, or if Convex isn't configured. It returns once both sites respond and Convex has pushed the current functions. Output goes to `.dev/logs/{convex,web,portal}.log`. If Convex fails (for example because you're offline or logged out), the sites keep running against the backend that was last deployed, and `npm start` prints a warning.

The scripts live in `scripts/` and use process groups, so they're for macOS and Linux.

### First-time setup

Both apps need a Convex deployment:

1. Run `pnpm install --frozen-lockfile`, then `pnpm backend:dev`. The Convex CLI logs you in, creates or selects a deployment, and writes `.env.local` at the repo root.
2. Copy `apps/web/.env.example` and `apps/portal/.env.example` to `.env.local` in each app, and set `VITE_CONVEX_URL` to the deployment URL.
3. On a new deployment, set up Convex Auth’s environment variables (`JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`). See the [Convex Auth setup guide](https://labs.convex.dev/auth/setup).
4. Initialise the workspace once (see [First administrator](#first-administrator)).

### Other commands

```sh
pnpm dev               # Both apps in the foreground (without Convex)
pnpm backend:dev       # Convex in the foreground, watching for changes
pnpm backend:push      # Push Convex functions once
pnpm typecheck         # Strict TypeScript across the backend and both apps
pnpm build             # Typecheck, then build through Turborepo
pnpm preview           # Serve the website's production build
pnpm --filter @sofora/portal preview   # Serve the portal build on port 4174
pnpm screenshot /services/ out.png        # Full-page screenshot of a public page (needs npm start)
```

The production outputs are `apps/web/dist` and `apps/portal/dist`. Both apps need `VITE_CONVEX_URL` set at build time.

## Structure

```text
apps/
  web/                 # @sofora/web: public website
    public/            # Local images, fonts and font licences
    src/
      components/      # Navigation, layout, calculator and repeated page elements
      data/            # Default content and copy, content context, LiveWebsite (live content from Convex)
      pages/           # Public routes, including the application form
      styles.css       # Design tokens, components, responsive styles
  portal/              # @sofora/portal: staff portal
    src/
      components/      # Forms, feedback, dialogs, website preview
      data/            # Types and permissions, document definitions, WorkspaceProvider (Convex hooks)
      pages/           # Login, overview, content, applications, staff, profile
      styles.css       # Staff workspace styling
convex/
  schema.ts            # Tables: staff, invitations, pages, applications, activity, counts, media (+ auth tables)
  auth.ts              # Password sign-in; account creation only through a staff invitation
  lib/access.ts        # staffQuery/staffMutation wrappers and permission checks
  content.ts           # Published content, editorial workflow
  applications.ts      # Public submissions, staff queue and decisions
  staff.ts, media.ts   # Staff management, profiles, invitations; image uploads
  setup.ts             # One-time workspace initialisation
scripts/               # npm start / npm stop / pnpm screenshot
docs/
```

The public site is `@sofora/web` and the portal is `@sofora/portal`. The portal declares a workspace dependency on the web app because it imports its page components and content to render previews. Code is shared through relative imports rather than a separate package. In particular, `convex/` imports `apps/portal/src/data/types.ts` so that the server and the portal use the same `can()` permission check.

## Public website

The website reproduces the original WordPress site at soforaccu.com (Borrow theme): the same menu, page structure, wording, photos, Poppins typeface and blue colour scheme. Only the technology changed. Pages keep their old WordPress addresses, so existing links and search results still work without redirects.

| Menu                 | Routes                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| Home                 | `/`: slider, loan rates, about, loan services, loan calculator, latest news            |
| About Us             | `/about-us/`, `/history/`, `/faq/`                                                                       |
| Team                 | `/board-of-directors/`, `/staff/` (also `/loan-team/`, linked from the home page)                        |
| Services             | `/services/` hub (loans, savings, how it works, calculator, forms), one page per product such as `/services/car-loan/`, `/downloads/` (fillable PDFs in `apps/web/public/downloads`). `/loan-services/` and `/saving/` redirect to the hub. Member Login (external) is in the top bar |
| Blog                 | `/blog/`, `/exciting-news-for-sofora-cooperative-credit-union-members/`, `/the-evolution-of-sofora/`     |
| Partners             | External links to partner credit unions                                                                  |
| Forms & Downloads    | `/downloads/`, `/registration-form/`, `/membership-application-form/`, `/kafo-application-form/`, `/loan-application-form/` |
| Gallery              | `/photo-gallery/`, `/youtube-gallery/`                                                                   |
| Contact Us           | `/contact-us/`                                                                                           |

Unknown routes display a not-found page.

The site loads its content from Convex (`content.published`) through `LiveWebsite.tsx`, so changes saved in the portal appear on the website immediately. Images uploaded in the portal are stored in Convex file storage and referenced as `storage:` IDs, which are swapped for URLs when the page loads.

The four forms replace the old WordPress forms. Each sends an application to the portal's Applications queue through `applications.submit`, which requires consent, includes a hidden spam-trap field, and is rate-limited to 200 submissions per hour overall and 5 per hour per email address. The Kafo form is a group membership application. Each form page also links to the matching fillable PDF. The online forms deliberately don't collect ID numbers, photos or signatures, which the paper forms do. The contact form has no mail server: it opens the visitor's email app with the message addressed to Sofora.

Differences from the old site:

- The loan card icons are redrawn in the same line style, because the originals came from an icon font licensed with the WordPress theme.
- The old Photo Gallery plugin no longer showed any photos. The new gallery uses photos from the old site's media library.
- The YouTube Gallery embeds the channel's uploads instead of the Elfsight widget.
- Search (the round button in the header) works like the old one, with results at `/?s=…`. It searches the live content in the browser, so portal edits are searchable straight away.
- The footer newsletter signup and embedded Twitter feed are left out. The footer and home page link to Twitter instead.
- The loan and amortization calculators are merged into one loan calculator, which shows the month-by-month repayment schedule on the page instead of emailing a PDF.

All text and images are defined in `apps/web/src/data/copy.ts` (one row per field, grouped by page; the portal builds its editor from this list) and the lists in `apps/web/src/data/content.ts` (loans, FAQs, board, staff, contact details, and the image library offered in the portal's photo pickers). These seed the Convex `pages` table when the workspace is initialised. After that, content is edited in the portal. After adding a page, `pnpm exec convex run setup:addMissingPages` creates its row with the defaults and leaves the other pages alone. If the page structure changes more deeply, `pnpm exec convex run setup:resetPages` replaces all stored pages with the defaults. Page layouts are in `apps/web/src/pages`, and colours are at the beginning of `apps/web/src/styles.css`.

The wording is copied from the old site as it was on 11 October 2026, including its spelling and grammar, so it can be corrected in the portal. See [content sources](docs/content-sources.md).

## Staff portal

The portal covers sign-in, an overview, an editor for every website page plus the menu, footer and calculator labels, membership and loan application queues, applicant details and notes, officer recommendations, administrator decisions, staff and role management, and each person’s profile.

### Roles

| Role                | Can do                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| Administrator       | Everything, including staff management and final application decisions |
| Content Editor      | Edit website content; saved changes go live immediately                 |
| Application Officer | Work the application queue: assign, add notes, request information, recommend |

A person can have several roles. Permissions are defined in `apps/portal/src/data/types.ts` and enforced on the server by `convex/lib/access.ts`. Every staff function requires an active, signed-in staff member.

### Accounts and sign-in

Sign-in uses Convex Auth with email and password. Nobody can sign up directly: an administrator adds a person under **Staff** and chooses **Create activation link**. The link (`/login#invitation=…&email=…`) is single-use and expires after seven days. The person opens it and chooses a password of 12–128 characters. Only a hash of the invitation token is stored. Deactivated staff can't sign in, and their existing access stops.

#### Dev login

On the development deployment, you can log in with username `admin` and password `admin`. This bypasses the invitation and password-length rules, so it only works where the Convex environment variable `DEV_LOGINS` is `true`. That's set on the dev deployment (`pnpm exec convex env set DEV_LOGINS true`) and must never be set in production.

`npm start` runs `devLogins:seed` after Convex is ready. That creates a "Dev Admin" staff member (`admin@sofora.test`) with the Administrator role, or resets its password to `admin` if it already exists. The login page accepts the username `admin` and shows a hint only in Vite dev mode, so production builds still ask for an email address. The code is in `convex/devLogins.ts`.

#### First administrator

On a fresh deployment, `setup.initialize` creates the first administrator, seeds every page from the default content, and initialises the application counters. It only runs while the `staff` table is empty. Generate a random token, pass its SHA-256 hash, and keep the token for the activation link:

```sh
TOKEN=$(openssl rand -hex 32)
HASH=$(printf %s "$TOKEN" | shasum -a 256 | cut -d' ' -f1)
pnpm exec convex run setup:initialize "{\"administratorEmail\":\"admin@example.com\",\"invitationHash\":\"$HASH\"}"
echo "http://127.0.0.1:5174/login#invitation=$TOKEN&email=admin%40example.com"
```

Keep activation links private. `admin-activation.local.md` is gitignored for this purpose.

### Editing content

Open a page under **Website content**, change the fields and press **Save**. The public website updates straight away; there are no drafts or approval steps. Saves carry a revision number, so if two people edit the same page, the later save is rejected instead of overwriting the other person's work. The **Preview** tab shows your unsaved changes using the real public page components and CSS, at desktop (1280px) or mobile (375px) widths. External links are disabled inside previews; the calculator and internal navigation still work. Images can be PNG, JPEG or WebP up to 2 MB.

### Applications

Applications arrive from the public form or are entered by staff. Officers assign them, add notes, request information and recommend approval or rejection. Administrators record the final decision. Every action is logged to the application’s history and the overview’s recent activity.

See [portal and content architecture](docs/portal-design.md).

## Calculators

Both calculators use equal monthly payments on a reducing balance:

```text
r = annual percentage rate / 1200
payment = principal × r / (1 − (1 + r)^(−months))
```

At 0% interest, the payment is the principal divided by the number of months. A numerically stable `log1p`/`expm1` expression avoids cancellation at very small positive rates. The loan calculator (`apps/web/src/components/LoanCalculator.tsx`, on the home and services pages) has a slider and a number box for amount, months and rate, shows the monthly repayment, amount borrowed, total interest and total to repay, and can show the month-by-month schedule. Its starting rate (15%) is editable in the portal.

## Manual review

There is no automated test framework. Type checking and production builds don’t prove that the layout or interactions work in a browser. To review manually:

1. Run `npm start`. Open every menu item, use back/forward navigation, and open an unknown route.
2. Check widths of about 360px, 768px and 1440px. Content should stay readable with no horizontal overflow.
3. On mobile, open the menu, expand a section and follow a link. Press Escape to close it; focus should return to the menu button.
4. Use only the keyboard: follow the skip link, open the dropdown menus, move through links and inputs, and expand FAQs. Focus should stay visible.
5. In the loan calculator, the defaults (GMD 50,000, 12 months, 15%) should show GMD4,512.92 a month. Typing GMD 12,000 at 12% for 12 months should show GMD1,066.19 a month and a 12-row schedule.
6. On the Downloads page, each Download button should save the matching PDF. On the application forms, the tabs in the header switch between the four forms.
7. Submit each of the four forms. Expect a reference number, then find both in the portal’s Applications queue.
8. In the portal, edit a page and press **Save**. The public website should update without a refresh.
9. Enable reduced motion in your operating system and confirm that the slider no longer advances by itself and smooth scrolling is off.

For a shorter end-to-end check, follow [the manual walkthrough](docs/portal-walkthrough.md).

## Production handoff

The live website has not been deployed or changed.

- Deploy the Convex backend to a production deployment (`npx convex deploy`), configure Convex Auth there, and run `setup:initialize` once.
- Build both apps with `VITE_CONVEX_URL` pointing at the production deployment.
- Configure your static host to serve `apps/web/dist` and `apps/portal/dist` and rewrite application routes to `index.html` while preserving real asset paths. Without the rewrite, refreshing a route such as `/services/` fails.
- The routes match the old WordPress addresses, so no redirects are needed when the domain moves. Old addresses that no longer exist (`/blog/` pagination, `/author/…`, `/downloads/` file links with `?wpdmdl=`) show the not-found page.
- Before publishing, confirm the organisation’s current product terms, staff, contact details, permission to use the images, and any legal notices.
- This is a client-rendered Vite application. Social previews use the homepage metadata; page-specific metadata is applied in the browser. Page-specific social previews and indexing would need static prerendering or server rendering.
