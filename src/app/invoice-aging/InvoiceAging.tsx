"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useInvoices } from "./useInvoices";
import type {
  Invoice,
  AgingBucket,
  FilterType,
  SortField,
  SortDirection,
} from "./types";
import {
  getDaysOverdue,
  getBucket,
  getAgingBuckets,
  calculateHealthScore,
  getOutstandingTotal,
  getOverdueTotal,
  getDueThisWeekTotal,
  formatCurrency,
  formatDate,
  formatDaysOverdue,
  getPrimaryCurrency,
  suggestInvoiceNumber,
  type BucketData,
} from "./utils";
import { toast } from "@/lib/toast";
import {
  Wallet,
  AlertTriangle,
  Clock,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Check,
  Download,
  X,
  ChevronUp,
  ChevronDown,
  Activity,
  FileWarning,
} from "lucide-react";

/* ━━━ Summary Cards ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SummaryCards({
  outstanding,
  overdue,
  dueThisWeek,
  totalCount,
  currency,
}: {
  outstanding: number;
  overdue: number;
  dueThisWeek: number;
  totalCount: number;
  currency: "INR" | "USD" | "GBP";
}) {
  const cards = [
    {
      label: "Total Outstanding",
      value: formatCurrency(outstanding, currency),
      icon: Wallet,
      accent: true,
      warn: false,
      danger: false,
    },
    {
      label: "Overdue",
      value: formatCurrency(overdue, currency),
      icon: AlertTriangle,
      accent: false,
      warn: false,
      danger: overdue > 0,
    },
    {
      label: "Due This Week",
      value: formatCurrency(dueThisWeek, currency),
      icon: Clock,
      accent: false,
      warn: dueThisWeek > 0,
      danger: false,
    },
    {
      label: "Total Invoices",
      value: String(totalCount),
      icon: FileText,
      accent: true,
      warn: false,
      danger: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const iconColorClass = card.danger
          ? "text-red-400"
          : card.warn
            ? "text-amber-400"
            : "text-(--accent)";
        const iconBgClass = card.danger
          ? "bg-red-500/15"
          : card.warn
            ? "bg-amber-500/15"
            : "bg-(--accent-muted)";

        return (
          <div
            key={card.label}
            className="rounded-xl border border-(--border) bg-(--card) p-5 transition-all hover:border-(--accent)/30"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted">{card.label}</span>
              <div className={`rounded-lg p-2 ${iconBgClass}`}>
                <card.icon size={16} className={iconColorClass} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ━━━ Aging Buckets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const BUCKET_CONFIG: {
  key: AgingBucket;
  label: string;
  barColor: string;
  textColor: string;
  emoji: string;
}[] = [
  {
    key: "current",
    label: "Not Yet Due",
    barColor: "bg-green-500",
    textColor: "text-green-400",
    emoji: "🟢",
  },
  {
    key: "1-30",
    label: "1–30 Days Overdue",
    barColor: "bg-amber-500",
    textColor: "text-amber-400",
    emoji: "🟡",
  },
  {
    key: "31-60",
    label: "31–60 Days Overdue",
    barColor: "bg-orange-500",
    textColor: "text-orange-400",
    emoji: "🟠",
  },
  {
    key: "60+",
    label: "60+ Days Overdue",
    barColor: "bg-red-500",
    textColor: "text-red-400",
    emoji: "🔴",
  },
];

function AgingBucketsView({
  buckets,
  currency,
}: {
  buckets: Record<AgingBucket, BucketData>;
  currency: "INR" | "USD" | "GBP";
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Aging Breakdown</h2>
      <div className="space-y-3">
        {BUCKET_CONFIG.map(({ key, label, barColor, textColor, emoji }) => {
          const bucket = buckets[key];
          return (
            <div
              key={key}
              className="rounded-xl border border-(--border) bg-(--card) p-4 transition-all hover:border-(--accent)/20"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{emoji}</span>
                  <span className="font-medium">{label}</span>
                </div>
                <span className={`font-mono text-sm ${textColor}`}>
                  {bucket.count} invoice{bucket.count !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  {formatCurrency(bucket.totalAmount, currency)}
                </span>
                <span className="text-muted">{bucket.percentage}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--border)">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${bucket.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ━━━ Health Score ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function HealthScoreView({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - score / 100);

  let color: string;
  let label: string;
  let advice: string;

  if (score >= 80) {
    color = "#22c55e";
    label = "Healthy 🟢";
    advice = "Great job! Most of your invoices are on track.";
  } else if (score >= 50) {
    color = "#f59e0b";
    label = "At Risk 🟡";
    advice = "Some invoices need follow-up soon.";
  } else {
    color = "#ef4444";
    label = "Critical 🔴";
    advice = "Immediate action needed. Chase overdue clients now.";
  }

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Activity size={18} className="text-(--accent)" />
        Health Score
      </h2>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 120 120" className="h-40 w-40">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-(--border)"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            className="transition-all duration-700"
          />
          <text
            x="60"
            y="66"
            textAnchor="middle"
            fill={color}
            fontSize="28"
            fontWeight="bold"
            fontFamily="var(--font-mono)"
          >
            {score}
          </text>
        </svg>
        <p className="mt-2 text-lg font-semibold">{label}</p>
        <p className="mt-1 text-center text-sm text-muted">{advice}</p>
      </div>
    </div>
  );
}

/* ━━━ Invoice Form Modal ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function InvoiceFormModal({
  invoice,
  existingInvoices,
  onSubmit,
  onClose,
}: {
  invoice: Invoice | null;
  existingInvoices: Invoice[];
  onSubmit: (data: Omit<Invoice, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const isEditing = invoice !== null;

  const [clientName, setClientName] = useState(invoice?.clientName ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice?.invoiceNumber ?? suggestInvoiceNumber(existingInvoices)
  );
  const [amount, setAmount] = useState(invoice?.amount?.toString() ?? "");
  const [currency, setCurrency] = useState<"INR" | "USD" | "GBP">(
    invoice?.currency ?? "INR"
  );
  const [invoiceDate, setInvoiceDate] = useState(
    invoice?.invoiceDate ?? new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? "");
  const [status, setStatus] = useState<"unpaid" | "partial" | "paid">(
    invoice?.status ?? "unpaid"
  );
  const [partialAmount, setPartialAmount] = useState(
    invoice?.partialAmount?.toString() ?? ""
  );
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!clientName.trim()) errs.clientName = "Client name is required";
    if (!amount || Number(amount) <= 0)
      errs.amount = "Amount must be greater than 0";
    if (!invoiceDate) errs.invoiceDate = "Invoice date is required";
    if (!dueDate) errs.dueDate = "Due date is required";
    if (
      invoiceDate &&
      dueDate &&
      new Date(dueDate) <= new Date(invoiceDate)
    ) {
      errs.dueDate = "Due date must be after invoice date";
    }
    if (status === "partial") {
      if (!partialAmount || Number(partialAmount) <= 0) {
        errs.partialAmount = "Partial amount must be greater than 0";
      } else if (Number(partialAmount) >= Number(amount)) {
        errs.partialAmount = "Partial amount must be less than total";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      clientName: clientName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      amount: Number(amount),
      currency,
      invoiceDate,
      dueDate,
      status,
      partialAmount: status === "partial" ? Number(partialAmount) : 0,
      notes: notes.trim(),
    });
  };

  const inputClass =
    "w-full rounded-lg border border-(--border) bg-background px-3 py-2.5 text-sm transition-colors focus:border-(--accent) focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16 backdrop-blur-sm sm:pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-fade-in-up w-full max-w-lg rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Invoice" : "Add Invoice"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-(--card-hover) hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Client Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              className={inputClass}
            />
            {errors.clientName && (
              <p className="mt-1 text-xs text-red-400">{errors.clientName}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder={suggestInvoiceNumber(existingInvoices)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Amount *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className={inputClass}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-400">{errors.amount}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as "INR" | "USD" | "GBP")
                }
                className={`${inputClass} appearance-none select-indent`}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={inputClass}
              />
              {errors.invoiceDate && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.invoiceDate}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-400">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <div className="flex gap-2">
              {(["unpaid", "partial", "paid"] as const).map((s) => {
                const active = status === s;
                let activeClass = "";
                if (active) {
                  if (s === "paid")
                    activeClass =
                      "border-green-500 bg-green-500/15 text-green-400";
                  else if (s === "partial")
                    activeClass =
                      "border-amber-500 bg-amber-500/15 text-amber-400";
                  else
                    activeClass = "border-red-500 bg-red-500/15 text-red-400";
                }
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all ${
                      active
                        ? activeClass
                        : "border-(--border) text-muted hover:border-(--accent)/50"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {status === "partial" && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Partial Amount Paid *
              </label>
              <input
                type="number"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className={inputClass}
              />
              {errors.partialAmount && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.partialAmount}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            className="btn-press w-full rounded-lg bg-(--accent) py-3 text-sm font-semibold text-background transition-all hover:bg-(--accent-hover)"
          >
            {isEditing ? "Save Changes" : "Add Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ━━━ Invoice Table ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SortIcon({
  field,
  activeField,
  dir,
}: {
  field: SortField;
  activeField: SortField;
  dir: SortDirection;
}) {
  if (activeField !== field)
    return <ChevronDown size={14} className="opacity-30" />;
  return dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid" },
  { key: "partial", label: "Partial" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

function InvoiceTableView({
  invoices,
  hasAny,
  filter,
  onFilterChange,
  sortField,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  onMarkPaid,
}: {
  invoices: Invoice[];
  hasAny: boolean;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  sortField: SortField;
  sortDir: SortDirection;
  onSort: (f: SortField) => void;
  onEdit: (inv: Invoice) => void;
  onDelete: (inv: Invoice) => void;
  onMarkPaid: (id: string) => void;
}) {
  if (!hasAny) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--card) p-12 text-center">
        <FileWarning
          size={48}
          className="mx-auto mb-4 text-muted opacity-50"
        />
        <p className="text-lg font-medium">No invoices yet</p>
        <p className="mt-1 text-sm text-muted">
          Add your first invoice above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted">Filter:</span>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              filter === key
                ? "bg-(--accent) text-background"
                : "border border-(--border) text-muted hover:border-(--accent)/50 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-(--border)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--border) bg-(--card)">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort("clientName")}
                  className="flex items-center gap-1 font-medium text-muted hover:text-foreground"
                >
                  Client
                  <SortIcon
                    field="clientName"
                    activeField={sortField}
                    dir={sortDir}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted">
                Invoice #
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => onSort("amount")}
                  className="ml-auto flex items-center gap-1 font-medium text-muted hover:text-foreground"
                >
                  Amount
                  <SortIcon
                    field="amount"
                    activeField={sortField}
                    dir={sortDir}
                  />
                </button>
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted md:table-cell">
                Invoice Date
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort("dueDate")}
                  className="flex items-center gap-1 font-medium text-muted hover:text-foreground"
                >
                  Due Date
                  <SortIcon
                    field="dueDate"
                    activeField={sortField}
                    dir={sortDir}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => onSort("daysOverdue")}
                  className="ml-auto flex items-center gap-1 font-medium text-muted hover:text-foreground"
                >
                  Days
                  <SortIcon
                    field="daysOverdue"
                    activeField={sortField}
                    dir={sortDir}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted"
                >
                  No invoices match this filter.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const days = getDaysOverdue(inv.dueDate);
                const isPaid = inv.status === "paid";
                return (
                  <tr
                    key={inv.id}
                    className={`border-b border-(--border) transition-colors hover:bg-(--card-hover) ${
                      isPaid ? "opacity-50" : ""
                    }`}
                  >
                    <td
                      className={`px-4 py-3 font-medium ${isPaid ? "line-through" : ""}`}
                    >
                      {inv.clientName}
                    </td>
                    <td
                      className={`px-4 py-3 font-mono text-xs text-muted ${isPaid ? "line-through" : ""}`}
                    >
                      {inv.invoiceNumber || "—"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${isPaid ? "line-through" : ""}`}
                    >
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted md:table-cell">
                      {formatDate(inv.invoiceDate)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-xs font-medium ${
                        isPaid
                          ? "text-muted"
                          : days > 0
                            ? "text-red-400"
                            : days === 0
                              ? "text-amber-400"
                              : "text-green-400"
                      }`}
                    >
                      {isPaid ? "—" : formatDaysOverdue(days)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          inv.status === "paid"
                            ? "bg-green-500/15 text-green-400"
                            : inv.status === "partial"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!isPaid && (
                          <button
                            onClick={() => onMarkPaid(inv.id)}
                            title="Mark as paid"
                            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-green-500/15 hover:text-green-400"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(inv)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-(--accent-muted) hover:text-(--accent)"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(inv)}
                          title="Delete"
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-500/15 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ━━━ Delete Confirmation Modal ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ConfirmDeleteModal({
  invoice,
  onConfirm,
  onCancel,
}: {
  invoice: Invoice;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="animate-fade-in-up w-full max-w-sm rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl">
        <h3 className="mb-2 text-lg font-bold">Delete Invoice</h3>
        <p className="mb-6 text-sm text-muted">
          Are you sure you want to delete the invoice for{" "}
          <strong className="text-foreground">{invoice.clientName}</strong>?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-(--border) py-2.5 text-sm font-medium transition-colors hover:bg-(--card-hover)"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-press flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ━━━ Main Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function InvoiceAging() {
  const {
    invoices,
    loaded,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
  } = useInvoices();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<SortField>("daysOverdue");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleAdd = useCallback(
    (data: Omit<Invoice, "id" | "createdAt">) => {
      addInvoice(data);
      setShowForm(false);
      toast.success("Invoice added successfully");
    },
    [addInvoice]
  );

  const handleEdit = useCallback(
    (data: Omit<Invoice, "id" | "createdAt">) => {
      if (!editingInvoice) return;
      updateInvoice(editingInvoice.id, data);
      setEditingInvoice(null);
      setShowForm(false);
      toast.success("Invoice updated successfully");
    },
    [editingInvoice, updateInvoice]
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteInvoice(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Invoice deleted");
  }, [deleteTarget, deleteInvoice]);

  const handleMarkPaid = useCallback(
    (id: string) => {
      markAsPaid(id);
      toast.success("Invoice marked as paid 🎉");
    },
    [markAsPaid]
  );

  const openEdit = useCallback((inv: Invoice) => {
    setEditingInvoice(inv);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingInvoice(null);
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField]
  );

  const handleExport = useCallback(async () => {
    const el = reportRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      el.style.display = "block";
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      el.style.display = "none";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      const pageH = pdf.internal.pageSize.getHeight();

      let y = 0;
      while (y < pdfH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pdfW, pdfH);
        y += pageH;
      }

      const date = new Date().toISOString().split("T")[0];
      pdf.save(`invoice-aging-report-${date}.pdf`);
      toast.success("Report exported as PDF");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = [...invoices];

    if (filter === "unpaid")
      list = list.filter((i) => i.status === "unpaid");
    else if (filter === "partial")
      list = list.filter((i) => i.status === "partial");
    else if (filter === "paid")
      list = list.filter((i) => i.status === "paid");
    else if (filter === "overdue")
      list = list.filter(
        (i) => i.status !== "paid" && getDaysOverdue(i.dueDate) > 0
      );

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "clientName":
          cmp = a.clientName.localeCompare(b.clientName);
          break;
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "dueDate":
          cmp =
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "daysOverdue":
          cmp = getDaysOverdue(a.dueDate) - getDaysOverdue(b.dueDate);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [invoices, filter, sortField, sortDir]);

  if (!loaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--accent) border-t-transparent" />
      </div>
    );
  }

  const primaryCurrency = getPrimaryCurrency(invoices);
  const outstandingTotal = getOutstandingTotal(invoices);
  const overdueTotal = getOverdueTotal(invoices);
  const dueThisWeekTotal = getDueThisWeekTotal(invoices);
  const healthScore = calculateHealthScore(invoices);
  const buckets = getAgingBuckets(invoices);

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setEditingInvoice(null);
            setShowForm(true);
          }}
          className="btn-press flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-medium text-background transition-all hover:bg-(--accent-hover)"
        >
          <Plus size={16} />
          Add Invoice
        </button>
        {invoices.length > 0 && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-press flex items-center gap-2 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium transition-all hover:border-(--accent) hover:bg-(--accent-muted) disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export Report"}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <SummaryCards
        outstanding={outstandingTotal}
        overdue={overdueTotal}
        dueThisWeek={dueThisWeekTotal}
        totalCount={invoices.length}
        currency={primaryCurrency}
      />

      {/* Aging Buckets + Health Score */}
      {invoices.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AgingBucketsView
              buckets={buckets}
              currency={primaryCurrency}
            />
          </div>
          <HealthScoreView score={healthScore} />
        </div>
      )}

      {/* Invoice Table */}
      <InvoiceTableView
        invoices={filteredAndSorted}
        hasAny={invoices.length > 0}
        filter={filter}
        onFilterChange={setFilter}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onMarkPaid={handleMarkPaid}
      />

      {/* Form Modal */}
      {showForm && (
        <InvoiceFormModal
          invoice={editingInvoice}
          existingInvoices={invoices}
          onSubmit={editingInvoice ? handleEdit : handleAdd}
          onClose={closeForm}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDeleteModal
          invoice={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Hidden PDF Report */}
      <div
        ref={reportRef}
        style={{
          display: "none",
          width: 800,
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#111",
          background: "#fff",
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
          Invoice Aging Report
        </h1>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 24 }}>
          Generated on {formatDate(new Date().toISOString())}
        </p>

        {/* Summary Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Total Outstanding", val: formatCurrency(outstandingTotal, primaryCurrency) },
            { label: "Overdue", val: formatCurrency(overdueTotal, primaryCurrency), danger: overdueTotal > 0 },
            { label: "Due This Week", val: formatCurrency(dueThisWeekTotal, primaryCurrency) },
            { label: "Total Invoices", val: String(invoices.length) },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                padding: 12,
                border: "1px solid #e5e5e5",
                borderRadius: 8,
              }}
            >
              <p style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                {c.label}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: c.danger ? "#ef4444" : "#111",
                }}
              >
                {c.val}
              </p>
            </div>
          ))}
        </div>

        {/* Health Score */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>
            Health Score: {healthScore}/100 —{" "}
            {healthScore >= 80
              ? "Healthy"
              : healthScore >= 50
                ? "At Risk"
                : "Critical"}
          </h2>
        </div>

        {/* Aging Buckets Table */}
        <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Aging Breakdown
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 24,
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f9f9f9" }}>
              <th
                style={{
                  padding: 8,
                  textAlign: "left",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                Bucket
              </th>
              <th
                style={{
                  padding: 8,
                  textAlign: "right",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                Invoices
              </th>
              <th
                style={{
                  padding: 8,
                  textAlign: "right",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                Amount
              </th>
              <th
                style={{
                  padding: 8,
                  textAlign: "right",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {BUCKET_CONFIG.map(({ key, label }) => (
              <tr key={key}>
                <td
                  style={{
                    padding: 8,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {label}
                </td>
                <td
                  style={{
                    padding: 8,
                    textAlign: "right",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {buckets[key].count}
                </td>
                <td
                  style={{
                    padding: 8,
                    textAlign: "right",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {formatCurrency(buckets[key].totalAmount, primaryCurrency)}
                </td>
                <td
                  style={{
                    padding: 8,
                    textAlign: "right",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {buckets[key].percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoices Table */}
        <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          All Invoices
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f9f9f9" }}>
              {["Client", "Inv #", "Amount", "Due Date", "Days", "Status"].map(
                (h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: 6,
                      textAlign: i === 2 || i === 4 ? "right" : "left",
                      borderBottom: "1px solid #e5e5e5",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const days = getDaysOverdue(inv.dueDate);
              return (
                <tr key={inv.id}>
                  <td
                    style={{
                      padding: 6,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {inv.clientName}
                  </td>
                  <td
                    style={{
                      padding: 6,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {inv.invoiceNumber || "—"}
                  </td>
                  <td
                    style={{
                      padding: 6,
                      textAlign: "right",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {formatCurrency(inv.amount, inv.currency)}
                  </td>
                  <td
                    style={{
                      padding: 6,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {formatDate(inv.dueDate)}
                  </td>
                  <td
                    style={{
                      padding: 6,
                      textAlign: "right",
                      borderBottom: "1px solid #f0f0f0",
                      color:
                        inv.status === "paid"
                          ? "#999"
                          : days > 0
                            ? "#ef4444"
                            : "#22c55e",
                    }}
                  >
                    {inv.status === "paid" ? "—" : formatDaysOverdue(days)}
                  </td>
                  <td
                    style={{
                      padding: 6,
                      borderBottom: "1px solid #f0f0f0",
                      textTransform: "capitalize",
                    }}
                  >
                    {inv.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
