"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

type JsonToken =
  | { type: "key"; value: string }
  | { type: "string"; value: string }
  | { type: "number"; value: string }
  | { type: "boolean"; value: string }
  | { type: "null"; value: string }
  | { type: "punctuation"; value: string };

function tokenizeJson(str: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;
  const peekNextNonSpace = (from: number) => {
    let j = from;
    while (j < str.length && /\s/.test(str[j])) j++;
    return str[j];
  };
  while (i < str.length) {
    const char = str[i];
    if (char === '"') {
      let value = '"';
      i++;
      while (i < str.length) {
        const c = str[i];
        if (c === "\\") {
          value += str.slice(i, Math.min(i + 2, str.length));
          i += 2;
          continue;
        }
        if (c === '"') {
          value += '"';
          i++;
          break;
        }
        value += c;
        i++;
      }
      tokens.push({ type: peekNextNonSpace(i) === ":" ? "key" : "string", value });
      continue;
    }
    if (char === ":" || char === "," || char === "{" || char === "}" || char === "[" || char === "]") {
      tokens.push({ type: "punctuation", value: char });
      i++;
      continue;
    }
    if (/[0-9-]/.test(char)) {
      let value = "";
      while (i < str.length && /[0-9.eE+-]/.test(str[i])) value += str[i++];
      if (value) tokens.push({ type: "number", value });
      continue;
    }
    if (str.slice(i, i + 4) === "true") { tokens.push({ type: "boolean", value: "true" }); i += 4; continue; }
    if (str.slice(i, i + 5) === "false") { tokens.push({ type: "boolean", value: "false" }); i += 5; continue; }
    if (str.slice(i, i + 4) === "null") { tokens.push({ type: "null", value: "null" }); i += 4; continue; }
    if (/\s/.test(char)) { tokens.push({ type: "punctuation", value: char }); i++; continue; }
    tokens.push({ type: "punctuation", value: char });
    i++;
  }
  return tokens;
}

function JsonHighlight({ value }: { value: string }) {
  const tokens = tokenizeJson(value);
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return (
    <code className="font-mono text-sm">
      {tokens.map((t, i) => (
        <span key={i} className={`json-${t.type}`}>{escape(t.value)}</span>
      ))}
    </code>
  );
}

function base64UrlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

function base64UrlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const HMAC_HASH: Record<string, "SHA-256" | "SHA-384" | "SHA-512"> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

