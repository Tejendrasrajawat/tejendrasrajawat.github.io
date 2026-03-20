"use client";

import { useState, useEffect, useCallback } from "react";
import type { Invoice } from "./types";

const STORAGE_KEY = "invoiceager_invoices";

function loadInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInvoices(loadInvoices());
    setLoaded(true);
  }, []);

  const addInvoice = useCallback(
    (invoice: Omit<Invoice, "id" | "createdAt">) => {
      const newInvoice: Invoice = {
        ...invoice,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setInvoices((prev) => {
        const updated = [...prev, newInvoice];
        saveInvoices(updated);
        return updated;
      });
    },
    []
  );

  const updateInvoice = useCallback(
    (id: string, data: Partial<Invoice>) => {
      setInvoices((prev) => {
        const updated = prev.map((inv) =>
          inv.id === id ? { ...inv, ...data } : inv
        );
        saveInvoices(updated);
        return updated;
      });
    },
    []
  );

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => {
      const updated = prev.filter((inv) => inv.id !== id);
      saveInvoices(updated);
      return updated;
    });
  }, []);

  const markAsPaid = useCallback((id: string) => {
    setInvoices((prev) => {
      const updated = prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: "paid" as const, partialAmount: 0 }
          : inv
      );
      saveInvoices(updated);
      return updated;
    });
  }, []);

  return {
    invoices,
    loaded,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
  };
}
