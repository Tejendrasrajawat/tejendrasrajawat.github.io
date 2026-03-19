"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

const EXAMPLE_URL =
  "https://api.example.com/v1/users?page=2&limit=10&filter=active#section";

type ParsedUrl = {
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  params: { key: string; value: string }[];
  pathSegments: string[];
};

function parseUrl(input: string): ParsedUrl | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const params: { key: string; value: string }[] = [];
    url.searchParams.forEach((value, key) => params.push({ key, value }));
    const pathSegments = url.pathname.split("/").filter(Boolean);
    return {
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      params,
      pathSegments,
    };
  } catch {
    return null;
  }
}

function buildUrl(base: string, path: string, params: { key: string; value: string }[], hash: string): string {
  try {
    const u = new URL(base);
    u.pathname = path.startsWith("/") ? path : `/${path}`;
    u.search = "";
    params.filter((p) => p.key.trim()).forEach((p) => u.searchParams.set(p.key, p.value));
    u.hash = hash.startsWith("#") ? hash : hash ? `#${hash}` : "";
    return u.toString();
  } catch {
    return base;
  }
}

function encodeText(str: string, mode: "component" | "full"): string {
  return mode === "component" ? encodeURIComponent(str) : encodeURI(str);
}

function decodeText(str: string, mode: "component" | "full"): string {
  try {
    return mode === "component" ? decodeURIComponent(str) : decodeURI(str);
  } catch {
    return str;
  }
}

