# Portal and content architecture

How the public website, the staff portal and Convex fit together. Current as of 12 October 2026.

## Decisions (and why)

- **Save means live.** There is no draft, review or publish step. The owner found the editorial workflow too complicated, so editors change a field, press Save, and the website updates. `revision` numbers prevent two people overwriting each other.
- **The website is a copy of the old WordPress site.** Same menu, wording, photos and URLs, so members recognise it and old links keep working. Only the technology changed.
- **Three roles:** Administrator (everything), Content Editor (edit content), Application Officer (work applications; only administrators make final decisions). There is no separate publisher role.
- **Fixed page layouts.** Staff edit fields within each page; there is no page builder.

## How content flows

1. `apps/web/src/data/copy.ts` lists every editable field (page, section, label, key, default, kind) and `content.ts` holds the lists (loans, FAQs, board, staff, contact). Together they are the default content.
2. Convex stores one `pages` row per page id, holding that page's fields as JSON. `setup:initialize` seeds the rows from the defaults; `setup:resetPages` replaces them.
3. `content.published` merges the stored rows over the defaults. The public site loads it in `LiveWebsite.tsx` and re-renders when it changes. Fields missing from a stored row fall back to the default, so adding a field needs no migration.
4. The portal's Website content screen lists the pages in `documents` (`apps/portal/src/data/content.ts`). Its editor is generated from the `copy.ts` rows, with extra editors for lists and photos in `ContentFields.tsx`.
5. The Preview tab renders the real public components in an iframe at `/preview/...` in the portal, fed by `postMessage`. `pnpm screenshot` reuses this route.

## Applications

The four public forms (`apps/web/src/pages/Apply.tsx`) call `applications.submit`. Applications appear in the portal's queue, where officers assign, add notes, request information and recommend, and administrators approve or reject. Staff can also enter applications by hand.

## Accounts

Staff accounts are invitation-only (an administrator creates a single-use activation link). For development, `admin` / `admin` is available where `DEV_LOGINS=true`.
