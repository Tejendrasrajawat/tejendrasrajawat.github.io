"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const;
type Method = (typeof METHODS)[number];

const BODY_TYPES = ["none", "json", "form", "form-urlencoded", "raw"] as const;
type BodyType = (typeof BODY_TYPES)[number];

const AUTH_TYPES = ["none", "bearer", "basic", "apiKey"] as const;
type AuthType = (typeof AUTH_TYPES)[number];

type Header = { key: string; value: string; enabled: boolean };
type Param = { key: string; value: string; enabled: boolean };

type RequestData = {
  id: string;
  name: string;
  description?: string;
  method: Method;
  url: string;
  params: Param[];
  headers: Header[];
  bodyType: BodyType;
  body: string;
  authType: AuthType;
  authValue: string;
  authHeader: string;
  timeout?: number;
};

type Collection = {
  id: string;
  name: string;
  requests: RequestData[];
};

const COLLECTIONS_KEY = "devkit_api_collections";
const HISTORY_KEY = "devkit_api_history";
const ENV_KEY = "devkit_api_env";
const MAX_HISTORY = 30;

type EnvVars = Record<string, string>;

function interpolateEnv(str: string, env: EnvVars): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => env[key] ?? `{{${key}}}`);
}

type HistoryEntry = { id: string; method: Method; url: string; name: string; timestamp: number };

const DEFAULT_HEADERS: Header[] = [
  { key: "Content-Type", value: "application/json", enabled: true },
  { key: "Accept", value: "application/json", enabled: true },
];

function newRequest(name = "New Request"): RequestData {
  return {
    id: crypto.randomUUID(),
    name,
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    params: [],
    headers: [...DEFAULT_HEADERS],
    bodyType: "none",
    body: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}',
    authType: "none",
    authValue: "",
    authHeader: "X-API-Key",
    timeout: 30000,
  };
}

function newCollection(name = "New Collection"): Collection {
  return { id: crypto.randomUUID(), name, requests: [] };
}

function parseUrl(url: string): { base: string; params: Param[] } {
  try {
    const u = new URL(url);
    const params: Param[] = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v, enabled: true }));
    return { base: u.origin + u.pathname, params };
  } catch {
    return { base: url, params: [] };
  }
}

function buildUrl(base: string, params: Param[]): string {
  try {
    const u = new URL(base);
    params.filter((p) => p.enabled && p.key.trim()).forEach((p) => u.searchParams.set(p.key, p.value));
    return u.toString();
  } catch {
    return base;
  }
}

