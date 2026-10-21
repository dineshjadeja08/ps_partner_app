You are a senior mobile product designer. Use the FigCraft MCP tools connected to my Figma file to design **PurplePartner**, the Android app that Purple Squad service partners (technicians) use to receive and complete home-service jobs. It is modelled on the HomeTriangle Partner app, in Purple Squad's brand.

## How to work
- Work in small batches: one page or 2–3 screens per tool call. After each batch, check what you created (read the node tree or take a screenshot), fix any problems, and then continue. Never try to build everything in one call.
- Use Auto Layout on every frame and component. Do not use absolute positioning, except for overlays.
- Name every layer clearly, for example `Job card / New`, `Button / Primary / Default`.
- Use the variables and styles below everywhere. Never hard-code a colour or font size.
- If a FigCraft tool fails, read the error, adjust the request and retry once. Then tell me what failed.

## 1. Foundations (page "🎨 Foundations")
Create these as Figma **variables** (collection "PurplePartner", one mode "Light") and show them as swatches on the page.

Colours:
- primary #6527B8, primaryPressed #4E1D91, primarySoft #F4EEFB
- accent #F58220, accentSoft #FFF1E5
- white #FFFFFF, background #FAFAFC, heading #1D1D22, body #64666D, muted #92959C, border #E8E7EC
- success #15803D, successSoft #F0FDF4; danger #B91C1C, dangerSoft #FEF2F2; warning #A16207, warningSoft #FEFCE8

Spacing (number variables): xs 4, sm 8, md 12, lg 16, xl 24, xxl 32
Radius: small 8, button 14, card 20, sheet 30, pill 999

Text styles, all in the **Manrope** font:
- Display: 26 / ExtraBold
- H1: 24 / ExtraBold
- H2: 18 / Bold
- H3: 15 / Bold
- Body: 14 / Regular, line height 20
- Body small: 13 / Regular, line height 20
- Caption: 12 / Medium
- Label: 13 / SemiBold
- Button: 15 / Bold
- OTP digit: 28 / ExtraBold

Effects:
- Card shadow: y 6, blur 16, black at 8%
- Bottom-sheet shadow: y −4, blur 24, black at 10%

## 2. Components (page "🧩 Components")
Build each one as a component with variants:
- **Button**:
  - variant: Primary (primary fill, white text), Secondary (primarySoft fill, primary text), Outline (border, heading text), Danger (danger fill), Ghost
  - state: Default, Pressed, Disabled, Loading (spinner)
  - Height 52, radius button, full width.
- **Input field**: label above; 52-high box with a border and radius button; placeholder; optional prefix ("+91"); states Default, Focused (primary border), Error (danger border, with an error text below), Disabled.
- **OTP input**: 4 boxes (customer service OTP) and 6 boxes (login OTP), 56×60, radius small. States: empty, filled, active, error.
- **Status pill**, radius pill, Caption text:
  - New / Accepted (primarySoft and primary)
  - On the way, Arrived, Started (warningSoft and warning)
  - Completed (successSoft and success)
  - Cancelled (dangerSoft and danger)
  - Partner status: ACTIVE (success), RESTRICTED (danger), INACTIVE (muted)
- **Job card**: white, radius card, card shadow, padding lg.
  - Top row: service name (H3) and a status pill.
  - Below: work-order number (Caption, muted), date and time-slot row with a calendar icon, address row with a map-pin icon (2 lines max), and a customer name row.
  - Footer: "Balance to collect ₹1,200" on the left and the primary next-step button on the right.
  - Variants: New, Accepted, On the way, Arrived, Started, Completed, Cancelled.
