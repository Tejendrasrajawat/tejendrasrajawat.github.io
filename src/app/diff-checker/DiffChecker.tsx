"use client";

import { useState, useCallback } from "react";

type DiffFormat = "plain" | "json" | "xml" | "code";

function normalizeJson(str: string): { result: string } | { error: string } {
  if (!str.trim()) return { result: "" };
  try {
    const parsed = JSON.parse(str);
    const normalized = sortKeysRecursive(parsed);
    return { result: JSON.stringify(normalized, null, 2) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function sortKeysRecursive(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysRecursive);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce(
        (acc, k) => {
          acc[k] = sortKeysRecursive((obj as Record<string, unknown>)[k]);
          return acc;
        },
        {} as Record<string, unknown>
      );
  }
  return obj;
}

function formatXml(str: string): { result: string } | { error: string } {
  if (!str.trim()) return { result: "" };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, "text/xml");
    const error = doc.querySelector("parsererror");
    if (error) return { error: "Invalid XML" };
    return { result: prettyPrintXml(doc.documentElement, 0) };
  } catch {
    return { error: "Invalid XML" };
  }
}

function prettyPrintXml(node: Element, indent: number): string {
  const pad = "  ".repeat(indent);
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tagName = el.tagName;
    const attrs = Array.from(el.attributes)
      .map((a) => ` ${a.name}="${a.value.replace(/"/g, "&quot;")}"`)
      .join("");
    const children = Array.from(el.childNodes).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE
    );
    const hasElementChildren = children.some((n) => n.nodeType === Node.ELEMENT_NODE);
    const textContent = children
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .join("")
      .trim();

    if (children.length === 0 || (children.length === 1 && textContent)) {
      const inner = textContent || "";
      return `${pad}<${tagName}${attrs}>${inner}</${tagName}>`;
    }
    const inner = children
      .map((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          return prettyPrintXml(n as Element, indent + 1);
        }
        const t = n.textContent?.trim();
        return t ? `${pad}  ${t}` : "";
      })
      .filter(Boolean)
      .join("\n");
    return `${pad}<${tagName}${attrs}>\n${inner}\n${pad}</${tagName}>`;
  }
  return "";
}

type CodeToken = { type: "string" | "comment" | "number" | "keyword" | "plain"; value: string };

function tokenizeCode(line: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  const keywords = new Set([
    "function", "return", "const", "let", "var", "if", "else", "for", "while",
    "class", "extends", "import", "export", "default", "from", "async", "await",
    "try", "catch", "throw", "new", "typeof", "instanceof", "true", "false", "null",
    "undefined", "this", "super", "in", "of",
  ]);
  let i = 0;

  while (i < line.length) {
    if (line.slice(i, i + 2) === "//") {
      tokens.push({ type: "comment", value: line.slice(i) });
      break;
    }
    if (line.slice(i, i + 2) === "/*") {
      const end = line.indexOf("*/", i + 2);
      tokens.push({
        type: "comment",
        value: end >= 0 ? line.slice(i, end + 2) : line.slice(i),
      });
      i = end >= 0 ? end + 2 : line.length;
      continue;
    }
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let value = quote;
      i++;
      while (i < line.length) {
        if (line[i] === "\\") {
          value += line.slice(i, i + 2);
          i += 2;
          continue;
        }
        if (line[i] === quote) {
          value += quote;
          i++;
          break;
        }
        value += line[i];
        i++;
      }
      tokens.push({ type: "string", value });
      continue;
    }
    if (/[0-9]/.test(line[i])) {
      let value = "";
      while (i < line.length && /[0-9.xXeE+-]/.test(line[i])) {
        value += line[i];
        i++;
      }
      tokens.push({ type: "number", value });
      continue;
    }
    if (/[a-zA-Z_$]/.test(line[i])) {
      let value = "";
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        value += line[i];
        i++;
      }
      tokens.push({
        type: keywords.has(value) ? "keyword" : "plain",
        value,
      });
      continue;
    }
    tokens.push({ type: "plain", value: line[i] });
    i++;
  }
  return tokens;
}

