"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
      const isKey = peekNextNonSpace(i) === ":";
      tokens.push({ type: isKey ? "key" : "string", value });
      continue;
    }

    if (char === ":" || char === "," || char === "{" || char === "}" || char === "[" || char === "]") {
      tokens.push({ type: "punctuation", value: char });
      i++;
      continue;
    }

    if (/[0-9-]/.test(char)) {
      let value = "";
      while (i < str.length && /[0-9.eE+-]/.test(str[i])) {
        value += str[i];
        i++;
      }
      if (value) tokens.push({ type: "number", value });
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

    if (/\s/.test(char)) {
      tokens.push({ type: "punctuation", value: char });
      i++;
      continue;
    }

    tokens.push({ type: "punctuation", value: char });
    i++;
  }

  return tokens;
}

function JsonHighlight({ value, className }: { value: string; className?: string }) {
  const tokens = tokenizeJson(value);
  if (!value) return null;

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return (
    <pre
      className={`font-mono text-sm leading-relaxed whitespace-pre-wrap break-words ${className ?? ""}`}
      aria-hidden
    >
      <code>
        {tokens.map((token, i) => (
          <span key={i} className={`json-${token.type}`}>
            {escape(token.value)}
          </span>
        ))}
      </code>
    </pre>
  );
}

function JsonEditor({
  value,
  onChange,
  placeholder,
  readOnly,
  className,
  wrapperClassName,
  id,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  wrapperClassName?: string;
  id?: string;
}) {
  const mirrorRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (mirrorRef.current) {
      mirrorRef.current.scrollTop = target.scrollTop;
      mirrorRef.current.scrollLeft = target.scrollLeft;
    }
  }, []);

  const baseClass =
    "absolute inset-0 min-h-[400px] w-full resize-y rounded-xl border border-(--border) bg-transparent p-4 font-mono text-sm leading-relaxed placeholder:text-muted focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)";
  const wrapperClass = `relative min-h-[400px] ${wrapperClassName ?? ""}`;

  if (readOnly) {
    return (
      <div className={`min-h-[400px] overflow-auto rounded-xl border border-(--border) bg-(--card) p-4 ${wrapperClassName ?? ""}`}>
        <JsonHighlight
          value={value || placeholder || " "}
          className="min-h-[400px] block select-text"
        />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div
        ref={mirrorRef}
        className="pointer-events-none absolute inset-0 overflow-auto rounded-xl border border-(--border) bg-(--card) p-4"
      >
        <JsonHighlight
          value={value || placeholder || " "}
          className="min-h-[400px] block"
        />
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        className={`${baseClass} text-transparent caret-(--accent) ${className ?? ""}`}
        style={{ background: "transparent" }}
      />
    </div>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function FullscreenPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
        <h3 className="text-sm font-medium text-muted">{title}</h3>
        <button
          onClick={onClose}
          className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:border-(--accent) hover:bg-(--accent-muted)"
          aria-label="Exit full screen"
        >
          Exit full screen
        </button>
      </div>
      <div className="flex-1 overflow-hidden p-4">{children}</div>
    </div>
  );
}

type FormatResult =
  | { success: true; output: string }
  | { success: false; error: string };

function formatJson(
  input: string,
  indent: number | "\t"
): FormatResult {
  if (!input.trim()) {
    return { success: false, error: "Input is empty" };
  }
  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed, null, indent);
    return { success: true, output };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return { success: false, error: message };
  }
}

function minifyJson(input: string): FormatResult {
  if (!input.trim()) {
    return { success: false, error: "Input is empty" };
  }
  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed);
    return { success: true, output };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return { success: false, error: message };
  }
}

