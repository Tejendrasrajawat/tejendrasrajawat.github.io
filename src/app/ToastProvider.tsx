"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      richColors
      closeButton
      expand={false}
      visibleToasts={3}
      toastOptions={{
        style: {
          background: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        },
        classNames: {
          success: "border-green-500/50",
          error: "border-red-500/50",
        },
      }}
    />
  );
}
