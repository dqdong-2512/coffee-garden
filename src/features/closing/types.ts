export type DailySummary = {
  businessDate: string; cashSales: number; bankTransferTotal: number; paidTotal: number;
  cashExpenses: number; voidedTotal: number; unpaidTotal: number;
  paymentCount: number; voidedPaymentCount: number; unpaidOrderCount: number;
};

export type DailyClosureRow = DailySummary & {
  id: string; openingCash: number; expectedCash: number; countedCash: number; cashDifference: number;
  note: string | null; createdBy: string; closedAt: string;
};

export type DailyCloseData = { summary: DailySummary; existing: DailyClosureRow | null; history: DailyClosureRow[] };
