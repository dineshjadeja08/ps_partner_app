# PurplePartner

Expo/React Native app for Purple Squad service partners (technicians and partner companies), modelled on the HomeTriangle Partner app. It shares its stack, design tokens and API client patterns with the customer app ([ps-mobile](https://github.com/dineshjadeja08/ps-mobile)).

## Implemented journey

Phone OTP (Firebase) → technician-only role check → location permissions → Dashboard → Jobs → Job detail → Start travelling / Start job / Complete job.

Also included: Wallet (credits, transactions, incentives, penalties, recharge), Earnings and settlement detail, Performance report, Reviews, Restrictions, ID card, Today’s schedule, Leaves, My services, Personal details, Service flow guide, and Help.

## What is live and what is sample data

| Area | Backend | Status |
| --- | --- | --- |
| Sign in, refresh, logout, `me` | `/api/v1/auth/*` | Live |
| Assigned jobs list | `GET /api/v1/technician/jobs/` | Live |
| Job actions | `POST /api/v1/technician/jobs/{id}/en-route/ · start/ · complete/` | Live |
| Profile, restrictions, dashboard opportunities, wallet, earnings, settlements, performance, reviews, leaves | Proposed in [docs/PARTNER_API_CONTRACT.md](docs/PARTNER_API_CONTRACT.md) | Sample data |
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
3. Make sure the backend’s `/api/v1/auth/firebase/` endpoint accepts tokens from the partner app. Only users with the `TECHNICIAN` role can sign in; anyone else is signed straight back out.

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
