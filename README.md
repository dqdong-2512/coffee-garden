# Coffee Garden

Step 1: Owner UI foundation, built in the existing Next.js 16 / React / TypeScript App Router application with Tailwind CSS 4.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000 for development navigation.

## Routes

- `/owner/dashboard`: daily KPIs, revenue overview, category mix, hourly revenue, breakfast performance, and top products.
- `/owner/revenue`: preview filters, interval tabs, revenue metrics, product performance, category and payment breakdowns.
- `/owner/expenses`: expense summaries, searchable/category-filtered table, validated temporary expense form.
- `/owner/profit`: revenue/COGS/operating expense breakdown, margins, monthly trend, and category gross profit.
- Owner placeholders: orders, payments, products, categories, inventory, stock, tables, staff, branches, sales-analytics, product-analytics, breakfast-analytics, reports, settings.
- `/pos`, `/kitchen`, `/order/T12`: future-module placeholders. Customer routes accept a dynamic table code.

## Architecture

- `src/app`: thin server route files, metadata, layout composition, and shared styling.
- `src/ui/core`: buttons, cards, badges, page headers, metrics, tables, and accessible native dialog.
- `src/ui/owner`: responsive shell/navigation, charts, reusable product table, and module screens.
- `src/data`: centralized typed dashboard, revenue, product, expense, and profit fixtures.
- `src/types`: shared view models.
- `src/lib`: class composition and Vietnamese currency formatting.
- `src/features`: reserved domain boundary documented for later work.

Interactive charts and forms use client components; route files remain server components. The native modal supplies modal focus containment and Escape behavior, restores focus on close, and locks background scrolling. Tables scroll within their cards. Mobile/tablet navigation uses a drawer; desktop has a persistent sidebar.

## Preview behavior

All data is illustrative and anchored to 14 September 2026. Chart intervals switch between separate sample series; date/branch/comparison controls acknowledge the selected dates but do not filter live data. Expense entries update local component state and computed expense summaries; navigation or reload clears additions. No browser storage, API, auth, database, Supabase, or Prisma is configured.

Dashboard estimated profit is revenue minus today's recorded expenses. The Profit page separately illustrates accrual-style COGS and operating expenses. Sample datasets are independent; payment expense entries are not a ledger reconciled against category sales or profit reports. Reporting periods appear beside charts.

## Design reference

Inspected `references/tailwindadmin/tailwindadmin-react-1.0.0`, including its sidebar, FullLayout, Modern dashboard, RevenueUpdate, and ProductPerformance components. Adapted grouped icon navigation, active-route treatment, responsive asymmetric chart grids, compact headers, softly bordered rounded cards, muted table headers, and badges. Implementations are local Coffee Garden components, with no reference runtime imports or template assets. The reference remains unmodified and is excluded from TypeScript, ESLint, and Tailwind scanning. Its original MIT license remains in the reference directory.

Added runtime dependencies: `lucide-react`, `recharts`, `clsx`, `tailwind-merge`. System fonts keep builds independent of remote font downloads.

## Validation

```sh
npm run lint
npm run build
```

Both pass. Browser checks cover the requested 375, 768, 1024, and 1440 widths, navigation drawer, chart tabs, mock filter feedback, expense creation and summary updates, and table filtering. No automated test dependency was added.