function validateJson(input: string): FormatResult {
  if (!input.trim()) {
    return { success: false, error: "Input is empty" };
  }
  try {
    JSON.parse(input);
    return { success: true, output: "✓ Valid JSON" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return { success: false, error: message };
  }
}

export default function JsonFormatter() {
  const [input, setInput] = useState(
    '{\n  "name": "DevKit",\n  "tools": ["JSON Formatter", "API Tester"],\n  "active": true\n}'
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<number | "\t">(2);
  const [fullscreen, setFullscreen] = useState<"input" | "output" | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(null);
    };
    if (fullscreen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  const handleFormat = useCallback(() => {
    setError(null);
    const result = formatJson(input, indent === 0 ? "\t" : indent);
    if (result.success) {
      setOutput(result.output);
    } else {
      setError(result.error);
      setOutput("");
    }
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    setError(null);
    const result = minifyJson(input);
    if (result.success) {
      setOutput(result.output);
    } else {
      setError(result.error);
      setOutput("");
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    setError(null);
    const result = validateJson(input);
    if (result.success) {
      setOutput(result.output);
      setError(null);
      toast.success("Valid JSON");
    } else {
      setError(result.error);
      setOutput("");
      toast.error("Invalid JSON");
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleFormat}
          className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-(--accent-hover)"
        >
          Beautify
        </button>
        <button
          onClick={handleMinify}
          className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:border-(--accent) hover:bg-(--accent-muted)"
        >
          Minify
        </button>
        <button
          onClick={handleValidate}
          className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:border-(--accent) hover:bg-(--accent-muted)"
        >
          Validate
        </button>
        <div className="flex items-center gap-3 border-l border-(--border) pl-4">
          <label
            htmlFor="indent"
            className="text-sm font-medium text-muted"
          >
            Indent
          </label>
          <select
            id="indent"
            value={indent === "\t" ? "tab" : indent}
            onChange={(e) =>
              setIndent(
                e.target.value === "tab" ? "\t" : Number(e.target.value)
              )
            }
            className="select-indent cursor-pointer appearance-none rounded-lg border border-(--border) bg-(--card) px-4 py-2 pr-9 text-sm font-mono text-foreground transition-colors hover:border-(--accent)/50 hover:bg-(--card-hover) focus:border-(--accent) focus:outline-none focus:ring-2 focus:ring-(--accent)/20"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!output}
            className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:border-(--accent) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-(--accent) hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Editor area */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className={`flex flex-col ${fullscreen === "input" ? "hidden" : ""}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="json-input"
              className="text-sm font-medium text-muted"
            >
              Input JSON
            </label>
            <button
              onClick={() => setFullscreen("input")}
              className="rounded p-1.5 text-muted transition-colors hover:bg-(--accent-muted) hover:text-(--accent)"
              title="Full screen"
              aria-label="Expand input to full screen"
            >
              <ExpandIcon className="h-4 w-4" />
            </button>
          </div>
          <JsonEditor
            id="json-input"
            value={input}
            onChange={setInput}
            placeholder='{"example": "Paste or type JSON here"}'
          />
        </div>
        <div
          className={`flex flex-col ${fullscreen === "output" ? "hidden" : ""}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="json-output"
              className="text-sm font-medium text-muted"
            >
              Output
            </label>
            <button
              onClick={() => setFullscreen("output")}
              className="rounded p-1.5 text-muted transition-colors hover:bg-(--accent-muted) hover:text-(--accent)"
              title="Full screen"
              aria-label="Expand output to full screen"
            >
              <ExpandIcon className="h-4 w-4" />
            </button>
          </div>
          <JsonEditor
            id="json-output"
            value={output}
            readOnly
            placeholder="Formatted or minified JSON will appear here"
          />
        </div>
      </div>

      {/* Fullscreen overlays */}
      {fullscreen === "input" && (
        <FullscreenPanel
          title="Input JSON"
          onClose={() => setFullscreen(null)}
        >
          <div className="h-full overflow-auto rounded-xl border border-(--border) bg-(--card) p-6">
            <JsonEditor
              value={input}
              onChange={setInput}
              placeholder='{"example": "Paste or type JSON here"}'
              wrapperClassName="!min-h-full h-full"
            />
          </div>
        </FullscreenPanel>
      )}
      {fullscreen === "output" && (
        <FullscreenPanel
          title="Output"
          onClose={() => setFullscreen(null)}
        >
          <div className="h-full overflow-auto rounded-xl border border-(--border) bg-(--card) p-6">
            <JsonEditor
              value={output}
              readOnly
              placeholder="Formatted or minified JSON will appear here"
              wrapperClassName="!min-h-full h-full"
            />
          </div>
        </FullscreenPanel>
      )}
    </div>
  );
}
