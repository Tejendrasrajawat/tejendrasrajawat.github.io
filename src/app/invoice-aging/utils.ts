import type { Invoice, AgingBucket } from "./types";

export function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export function getBucket(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 0) return "current";
  if (daysOverdue <= 30) return "1-30";
  if (daysOverdue <= 60) return "31-60";
  return "60+";
}

export interface BucketData {
  invoices: Invoice[];
  totalAmount: number;
  count: number;
  percentage: number;
}

export function getAgingBuckets(
  invoices: Invoice[]
): Record<AgingBucket, BucketData> {
  const unpaid = invoices.filter((i) => i.status !== "paid");
  const total = getOutstandingTotal(invoices);

  const buckets: Record<AgingBucket, BucketData> = {
    current: { invoices: [], totalAmount: 0, count: 0, percentage: 0 },
    "1-30": { invoices: [], totalAmount: 0, count: 0, percentage: 0 },
    "31-60": { invoices: [], totalAmount: 0, count: 0, percentage: 0 },
    "60+": { invoices: [], totalAmount: 0, count: 0, percentage: 0 },
  };

  for (const inv of unpaid) {
    const days = getDaysOverdue(inv.dueDate);
    const bucket = getBucket(days);
    const amt =
      inv.status === "partial" ? inv.amount - inv.partialAmount : inv.amount;
    buckets[bucket].invoices.push(inv);
    buckets[bucket].totalAmount += amt;
    buckets[bucket].count++;
  }

  for (const key of Object.keys(buckets) as AgingBucket[]) {
    buckets[key].percentage =
      total > 0
        ? Math.round((buckets[key].totalAmount / total) * 100)
        : 0;
  }

  return buckets;
}

export function calculateHealthScore(invoices: Invoice[]): number {
  const unpaid = invoices.filter((i) => i.status !== "paid");
  let score = 100;

  for (const inv of unpaid) {
    const days = getDaysOverdue(inv.dueDate);
    const bucket = getBucket(days);
    if (bucket === "1-30") score -= 10;
    else if (bucket === "31-60") score -= 20;
    else if (bucket === "60+") score -= 35;
  }

  return Math.max(0, score);
}

export function getOutstandingTotal(invoices: Invoice[]): number {
  return invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => {
      if (i.status === "partial") return sum + (i.amount - i.partialAmount);
      return sum + i.amount;
    }, 0);
}

export function getOverdueTotal(invoices: Invoice[]): number {
  return invoices
    .filter((i) => i.status !== "paid" && getDaysOverdue(i.dueDate) > 0)
    .reduce((sum, i) => {
      if (i.status === "partial") return sum + (i.amount - i.partialAmount);
      return sum + i.amount;
    }, 0);
}

export function getDueThisWeek(invoices: Invoice[]): Invoice[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = new Date(today);
  week.setDate(week.getDate() + 7);

  return invoices.filter((i) => {
    if (i.status === "paid") return false;
    const due = new Date(i.dueDate);
    due.setHours(0, 0, 0, 0);
    return due >= today && due <= week;
  });
}

export function getDueThisWeekTotal(invoices: Invoice[]): number {
  return getDueThisWeek(invoices).reduce((sum, i) => {
    if (i.status === "partial") return sum + (i.amount - i.partialAmount);
    return sum + i.amount;
  }, 0);
}

export function formatCurrency(
  amount: number,
  currency: "INR" | "USD" | "GBP"
): string {
  const locale =
    currency === "INR" ? "en-IN" : currency === "GBP" ? "en-GB" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDaysOverdue(days: number): string {
  if (days === 0) return "Due today";
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} overdue`;
  const abs = Math.abs(days);
  return `Due in ${abs} day${abs === 1 ? "" : "s"}`;
}

export function getPrimaryCurrency(
  invoices: Invoice[]
): "INR" | "USD" | "GBP" {
  const outstanding = invoices.filter((i) => i.status !== "paid");
  if (outstanding.length === 0) {
    if (invoices.length > 0) return invoices[0].currency;
    return "INR";
  }
  const counts: Record<string, number> = { INR: 0, USD: 0, GBP: 0 };
  for (const inv of outstanding) counts[inv.currency]++;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as
    | "INR"
    | "USD"
    | "GBP";
}

export function suggestInvoiceNumber(invoices: Invoice[]): string {
  const count = invoices.length + 1;
  return `INV-${String(count).padStart(3, "0")}`;
}
