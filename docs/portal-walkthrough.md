# Manual walkthrough

A quick end-to-end check of the website and portal in a real browser. There are no automated tests. Start with `npm start`; the website opens at http://127.0.0.1:5173 and the portal at http://127.0.0.1:5174.

## Website

1. Open every menu item, including each dropdown. Pages should match the old soforaccu.com.
2. Home: the slider advances on its own and with the arrows; the loan calculator defaults (GMD 50,000, 12 months, 15%) show GMD4,512.92 a month.
3. Loan calculator: GMD 12,000 at 12% for 12 months shows GMD1,066.19 a month, and the schedule button lists 12 rows.
4. Search (round button in the header): "guarantor" finds FAQ and the loan product pages; nonsense shows the "nothing matched" message.
5. Downloads: each Download button saves the matching PDF; "Apply online instead" opens the matching online form.
6. Gallery: the Photos and Videos tabs switch views; pagination works; clicking a photo opens it full screen, the arrows (and left/right keys) move between photos, and Escape closes it.
7. Submit each of the four forms. Upload an ID and passport-size photo on step 3; you get a reference number. In the portal, open the application and confirm the uploads appear under **Uploaded documents**.
8. Contact us: send a message; you get a reference number.
9. At phone width, the menu button opens collapsible sections, with no sideways scrolling.
10. On a slow connection (browser dev tools, "Slow 3G"), pages show a grey loading skeleton, not a blank page.

## Portal

1. Log in with `admin` / `admin`.
2. Website content → History: change the heading and press Save. The website tab updates without a refresh. Change it back.
3. Board of Directors: change a photo with the picker or upload one (PNG, JPEG or WebP, up to 2 MB). Check the website.
4. Applications: the forms from step 7 above are listed. Assign one, add a note, recommend, then approve as administrator.
5. Contact: the message from website step 8 is listed as New; opening it marks it Read.
6. Staff: add a Content Editor and create an activation link. Open it in a private window, set a password, and confirm that person sees Website content but not Applications.
