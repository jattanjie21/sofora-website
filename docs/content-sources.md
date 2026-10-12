# Content and asset sources

The public website copies the old WordPress site at https://soforaccu.com/ as it was on 11 October 2026. Text was taken from the WordPress REST API (`/wp-json/wp/v2/pages`, `/posts`) and the rendered pages; images from `https://soforaccu.com/wp-content/uploads/`. The React app never fetches the old site at runtime.

## Pages

Wording is copied word for word, including the original spelling and grammar, so the owner can correct it in the portal.

| Old page | New route | Notes |
| --- | --- | --- |
| Home | `/` | Slider, rates, about, loan cards, calculators, latest news, help banner. |
| About, History, FAQ | `/about-us/`, `/history/`, `/faq/` | FAQ questions came from the accordion titles in the page source. |
| Board of Directors, Staff, Loan Team | `/board-of-directors/`, `/staff/`, `/loan-team/` | Loan Team showed the same people as Staff. |
| Loan Services, Saving | `/loan-services/`, `/saving/` | |
| Downloads | `/downloads/` | The four fillable PDFs are in `apps/web/public/downloads/`. |
| Blog and its two posts | `/blog/`, `/exciting-news-for-sofora-cooperative-credit-union-members/`, `/the-evolution-of-sofora/` | |
| Photo Gallery | `/photo-gallery/` | The old gallery plugin was broken and showed nothing; photos were taken from the media library. |
| YouTube Gallery | `/youtube-gallery/` | Embeds channel `UC7ZTCxd3vVibor0d3qIGGcg` (the old Elfsight widget's channel). |
| Contact us | `/contact-us/` | The form opens the visitor's email app; there is no mail server. |
| Registration, Membership, Kafo and Loan application forms | Same slugs | Replaced by online forms that feed the portal's Applications queue. The old forms also collected ID numbers, photos and signatures; the online forms deliberately don't. |

## Needs owner confirmation before launch

- The home page shows different rates per product (9%, 13%, 10%, 8%) while the FAQ says all loans are 15%.
- Membership, savings and lending figures, board and staff lists, and contact details are as published on the old site and may be out of date.
- Partner links for MRCCCU and Medical & Health CCU were empty on the old site.

## Images (`apps/web/public/images/`)

Large JPEGs were resized to at most 1920px wide and recompressed. The loan card icons are not copied: the originals came from an icon font licensed with the WordPress theme, so they were redrawn in `apps/web/src/components/Icon.tsx`. Poppins (`apps/web/public/fonts/`) is from Google Fonts under the SIL Open Font License.

| Local file | Source under `wp-content/uploads/` |
| --- | --- |
| `logo.png` | `2021/04/sofora_logo.png` |
| `logo-white.png` | `2021/04/sofora_logo_web_white.png` |
| `sofora-logo.png` | `2021/04/sofora_logo.png` (portal favicon and login) |
| `sofora-community.jpg` | `2021/08/83454872_2600330603410312_4158172935514750976_n.jpg` |
| `savings-boxes.jpeg` | `2021/10/savings-boxes.jpeg` |
| `slide-online-members.jpg` | `2023/08/home-slider-online-members.jpg` |
| `slide-personal-loan.jpg` | `2021/08/home-slider-a.jpg` |
| `slide-car-loan.jpg` | `2021/08/home-slider-car-loan.jpg` |
| `slide-careers.jpg` | `2021/08/home-slider-dd.jpg` |
| `slide-education.jpg` | `2021/08/business-slider-bb.jpg` |
| `slide-consumer.jpg` | `2021/08/business-slider-a.jpg` |
| `slide-business.jpg` | `2021/08/business-slider-c.jpg` |
| `business-loan.jpg` | `2021/08/business-loan.jpg` |
| `page-header-about.jpg` | `2021/08/page-header-about.jpg` |
| `rate-building.svg` | `2017/01/mortgage.svg` |
| `rate-personal.svg` | `2017/01/loan.svg` |
| `rate-agriculture.svg` | `2026/04/agric-1.svg` |
| `rate-education.svg` | `2020/05/forex-icon-3.svg` |
| `board-*.jpg` | `2016/12/` (board photos; board-vice-chairperson.jpg is Mrs-Fatou-Kolley-Gaye.jpg, as on the old site) |
| `staff-*.jpg` | `2021/08/` (staff photos; Assan Jarju uses the placeholder board-modou-lamin-badjie.jpg, as on the old site) |
| `partner-*.png` | `2021/08/` (NACCUG, SBFIC, GTUCCU, GPFCCU, MRCCU, Medical and Health CCU logos) |
| `news-online-enquiry.jpg` | `2023/08/365712023_315795500839530_6554462997479411171_n.jpg` |
| `news-evolution.jpg` | `2015/08/evolution-of-sofora.jpg` |
| `evolution-1.jpg` | `2015/08/64436624_2181949051915138_4038279421663117312_n.jpg` |
| `evolution-safiatou-ndey.jpg` | `2015/08/Safiatou-and-Ndey.jpg` |
| `evolution-2.jpg` | `2015/08/45551152_1814687085308005_2739402700566298624_n.jpg` |
| `savings-graph.jpeg` | `2021/10/graph.jpeg` |
| `gallery-3.jpg` | `2021/04/49778651_1914485865328126_2156158983721713664_n.jpg` |
| `gallery-4.jpeg` | `2026/04/WhatsApp-Image-2026-04-28-at-11.16.40.jpeg` |