export default function UrlParser() {
  const [input, setInput] = useState(EXAMPLE_URL);
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [encodeMode, setEncodeMode] = useState<"component" | "full">("component");
  const [decodeMode, setDecodeMode] = useState<"component" | "full">("component");
  const [activeTab, setActiveTab] = useState<"parse" | "encode" | "decode" | "build">("parse");

  // Builder state
  const [builderBase, setBuilderBase] = useState("https://api.example.com");
  const [builderPath, setBuilderPath] = useState("/v1/users");
  const [builderParams, setBuilderParams] = useState<{ key: string; value: string }[]>([
    { key: "page", value: "1" },
    { key: "limit", value: "10" },
  ]);
  const [builderHash, setBuilderHash] = useState("");

  const parsed = parseUrl(input);

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }, []);

  const addBuilderParam = useCallback(() => {
    setBuilderParams((p) => [...p, { key: "", value: "" }]);
  }, []);

  const updateBuilderParam = useCallback((i: number, field: "key" | "value", val: string) => {
    setBuilderParams((p) => {
      const next = [...p];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  }, []);

  const removeBuilderParam = useCallback((i: number) => {
    setBuilderParams((p) => p.filter((_, j) => j !== i));
  }, []);

  const builtUrl = buildUrl(builderBase, builderPath, builderParams, builderHash);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-(--border)">
        {(["parse", "encode", "decode", "build"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-(--accent) text-(--accent)"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "parse" && (
        <>
          <div>
            <label htmlFor="url-input" className="mb-2 block text-sm font-medium text-muted">
              Enter URL to parse
            </label>
            <div className="flex gap-2">
              <input
                id="url-input"
                type="url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://example.com/path?key=value#hash"
                className="flex-1 rounded-xl border border-(--border) bg-(--card) px-4 py-3 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
              />
              <button
                onClick={() => setInput(EXAMPLE_URL)}
                className="rounded-xl border border-(--border) px-4 py-2 text-sm text-muted hover:border-(--accent) hover:text-(--accent)"
              >
                Example
              </button>
            </div>
            {input.trim() && !parsed && (
              <p className="mt-2 text-sm text-red-400">Invalid URL. Ensure it includes a protocol (http:// or https://).</p>
            )}
          </div>

          {parsed && (
            <div className="space-y-4">
              <div className="rounded-xl border border-(--border) bg-(--card)">
                <h3 className="border-b border-(--border) px-4 py-3 font-semibold">Components</h3>
                <div className="divide-y divide-(--border) p-4">
                  {[
                    { label: "Full URL", value: parsed.href, key: "href" },
                    { label: "Protocol", value: parsed.protocol, key: "protocol" },
                    { label: "Origin", value: parsed.origin, key: "origin" },
                    { label: "Host", value: parsed.host, key: "host" },
                    { label: "Hostname", value: parsed.hostname, key: "hostname" },
                    { label: "Port", value: parsed.port || "(default)", key: "port" },
                    { label: "Pathname", value: parsed.pathname || "/", key: "pathname" },
                    { label: "Search", value: parsed.search || "(none)", key: "search" },
                    { label: "Hash", value: parsed.hash || "(none)", key: "hash" },
                  ].map(({ label, value, key }) => (
                    <div key={key} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
                      <span className="shrink-0 text-sm font-medium text-muted w-24">{label}</span>
                      <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                        {value}
                      </code>
                      <button
                        onClick={() => copy(value, label)}
                        className="shrink-0 rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {parsed.pathSegments.length > 0 && (
                <div className="rounded-xl border border-(--border) bg-(--card)">
                  <h3 className="border-b border-(--border) px-4 py-3 font-semibold">Path segments</h3>
                  <div className="flex flex-wrap gap-2 p-4">
                    {parsed.pathSegments.map((seg, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-md border border-(--border) bg-(--card-hover) px-2 py-1 font-mono text-sm"
                      >
                        <span className="text-muted">{i}</span>
                        <code className="text-(--accent)">{seg}</code>
                        <button
                          onClick={() => copy(seg, "Segment")}
                          className="text-xs text-muted hover:text-(--accent)"
                        >
                          Copy
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-(--border) bg-(--card)">
                <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
                  <h3 className="font-semibold">Query parameters</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        copy(
                          parsed.params.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&"),
                          "Query string (encoded)"
                        )
                      }
                      className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
                    >
                      Copy encoded
                    </button>
                    <button
                      onClick={() =>
                        copy(
                          parsed.params.map((p) => `${p.key}=${p.value}`).join("&"),
                          "Query string"
                        )
                      }
                      className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
                    >
                      Copy raw
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="pb-2 font-medium">Key</th>
                        <th className="pb-2 font-medium">Value</th>
                        <th className="pb-2 font-medium">Encoded</th>
                        <th className="w-16 pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.params.map((p, i) => (
                        <tr key={i} className="border-t border-(--border)">
                          <td className="py-2 font-mono text-(--accent)">{p.key}</td>
                          <td className="py-2 font-mono">{p.value}</td>
                          <td className="py-2 font-mono text-xs text-muted">
                            {encodeURIComponent(p.key)}={encodeURIComponent(p.value)}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() =>
                                copy(`${p.key}=${p.value}`, "Parameter")
                              }
                              className="text-xs text-muted hover:text-(--accent)"
                            >
                              Copy
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "encode" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-muted">Encode mode</label>
            <select
              value={encodeMode}
              onChange={(e) => setEncodeMode(e.target.value as "component" | "full")}
              className="rounded border border-(--border) bg-(--card) px-3 py-1.5 text-sm"
            >
              <option value="component">encodeURIComponent (for query values)</option>
              <option value="full">encodeURI (for full URL, preserves :/?#)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Text to encode
            </label>
            <textarea
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              placeholder="Enter text to encode..."
              className="min-h-[100px] w-full rounded-xl border border-(--border) bg-(--card) p-4 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            />
          </div>
          {encodeInput && (
            <div className="rounded-xl border border-(--border) bg-(--card) p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Encoded</span>
                <button
                  onClick={() => copy(encodeText(encodeInput, encodeMode), "Encoded text")}
                  className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
                >
                  Copy
                </button>
              </div>
              <code className="block break-all font-mono text-sm text-foreground">
                {encodeText(encodeInput, encodeMode)}
              </code>
            </div>
          )}
        </div>
      )}

      {activeTab === "decode" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-muted">Decode mode</label>
            <select
              value={decodeMode}
              onChange={(e) => setDecodeMode(e.target.value as "component" | "full")}
              className="rounded border border-(--border) bg-(--card) px-3 py-1.5 text-sm"
            >
              <option value="component">decodeURIComponent</option>
              <option value="full">decodeURI</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              URL-encoded text to decode
            </label>
            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="Enter encoded text (e.g. hello%20world)"
              className="min-h-[100px] w-full rounded-xl border border-(--border) bg-(--card) p-4 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            />
          </div>
          {decodeInput && (
            <div className="rounded-xl border border-(--border) bg-(--card) p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Decoded</span>
                <button
                  onClick={() => copy(decodeText(decodeInput, decodeMode), "Decoded text")}
                  className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
                >
                  Copy
                </button>
              </div>
              <code className="block break-all font-mono text-sm text-foreground">
                {decodeText(decodeInput, decodeMode)}
              </code>
            </div>
          )}
        </div>
      )}

      {activeTab === "build" && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Base URL</label>
            <input
              value={builderBase}
              onChange={(e) => setBuilderBase(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full rounded-xl border border-(--border) bg-(--card) px-4 py-3 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Path</label>
            <input
              value={builderPath}
              onChange={(e) => setBuilderPath(e.target.value)}
              placeholder="/v1/users"
              className="w-full rounded-xl border border-(--border) bg-(--card) px-4 py-3 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-muted">Query parameters</label>
              <button
                onClick={addBuilderParam}
                className="text-xs text-(--accent) hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {builderParams.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={p.key}
                    onChange={(e) => updateBuilderParam(i, "key", e.target.value)}
                    placeholder="Key"
                    className="flex-1 rounded border border-(--border) bg-(--card) px-3 py-2 font-mono text-sm"
                  />
                  <input
                    value={p.value}
                    onChange={(e) => updateBuilderParam(i, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 rounded border border-(--border) bg-(--card) px-3 py-2 font-mono text-sm"
                  />
                  <button
                    onClick={() => removeBuilderParam(i)}
                    className="rounded border border-red-500/50 px-2 text-red-400 hover:bg-red-500/10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Hash (optional)</label>
            <input
              value={builderHash}
              onChange={(e) => setBuilderHash(e.target.value)}
              placeholder="section or #section"
              className="w-full rounded-xl border border-(--border) bg-(--card) px-4 py-3 font-mono text-sm placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            />
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Built URL</span>
              <button
                onClick={() => copy(builtUrl, "URL")}
                className="rounded border border-(--border) px-2 py-1 text-xs text-muted hover:border-(--accent) hover:text-(--accent)"
              >
                Copy
              </button>
            </div>
            <code className="block break-all font-mono text-sm text-foreground">
              {builtUrl}
            </code>
            <button
              onClick={() => {
                setInput(builtUrl);
                setActiveTab("parse");
                toast.success("Switched to Parse");
              }}
              className="mt-2 text-xs text-(--accent) hover:underline"
            >
              Parse this URL →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