function CodeHighlight({ content, className }: { content: string; className?: string }) {
  const tokens = tokenizeCode(content);
  return (
    <span className={className}>
      {tokens.map((t, i) => (
        <span key={i} className={`diff-code-${t.type}`}>
          {t.value}
        </span>
      ))}
    </span>
  );
}

type JsonToken =
  | { type: "key" | "string" | "number" | "boolean" | "null" | "punctuation"; value: string };

function tokenizeJsonForDiff(str: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;
  const peek = (from: number) => {
    let j = from;
    while (j < str.length && /\s/.test(str[j])) j++;
    return str[j];
  };
  while (i < str.length) {
    const c = str[i];
    if (c === '"') {
      let value = '"';
      i++;
      while (i < str.length) {
        if (str[i] === "\\") {
          value += str.slice(i, i + 2);
          i += 2;
          continue;
        }
        if (str[i] === '"') {
          value += '"';
          i++;
          break;
        }
        value += str[i++];
      }
      tokens.push({ type: peek(i) === ":" ? "key" : "string", value });
      continue;
    }
    if (/[0-9-]/.test(c)) {
      let value = "";
      while (i < str.length && /[0-9.eE+-]/.test(str[i])) value += str[i++];
      tokens.push({ type: "number", value });
      continue;
    }
    if (str.slice(i, i + 4) === "true") {
      tokens.push({ type: "boolean", value: "true" });
      i += 4;
      continue;
    }
    if (str.slice(i, i + 5) === "false") {
      tokens.push({ type: "boolean", value: "false" });
      i += 5;
      continue;
    }
    if (str.slice(i, i + 4) === "null") {
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }
    if (c === ":" || c === "," || c === "{" || c === "}" || c === "[" || c === "]") {
      tokens.push({ type: "punctuation", value: c });
      i++;
      continue;
    }
    tokens.push({ type: "punctuation", value: c });
    i++;
  }
  return tokens;
}

function JsonHighlight({ content, className }: { content: string; className?: string }) {
  const tokens = tokenizeJsonForDiff(content);
  return (
    <span className={className}>
      {tokens.map((t, i) => (
        <span key={i} className={`json-${t.type}`}>
          {t.value}
        </span>
      ))}
    </span>
  );
}

type XmlToken = { type: "tag" | "plain"; value: string };

function tokenizeXmlForDiff(str: string): XmlToken[] {
  const tokens: XmlToken[] = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === "<") {
      let value = "";
      while (i < str.length && str[i] !== ">") value += str[i++];
      if (i < str.length) value += str[i++];
      tokens.push({ type: "tag", value });
      continue;
    }
    let value = "";
    while (i < str.length && str[i] !== "<") value += str[i++];
    if (value) tokens.push({ type: "plain", value });
  }
  return tokens;
}

function XmlHighlight({ content, className }: { content: string; className?: string }) {
  const tokens = tokenizeXmlForDiff(content);
  return (
    <span className={className}>
      {tokens.map((t, i) => (
        <span key={i} className={`diff-xml-${t.type}`}>
          {t.value}
        </span>
      ))}
    </span>
  );
}

function preprocessForDiff(
  text: string,
  format: DiffFormat
): { text: string; error?: string } {
  if (format === "json") {
    const r = normalizeJson(text);
    if ("error" in r) return { text, error: r.error };
    return { text: r.result };
  }
  if (format === "xml") {
    const r = formatXml(text);
    if ("error" in r) return { text, error: r.error };
    return { text: r.result };
  }
  return { text };
}

type DiffLine =
  | { type: "unchanged"; oldLine: number; newLine: number; content: string }
  | { type: "removed"; oldLine: number; content: string }
  | { type: "added"; newLine: number; content: string };

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = m;
  let j = n;
  let oldLineNum = m;
  let newLineNum = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({
        type: "unchanged",
        oldLine: i,
        newLine: j,
        content: oldLines[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", newLine: j, content: newLines[j - 1] });
      j--;
    } else {
      result.unshift({ type: "removed", oldLine: i, content: oldLines[i - 1] });
      i--;
    }
  }

  return result;
}

