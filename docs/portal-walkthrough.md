# Manual walkthrough

A quick end-to-end check of the website and portal in a real browser. There are no automated tests. Start with `npm start`; the website opens at http://127.0.0.1:5173 and the portal at http://127.0.0.1:5174.

## Website

1. Open every menu item, including each dropdown. Pages should match the old soforaccu.com.
2. Home: the slider advances on its own and with the arrows; the loan calculator defaults (GMD 1,000, 1 month, 15%) show a Monthly EMI of GMD1,012.50 and 1.23%.
3. Amortization calculator: GMD 12,000 at 12% for 12 months shows GMD1,066.19 a month and a 12-row schedule.
4. Search (round button in the header): "guarantor" finds FAQ and Loan Services; nonsense shows the "nothing matched" message.
5. Downloads: each button saves the matching PDF.
6. Photo Gallery: clicking a photo opens it full screen; Escape closes it.
7. Submit each of the four forms. You get a reference number.
8. At phone width, the menu button opens collapsible sections, with no sideways scrolling.

## Portal

1. Log in with `admin` / `admin`.
2. Website content → History: change the heading and press Save. The website tab updates without a refresh. Change it back.
3. Board of Directors: change a photo with the picker or upload one (PNG, JPEG or WebP, up to 2 MB). Check the website.
4. Applications: the forms from step 7 above are listed. Assign one, add a note, recommend, then approve as administrator.
5. Staff: add a Content Editor and create an activation link. Open it in a private window, set a password, and confirm that person sees Website content but not Applications.