function tokenizeJson(str: string) {
  const tokens: { type: string; value: string }[] = [];
  let i = 0;
  const peek = (from: number) => {
    let j = from;
    while (j < str.length && /\s/.test(str[j])) j++;
    return str[j];
  };
  while (i < str.length) {
    const c = str[i];
    if (c === '"') {
      let v = '"';
      i++;
      while (i < str.length) {
        if (str[i] === "\\") { v += str.slice(i, i + 2); i += 2; continue; }
        if (str[i] === '"') { v += '"'; i++; break; }
        v += str[i++];
      }
      tokens.push({ type: peek(i) === ":" ? "key" : "string", value: v });
      continue;
    }
    if (/[0-9-]/.test(c)) {
      let v = "";
      while (i < str.length && /[0-9.eE+-]/.test(str[i])) v += str[i++];
      if (v) tokens.push({ type: "number", value: v });
      continue;
    }
    if (str.slice(i, i + 4) === "true") { tokens.push({ type: "boolean", value: "true" }); i += 4; continue; }
    if (str.slice(i, i + 5) === "false") { tokens.push({ type: "boolean", value: "false" }); i += 5; continue; }
    if (str.slice(i, i + 4) === "null") { tokens.push({ type: "null", value: "null" }); i += 4; continue; }
    if (c === ":" || c === "," || c === "{" || c === "}" || c === "[" || c === "]") {
      tokens.push({ type: "punctuation", value: c }); i++;
      continue;
    }
    tokens.push({ type: "punctuation", value: c }); i++;
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

function toCurl(method: Method, url: string, headers: Header[], body: string, bodyType: BodyType, auth: AuthType, authValue: string, authHeader: string): string {
  let curl = `curl -X ${method}`;
  headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => { curl += ` \\\n  -H "${h.key}: ${h.value.replace(/"/g, '\\"')}"`; });
  if (auth === "bearer" && authValue) curl += ` \\\n  -H "Authorization: Bearer ${authValue}"`;
  if (auth === "basic" && authValue) curl += ` \\\n  -H "Authorization: Basic ${btoa(authValue)}"`;
  if (auth === "apiKey" && authValue) curl += ` \\\n  -H "${authHeader}: ${authValue}"`;
  if (["POST", "PUT", "PATCH"].includes(method) && body && bodyType !== "none") {
    let data = body;
    if (bodyType === "form-urlencoded") {
      const params = new URLSearchParams();
      body.split("\n").forEach((line) => { const [k, ...vParts] = line.split("="); if (k?.trim()) params.set(k.trim(), vParts.join("=").trim()); });
      data = params.toString();
    }
    curl += ` \\\n  -d '${data.replace(/'/g, "'\\''")}'`;
  }
  curl += ` \\\n  "${url}"`;
  return curl;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-green-400";
  if (status >= 300 && status < 400) return "text-amber-400";
  if (status >= 400 && status < 500) return "text-orange-400";
  return "text-red-400";
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg className={`h-4 w-4 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function ApiTester({ fullScreen = false }: { fullScreen?: boolean }) {
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const raw = localStorage.getItem(COLLECTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const defaultReq = newRequest("Get Post");
    return [{ ...newCollection("My Collection"), requests: [defaultReq] }];
  });

  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [request, setRequest] = useState<RequestData>(() => {
    try {
      const raw = localStorage.getItem(COLLECTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const first = parsed?.[0]?.requests?.[0];
        if (first) return first;
      }
    } catch {}
    return newRequest("Get Post");
  });
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(() => new Set());
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body" | "auth">("params");
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [responsePretty, setResponsePretty] = useState(true);
  const [responseSearch, setResponseSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number; statusText: string; headers: Record<string, string>; body: string; rawBody: string; time: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [envVars, setEnvVars] = useState<EnvVars>(() => {
    try {
      const raw = localStorage.getItem(ENV_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { baseUrl: "https://jsonplaceholder.typicode.com", apiKey: "" };
  });
  const [showEnvPanel, setShowEnvPanel] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (selectedRequest) setRequest({ ...selectedRequest });
  }, [selectedRequest?.id]);

  useEffect(() => {
    if (collections.length > 0 && selectedRequest === null) {
      const first = collections[0]?.requests?.[0];
      if (first) {
        setSelectedRequest(first);
        setRequest({ ...first });
        setExpandedCollections((e) => {
          const next = new Set(e);
          collections.forEach((c) => next.add(c.id));
          return next;
        });
      }
    }
  }, [collections, selectedRequest]);

  const persistCollections = useCallback((cols: Collection[]) => {
    try {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(cols));
    } catch {}
  }, []);

  const loadHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(ENV_KEY, JSON.stringify(envVars));
    } catch {}
  }, [envVars]);

  const updateRequest = useCallback((updates: Partial<RequestData>) => {
    const reqId = selectedRequest?.id;
    setRequest((r) => ({ ...r, ...updates }));
    if (!reqId) return;
    setCollections((cols) => {
      const next = cols.map((c) => ({
        ...c,
        requests: c.requests.map((req) =>
          req.id === reqId ? { ...req, ...updates } : req
        ),
      }));
      try {
        localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [selectedRequest?.id]);

  const addCollection = useCallback(() => {
    const col = newCollection();
    setCollections((c) => {
      const next = [...c, col];
      persistCollections(next);
      return next;
    });
    setExpandedCollections((e) => new Set([...e, col.id]));
  }, [persistCollections]);

  const addRequest = useCallback((collectionId: string) => {
    const req = newRequest();
    setCollections((cols) => {
      const next = cols.map((c) =>
        c.id === collectionId ? { ...c, requests: [...c.requests, req] } : c
      );
      persistCollections(next);
      return next;
    });
    setSelectedRequest(req);
    setRequest(req);
    setExpandedCollections((e) => new Set([...e, collectionId]));
  }, [persistCollections]);

  const selectRequest = useCallback((req: RequestData) => {
    setSelectedRequest(req);
    setRequest({ ...req });
  }, []);

  const deleteRequest = useCallback((collId: string, reqId: string) => {
    const next = collections
      .map((c) => (c.id === collId ? { ...c, requests: c.requests.filter((r) => r.id !== reqId) } : c))
      .filter((c) => c.requests.length > 0 || c.id !== collId);
    setCollections(next);
    persistCollections(next);
    if (selectedRequest?.id === reqId) {
      const coll = next.find((c) => c.id === collId);
      const otherColl = next.find((c) => c.requests.length > 0);
      const nextReq = coll?.requests[0] ?? otherColl?.requests[0] ?? null;
      setSelectedRequest(nextReq);
      setRequest(nextReq ? { ...nextReq } : newRequest());
    }
  }, [collections, selectedRequest, persistCollections]);

  const toggleCollection = useCallback((id: string) => {
    setExpandedCollections((e) => {
      const next = new Set(e);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const updateParamsFromUrl = useCallback(() => {
    const { base, params: p } = parseUrl(request.url);
    updateRequest({ url: base, params: p.length > 0 ? p : request.params });
  }, [request.url, request.params, updateRequest]);

  const addHeader = useCallback(() => updateRequest({ headers: [...request.headers, { key: "", value: "", enabled: true }] }), [request.headers, updateRequest]);
  const updateHeader = useCallback((i: number, field: "key" | "value" | "enabled", val: string | boolean) => {
    const h = [...request.headers];
    h[i] = { ...h[i], [field]: val };
    updateRequest({ headers: h });
  }, [request.headers, updateRequest]);
  const removeHeader = useCallback((i: number) => updateRequest({ headers: request.headers.filter((_, j) => j !== i) }), [request.headers, updateRequest]);

  const addParam = useCallback(() => updateRequest({ params: [...request.params, { key: "", value: "", enabled: true }] }), [request.params, updateRequest]);
  const updateParam = useCallback((i: number, field: "key" | "value" | "enabled", val: string | boolean) => {
    const p = [...request.params];
    p[i] = { ...p[i], [field]: val };
    updateRequest({ params: p });
  }, [request.params, updateRequest]);
  const removeParam = useCallback((i: number) => updateRequest({ params: request.params.filter((_, j) => j !== i) }), [request.params, updateRequest]);

  const saveToHistory = useCallback((m: Method, u: string, name: string) => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
      const entry: HistoryEntry = { id: crypto.randomUUID(), method: m, url: u, name, timestamp: Date.now() };
      const next = [entry, ...list.filter((x) => !(x.method === m && x.url === u))].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setHistory(next);
    } catch {}
  }, []);

  const applyHistory = useCallback((entry: HistoryEntry) => {
    const { params: p } = parseUrl(entry.url);
    setRequest((r) => ({ ...r, method: entry.method as Method, url: entry.url, params: p.length > 0 ? p : r.params }));
    setSelectedRequest(null);
  }, []);

  const sendRequest = useCallback(async () => {
    const url = interpolateEnv(request.url, envVars);
    const params = request.params.map((p) => ({ ...p, key: interpolateEnv(p.key, envVars), value: interpolateEnv(p.value, envVars) }));
    const finalUrl = buildUrl(url, params);
    if (!finalUrl.startsWith("http")) {
      setError("Enter a valid URL (http:// or https://)");
      return;
    }
    setLoading(true);
    setError(null);
    setResponse(null);
    abortRef.current = new AbortController();
    const timeoutMs = request.timeout ?? 30000;
    const timeoutId = setTimeout(() => abortRef.current?.abort(), timeoutMs);
    const h: Record<string, string> = {};
    request.headers.filter((x) => x.enabled && x.key.trim()).forEach((x) => (h[interpolateEnv(x.key, envVars)] = interpolateEnv(x.value, envVars)));
    const authVal = interpolateEnv(request.authValue, envVars);
    const authHdr = interpolateEnv(request.authHeader, envVars);
    if (request.authType === "bearer" && authVal) h["Authorization"] = `Bearer ${authVal}`;
    if (request.authType === "basic" && authVal) h["Authorization"] = `Basic ${btoa(authVal)}`;
    if (request.authType === "apiKey" && authVal) h[authHdr] = authVal;
    let bodyToSend: string | FormData | undefined;
    const headersToSend = { ...h };
    if (["POST", "PUT", "PATCH"].includes(request.method) && request.bodyType !== "none") {
      const bodyStr = interpolateEnv(request.body, envVars);
      if (request.bodyType === "form") {
        const fd = new FormData();
        bodyStr.split("\n").forEach((line) => {
          const [k, ...vParts] = line.split("=");
          if (k?.trim()) fd.append(k.trim(), vParts.join("=").trim());
        });
        bodyToSend = fd;
        delete headersToSend["Content-Type"];
      } else if (request.bodyType === "form-urlencoded") {
        const urlParams = new URLSearchParams();
        bodyStr.split("\n").forEach((line) => {
          const [k, ...vParts] = line.split("=");
          if (k?.trim()) urlParams.set(k.trim(), vParts.join("=").trim());
        });
        bodyToSend = urlParams.toString();
        headersToSend["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        bodyToSend = bodyStr;
      }
    }
    const start = performance.now();
    try {
      const res = await fetch(finalUrl, {
        method: request.method,
        headers: headersToSend,
        body: bodyToSend,
        signal: abortRef.current.signal,
      });
      clearTimeout(timeoutId);
      const time = Math.round(performance.now() - start);
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => (resHeaders[k] = v));
      const rawBody = await res.text();
      let prettyBody = rawBody;
      try {
        prettyBody = JSON.stringify(JSON.parse(rawBody), null, 2);
      } catch {}
      setResponse({ status: res.status, statusText: res.statusText, headers: resHeaders, body: prettyBody, rawBody, time });
      saveToHistory(request.method, finalUrl, request.name);
    } catch (e) {
      clearTimeout(timeoutId);
      if ((e as Error).name === "AbortError") {
        setError(`Request timed out after ${timeoutMs / 1000}s`);
        return;
      }
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [request, envVars, saveToHistory]);

  const cancelRequest = useCallback(() => abortRef.current?.abort(), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendRequest();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sendRequest]);

  const duplicateRequest = useCallback((collectionId: string, req: RequestData) => {
    const dup = { ...newRequest(`${req.name} (copy)`), ...req, id: crypto.randomUUID(), name: `${req.name} (copy)` };
    setCollections((cols) => {
      const next = cols.map((c) =>
        c.id === collectionId ? { ...c, requests: [...c.requests, dup] } : c
      );
      persistCollections(next);
      return next;
    });
    setSelectedRequest(dup);
    setRequest(dup);
  }, [persistCollections]);

  const exportCollections = useCallback(() => {
    const blob = new Blob([JSON.stringify(collections, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devkit-collections-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Collections exported");
  }, [collections]);

  const importCollections = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCollections(parsed);
            persistCollections(parsed);
            const first = parsed[0]?.requests?.[0];
            if (first) {
              setSelectedRequest(first);
              setRequest(first);
            }
            toast.success("Collections imported");
          }
        } catch {
          setError("Invalid JSON file");
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [persistCollections]);

  const copyAsCurl = useCallback(() => {
    const url = interpolateEnv(request.url, envVars);
    const params = request.params.map((p) => ({ ...p, key: interpolateEnv(p.key, envVars), value: interpolateEnv(p.value, envVars) }));
    const finalUrl = buildUrl(url, params);
    const headers = request.headers.map((h) => ({ ...h, key: interpolateEnv(h.key, envVars), value: interpolateEnv(h.value, envVars) }));
    navigator.clipboard.writeText(toCurl(request.method, finalUrl, headers, interpolateEnv(request.body, envVars), request.bodyType, request.authType, interpolateEnv(request.authValue, envVars), interpolateEnv(request.authHeader, envVars)));
    toast.success("cURL copied");
  }, [request, envVars]);

  const TABS = [
    { id: "params" as const, label: "Params" },
    { id: "headers" as const, label: "Headers" },
    { id: "body" as const, label: "Body" },
    { id: "auth" as const, label: "Auth" },
  ] as const;

  return (
    <div className={`flex gap-0 overflow-hidden rounded-xl border border-(--border) bg-(--card) ${fullScreen ? "h-full min-h-0 w-full flex-1 min-w-0" : "h-[calc(100vh-14rem)] min-h-[520px]"}`}>
      {/* Left sidebar - Collections & History */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-(--border) bg-(--card-hover)">
        <div className="flex items-center justify-between border-b border-(--border) px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Collections</span>
          <div className="flex gap-0.5">
            <button onClick={exportCollections} className="rounded p-1 text-muted transition-colors hover:bg-(--accent-muted) hover:text-(--accent)" title="Export collections">↓</button>
            <button onClick={importCollections} className="rounded p-1 text-muted transition-colors hover:bg-(--accent-muted) hover:text-(--accent)" title="Import collections">↑</button>
            <button onClick={addCollection} className="rounded p-1 text-muted transition-colors hover:bg-(--accent-muted) hover:text-(--accent)" title="New collection">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {collections.map((col) => (
            <div key={col.id} className="mb-1">
              <div className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-sm hover:bg-(--accent-muted)/50 group/coll">
                <button onClick={() => toggleCollection(col.id)} className="flex flex-1 min-w-0 items-center gap-1">
                  <ChevronDown open={expandedCollections.has(col.id)} />
                  {editingCollection === col.id ? (
                    <input
                      value={col.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCollections((c) => {
                          const next = c.map((x) => (x.id === col.id ? { ...x, name: v } : x));
                          persistCollections(next);
                          return next;
                        });
                      }}
                      onBlur={() => setEditingCollection(null)}
                      onKeyDown={(e) => { if (e.key === "Enter") setEditingCollection(null); }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 rounded border border-(--border) bg-(--card) px-1.5 py-0.5 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate font-medium" onDoubleClick={() => setEditingCollection(col.id)}>{col.name}</span>
                  )}
                </button>
                <span className="text-xs text-muted">{col.requests.length}</span>
              </div>
              {expandedCollections.has(col.id) && (
                <div className="ml-4 border-l border-(--border) pl-2">
                  {col.requests.map((req) => (
                    <div
                      key={req.id}
                      className={`group flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer ${
                        selectedRequest?.id === req.id ? "bg-(--accent-muted) text-(--accent)" : "hover:bg-(--card)"
                      }`}
                    >
                      <button onClick={() => selectRequest(req)} className="flex-1 truncate text-left">
                        <span className="font-mono text-xs text-muted">{req.method}</span>{" "}
                        <span className="truncate">{req.name}</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); duplicateRequest(col.id, req); }} className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted hover:bg-(--accent-muted) hover:text-(--accent)" title="Duplicate">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteRequest(col.id, req.id); }} className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted hover:bg-red-500/20 hover:text-red-400" title="Delete">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addRequest(col.id)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted hover:bg-(--card) hover:text-(--accent)"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-(--border) p-2">
          <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted">History</div>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {history.slice(0, 8).map((entry) => (
              <button
                key={entry.id}
                onClick={() => applyHistory(entry)}
                className="flex w-full items-center gap-2 truncate rounded px-2 py-1.5 text-left text-xs hover:bg-(--card)"
                title={entry.url}
              >
                <span className="shrink-0 font-mono text-(--accent)">{entry.method}</span>
                <span className="truncate text-muted">{entry.name || entry.url.slice(0, 30)}</span>
              </button>
            ))}
            {history.length === 0 && <p className="px-2 py-1 text-xs text-muted">No history yet</p>}
          </div>
        </div>
      </aside>

      {/* Right - Request builder & Response */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Request section */}
        <div className="relative flex flex-1 flex-col overflow-hidden border-b border-(--border)">
          <div className="flex items-center gap-3 border-b border-(--border) bg-(--card-hover) px-4 py-2">
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <input
                value={request.name}
                onChange={(e) => updateRequest({ name: e.target.value })}
                placeholder="Request name"
                className="w-48 rounded border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium focus:border-(--border) focus:outline-none"
              />
              <input
                value={request.description ?? ""}
                onChange={(e) => updateRequest({ description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full max-w-md rounded border border-transparent bg-transparent px-2 py-1 text-xs text-muted focus:border-(--border) focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowEnvPanel((s) => !s)}
              className={`rounded px-2 py-1 text-xs ${showEnvPanel ? "bg-(--accent-muted) text-(--accent)" : "text-muted hover:bg-(--accent-muted) hover:text-(--accent)"}`}
              title="Environment variables (e.g. {{baseUrl}})"
            >
              Env
            </button>
            {showEnvPanel && (
              <div className="absolute left-4 top-24 z-50 flex flex-col gap-2 rounded-lg border border-(--border) bg-(--card) p-3 shadow-xl">
                <div className="text-xs font-semibold text-muted">Environment variables</div>
                <p className="text-xs text-muted">Use {"{{variable}}"} in URL, headers, body. Example: {"{{baseUrl}}/posts"}</p>
                {Object.entries(envVars).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <input value={k} onChange={(e) => { const nk = e.target.value; setEnvVars((ev) => { const next = { ...ev }; if (nk !== k) { delete next[k]; next[nk] = v; } return next; }); }} placeholder="Key" className="w-24 rounded border border-(--border) bg-(--card) px-2 py-1 font-mono text-xs" />
                    <input value={v} onChange={(e) => setEnvVars((ev) => ({ ...ev, [k]: e.target.value }))} placeholder="Value" className="flex-1 rounded border border-(--border) bg-(--card) px-2 py-1 font-mono text-xs" />
                    <button onClick={() => setEnvVars((ev) => { const next = { ...ev }; delete next[k]; return next; })} className="text-red-400 hover:underline">×</button>
                  </div>
                ))}
                <button onClick={() => setEnvVars((ev) => ({ ...ev, [`var_${Date.now()}`]: "" }))} className="text-xs text-(--accent) hover:underline">+ Add variable</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-b border-(--border) bg-(--card-hover) px-4 py-3">
            <select
              value={request.method}
              onChange={(e) => updateRequest({ method: e.target.value as Method })}
              className="select-indent w-28 cursor-pointer rounded border border-(--border) bg-(--card) px-3 py-2 font-mono text-sm font-medium"
            >
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              type="url"
              value={request.url}
              onChange={(e) => updateRequest({ url: e.target.value })}
              onBlur={updateParamsFromUrl}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 rounded border border-(--border) bg-(--card) px-4 py-2 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            />
            <button
              onClick={sendRequest}
              disabled={loading}
              className="rounded-lg bg-(--accent) px-5 py-2 font-medium text-background transition-colors hover:bg-(--accent-hover) disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send"}
            </button>
            {loading && (
              <button onClick={cancelRequest} className="rounded border border-red-500/50 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                Cancel
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-(--border) px-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-(--accent) text-(--accent)"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "params" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Query parameters</span>
                  <button onClick={addParam} className="text-xs text-(--accent) hover:underline">+ Add</button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="w-8 pb-2">✓</th>
                      <th className="pb-2">Key</th>
                      <th className="pb-2">Value</th>
                      <th className="w-10 pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.params.map((p, i) => (
                      <tr key={i} className="border-t border-(--border)">
                        <td className="py-1.5"><input type="checkbox" checked={p.enabled} onChange={(e) => updateParam(i, "enabled", e.target.checked)} className="rounded" /></td>
                        <td className="py-1.5"><input value={p.key} onChange={(e) => updateParam(i, "key", e.target.value)} placeholder="Key" className="w-full rounded border border-(--border) bg-(--card) px-2 py-1 font-mono" /></td>
                        <td className="py-1.5"><input value={p.value} onChange={(e) => updateParam(i, "value", e.target.value)} placeholder="Value" className="w-full rounded border border-(--border) bg-(--card) px-2 py-1 font-mono" /></td>
                        <td className="py-1.5"><button onClick={() => removeParam(i)} className="text-muted hover:text-red-400">×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {request.params.length === 0 && <p className="py-4 text-center text-sm text-muted">No parameters. Add from URL or click + Add.</p>}
              </div>
            )}

            {activeTab === "headers" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Request headers</span>
                  <button onClick={addHeader} className="text-xs text-(--accent) hover:underline">+ Add</button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="w-8 pb-2">✓</th>
                      <th className="pb-2">Key</th>
                      <th className="pb-2">Value</th>
                      <th className="w-10 pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.headers.map((h, i) => (
                      <tr key={i} className="border-t border-(--border)">
                        <td className="py-1.5"><input type="checkbox" checked={h.enabled} onChange={(e) => updateHeader(i, "enabled", e.target.checked)} className="rounded" /></td>
                        <td className="py-1.5"><input value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} placeholder="Header" className="w-full rounded border border-(--border) bg-(--card) px-2 py-1 font-mono" /></td>
                        <td className="py-1.5"><input value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} placeholder="Value" className="w-full rounded border border-(--border) bg-(--card) px-2 py-1 font-mono" /></td>
                        <td className="py-1.5"><button onClick={() => removeHeader(i)} className="text-muted hover:text-red-400">×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "body" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={request.bodyType}
                    onChange={(e) => updateRequest({ bodyType: e.target.value as BodyType })}
                    className="select-indent rounded border border-(--border) bg-(--card) px-3 py-1.5 text-sm"
                  >
                    {BODY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {request.bodyType !== "none" && (
                  <textarea
                    value={request.body}
                    onChange={(e) => updateRequest({ body: e.target.value })}
                    placeholder={request.bodyType === "json" ? '{"key": "value"}' : "key=value"}
                    className="min-h-[180px] w-full resize-y rounded border border-(--border) bg-(--card) p-4 font-mono text-sm focus:border-(--accent) focus:outline-none"
                    spellCheck={false}
                  />
                )}
              </div>
            )}

            {activeTab === "auth" && (
              <div className="space-y-3">
                <select
                  value={request.authType}
                  onChange={(e) => updateRequest({ authType: e.target.value as AuthType })}
                  className="select-indent w-full rounded border border-(--border) bg-(--card) px-3 py-2 text-sm"
                >
                  {AUTH_TYPES.map((t) => <option key={t} value={t}>{t === "none" ? "No Auth" : t}</option>)}
                </select>
                {request.authType !== "none" && (
                  <div className="space-y-2">
                    {request.authType === "apiKey" && (
                      <input
                        value={request.authHeader}
                        onChange={(e) => updateRequest({ authHeader: e.target.value })}
                        placeholder="Header (e.g. X-API-Key)"
                        className="w-full rounded border border-(--border) bg-(--card) px-3 py-2 font-mono text-sm"
                      />
                    )}
                    <input
                      value={request.authValue}
                      onChange={(e) => updateRequest({ authValue: e.target.value })}
                      placeholder={request.authType === "bearer" ? "Token" : request.authType === "basic" ? "username:password" : "API Key"}
                      type={request.authType === "basic" ? "password" : "text"}
                      className="w-full rounded border border-(--border) bg-(--card) px-3 py-2 font-mono text-sm"
                    />
                  </div>
                )}
                <div className="pt-3 border-t border-(--border)">
                  <label className="text-xs text-muted">Request timeout (seconds)</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={(request.timeout ?? 30000) / 1000}
                    onChange={(e) => updateRequest({ timeout: Math.max(1, Math.min(300, +e.target.value || 30)) * 1000 })}
                    className="mt-1 w-24 rounded border border-(--border) bg-(--card) px-3 py-2 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Response section */}
        <div className="flex h-64 shrink-0 flex-col overflow-hidden border-t border-(--border)">
          <div className="flex items-center justify-between border-b border-(--border) bg-(--card-hover) px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted">Response</span>
              {response && (
                <>
                  <div className="flex rounded border border-(--border) p-0.5">
                    {(["body", "headers"] as const).map((tab) => (
                      <button key={tab} onClick={() => setResponseTab(tab)} className={`rounded px-2 py-1 text-xs capitalize ${responseTab === tab ? "bg-(--accent-muted) text-(--accent)" : "text-muted hover:text-foreground"}`}>{tab}</button>
                    ))}
                  </div>
                  {responseTab === "body" && (
                    <>
                      <button onClick={() => setResponsePretty((p) => !p)} className={`rounded px-2 py-1 text-xs ${responsePretty ? "bg-(--accent-muted) text-(--accent)" : "text-muted"}`}>Pretty</button>
                      <input
                        value={responseSearch}
                        onChange={(e) => setResponseSearch(e.target.value)}
                        placeholder="Search in response…"
                        className="w-36 rounded border border-(--border) bg-(--card) px-2 py-1 text-xs"
                      />
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={copyAsCurl} className="rounded border border-(--border) px-2 py-1 text-xs hover:border-(--accent)">cURL</button>
              {response && (
                <button onClick={() => { navigator.clipboard.writeText(responsePretty ? response.body : response.rawBody); toast.success("Response copied"); }} className="rounded border border-(--border) px-2 py-1 text-xs hover:border-(--accent)">Copy</button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {error && <div className="rounded border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
            {response && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className={`font-mono font-semibold ${getStatusColor(response.status)}`}>{response.status} {response.statusText}</span>
                  <span className="text-sm text-muted">{response.time} ms</span>
                </div>
                {responseTab === "headers" ? (
                  <div className="max-h-40 overflow-auto rounded border border-(--border) bg-(--card) p-3 font-mono text-xs">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k}><span className="text-(--accent)">{k}:</span> <span className="text-muted">{v}</span></div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-(--border) bg-(--card) p-4">
                    {response.body || response.rawBody ? (
                      (() => {
                        const displayBody = responsePretty ? response.body : response.rawBody;
                        if (responseSearch.trim()) {
                          try {
                            const parts = displayBody.split(new RegExp(`(${escapeRegex(responseSearch)})`, "gi"));
                            return (
                              <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-muted">
                                {parts.map((part, i) =>
                                  part.toLowerCase() === responseSearch.toLowerCase() ? <mark key={i} className="bg-amber-500/30">{part}</mark> : part
                                )}
                              </pre>
                            );
                          } catch {
                            return <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-muted">{displayBody}</pre>;
                          }
                        }
                        if (responsePretty) {
                          try {
                            JSON.parse(response.body);
                            return <pre className="whitespace-pre-wrap wrap-break-word text-sm"><JsonHighlight value={response.body} /></pre>;
                          } catch {
                            return <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-muted">{response.body}</pre>;
                          }
                        }
                        return <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-muted">{response.rawBody}</pre>;
                      })()
                    ) : (
                      <span className="text-muted">(empty)</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {!response && !error && <p className="text-sm text-muted">Send a request to see the response. Use ⌘+Enter to send.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
