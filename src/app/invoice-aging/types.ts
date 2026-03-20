export interface Invoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: "INR" | "USD" | "GBP";
  invoiceDate: string;
  dueDate: string;
  status: "unpaid" | "partial" | "paid";
  partialAmount: number;
  notes: string;
  createdAt: string;
}

export type AgingBucket = "current" | "1-30" | "31-60" | "60+";
export type FilterType = "all" | "unpaid" | "partial" | "paid" | "overdue";
export type SortField = "clientName" | "amount" | "dueDate" | "daysOverdue";
export type SortDirection = "asc" | "desc";
