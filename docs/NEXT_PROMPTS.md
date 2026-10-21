# Prompts for the remaining MVP work

Paste each prompt into your AI code editor (Claude Code, Cursor, etc.) **inside the repo named in its heading**. All of them rely on backend changes that are on the `ps_core` branch `gcp_deployment`, so deploy that first.

Already done, and not covered here: the partner app (PurplePartner) and its backend — sign-up and KYC, job alerts, Accept → On the way → Arrived → OTP start → photos → collect payment → Complete, and earnings.

Decision used in these prompts: **the technician marks the job completed**. The customer's OTP proves the technician was on site, so the customer app does not get a "mark completed" button.

---

## Prompt 1: Customer app (`ps-mobile`)

```text
You are working in the Purple Squad customer app (Expo SDK 57, Expo Router, React Query). Read AGENTS.md first and follow it.

The backend (ps_core, branch gcp_deployment) now has:
- GET /api/v1/bookings/{id}/start-otp/ → { otp: "4821", verified: boolean, verified_at: string | null }. Only the booking's customer can read it.
- Every booking response (list and detail) now also has:
  accepted_at: string | null, arrived_at: string | null, start_otp_verified: boolean,
  technician: { name, phone, photo_url, average_rating, completed_job_count, is_verified } | null
- Job flow: TECHNICIAN_ASSIGNED (accepted_at set when the technician accepts) → TECHNICIAN_EN_ROUTE (arrived_at set on arrival) → IN_PROGRESS (only after the technician enters the customer's OTP) → COMPLETED.

Build:
1. Types and API: add the new Booking fields to src/types/api.ts and api.bookings.startOtp(id) to src/lib/api.ts.
2. Service OTP card in src/app/booking/[id].tsx: while booking_status is CONFIRMED, TECHNICIAN_ASSIGNED or TECHNICIAN_EN_ROUTE and start_otp_verified is false, show "Your service OTP" with the 4 digits large and spaced, plus the line "Share this code with the technician only when they arrive. Never share it on a call." Hide it once verified, and show "OTP verified, service started" instead. Load it with useQuery and refetch every 30 seconds while the booking is active.
3. Also show the OTP on src/app/booking-success/[bookingId].tsx after payment succeeds, with "You can also find this in your booking".
4. Technician card: when booking.technician is set, replace the generic "A verified technician has been assigned… Call support" block with a card showing photo (or initial), name, ★ rating and completed jobs, a "Verified" badge if is_verified, and a "Call technician" button (tel: link). Keep "Call support" as a secondary button.
5. Progress: update the Stepper in booking/[id].tsx to Booked → Technician assigned → Accepted → On the way → Arrived → Service started → Completed, using accepted_at and arrived_at for the in-between steps.
6. Booking history (src/app/(tabs)/bookings.tsx): show the same status names, including "Technician on the way" and "Technician arrived".
7. Translations: add every new string to src/i18n, as the existing screens do.

Do not add a customer "mark as completed" button: the technician completes the job.
Run npx tsc --noEmit and npx expo lint, then test on a phone against the backend branch: book → admin assigns → the technician accepts and arrives in the PurplePartner app → the customer reads the OTP to the technician → the job starts.
```

---

## Prompt 2: Website and admin panel (`ps_coreF1`)

