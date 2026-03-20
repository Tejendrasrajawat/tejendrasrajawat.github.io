"use client";

import dynamic from "next/dynamic";

const InvoiceAging = dynamic(() => import("./InvoiceAging"), { ssr: false });

export default function InvoiceAgingWrapper() {
  return <InvoiceAging />;
}