async function verifyHsToken(token: string, secret: string, alg: string): Promise<boolean> {
  const hash = HMAC_HASH[alg?.toUpperCase()] ?? "SHA-256";
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const signingInput = `${parts[0]}.${parts[1]}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    const expected = base64UrlEncode(sig);
    return expected === parts[2];
  } catch {
    return false;
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

type ClaimStatus = "valid" | "expired" | "not_yet";

function getClaimStatus(key: string, value: unknown): ClaimStatus | null {
  if (key === "exp" && typeof value === "number") {
    return value < Date.now() / 1000 ? "expired" : "valid";
  }
  if (key === "nbf" && typeof value === "number") {
    return value > Date.now() / 1000 ? "not_yet" : "valid";
  }
  return null;
}

function formatClaim(key: string, value: unknown): string {
  if (key === "exp" || key === "iat" || key === "nbf") {
    if (typeof value === "number") {
      const status = getClaimStatus(key, value);
      const suffix = status === "expired" ? " (expired)" : status === "not_yet" ? " (not yet valid)" : "";
      return `${formatTimestamp(value)}${suffix}`;
    }
  }
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

type DecodedJwt = {
  header: string;
  payload: string;
  signature: string;
  headerJson: Record<string, unknown>;
  payloadJson: Record<string, unknown>;
  headerPretty: string;
  payloadPretty: string;
};

function normalizeInput(raw: string): string {
  return raw.trim().replace(/^Bearer\s+/i, "");
}

function decodeJwt(input: string): DecodedJwt | null {
  const normalized = normalizeInput(input);
  const parts = normalized.split(".");
  if (parts.length !== 3) return null;
  try {
    const headerRaw = base64UrlDecode(parts[0]);
    const payloadRaw = base64UrlDecode(parts[1]);
    if (!headerRaw || !payloadRaw) return null;
    const headerJson = JSON.parse(headerRaw) as Record<string, unknown>;
    const payloadJson = JSON.parse(payloadRaw) as Record<string, unknown>;
    return {
      header: parts[0],
      payload: parts[1],
      signature: parts[2],
      headerJson,
      payloadJson,
      headerPretty: JSON.stringify(headerJson, null, 2),
      payloadPretty: JSON.stringify(payloadJson, null, 2),
    };
  } catch {
    return null;
  }
}

function getValidationError(input: string): string | null {
  const normalized = normalizeInput(input);
  if (!normalized) return null;
  const parts = normalized.split(".");
  if (parts.length !== 3) return "Expected 3 parts (header.payload.signature). Check for extra spaces or line breaks.";
  const headerRaw = base64UrlDecode(parts[0]);
  const payloadRaw = base64UrlDecode(parts[1]);
  if (!headerRaw) return "Invalid base64url in header.";
  if (!payloadRaw) return "Invalid base64url in payload.";
  try {
    JSON.parse(headerRaw);
  } catch {
    return "Header is not valid JSON.";
  }
  try {
    JSON.parse(payloadRaw);
  } catch {
    return "Payload is not valid JSON.";
  }
  return null;
}

const STANDARD_CLAIMS = ["exp", "iat", "nbf", "iss", "sub", "aud", "jti", "typ", "azp"];
const EXAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDebugger() {
  const [input, setInput] = useState(EXAMPLE_JWT);
  const [secret, setSecret] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const decoded = decodeJwt(input);
  const error = getValidationError(input);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setVerifyResult(null);
  }, []);

  const resetToExample = useCallback(() => {
    setInput(EXAMPLE_JWT);
    setSecret("");
    setVerifyResult(null);
  }, []);

  const copyPayload = useCallback(() => {
    if (decoded) {
      navigator.clipboard.writeText(decoded.payloadPretty);
      toast.success("Payload copied");
    }
  }, [decoded]);

  const copyHeader = useCallback(() => {
    if (decoded) {
      navigator.clipboard.writeText(decoded.headerPretty);
      toast.success("Header copied");
    }
  }, [decoded]);

  const copyToken = useCallback(() => {
    if (decoded) {
      navigator.clipboard.writeText(normalizeInput(input));
      toast.success("Token copied");
    }
  }, [decoded, input]);

  const verifySignature = useCallback(async () => {
    if (!decoded || !secret) return;
    const alg = (decoded.headerJson.alg as string) || "";
    if (!alg.toUpperCase().startsWith("HS")) {
      setVerifyResult(false);
      return;
    }
    setVerifying(true);
    setVerifyResult(null);
    try {
      const algorithm = (decoded.headerJson.alg as string) || "HS256";
      const valid = await verifyHsToken(normalizeInput(input), secret, algorithm);
      setVerifyResult(valid);
    } catch {
      setVerifyResult(false);
    } finally {
      setVerifying(false);
    }
  }, [decoded, secret, input]);

  const alg = decoded?.headerJson.alg as string | undefined;
  const isHsAlg = alg?.toUpperCase().startsWith("HS");
  const exp = decoded?.payloadJson.exp as number | undefined;
  const nbf = decoded?.payloadJson.nbf as number | undefined;
  const now = Date.now() / 1000;
  const isExpired = typeof exp === "number" && exp < now;
  const notYetValid = typeof nbf === "number" && nbf > now;
  const validityStatus = isExpired ? "expired" : notYetValid ? "not_yet" : "valid";

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="jwt-input" className="text-sm font-medium text-muted">
            Paste your JWT (Bearer prefix auto-stripped)
          </label>
          <button
            onClick={resetToExample}
            className="text-xs text-muted hover:text-(--accent)"
          >
            Reset to example
          </button>
        </div>
        <textarea
          id="jwt-input"
          value={input}
          onChange={handleInputChange}
          placeholder="Paste JWT or Bearer token..."
          className="min-h-[120px] w-full resize-y rounded-xl border border-(--border) bg-(--card) p-4 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
          spellCheck={false}
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {decoded && (
        <>
          {/* Validity & Algorithm */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                validityStatus === "valid"
                  ? "bg-green-500/20 text-green-400"
                  : validityStatus === "expired"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {validityStatus === "valid" ? "Valid" : validityStatus === "expired" ? "Expired" : "Not yet valid"}
            </span>
            <span className="rounded-md border border-(--border) bg-(--card) px-2.5 py-1 font-mono text-xs text-muted">
              {alg ?? "alg: unknown"}
            </span>
            <button
              onClick={copyToken}
              className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
            >
              Copy token
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-(--border) bg-(--card)">
              <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
                <h3 className="font-semibold">Header</h3>
                <button
                  onClick={copyHeader}
                  className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
                >
                  Copy
                </button>
              </div>
              <div className="max-h-48 overflow-auto p-4">
                <pre className="whitespace-pre-wrap wrap-break-word text-sm">
                  <JsonHighlight value={decoded.headerPretty} />
                </pre>
              </div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--card)">
              <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
                <h3 className="font-semibold">Payload</h3>
                <button
                  onClick={copyPayload}
                  className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
                >
                  Copy
                </button>
              </div>
              <div className="max-h-48 overflow-auto p-4">
                <pre className="whitespace-pre-wrap wrap-break-word text-sm">
                  <JsonHighlight value={decoded.payloadPretty} />
                </pre>
              </div>
            </div>
          </div>

          {/* Claims */}
          <div className="rounded-xl border border-(--border) bg-(--card)">
            <h3 className="border-b border-(--border) px-4 py-3 font-semibold">Claims</h3>
            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(decoded.payloadJson)
                .filter(([k]) => STANDARD_CLAIMS.includes(k))
                .map(([key]) => (
                  <div key={key} className="rounded-lg border border-(--border) bg-(--card-hover) p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-(--accent)">{key}</span>
                      {getClaimStatus(key, decoded.payloadJson[key]) === "expired" && (
                        <span className="text-[10px] text-red-400">expired</span>
                      )}
                      {getClaimStatus(key, decoded.payloadJson[key]) === "not_yet" && (
                        <span className="text-[10px] text-amber-400">not yet</span>
                      )}
                    </div>
                    <div className="text-sm text-muted">
                      {formatClaim(key, decoded.payloadJson[key])}
                    </div>
                  </div>
                ))}
            </div>
            {Object.keys(decoded.payloadJson).filter((k) => !STANDARD_CLAIMS.includes(k)).length > 0 && (
              <div className="border-t border-(--border) p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Custom claims</h4>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(decoded.payloadJson)
                    .filter(([k]) => !STANDARD_CLAIMS.includes(k))
                    .map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-(--border) bg-(--card-hover) p-3">
                        <div className="mb-1 font-mono text-xs text-(--accent)">{key}</div>
                        <div className="text-sm text-muted">
                          {typeof value === "object" && value !== null ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Signature verification */}
          <div className="rounded-xl border border-(--border) bg-(--card) p-4">
            <h3 className="mb-3 font-semibold">Signature verification</h3>
            <p className="mb-3 font-mono text-xs text-muted break-all">{decoded.signature}</p>
            {isHsAlg ? (
              <div className="space-y-2">
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => {
                    setSecret(e.target.value);
                    setVerifyResult(null);
                  }}
                  placeholder="Enter secret to verify (HS256/HS384/HS512)"
                  className="w-full rounded border border-(--border) bg-(--card-hover) px-3 py-2 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={verifySignature}
                    disabled={!secret || verifying}
                    className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-background hover:bg-(--accent-hover) disabled:opacity-50"
                  >
                    {verifying ? "Verifying…" : "Verify signature"}
                  </button>
                  {verifyResult === true && (
                    <span className="text-sm text-green-400">✓ Signature valid</span>
                  )}
                  {verifyResult === false && (
                    <span className="text-sm text-red-400">✗ Signature invalid</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">
                Algorithm <code className="rounded bg-(--card-hover) px-1">{alg ?? "unknown"}</code> uses asymmetric keys (e.g. RS256, ES256). Verification requires the public key.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