- **Stat tile**: icon in a soft circle, large number (H1), label (Caption). Variants for colour: primary, accent, success, danger.
- **Menu row**: a 40px circle icon, title (Body, bold), optional subtitle, and a chevron. Variants: default, with badge, danger (Logout).
- **Segmented tabs**: Today, Upcoming, Overdue, Completed, Cancelled, each with a count badge. Selected tab: primary underline and primary text.
- **Chip**: selectable, for services and languages; selected and unselected.
- **Step tracker**: vertical with 7 steps — Assigned, Accepted, On the way, Arrived, Started, Payment collected, Completed. Variants: done (success check), current (primary ring), upcoming (muted).
- **Banner**: info, warning, danger and success, each with an icon, title, text and an optional action.
- **Document upload tile**: empty (dashed border, camera icon, "Upload Aadhaar front"), uploaded (thumbnail, "Replace" and "Remove"), uploading (progress).
- **Photo grid tile**: for the Before, After and Receipt photos.
- **Bottom tab bar**: 5 tabs — Dashboard, Jobs, Wallet, Earnings, More — with icons. The active tab is primary; the others are muted.
- **App header**: back arrow and title; also a dashboard variant with avatar, "Hi, Ravi", partner ID "PSP-104233", a status pill and a bell icon.
- **Empty state, Error state and Loading skeleton** for the lists.
- **Offline banner**: dark, "You're offline. Changes will sync when you're back online."
- **Sample-data tag**: a small accent pill reading "Sample data".

Use a consistent outline icon set, Lucide-style with 1.75 stroke. Put the icons in an "Icons" section.

## 3. Screens (page "📱 Screens")
- Frames are **360 × 800** (Android), with a 24 status bar. Show the bottom tab bar only on the tab screens.
- Arrange them left to right in flow order, with a section per flow and section titles.
- Use realistic Indian data: names like Ravi Kumar and Priya S., Chennai and Coimbatore addresses, ₹ amounts, and services like AC service, RO water purifier repair, deep cleaning, electrician and plumbing.

**Flow A, Onboarding**
1. **Splash**: primary background, white PurplePartner logo and wordmark.
2. **Login, "Sign in or join"**:
   - Logo, "PurplePartner" and "For Purple Squad service partners".
   - A card holding: the H1 title, subtitle "Enter your mobile number. New partners can sign up here and complete KYC to start getting jobs.", the mobile field with a +91 prefix, and a "Send OTP" button.
   - A primarySoft notice: "What you'll need to join: Aadhaar card, PAN card and a clear photo of yourself. Our team verifies them, usually within 1–2 working days."
3. **Verify OTP**: "Enter the 6-digit code sent to +91 98xxxxxx21", 6-box OTP, "Resend in 0:30", and a Verify button. Also a variant with the error "This number is registered as a Purple Squad customer account…".
4. **KYC form**, scrollable:
   - Header "Partner verification" and a progress indicator (Details → Documents → Submit).
   - Fields: full name, city, pincode, years of experience, and languages (chips: Tamil, English, Hindi, Telugu, Kannada, Malayalam).
   - "Services you offer" chips, with several selected.
   - Documents: Aadhaar front, Aadhaar back, PAN and your photo (all required); certificates (optional).
   - Sticky "Submit for verification" button and a Logout link.
5. **KYC – missing items error**: a danger banner "Still needed: PAN, Your photo".
6. **KYC – under review**: hourglass illustration, "Your details are under review", "Usually 1–2 working days. We'll notify you once approved.", a summary of the submitted documents, and Logout.
7. **KYC – rejected**: a danger banner with the admin's note ("PAN photo is blurry, please re-upload"), the form editable again, and a "Resubmit" button.
8. **Permissions**: illustration, "Allow location & notifications", why they are needed (job alerts, arrival tracking), and an "Allow" button.

**Flow B, Daily work (tabs)**

9. **Dashboard**:
   - The dashboard header.
   - A RESTRICTED-variant banner (as a separate state frame).
   - Stat tiles in a 2×2 grid: Today's jobs 3, Upcoming 5, Overdue 1, Completed this month 42.
   - "Next job" — a highlighted job card.
   - "Opportunities" with a Sample-data tag.
   - Quick links: Today's schedule, Service guide, Help.
