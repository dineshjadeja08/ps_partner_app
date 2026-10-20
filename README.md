# PurplePartner

Expo/React Native app for Purple Squad service partners (technicians and partner companies), modelled on the HomeTriangle Partner app. It shares its stack, design tokens and API client patterns with the customer app ([ps-mobile](https://github.com/dineshjadeja08/ps-mobile)).

## Implemented journey

1. **Sign in or join:** phone OTP (Firebase). A new number signs up as a pending partner; numbers registered as customers are refused.
2. **KYC:** name, city, pincode, experience, languages and services, plus Aadhaar (front and back), PAN and a photo, with optional certificates. The partner submits for review and the screen shows *under review* until an admin approves. If rejected, the admin's note is shown and the partner can fix and resubmit.
3. **Location permissions** (first time only), then the dashboard.
4. **Job alerts:** a push notification when an admin assigns a job. Tapping it opens the job.
5. **Job flow:** Accept → Start travelling → I have arrived → enter the customer's 4-digit **service OTP** → Start job → before/after photos and receipt → record cash or UPI collected → Complete job.
6. **Jobs** list with Today, Upcoming, Overdue, Completed and Cancelled tabs. **Earnings** shows completed jobs, what the partner collected, and what was paid online.

Also included: Performance report, Reviews, Leaves, ID card, My services, Personal details, Today's schedule, Service flow guide, Help, and Wallet (sample).

## What is live and what is sample data

| Area | Backend (`ps_core` branch `claude/technician-partner-api`) | Status |
| --- | --- | --- |
| Sign in or sign up, refresh, logout | `/api/v1/auth/firebase/` with `app: "partner"`, `/auth/*` | Live |
| KYC | `PATCH /technician/profile/`, `GET /technician/skills/`, `/technician/documents/`, `POST /technician/kyc/submit/` | Live |
| Job alerts | `POST/DELETE /notifications/devices/` (Expo push) | Live; needs an EAS project id |
| Jobs and job steps | `/technician/jobs/` · `{id}/accept · en-route · arrived · start {otp} · collect-balance · complete` | Live |
| Completion photos | `/technician/jobs/{id}/photos/` | Live |
| Earnings | `GET /technician/earnings/` | Live (job values; no commission or payouts yet) |
| Profile, ID card, services, reviews, leaves, performance | `/technician/profile · reviews · leaves · performance/` | Live |
| Wallet, restrictions, dashboard opportunities | Proposed in [docs/PARTNER_API_CONTRACT.md](docs/PARTNER_API_CONTRACT.md) | Sample data (restrictions sample is empty) |
| Wallet recharge payment | Needs a wallet payment-order endpoint | Disabled in the UI |

While `EXPO_PUBLIC_PARTNER_MOCKS` is not `false`, the endpoints that are not live yet come from `src/lib/mock-data.ts`, and those screens show a “Sample data” label. Once the backend ships them, set it to `false`. Screens need no change because `src/lib/api.ts` already holds the real paths.

## Run locally

Requirements: Node.js 22.13 or newer, npm, and the Django API.

```powershell
Copy-Item .env.example .env.local
npm ci
npx expo start
```

Firebase phone auth uses native code, so sign-in needs a development build rather than Expo Go:

```powershell
npx expo prebuild
npx expo run:android
```

### Before the first build

1. Register the Android app `in.purplesquad.partner` (and the iOS app) in the Purple Squad Firebase project. Enable Phone auth, add the SHA-1/SHA-256 fingerprints, and put the downloaded `google-services.json` in the repo root.
2. Create the EAS project (`npx eas-cli@latest init`), which writes `extra.eas.projectId` into `app.json`.
3. Job alerts use Expo push. For Android, upload the Firebase Cloud Messaging V1 service-account key to EAS (`npx eas-cli@latest credentials` → Android → Push Notifications). On iOS, EAS sets up the APNs key during the build. Push only works on a real phone, in a development or production build.

## Quality checks

```powershell
npx tsc --noEmit
npm run lint
npx expo export --platform web
```

## Architecture

- `src/app`: Expo Router screens. `(tabs)` holds Dashboard, Jobs, Wallet, Earnings and More.
- `src/lib/api.ts`: typed backend client with token refresh. `api.jobs` is live, and `api.partner` switches between sample data and the real endpoints.
- `src/lib/jobs.ts`: job buckets (today, tomorrow, upcoming, overdue, closed) and the next action for each job status.
- `src/components/partner-ui.tsx`: shared partner UI (cards, stat tiles, pills, menu rows, segmented tabs).
- `src/components/ui`: base components shared with the customer app.
- `references/hometriangle-partner`: the reference screenshots. See [docs/SCREEN_MAP.md](docs/SCREEN_MAP.md).
