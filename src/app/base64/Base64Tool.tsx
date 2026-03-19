"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

type Mode = "encode" | "decode";
type Variant = "standard" | "url-safe" | "hex";

function base64Encode(str: string, variant: Variant): string {
  try {
    const bytes = new TextEncoder().encode(str);
    if (variant === "hex") {
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let encoded = btoa(binary);
    if (variant === "url-safe") {
      encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    return encoded;
  } catch {
    return "";
  }
}

function base64Decode(str: string, variant: Variant): string {
  try {
    let decoded = str.trim();
    if (variant === "url-safe") {
      decoded = decoded.replace(/-/g, "+").replace(/_/g, "/");
      const pad = decoded.length % 4;
      if (pad) decoded += "=".repeat(4 - pad);
    }
    if (variant === "hex") {
      const bytes = decoded.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) ?? [];
      return new TextDecoder().decode(new Uint8Array(bytes));
    }
    return decodeURIComponent(
      atob(decoded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

const EXAMPLE_TEXT = "Hello, World!";

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [variant, setVariant] = useState<Variant>("standard");
  const [input, setInput] = useState(EXAMPLE_TEXT);

  const output =
    mode === "encode"
      ? base64Encode(input, variant)
      : base64Decode(input, variant);

  const copy = useCallback(() => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    }
  }, [output]);

  const swap = useCallback(() => {
    setInput(output || input);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  }, [output, input]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-(--border) p-1">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${
                mode === m ? "bg-(--accent-muted) text-(--accent)" : "text-muted hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">Format</label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as Variant)}
            className="rounded border border-(--border) bg-(--card) px-3 py-2 text-sm"
          >
            <option value="standard">Standard Base64</option>
            <option value="url-safe">URL-safe Base64</option>
            <option value="hex">Hex</option>
          </select>
        </div>
        <button
          onClick={() => setInput(EXAMPLE_TEXT)}
          className="text-sm text-muted hover:text-(--accent)"
        >
          Example
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted">
            {mode === "encode" ? "Input (text)" : "Input (encoded)"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 or hex to decode..."}
            className="min-h-[200px] w-full resize-y rounded-xl border border-(--border) bg-(--card) p-4 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            spellCheck={false}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              {mode === "encode" ? "Output (encoded)" : "Output (decoded)"}
            </label>
            <div className="flex gap-2">
              <button
                onClick={swap}
                className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
              >
                Swap
              </button>
              <button
                onClick={copy}
                disabled={!output}
                className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent) disabled:opacity-50"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="min-h-[200px] rounded-xl border border-(--border) bg-(--card) p-4">
            {output ? (
              <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-foreground">
                {output}
              </pre>
            ) : (
              <p className="font-mono text-sm text-muted">
                {input.trim()
                  ? mode === "decode"
                    ? "Invalid or empty result"
                    : "—"
                  : "Result will appear here"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-(--border) bg-(--card) p-4">
        <h3 className="mb-2 font-semibold">Formats</h3>
        <ul className="space-y-1 text-sm text-muted">
          <li>
            <strong className="text-foreground">Standard Base64</strong> — Uses A-Za-z0-9+/ with = padding
          </li>
          <li>
            <strong className="text-foreground">URL-safe Base64</strong> — Uses - and _ instead of + and /
          </li>
          <li>
            <strong className="text-foreground">Hex</strong> — Hexadecimal representation of bytes
          </li>
        </ul>
      </div>
    </div>
  );
}
