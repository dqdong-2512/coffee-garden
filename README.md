# Coffee Garden

Coffee Garden is a Next.js 16 application for one café, with table ordering and day-to-day operations backed by PostgreSQL.

## What works

- Customer menu at `/order/[tableCode]`, designed mobile-first for a QR code placed on each table.
- Seed menu with 3 foods and 7 drinks: bún bò Huế, bò kho, bánh mì chảo, cà phê đen đá/nóng, cà phê sữa, bạc xỉu, nước cam, sinh tố dâu, and sinh tố bơ.
- Cart quantities, per-item notes, a general note, server-side validation, and a success receipt.
- Orders and item price/name snapshots persisted atomically in PostgreSQL.
- Server-calculated totals, request idempotency, daily order numbers, availability checks, and a simple per-table rate limit.
- Kitchen board at `/kitchen` with four-second refresh, optional new-order sound, persisted status transitions, and cancellation reasons.
- Customer receipts automatically track kitchen progress through served or cancelled.
- Real order list and expandable order details at `/owner/orders`.
- Staff login with server-enforced permissions, signed 12-hour `HttpOnly` sessions, and `scrypt` password hashes.
- Owner management for products, categories, availability, prices, tables, and a downloadable QR for each table.
- Shared public homepage for introducing the shop, with one protected staff entry that opens a visual table directory.
- Staff POS at `/pos` for employees with the **Gọi món** permission, using the live menu to create persisted orders that appear in Kitchen.
- Manual cash and bank-transfer collection with server-derived amounts, staff attribution, idempotency, and Owner reconciliation.
- Persisted expense entry with category, supplier, payment method, date, and Owner attribution.
- Live Owner dashboard, revenue, expense, and estimated profit reports calculated from paid invoices, served-order recipe costs, and operating expenses.
- Ingredient catalog, base units, low-stock thresholds, stock receipts, physical-count adjustments, and an auditable movement ledger.
- Per-product recipes with automatic stock consumption and historical food-cost snapshots when Kitchen marks an order served.
- Immutable daily closing with opening cash, counted cash, cash variance, transfers, voided payments, unpaid orders, history, and CSV export.
- A single protected Super Admin plus shop-issued employee accounts with combinable **Gọi món**, **Bếp**, and **Kiểm toán** permissions, account locking, password reset, and immediate invalidation of old sessions.
- Single-shop settings for business name, address, phone, tax code, and receipt footer, reused by the Owner, POS, Kitchen, and table QR interfaces.
- Dedicated 80 mm receipt and Kitchen ticket views with persisted order details, notes, payment state, browser printing, and reprint actions.
- Production preflight and smoke checks, database health monitoring, security headers, private operational routes, and a 3–7 day launch runbook.

## Local setup with Supabase and Docker

Install these prerequisites:

- Node.js 22.12 or newer.
- Docker Desktop with the Docker engine running.

Supabase CLI is already a project dev dependency. You do not need to install PostgreSQL directly.

From the project directory, install packages and create the local environment file:

```powershell
npm install
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env` for the second command.

Start the local Supabase stack, apply the checked-in Prisma migration, and insert the review data:

```powershell
npm run db:start
npm run db:deploy
npm run db:seed
```

The local seed creates these review accounts:

| Quyền truy cập | Username | Password |
| --- | --- | --- |
| Super Admin duy nhất · toàn quyền | `owner` | `coffee-owner-local` |
| Bếp | `kitchen` | `coffee-kitchen-local` |
| Gọi món | `cashier` | `coffee-cashier-local` |

These credentials are for local review only. Change `AUTH_SESSION_SECRET` and all three `SEED_*_PASSWORD` values before connecting a hosted database. Seed passwords create missing accounts and do not overwrite an existing account's password.

The first `db:start` downloads the required Docker images and can take several minutes. Prisma is the only migration authority in this repository; Supabase's own migration and seed runners are disabled in `supabase/config.toml`.

Start the web app:

```powershell
npm run dev
```

Open these pages:

