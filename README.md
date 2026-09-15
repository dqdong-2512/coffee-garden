# Coffee Garden

Coffee Garden is a Next.js 16 application for table ordering and café operations. The current implementation includes the Owner dashboard foundation plus a real customer ordering flow backed by PostgreSQL.

## What works

- Customer menu at `/order/[tableCode]`, designed mobile-first for a QR code placed on each table.
- Seed menu with 3 foods and 7 drinks: bún bò Huế, bò kho, bánh mì chảo, cà phê đen đá/nóng, cà phê sữa, bạc xỉu, nước cam, sinh tố dâu, and sinh tố bơ.
- Cart quantities, per-item notes, a general note, server-side validation, and a success receipt.
- Orders and item price/name snapshots persisted atomically in PostgreSQL.
- Server-calculated totals, request idempotency, daily order numbers, availability checks, and a simple per-table rate limit.
- Kitchen board at `/kitchen` with four-second refresh, optional new-order sound, persisted status transitions, and cancellation reasons.
- Customer receipts automatically track kitchen progress through served or cancelled.
- Real order list and expandable order details at `/owner/orders`.

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

The first `db:start` downloads the required Docker images and can take several minutes. Prisma is the only migration authority in this repository; Supabase's own migration and seed runners are disabled in `supabase/config.toml`.

Start the web app:

```powershell
npm run dev
```

Open these pages:

- [Customer ordering at table T12](http://localhost:3000/order/T12)
- [Kitchen workflow](http://localhost:3000/kitchen)
- [Persisted orders for Owner](http://localhost:3000/owner/orders)
- [Owner dashboard](http://localhost:3000/owner/dashboard)
- [Local Supabase Studio](http://127.0.0.1:54323)

Valid seeded table codes are `T01` through `T12`. The local PostgreSQL connection is `postgresql://postgres:postgres@127.0.0.1:54322/postgres` and is already present in `.env.example`.

## UI and persistence review

Use this short acceptance flow:

1. Open `/order/T12` at a mobile viewport.
2. Add 1 bún bò Huế and 2 cà phê sữa. The expected total is **115.000 ₫**.
3. Open the cart, add optional notes, and submit the order.
4. Verify the receipt displays an order number such as `CG-YYYYMMDD-0001`.
5. Keep the receipt open and open `/kitchen` in another tab. Move the order through **Mới → Đang làm → Sẵn sàng → Đã phục vụ**.
6. Verify the customer receipt updates automatically after each kitchen change.
7. Open `/owner/orders` and verify the same order, item details, status, and total appear after a refresh.
8. Create another order and cancel it in Kitchen; a reason is required and appears on the customer receipt.
9. Optionally inspect the `Order` and `OrderItem` rows in Supabase Studio.

The API ignores prices sent by a browser and resolves current prices from PostgreSQL. Re-sending the same `clientRequestId` returns the original order instead of creating a duplicate.

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

The database test creates a real 115.000 ₫ order, verifies idempotent replay, stored line items, ordered status transitions, served timestamps, and cancellation reasons, then removes its test orders.

## Project structure

- `src/app`: App Router pages and the `POST /api/orders` route handler.
- `src/features/catalog`: customer catalog query and view types.
- `src/features/orders`: validation, calculations, transaction service, and read queries.
- `src/ui/order`: mobile customer menu, cart, and receipt UI.
- `src/ui/kitchen`: live operational board for preparing and serving orders.
- `src/ui/owner`: responsive Owner workspace and persisted order table.
- `src/lib/db`: shared Prisma client using the PostgreSQL driver adapter.
- `prisma`: schema, migration, and explicit seed.
- `supabase`: local Docker stack configuration.

## Deployment direction

Use Vercel preview deployments while testing and a managed Supabase PostgreSQL project in Southeast Asia (Singapore) to keep the database close to customers in Vietnam. Vercel Hobby is restricted to personal, non-commercial use, so move the live shop to Pro or another commercial host. See the official [Vercel plan guidance](https://vercel.com/docs/plans/hobby) and [Supabase region list](https://supabase.com/docs/guides/platform/regions).

Set `DATABASE_URL` to the pooled runtime URL and `DIRECT_URL` to the direct database URL used by Prisma migrations, following [Prisma's connection guidance](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections). Run `npm run db:deploy` during the release process. Before using the app in a real shop, add authentication and role checks; `/owner` and `/kitchen` are intentionally unprotected during local review.
