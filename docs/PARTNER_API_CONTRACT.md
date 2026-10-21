# Partner API contract

The endpoints under **Live** are in `ps_core` (branch `gcp_deployment`). The ones under **Still needed** do not exist in the backend yet. The app serves them from `src/lib/mock-data.ts` until `EXPO_PUBLIC_PARTNER_MOCKS=false`. The TypeScript shapes live in `src/types/api.ts` and are the source of truth for field names.

Every endpoint is authenticated (`Authorization: Bearer <access>`), scoped to the signed-in `TECHNICIAN` user, and returns the standard error body `{ "error": { "code", "message", "details" } }`. Money values are decimal strings in INR.

## Live

| Method | Path | Used by |
| --- | --- | --- |
| POST | `/api/v1/auth/firebase/` `{ id_token, app: "partner" }` | Sign in; unknown numbers sign up as pending partners |
| GET | `/api/v1/auth/me/` | Session restore and role check |
| POST | `/api/v1/auth/refresh/`, `/api/v1/auth/logout/` | Session |
| GET, PATCH | `/api/v1/technician/profile/` | Profile, ID card, services; PATCH edits KYC details while pending or rejected |
| GET | `/api/v1/technician/skills/` | Services picker in KYC |
| GET, POST | `/api/v1/technician/documents/` (multipart `doc_type`, `file`) | KYC documents; Aadhaar, PAN and photo replace the previous upload |
| DELETE | `/api/v1/technician/documents/{id}/` | Remove a KYC document |
| POST | `/api/v1/technician/kyc/submit/` | Submit for review; 400 lists anything still missing |
| POST, DELETE | `/api/v1/devices/register/` `{ token, platform }` | Register or remove the phone's FCM token |
| GET | `/api/v1/technician/jobs/`, `/api/v1/technician/jobs/{id}/` | Jobs, dashboard counts, schedule, job detail |
| POST | `/api/v1/technician/jobs/{id}/accept/` | Accept job |
| POST | `/api/v1/technician/jobs/{id}/en-route/` | Start travelling (also records acceptance) |
| POST | `/api/v1/technician/jobs/{id}/arrived/` | I have arrived → `TECHNICIAN_ARRIVED` |
| POST | `/api/v1/technician/jobs/{id}/start/` `{ otp }` | Start job with the customer's 4-digit OTP; locked after 5 wrong tries |
| GET, POST | `/api/v1/technician/jobs/{id}/photos/` (multipart `kind`, `file`) | Completion proof (BEFORE, AFTER, RECEIPT) while in progress |
| DELETE | `/api/v1/technician/jobs/{id}/photos/{photo_id}/` | Remove a photo |
| POST | `/api/v1/technician/jobs/{id}/collect-balance/` `{ amount, method }` | Record cash or UPI collected |
| POST | `/api/v1/technician/jobs/{id}/complete/` | Complete job (balance must be collected) |
| GET | `/api/v1/technician/earnings/` | Earnings tab |
| GET | `/api/v1/technician/reviews/` | My reviews |
| GET, POST | `/api/v1/technician/leaves/` | My leaves |
| GET | `/api/v1/technician/performance/` | Performance report |

### Requested changes to live endpoints

- **Filtering and pagination on `/technician/jobs/`.** Add `status`, `date_from`, `date_to` and `search` (work order number). A partner with more than 100 jobs currently loses the oldest ones.
- **Arrival location on `arrived` and `start`.** Accept an optional `{ "latitude", "longitude" }` for arrival tracking. The app already asks for location permission.
- **Commission and payouts.** `/technician/earnings/` returns job values; add the partner's share and settlement status once the business rules exist.

## Still needed

| Method | Path | Response type | Screen |
| --- | --- | --- | --- |
| GET | `/api/v1/technician/restrictions/` | `Restriction[]` (active only) | Dashboard banner, My restrictions |
| GET | `/api/v1/technician/dashboard/` | `DashboardSummary` | Dashboard opportunities |
| GET | `/api/v1/technician/wallet/` | `Wallet` | Wallet tabs |
| POST | `/api/v1/technician/wallet/recharge/order/` | Razorpay order (same shape as the customer `PaymentOrder`) | Recharge (not wired yet) |

### Notes for the backend

- The ACTIVE / RESTRICTED / INACTIVE pill is derived in the app: any active `Restriction` means RESTRICTED; otherwise the profile's `is_active` and `employment_status` decide.
- `Wallet.running_credits` is the prepaid balance that lead fees and penalties are deducted from. Recharge must go through Razorpay with server-side verification, as in the customer app. Never trust the client amount.
- Lists should be paginated (`Paginated<T>`) once volumes grow. The app can adopt that without UI changes.