- [Customer ordering at table T12](http://localhost:3000/order/T12)
- [Staff login](http://localhost:3000/login)
- [Staff table selection](http://localhost:3000/staff/tables)
- [Staff POS](http://localhost:3000/pos)
- [Kitchen workflow](http://localhost:3000/kitchen)
- [Persisted orders for Owner](http://localhost:3000/owner/orders)
- [Owner dashboard](http://localhost:3000/owner/dashboard)
- [Revenue report](http://localhost:3000/owner/revenue)
- [Expense management](http://localhost:3000/owner/expenses)
- [Estimated profit](http://localhost:3000/owner/profit)
- [Ingredients and recipes](http://localhost:3000/owner/inventory)
- [Stock movements](http://localhost:3000/owner/stock)
- [Daily closing and CSV report](http://localhost:3000/owner/reports)
- [Staff and role management](http://localhost:3000/owner/staff)
- [Shop settings](http://localhost:3000/owner/settings)
- [Product management](http://localhost:3000/owner/products)
- [Category management](http://localhost:3000/owner/categories)
- [Table and QR management](http://localhost:3000/owner/tables)
- [Local Supabase Studio](http://127.0.0.1:54323)
- [Application and database health](http://localhost:3000/api/health)

Valid seeded table codes are `T01` through `T12`. The local PostgreSQL connection is `postgresql://postgres:postgres@127.0.0.1:54322/postgres` and is already present in `.env.example`.

## UI and persistence review

Use this short acceptance flow:

1. Open `/owner/dashboard`; verify the app redirects to `/login`.
2. Sign in as `owner` and open Products, Categories, and Tables from the sidebar.
3. Change a product to **Tạm hết**, then open `/order/T12` in a private window and verify that the product is hidden. Turn it back on after review.
4. Open Tables → **Xem QR** for T12. Download the SVG or open its menu link.
5. Sign out, sign in as `kitchen`, and verify `/kitchen` opens while `/owner/dashboard` is denied because the account only has the **Bếp** permission.
6. Sign in as `cashier`, open `/staff/tables`, choose a table, then add món in POS and select **Tiền mặt** or **Chuyển khoản** before creating the order.
7. Verify the POS order appears in Kitchen and in the Owner order list with source `POS`.
8. Use **Chờ thanh toán** in POS to collect an unpaid QR order.
9. Sign in as Owner and open `/owner/payments` to review payments or cancel a collection with a required reason.
10. Open `/order/T12` at a mobile viewport, add 1 bún bò Huế and 2 cà phê sữa, and verify the expected total is **115.000 ₫**.
11. Submit the order, then move it in Kitchen through **Mới → Đang làm → Sẵn sàng → Đã phục vụ**.
12. Verify the customer receipt updates after each change and the completed order appears in Owner → Orders.
13. In Owner → Expenses, add a small test expense and reload the page to verify that it persists.
14. Open Dashboard, Revenue, and Profit. Verify that PAID collections and the new expense appear in the selected period.
15. Open Ingredients, review a product recipe, and save a small change if desired.
16. Open Stock, record a stock receipt or physical count, and verify that it remains after reload.
17. Serve an order in Kitchen and verify Stock contains one automatic consumption row per ingredient used by that order.
18. Open Daily Closing, enter opening and counted cash, and verify the system calculates the expected drawer and variance.
19. Confirm the close, reload the page, and export the closing history as CSV.
20. Open Staff, create a temporary employee account, assign both **Gọi món** and **Kiểm toán**, then reset its password.
21. Sign in with the temporary account, then lock it from Owner and verify its existing session can no longer access staff pages.
22. Open Shop Settings and save the business name, address, phone, tax code, and receipt footer.
23. Reload Owner, POS, Kitchen, and the table QR modal; verify the saved shop name is displayed consistently.
24. Create an order in POS and use the success actions to print its customer receipt and Kitchen ticket.
25. Open Payments and reprint an older receipt; verify the payment method, staff name, items, notes, and shop information.
26. Open Kitchen and print a ticket from any active order; verify the 80 mm preview emphasizes the table, quantities, and preparation notes.

The API ignores prices sent by a browser and resolves current prices from PostgreSQL. Re-sending the same `clientRequestId` returns the original order instead of creating a duplicate. Estimated profit uses the recipe cost captured when an order is served, then subtracts non-ingredient operating expenses. Ingredient purchases remain visible in expenses and cash flow without being deducted twice from estimated profit.

## Database commands

```powershell
npm run db:start      # start local Supabase containers
npm run db:stop       # stop them without deleting data
npm run db:deploy     # apply checked-in migrations
npm run db:migrate    # create a new migration during development
npm run db:seed       # insert missing sample catalog/table data
npm run db:reset      # rebuild the Prisma schema and seed data (destructive locally)
npm run db:studio     # open Prisma Studio
npm run db:validate   # validate the Prisma schema
npm run production:check       # validate production runtime variables
npm run production:seed-check  # also validate first-release seed passwords
npm run production:smoke -- https://your-domain.example
```

The seed is explicit and idempotent: it creates missing rows but does not overwrite later menu edits.

## Validation

With no database required:

```powershell
npm test
npm run lint
npm run build
```

With local Supabase already started, migrated, and seeded:

```powershell
npm run test:db
```

The test suite also verifies password hashing, signed-session tamper rejection, safe login redirects, staff/shop/menu/table/expense/inventory/daily-close validation, period normalization, and the payment trust boundary. Database tests cover QR and POS persistence, idempotent order creation, ordered kitchen transitions, automatic recipe consumption and cost snapshots, payment amount derivation, payment reversal, staff attribution, account session invalidation, shop settings, expense persistence, financial aggregation, and immutable daily closing, then remove their test records.

## Project structure

- `src/app`: App Router pages and the `POST /api/orders` route handler.
- `src/features/catalog`: customer catalog query and view types.
- `src/features/orders`: validation, calculations, transaction service, and read queries.
- `src/features/auth`: login validation; `src/lib/auth` contains password, session, and authorization code.
- `src/features/management`: Owner menu/table queries, validation, and database services.
- `src/features/pos`: POS catalog and payment-order views.
- `src/features/payments`: payment validation and transactional collection/reversal services.
- `src/features/finance`: expense validation/persistence, reporting periods, and live financial aggregation.
- `src/features/inventory`: ingredient, recipe, stock movement, and inventory valuation logic.
- `src/features/closing`: daily reconciliation calculations, persisted close snapshots, and CSV reporting.
- `src/features/settings`: staff account safety rules, session invalidation, and single-shop configuration.
- `src/features/printing`: authorized receipt and Kitchen-ticket projections from persisted order data.
- `src/ui/order`: mobile customer menu, cart, and receipt UI.
- `src/ui/kitchen`: live operational board for preparing and serving orders.
- `src/ui/print`: browser-printable 80 mm customer receipts and Kitchen tickets.
- `src/ui/owner`: responsive Owner workspace and persisted order table.
- `src/lib/db`: shared Prisma client using the PostgreSQL driver adapter.
- `src/lib/config`: production environment validation used before release.
- `prisma`: schema, migration, and explicit seed.
- `supabase`: local Docker stack configuration.
- `docs/DEPLOYMENT.md`: production environment, backup, pilot, health-check, and rollback runbook.

## Deployment direction

Follow the complete [deployment and pilot runbook](docs/DEPLOYMENT.md) before connecting a real domain or accepting live orders.

Use Vercel preview deployments while testing and a managed Supabase PostgreSQL project in Southeast Asia (Singapore) to keep the database close to customers in Vietnam. Vercel Hobby is restricted to personal, non-commercial use, so move the live shop to Pro or another commercial host. See the official [Vercel plan guidance](https://vercel.com/docs/plans/hobby) and [Supabase region list](https://supabase.com/docs/guides/platform/regions).

Set `DATABASE_URL` to the pooled runtime URL and `DIRECT_URL` to the direct database URL used by Prisma migrations, following [Prisma's connection guidance](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections). Set `PUBLIC_APP_URL` to the public HTTPS origin so downloaded table QR codes point to the production site. Use unique initial production passwords for Super Admin, Kitchen and Order staff plus a random `AUTH_SESSION_SECRET` of at least 32 characters, then run `npm run db:deploy` and `npm run db:seed` during the first release. After the first Super Admin login, change all seed passwords, create one account per employee, assign the required permissions, and enter the real shop information in Settings. Bank transfers are confirmed manually by staff; no banking API or automatic VietQR reconciliation is enabled.
