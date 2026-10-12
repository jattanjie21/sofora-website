# Content and asset sources

Reviewed on 11 October 2026. The public WordPress website was used as a source during implementation only; the React app does not fetch it at runtime.

## Content

- [Homepage](https://soforaccu.com/): identity, product categories, NACCUG affiliation, contact details, and cooperative registration year.
- [About](https://soforaccu.com/about-us/): member ownership, mission, vision, and values.
- [History](https://soforaccu.com/history/): the 2006 study group, 60 original members, the meaning of Sofora, and registration on 8 September 2011.
- [Savings](https://soforaccu.com/saving/): personal, group/corporate/business, and children’s savings; the November 2013 savings-box programme and its supporting organisations.
- [Loan services](https://soforaccu.com/loan-services/): the eight loan categories. Descriptions were rewritten for clarity.
- [FAQ](https://soforaccu.com/faq/): membership contact options and reducing-balance loan context.
- [Contact](https://soforaccu.com/contact-us/): five telephone numbers, the email address, and Bundung Six Junction address.
- [Board](https://soforaccu.com/board-of-directors/) and [staff](https://soforaccu.com/staff/): names and roles reproduced from the public directories.

## Information requiring owner confirmation

- The homepage advertises different annual rates for different products, while the FAQ states a single 15% rate. Product cards deliberately make no rate claims. The calculator uses an explicitly illustrative, editable rate.
- Historic membership, savings, lending totals, and branch counts are not presented as current statistics.
- Board/staff listings and contact details are copied from the existing public pages and need owner confirmation before launch.
- The existing site’s approval-time promises, loan-to-savings multiples, six-month membership requirement, and no-extra-fees claim have not been carried over as current promises.
- Opening hours are not available in the reviewed contact information. The contact page asks visitors to call ahead.
- Online forms, member login, newsletters, and their data flows are not migrated in this public-site phase.

## Assets

| Local asset | Original source |
| --- | --- |
| `apps/web/public/images/sofora-logo.png` | https://soforaccu.com/wp-content/uploads/2021/04/sofora_logo.png |
| `apps/web/public/images/sofora-community.jpg` | https://soforaccu.com/wp-content/uploads/2021/08/83454872_2600330603410312_4158172935514750976_n.jpg |
| `apps/web/public/images/savings-boxes.jpeg` | https://soforaccu.com/wp-content/uploads/2021/10/savings-boxes.jpeg |

The photographs are existing Sofora archive images, not representations of newly documented events. Confirm Sofora’s reuse permissions before public launch.

Manrope and DM Sans Latin variable fonts are self-hosted from Google Fonts. Their SIL Open Font License files are included next to the font files in `apps/web/public/fonts`. The logo is retained; the SOFORA text beside it is styled text for the new website. Decorative icons are inline SVG paths authored in `apps/web/src/components/Icon.tsx`.
