# Partner API contract

The endpoints under **Live** are in `ps_core` (branch `claude/technician-partner-api`). The ones under **Still needed** do not exist in the backend yet. The app serves them from `src/lib/mock-data.ts` until `EXPO_PUBLIC_PARTNER_MOCKS=false`. The TypeScript shapes live in `src/types/api.ts` and are the source of truth for field names.

Every endpoint is authenticated (`Authorization: Bearer <access>`), scoped to the signed-in `TECHNICIAN` user, and returns the standard error body `{ "error": { "code", "message", "details" } }`. Money values are decimal strings in INR.

## Live

| Method | Path | Used by |
| --- | --- | --- |
| POST | `/api/v1/auth/firebase/` | OTP verify |
| GET | `/api/v1/auth/me/` | Session restore and role check |
| POST | `/api/v1/auth/refresh/`, `/api/v1/auth/logout/` | Session |
| GET | `/api/v1/technician/jobs/?page_size=100` | Dashboard counts, Jobs, Schedule, Job detail |
| POST | `/api/v1/technician/jobs/{id}/en-route/` | Start travelling |
| POST | `/api/v1/technician/jobs/{id}/start/` | Start job |
| POST | `/api/v1/technician/jobs/{id}/complete/` | Complete job (requires the balance to be collected) |
| GET | `/api/v1/technician/jobs/{id}/` | Job detail |
| POST | `/api/v1/technician/jobs/{id}/collect-balance/` | Record cash/UPI collected (`{ amount, method }`) |
| GET | `/api/v1/technician/profile/` | More, ID card, Personal details, My services |
| GET | `/api/v1/technician/reviews/` | My reviews (paginated) |
| GET, POST | `/api/v1/technician/leaves/` | My leaves; POST `{ start_at, end_at, reason }` creates a pending request |
| GET | `/api/v1/technician/performance/?period=overall\|YYYY-MM` | Performance report (`penalties` is null until penalties exist) |

### Requested changes to live endpoints

- **Filtering and pagination on `/technician/jobs/`.** Add `status`, `date_from`, `date_to` and `search` (work order number). A partner with more than 100 jobs currently loses the oldest ones.
- **Service PIN on `start`.** HomeTriangle makes the partner ask the customer for a 4-digit PIN before starting. Add `{ "service_pin": "1234" }` to the start request and show the PIN in the customer app.
- **Arrival location on `en-route` and `start`.** Accept an optional `{ "latitude", "longitude" }` for arrival tracking. The app already asks for location permission.

## Still needed

| Method | Path | Response type | Screen |
| --- | --- | --- | --- |
| GET | `/api/v1/technician/restrictions/` | `Restriction[]` (active only) | Dashboard banner, My restrictions |
| GET | `/api/v1/technician/dashboard/` | `DashboardSummary` | Dashboard opportunities |
| GET | `/api/v1/technician/wallet/` | `Wallet` | Wallet tabs |
| POST | `/api/v1/technician/wallet/recharge/order/` | Razorpay order (same shape as the customer `PaymentOrder`) | Recharge (not wired yet) |
| GET | `/api/v1/technician/earnings/` | `Earnings` | Earnings |
| GET | `/api/v1/technician/settlements/{id}/` | `Settlement` | Settlement details |

### Notes for the backend

- The ACTIVE / RESTRICTED / INACTIVE pill is derived in the app: any active `Restriction` means RESTRICTED; otherwise the profile's `is_active` and `employment_status` decide.
- `Wallet.running_credits` is the prepaid balance that lead fees and penalties are deducted from. Recharge must go through Razorpay with server-side verification, as in the customer app. Never trust the client amount.
- Lists should be paginated (`Paginated<T>`) once volumes grow. The app can adopt that without UI changes.
- Push notifications for new jobs (FCM) are out of scope for this contract. They need a device-token endpoint and `expo-notifications`.
