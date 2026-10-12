# Staff portal — manual walkthrough

This is a fictional demo for reviewing the frontend before connecting Convex. The following browser interactions have **not** been run by the coding agent. Type checking and production compilation are separate from this manual review.

## Start

Use Node 24 and pnpm 11.22.0 from the workspace root:

```sh
pnpm install --frozen-lockfile
pnpm --filter @sofora/portal dev
```

Open `http://127.0.0.1:5174` in your browser. Use one tab for editing. To compare the unchanged public site, run `pnpm --filter @sofora/web dev` in another terminal and open its printed URL.

The portal opens at **Log in**. Choose a demo account to fill in the form, then select **Log in**. For Administrator access, use `awa@example.test` and password `sofora-demo`. Every active demo account uses that password. After logging in, open your name/avatar at the bottom of the sidebar to switch accounts:

| Person         | Roles                                | Expected access                                                                     |
| -------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Awa Sanyang    | Administrator                        | All screens and actions                                                             |
| Omar Ceesay    | Content Editor                       | Draft, edit and submit content; no publishing or applications                       |
| Mariama Jallow | Content Publisher                    | Read and preview content; publish or return submissions; no editing or applications |
| Lamin Touray   | Application Officer                  | Applications, assignment, notes and recommendations; no final decisions or content  |
| Isatou Bah     | Content Editor + Application Officer | Both sets of permissions                                                            |

These accounts simulate permissions in the UI and mock actions. They are not authentication or a security boundary.

## Login, profile and account menu

1. While logged out, open `/content` or `/profile` directly. Expect the login page; a successful login should return to the requested page, subject to that account’s roles.
2. Try an incorrect password or an unknown email. Expect a helpful error and no workspace access. Choose a sample account and log in with `sofora-demo`.
3. Open your account menu in the sidebar. Expect your name/email, **My profile**, **Switch demo user**, and **Log out**. Check keyboard access, Escape to close and return focus, and clicking outside to dismiss.
4. Open **My profile**. Change your name/email, save, and refresh. Expect the sidebar and profile to show the saved details. Repeat as a non-administrator; their roles should remain read-only. Blank names, malformed emails and another staff member’s email should prevent saving.
5. Make an unsaved profile edit and try navigating, switching accounts or logging out. Expect the discard prompt. **Keep editing** should retain your changes and login; **Discard and continue** should perform the chosen action.
6. Log out, then use browser Back or a workspace URL. Expect login again. Log in with your updated email and the demo password; previously saved content, applications and profile details should remain.
7. Refresh while logged in; the same account should stay selected. Session state is stored separately from workspace data in sessionStorage, and passwords are never persisted. Closing the tab normally ends that session; browser session restoration can restore it.
8. Review the black headings, descriptions, navigation labels, placeholders and timestamps. Blue actions and coloured status indicators remain distinct; text on dark surfaces stays white.

## Content and previews

1. As Omar, open **Website content → Community**. It starts as a draft. Change its introduction or heading, then choose **Draft preview**. Expect the revised copy in the public-site layout. Switch between Desktop and Mobile.
2. Choose **Published preview**. Expect the original published copy, without the draft changes.
3. Return to Content and save the draft. Refresh; expect it to remain saved.
4. Make another unsaved edit, then navigate away, use browser Back, or switch demo users. Expect a discard confirmation. Choose **Keep editing** and verify the edit remains. A full reload should invoke the browser’s native unsaved-changes prompt.
5. Submit for review. Expect the status to become **In review** and fields to be locked. Omar should have no publish button.
6. Switch to Mariama and reopen Community. Compare draft/published previews. Choose **Request changes**, enter feedback and submit. Expect **Changes requested**, with feedback in Page activity.
7. Switch to Omar, revise and resubmit. Switch back to Mariama, choose **Publish changes** and confirm. Expect **Published** and the updated published preview. The separately running public website should still display the original content.
8. Open a published page as Omar and choose **Create draft**. The starting values should match the currently published mock snapshot.
9. In About, edit a board/staff person, add one, or remove one; preview the public directory. These entries are separate from portal user accounts.
10. In Shared content & FAQs, edit a question or add one. Preview Membership, then follow the internal link to Contact; both should use that shared draft’s FAQs.
11. In Savings or Loans, edit a product title/description. In Contact, edit the email, address and phone list. Check the corresponding preview and its shared header/footer phone number.
12. Change an image using the existing asset selector or upload a PNG, JPEG or WebP under 350 KB. Save and refresh. Try an oversized or unsupported file; expect an explanation without replacing the image.
13. Try a malformed email, blank product name, invalid external link or blank staff-directory name. Saving should explain what needs correction. No invalid content should be submitted or published.
14. Open Loan calculator copy, change explanatory text and preview it. Try the actual calculator. Its numerical behavior and illustrative rate remain unchanged.