10. **Jobs list**: segmented tabs with counts and a list of job cards in mixed states. Also an empty-state variant: "No jobs today".
11. **Job details** (the most important screen; design 6 frames, one per step):
    - Common parts, top to bottom:
      - Service, status pill and work-order number.
      - Customer card: name; call and directions buttons; full address with a "Open in Maps" link.
      - Slot date and time.
      - Service items with prices.
      - Payment summary: Total ₹1,800, Paid online ₹600, Balance to collect ₹1,200.
      - Step tracker.
      - A sticky bottom action area with a hint line above the primary button.
    - a. **New**: "Accept job" (hint: "Accept to confirm you will do this job at the scheduled time.")
    - b. **Accepted**: "Start travelling"
    - c. **On the way**: "I have arrived"
    - d. **Arrived**:
      - A "Customer service OTP" section with a 4-box OTP input, the hint "Ask the customer for their 4-digit service OTP", and a "Start job" button.
      - Plus an error variant: "Wrong OTP. 3 tries left".
    - e. **Started**:
      - A "Completion proof" section with Before, After and Receipt photo grids (some filled).
      - A "Collect payment" bottom sheet showing the amount ₹1,200, a Cash/UPI segmented choice and a "Record payment" button.
    - f. **Payment collected**: a "Complete job" button, then a **Completed** success state: a check illustration, "Job completed" and "₹1,200 collected in cash".
12. **Confirm dialog**: "Mark as arrived?" with Cancel and Confirm.
13. **Wallet** (Sample data):
    - Balance card: running credits ₹2,450, in a primary gradient, with a "Recharge" button.
    - Tabs: All, Credits, Debits.
    - Transaction rows: lead fee, recharge, penalty.
14. **Recharge**: amount chips (₹500, ₹1,000, ₹2,000, custom), a disabled "Pay" button, and the note "Coming soon".
15. **Earnings**:
    - Period switcher: This week, This month, All time.
    - Total earned card, with Collected by you vs Paid online split into two tiles.
    - A simple bar chart by day.
    - A list of completed jobs with amounts.
16. **More**: a profile header card with photo, name, PSP ID, rating ★4.7 and a verified badge. Menu rows:
    - Personal details, ID card, My services
    - Performance report, My reviews, My leaves, My restrictions
    - Service guide, Help & support
    - Logout (danger)

**Flow C, More screens**

17. **Personal details**: a read-only profile with an Edit option.
18. **ID card**: a vertical card in brand colours with photo, name, partner ID, services, a QR code placeholder, "Verified partner" and the Purple Squad logo.
19. **My services**: a list of skills with chips.
20. **Performance report**: a rating, acceptance rate, on-time arrival %, completion rate and cancellations, as stat tiles with small progress bars.
21. **My reviews**: an average-rating summary with a 5→1 star breakdown and review cards (customer name, stars, comment, date, service).
22. **My leaves**: a list of leaves with status pills and an "Apply leave" button opening a bottom sheet (date range, reason, Submit).
23. **My restrictions**: an empty state, "No active restrictions 🎉", plus a variant with a restriction card (reason, since date, how to resolve).
24. **Today's schedule**: a timeline of today's jobs by time slot.
25. **Service guide**: a modal with numbered steps — Accept → Travel → Arrive → OTP → Work and photos → Collect payment → Complete — each with an icon.
26. **Help & support**: call support, WhatsApp support and FAQ accordion rows.
27. **Push notification mock**: an Android notification "New job assigned · AC service · Today 2–4 PM · Anna Nagar".

## 4. Prototype
Link Flow A in order. On the dashboard, link a job card to Job details (state a), then each primary button to the next state (a → f). Link the bottom tabs between the tab screens and the More menu rows to their screens. Use Smart Animate, 250 ms ease-out.

## 5. Quality bar
- Touch targets are at least 48 px. Text contrast is at least 4.5:1. Body text is never smaller than 12.
- The layout is consistent: 16 px side padding, 12–16 px gaps between cards, and 24 px between sections.
- Long text (addresses, names) truncates cleanly. Rupee amounts use the Indian format (₹1,20,000).
- When you finish, list every page, component and screen you created, and anything you skipped.