function DiffLineContent({
  content,
  format,
  variant,
}: {
  content: string;
  format: DiffFormat;
  variant: "removed" | "added" | "unchanged";
}) {
  const baseClass = "flex-1 overflow-x-auto px-3 py-1 whitespace-pre";
  const colorClass =
    variant === "removed"
      ? "text-red-400"
      : variant === "added"
        ? "text-green-400"
        : "";

  if (format === "code" && content.trim()) {
    return (
      <span className={`${baseClass} ${colorClass} font-mono text-sm`}>
        <CodeHighlight content={content || " "} />
      </span>
    );
  }

  if (format === "json" && content.trim()) {
    return (
      <span className={`${baseClass} ${colorClass} font-mono text-sm`}>
        <JsonHighlight content={content || " "} />
      </span>
    );
  }

  if (format === "xml" && content.trim()) {
    return (
      <span className={`${baseClass} ${colorClass} font-mono text-sm`}>
        <XmlHighlight content={content || " "} />
      </span>
    );
  }

  return (
    <span className={`${baseClass} ${colorClass} font-mono text-sm`}>
      {content || " "}
    </span>
  );
}

function DiffView({
  lines,
  format,
}: {
  lines: DiffLine[];
  format: DiffFormat;
}) {
  return (
    <div className="grid grid-cols-2 gap-0 border border-(--border) rounded-xl overflow-hidden">
      <div className="border-r border-(--border)">
        <div className="bg-(--card-hover) px-3 py-2 text-xs font-medium text-muted border-b border-(--border)">
          Original
        </div>
        <div className="font-mono text-sm">
          {lines.map((line, i) => {
            if (line.type === "removed") {
              return (
                <div
                  key={i}
                  className="flex border-b border-(--border) bg-red-500/10"
                >
                  <span className="w-12 shrink-0 bg-red-500/20 px-2 py-1 text-right text-muted select-none border-r border-(--border)">
                    {line.oldLine}
                  </span>
                  <DiffLineContent
                    content={line.content}
                    format={format}
                    variant="removed"
                  />
                </div>
              );
            }
            if (line.type === "unchanged") {
              return (
                <div key={i} className="flex border-b border-(--border)">
                  <span className="w-12 shrink-0 bg-(--card) px-2 py-1 text-right text-muted select-none border-r border-(--border)">
                    {line.oldLine}
                  </span>
                  <DiffLineContent
                    content={line.content}
                    format={format}
                    variant="unchanged"
                  />
                </div>
              );
            }
            return (
              <div
                key={i}
                className="flex border-b border-(--border) bg-(--card)"
              >
                <span className="w-12 shrink-0 bg-(--card) px-2 py-1 text-right text-muted select-none border-r border-(--border)">
                  {" "}
                </span>
                <span className="flex-1 overflow-x-auto px-3 py-1 text-muted/50 whitespace-pre">
                  {" "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className="bg-(--card-hover) px-3 py-2 text-xs font-medium text-muted border-b border-(--border)">
          Modified
        </div>
        <div className="font-mono text-sm">
          {lines.map((line, i) => {
            if (line.type === "added") {
              return (
                <div
                  key={i}
                  className="flex border-b border-(--border) bg-green-500/10"
                >
                  <span className="w-12 shrink-0 bg-green-500/20 px-2 py-1 text-right text-muted select-none border-r border-(--border)">
                    {line.newLine}
                  </span>
                  <DiffLineContent
                    content={line.content}
                    format={format}
                    variant="added"
                  />
                </div>
              );
            }
            if (line.type === "unchanged") {
              return (
                <div key={i} className="flex border-b border-(--border)">
                  <span className="w-12 shrink-0 bg-(--card) px-2 py-1 text-right text-muted select-none border-r border-(--border)">
                    {line.newLine}
                  </span>
                  <DiffLineContent
                    content={line.content}
                    format={format}
                    variant="unchanged"
                  />
                </div>
              );
            }
            return (
              <div
                key={i}
                className="flex border-b border-(--border) bg-(--card)"
              >
                <span className="w-12 shrink-0 bg-(--card) px-2 py-1 text-right text-muted select-none border-r border-(--border)">
                  {" "}
                </span>
                <span className="flex-1 overflow-x-auto px-3 py-1 text-muted/50 whitespace-pre">
                  {" "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DiffChecker() {
  const [original, setOriginal] = useState(`function greet() {
  console.log("Hello");
  return true;
}`);
  const [modified, setModified] = useState(`function greet() {
  console.log("Hello, World!");
  return true;
}`);
  const [format, setFormat] = useState<DiffFormat>("code");

  const origPreprocessed = preprocessForDiff(original, format);
  const modPreprocessed = preprocessForDiff(modified, format);
  const diffLines = computeDiff(origPreprocessed.text, modPreprocessed.text);

  const formatErrors: string[] = [];
  if (origPreprocessed.error) formatErrors.push(`Original: ${origPreprocessed.error}`);
  if (modPreprocessed.error) formatErrors.push(`Modified: ${modPreprocessed.error}`);
  const formatError =
    formatErrors.length > 0 ? formatErrors.join(" • ") : null;

  const handleClear = useCallback(() => {
    setOriginal("");
    setModified("");
  }, []);

  const handleSwap = useCallback(() => {
    setOriginal(modified);
    setModified(original);
  }, [original, modified]);

  const stats = {
    added: diffLines.filter((l) => l.type === "added").length,
    removed: diffLines.filter((l) => l.type === "removed").length,
    unchanged: diffLines.filter((l) => l.type === "unchanged").length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="diff-format"
            className="text-sm font-medium text-muted"
          >
            Format
          </label>
          <select
            id="diff-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as DiffFormat)}
            className="select-indent cursor-pointer appearance-none rounded-lg border border-(--border) bg-(--card) px-4 py-2 pr-9 text-sm font-mono text-foreground transition-colors hover:border-(--accent)/50 hover:bg-(--card-hover) focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent)/20"
          >
            <option value="plain">Plain text</option>
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="code">Code</option>
          </select>
        </div>
        <button
          onClick={handleSwap}
          className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:border-(--accent) hover:bg-(--accent-muted)"
          title="Swap original and modified"
        >
          Swap
        </button>
        <button
          onClick={handleClear}
          className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-(--accent) hover:text-foreground"
        >
          Clear
        </button>
        <div className="ml-auto flex gap-4 text-sm text-muted">
          <span>
            <span className="font-medium text-red-400">{stats.removed}</span>{" "}
            removed
          </span>
          <span>
            <span className="font-medium text-green-400">{stats.added}</span> added
          </span>
          <span>
            <span className="font-medium text-foreground">{stats.unchanged}</span>{" "}
            unchanged
          </span>
        </div>
      </div>

      {/* Format error */}
      {formatError && (format === "json" || format === "xml") && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 font-mono text-sm text-amber-400">
          Parse error — showing raw diff. {formatError}
        </div>
      )}

      {/* Input area */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col">
          <label
            htmlFor="diff-original"
            className="mb-2 text-sm font-medium text-muted"
          >
            Original
          </label>
          <textarea
            id="diff-original"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste or type the original text..."
            className="min-h-[300px] resize-y rounded-xl border border-(--border) bg-(--card) p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="diff-modified"
            className="mb-2 text-sm font-medium text-muted"
          >
            Modified
          </label>
          <textarea
            id="diff-modified"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste or type the modified text..."
            className="min-h-[300px] resize-y rounded-xl border border-(--border) bg-(--card) p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff output */}
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-medium text-muted">
          Diff view
        </label>
        <div className="min-h-[300px] overflow-auto rounded-xl">
          <DiffView lines={diffLines} format={format} />
        </div>
      </div>
    </div>
  );
}
