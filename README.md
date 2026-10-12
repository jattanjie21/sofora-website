# Sofora website

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
scripts/               # npm start / npm stop
docs/
```

The public site is `@sofora/web` and the portal is `@sofora/portal`. The portal declares a workspace dependency on the web app because it imports its page components and content to render previews. Code is shared through relative imports rather than a separate package. In particular, `convex/` imports `apps/portal/src/data/types.ts` so that the server and the portal use the same `can()` permission check.

## Public website

| Route              | Content                                                             |
| ------------------ | ------------------------------------------------------------------- |
| `/`                | Homepage and introductions to savings, loans and community          |
| `/about`           | History, purpose, values, board, staff and partners                 |
| `/savings`         | Personal, group/business and children’s savings                     |
| `/loans`           | Eight loan categories and an illustrative repayment calculator      |
| `/membership`      | Membership benefits, next steps and FAQs                            |
| `/community`       | Community photography, savings-box story and historical milestones  |
| `/contact`         | Telephone numbers, email links, address and map link                |
| `/apply/:kind`     | Membership (`/apply/membership`) or loan (`/apply/loan`) application |

Unknown routes display an in-app not-found page. Route changes update the page title and description, move focus to the main content, and support section links.

The site loads its content from Convex (`content.published`) through `LiveWebsite.tsx`, so changes saved in the portal appear on the website immediately. Images uploaded in the portal are stored in Convex file storage and referenced as `storage:` IDs, which are swapped for URLs when the page loads.

“Join Sofora” on Membership and “Apply for this loan” on Loans open the application form. Submissions go to `applications.submit`, which requires consent, includes a hidden spam-trap field, and is rate-limited to 200 submissions per hour overall and 5 per hour per email address. The applicant gets a reference number. Document uploads, payments and member account access are not included.

Default content lives in `apps/web/src/data/content.ts` and page copy, with field descriptions, in `apps/web/src/data/copy.ts`. These seed the Convex `pages` table when the workspace is initialised. After that, content is edited in the portal. Page layouts are in `apps/web/src/pages`, and design tokens are at the beginning of `apps/web/src/styles.css`.

The design retains Sofora’s logo and blue identity, adds warm neutral backgrounds and locally hosted typography, and uses photographs from the existing website. Public information was reviewed on 11 October 2026. See [content sources](docs/content-sources.md) for provenance and for information that needs the owner’s confirmation before launch.

## Staff portal

The portal covers sign-in, an overview, structured editors for all seven pages plus shared content and calculator copy, membership and loan application queues, applicant details and notes, officer recommendations, administrator decisions, staff and role management, and each person’s profile.

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

See the [portal design](docs/portal-design.md).

## Calculator

The calculator uses equal monthly payments on a reducing balance:

```text
r = annual percentage rate / 1200
payment = principal × r / (1 − (1 + r)^(−months))
```

At 0% interest, the payment is the principal divided by the number of months. It uses unrounded intermediate values and shows results to two decimal places. A numerically stable `log1p`/`expm1` expression avoids cancellation at very small positive rates.

Amount, whole-month term and annual rate are validated; empty or invalid inputs hide the results and show an explanation. The default 15% is an editable illustration, not a verified current Sofora offer. Fees and product-specific lending rules are excluded. The input limits are for exploring numbers, not claims about which products are available.

## Manual review

There is no automated test framework. Type checking and production builds don’t prove that the layout or interactions work in a browser. To review manually:

1. Run `npm start`. Open all seven public routes, use back/forward navigation, follow section links, and open an unknown route.
2. Check widths of about 360px, 768px and 1440px. Content should stay readable with no horizontal overflow.
3. On mobile, open the navigation, follow a link and reopen it. Press Escape to close it; focus should return to the menu button.
4. Use only the keyboard: follow the skip link, move through links and inputs, and expand FAQs and team sections. Focus should stay visible.
5. On `/loans#calculator`, enter GMD 12,000, 12 months and 0%: expect a monthly payment of GMD 1,000.00, total interest of GMD 0.00 and total repayment of GMD 12,000.00. At 12% with the same inputs, expect about GMD 1,066.19 a month and a total repayment of GMD 12,794.23.
6. Clear each calculator input, then try a negative amount, 0 months, a fractional month and a rate over 50%. Expect an explanation and no quote.
7. Submit a membership application and a loan application. Expect a reference number, then find both in the portal’s Applications queue.
8. In the portal, edit a page and press **Save**. The public website should update without a refresh.
9. Enable reduced motion in your operating system and confirm that entrance animations and smooth scrolling are off.

`docs/portal-walkthrough.md` was written for the earlier browser-only mock (demo accounts, localStorage). Its steps for checking content and permissions still apply, but its login and storage instructions don’t.

## Production handoff

The live website has not been deployed or changed.

- Deploy the Convex backend to a production deployment (`npx convex deploy`), configure Convex Auth there, and run `setup:initialize` once.
- Build both apps with `VITE_CONVEX_URL` pointing at the production deployment.
- Configure your static host to serve `apps/web/dist` and `apps/portal/dist` and rewrite application routes to `index.html` while preserving real asset paths. Without the rewrite, refreshing a route such as `/loans` fails.
- `convex/integrationChecks.ts` holds temporary internal fixtures for development checks and only runs against the development deployment. Remove it before deploying to production.
- When the domain moves, set up redirects from the old WordPress URLs: `/about-us/` → `/about`, `/saving/` → `/savings`, `/loan-services/` → `/loans`, `/history/` → `/about`, `/board-of-directors/` and `/staff/` → `/about#our-people`, `/photo-gallery/` → `/community`, `/faq/` → `/membership#faq` and `/contact-us/` → `/contact`. Old application-form URLs could redirect to `/apply/membership` and `/apply/loan`.
- Before publishing, confirm the organisation’s current product terms, staff, contact details, permission to use the images, and any legal notices.
- This is a client-rendered Vite application. Social previews use the homepage metadata; page-specific metadata is applied in the browser. Page-specific social previews and indexing would need static prerendering or server rendering.
