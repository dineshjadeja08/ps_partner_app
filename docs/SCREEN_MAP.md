# HomeTriangle Partner → PurplePartner screen map

The reference screenshots are in `references/hometriangle-partner/`.

| HomeTriangle screen | PurplePartner route | Data | Notes |
| --- | --- | --- | --- |
| Permissions (location, all the time, notifications, GPS) | `/permissions` | Device | Location, background location and GPS. Notifications are deferred until push exists. |
| Dashboard (restriction banner, service guide, orders and opportunities grids, performance card) | `/(tabs)` | Jobs live, rest sample | Order counts come from real jobs. The Invest (PyllarMoney) promo is left out. |
| Service guide sheet | `/service-guide` | Static | Steps follow Purple Squad's job states: travelling → start → complete. |
| Profile restriction details | `/restrictions` | Sample | |
| My all orders / Today (filter chips, search by work order) | `/(tabs)/jobs`, `/schedule` | Live | |
| (Order detail) | `/job/[id]` | Live | Call, directions, payment to collect, next action. |
| Wallet: running credits, Transactions / Incentives / Penalties, Recharge | `/(tabs)/wallet`, `/recharge` | Sample | Recharge payment is disabled until a backend order endpoint exists. |
| Earnings list | `/(tabs)/earnings` | Sample | |
| Settlement details | `/settlement/[id]` | Sample | |
| Performance report (completion ring, tiles, 3-month trend) | `/performance` | Sample | |
| Reviews | `/reviews` | Sample | |
| ID card | `/id-card` | Sample | |
| Profile / More menu | `/(tabs)/more` | Mixed | My employees, calendar, packages, service line items and location hubs are left out until there is a business need. |
| My leaves | `/leaves` | Sample | |
| My services | `/services` | Sample | |
| Help | `/help` | Static | Same phone, WhatsApp and email as the customer app. |

## Bottom tabs

HomeTriangle has Dashboard · Wallet · Invest · Earnings · More. PurplePartner has **Dashboard · Jobs · Wallet · Earnings · More**: Jobs replaces Invest, so a partner's daily work is one tap away.
