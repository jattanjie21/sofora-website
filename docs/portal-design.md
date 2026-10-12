# Sofora staff portal

Approved in chat on 11 October 2026. This is a frontend mock for refining the portal before connecting Convex.

## Scope

- A separate React, Vite, TypeScript app at `apps/portal`, using the existing workspace dependencies and port 5174.
- Sofora blue, warm neutral backgrounds, local Manrope and DM Sans fonts. Responsive sidebar, overview, content editors, application queues, staff management.
- Administrator, Content Editor, Content Publisher, Application Officer. Multiple roles per staff member. Demo user switching, without real authentication.
- Structured editing of the existing seven public pages, shared copy, photos, products, FAQs, people and contact information. Existing layouts remain fixed.
- Draft → In review → Published. Publishers and administrators can publish or return submissions with feedback. Editing is limited to drafts; returned content can be revised. The prior published content remains available until replacement is approved.
- Portal-only draft/published previews reuse the existing website rendering. The public website keeps its original content and appearance.
- Membership and loan application queues with search, filtering, manual entry, assignment, internal notes, missing-information status, officer recommendations and administrator decisions.
- Add, edit and deactivate mock staff and assign preset roles. Protect the last active administrator.
- Typed mock records in browser localStorage, with a confirmed reset action. No cross-user backend, Convex, real authentication, emails, payments, public application forms or deployment.

## Implementation

Use the existing public page components with a content context whose default is the original website content. The portal supplies draft or mock published content to those same components in an isolated preview document. This creates two real consumers without introducing a speculative shared package or backend adapter.

Keep domain records and mock actions in the portal. Components use explicit actions for editorial transitions, application processing and staff management. Permissions are checked in both the UI and mock actions. These are demo controls, not a security boundary; backend authorization will be required when Convex is connected.

Reuse React, React Router, Vite and TypeScript at the existing versions. No new UI library or test infrastructure.

## Validation

Run `pnpm typecheck` and `pnpm build`. No tests, Docker or browser automation. Provide a manual review guide covering all screens, role restrictions, editorial transitions, application decisions, persistence, preview isolation, keyboard use and responsive layouts. Compilation does not establish browser correctness.