```text
You are working in ps_coreF1 (Next.js): the Purple Squad customer website, admin panel and the old /technician web portal. Read AGENTS.md / CLAUDE.md first. API paths live in src/lib/api/endpoints.ts and types in src/types/api.ts.

The backend (ps_core, branch gcp_deployment) added:
- Technician KYC
  - GET /api/v1/admin/technicians/?verification=UNDER_REVIEW (also PENDING, VERIFIED, REJECTED, SUSPENDED)
  - GET /api/v1/admin/technicians/{id}/kyc/ → { profile, documents: [{ id, doc_type, url, created_at }] }.
    doc_type is AADHAAR_FRONT, AADHAAR_BACK, PAN, PHOTO or CERTIFICATE; url is an image or PDF.
  - POST /api/v1/admin/technicians/{id}/kyc/ { decision: "APPROVE" | "REJECT", note }. A note is required to reject.
  - The technician profile now has kyc_submitted_at and verification_note.
- Bookings now include accepted_at, arrived_at, start_otp_verified, and technician { name, phone, photo_url, average_rating, completed_job_count, is_verified }.
- GET /api/v1/admin/bookings/{id}/photos/ → [{ id, kind: BEFORE|AFTER|RECEIPT, url, created_at }]
- GET /api/v1/bookings/{id}/start-otp/ → { otp, verified, verified_at } for the signed-in customer.
- Technician job flow now requires: accept → en-route → arrived → start { otp } → collect-balance → complete.

Build:
1. Admin, KYC review: a "Partner KYC" page under /admin/technicians (add it to the sidebar in src/components/admin/admin-sidebar.tsx) listing UNDER_REVIEW partners with name, phone, city, services and submitted time. A detail view shows the profile and every document (images inline, click to enlarge; PDFs as links), with Approve, and Reject with a required note. After a decision, refresh the list. Show a count badge for pending reviews in the sidebar.
2. Admin, technicians list (admin-technicians-screen.tsx): add a verification-status filter, and show rejected partners' verification_note.
3. Admin, booking detail and operations (admin-booking-operations.tsx, admin-work-order-detail.tsx): show a timeline of Assigned, Accepted (accepted_at), On the way, Arrived (arrived_at), OTP verified (start_otp_verified), Started and Completed. Add a "Completion proof" section with the before/after/receipt photos from /admin/bookings/{id}/photos/.
4. Admin, live monitoring: on the bookings list and dashboard, refetch every 30 seconds (React Query refetchInterval) and add an "Active now" filter (TECHNICIAN_ASSIGNED, TECHNICIAN_EN_ROUTE, IN_PROGRESS) with the step label from point 3.
5. Admin dashboard: make sure it shows total bookings, completed jobs, active technicians (VERIFIED and available) and revenue. Add whatever is missing from the existing /admin/dashboard/summary data, or compute it from the lists.
6. Customer website booking detail (src/features/bookings/components/booking-detail-screen.tsx): show the service OTP card and the technician card exactly as described for the mobile app (OTP visible until start_otp_verified; technician photo, name, rating, call button).
7. Old technician web portal (src/app/technician/jobs, technician-jobs-screen.tsx): it calls en-route/start directly, which the backend now rejects (accept, arrived and OTP are required). Replace the page with a short message telling technicians to use the PurplePartner app, with the store link placeholder. Don't re-implement the flow on the web.

Run the project's lint, typecheck and tests (npm run lint, npx tsc --noEmit, npm test) before finishing.
```

---

## Prompt 3: Backend extras (`ps_core`), optional for MVP

```text
You are working in ps_core (Django + DRF) on branch gcp_deployment. Follow the existing patterns: services in apps/*/services.py, audit_event for admin actions, drf-spectacular schemas, and pytest tests in tests/.

Build:
1. Complaints: a Complaint model (booking, raised_by customer, category [SERVICE_QUALITY, DAMAGE, OVERCHARGE, NO_SHOW, BEHAVIOUR, OTHER], description, optional photos, status OPEN/IN_PROGRESS/RESOLVED/REJECTED, resolution note, assigned_to admin, timestamps).
   - Customer: POST /api/v1/bookings/{id}/complaints/ (only for their own booking, within 7 days of completion) and GET to list theirs.
   - Admin: list, filter, assign, update status and resolve. Optionally link a refund through the existing payments create_refund.
   - Add admin audit events, and add OPEN complaints to the admin dashboard summary.
2. Arrival location: accept optional { latitude, longitude } on technician arrived/ and start/, store them on the booking (arrival_lat/lng), and expose them in admin booking detail.
3. Customer push notifications (optional): the PushDevice table and Expo provider already exist. Send PUSH alongside WhatsApp for TECHNICIAN_ASSIGNED, TECHNICIAN_EN_ROUTE, TECHNICIAN_ARRIVED and SERVICE_COMPLETED when the customer has an app="customer" device.
4. Technician job list: add status, date_from, date_to and search filters to /api/v1/technician/jobs/.

Run pytest, python manage.py makemigrations --check, and python manage.py spectacular --validate before finishing.
```

---

## Still blocked on business decisions (not prompts yet)

Wallet credits and recharge, lead fees, penalties, restrictions, commission and payouts. Decide the rules (fee per lead, penalty amounts, when a partner gets restricted, commission %, payout schedule) and then these can be built the same way.