The draft preview shows the selected document’s draft, including unsaved local form edits, against other documents’ published content. Fixed page layouts and product categories are intentional; there is no page builder. Content changes are plain text. External preview links do not open websites, email or telephone apps.

## Membership and loan applications

1. As Lamin, open Applications. Try the Membership and Loans tabs, status filter, search by name/reference/email and **Assigned to me**.
2. Open **New application**, choose Membership, fill in fictional contact and membership details, assign an officer and record it. Expect a new reference, **New** status and the saved detail screen.
3. Record a Loan application with a product, positive amount, whole-month term and member number. Missing required fields or invalid numbers should prevent submission. Creation does not send a message.
4. Open a new record and select **Start review**. Add an internal note and change its assignee. Expect these actions in its history and overview counts to update.
5. Choose **Flag missing information**, write what is missing and confirm. Expect **Needs information** and a visible internal follow-up note.
6. Edit the applicant details, save, and select **Resume review**. Expect **In review**. The earlier request remains in history.
7. Recommend approval or rejection and provide a reason. Expect **Awaiting decision** and an officer recommendation. Lamin should have no final approve/reject actions.
8. Use **Return to review** if you need to revise the request. It clears the current recommendation and permits editing again; the previous recommendation event stays in history.
9. Switch to Awa and open the recommended application. Record a final approval/rejection with a reason. Expect a final status, administrator decision and history entry. Finalized details, assignment and decisions should be locked; internal notes remain available.
10. Refresh and verify saved changes remain. All applicants and decisions are mock records; there are no emails, uploads to a backend, loan disbursements or account creation.

## Staff and roles

1. As Awa, open Staff & roles and add a fictional staff member with Content Editor and Application Officer roles. Use a unique `example.test` email. Expect them in the table and demo-user selector, with no invitation sent.
2. Switch to that person. Confirm access to content editing and applications, with no publishing, final application decisions or staff management. Directly entering `/staff` must show the access explanation.
3. Return to Awa, edit their roles, and deactivate them. Expect them to disappear from the demo selector and new-assignment menus. Their historical actions remain visible.
4. Attempt to remove Administrator from the only active administrator. Expect a validation error. Add another administrator first if you want to explore changing Awa’s roles.
5. Try a duplicate email or an empty role selection. Expect the save to be blocked. Cancel unsaved staff changes and confirm the discard prompt behaves correctly.

## Reset, layouts and keyboard review

1. As an Administrator, select **Reset demo data**. Cancel first and confirm your edits remain. Reopen and confirm: expect the original sample staff, applications and content, with Awa selected.
2. Review around 360px, 768px and 1440px widths. Tables may scroll horizontally within their panels; the whole page should not overflow. On smaller screens, open the sidebar, follow a link and close with Escape or the backdrop.
3. Use Tab and Shift+Tab to navigate. Confirm visible focus, labelled controls, keyboard-operable details/FAQs, modal focus and return focus on closing. Try the skip link and browser Back/Forward.
4. Enable reduced motion in your system and review the interface again. Transitions should be disabled.
5. If browser storage is blocked/full, expect a visible session-only warning. Do not refresh until you have decided whether to discard those unsaved-to-storage edits. Reset affects only this portal’s demo key.

## Build checks

```sh
pnpm typecheck
pnpm build
pnpm --filter @sofora/portal preview
```

The production preview opens on port 4174 and uses a separate localStorage origin from port 5174. A static host must rewrite app routes, including `/preview/*`, to `index.html` while preserving assets. No deployment is included.

## Where to refine the frontend

- `apps/portal/src/styles.css`: colors, spacing, typography, surfaces and breakpoints.
- `apps/portal/src/PortalShell.tsx`: sidebar, top bar, navigation guards and demo controls.
- `apps/portal/src/components/AccountMenu.tsx`: sidebar account popover, profile link, user switcher and logout.
- `apps/portal/src/pages/`: each portal screen.
- `apps/portal/src/data/seed.ts`: fictional staff and application fixtures.
- `apps/portal/src/data/types.ts`: concrete records and permission definitions.
- `apps/portal/src/data/DemoProvider.tsx`: mock workflow operations and persistence. Replace these with real Convex queries/mutations and backend authorization in the next phase.
- `apps/web/src/data/copy.ts`: original website copy and structured editor field descriptions.
- `apps/web/src/data/WebsiteContent.tsx`: the default public content and the context used by portal previews.

No Convex setup, speculative data service, additional frontend library, test framework, commits or deployment were added.
