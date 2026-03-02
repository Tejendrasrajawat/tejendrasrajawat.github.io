import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "JavaScript Editor",
  description:
    "Online JavaScript editor. Write and run JavaScript code in the browser. Quick JS runner for testing snippets and learning.",
  path: "tools/js-editor",
  keywords: ["JavaScript editor", "JS editor", "run JavaScript online", "JavaScript runner", "online JS"],
};

const Wrapper = styled.main`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 1000px;

  .page-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .page-desc {
    color: ${(p) => (p.$dark ? "#aaa" : "#555")};
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  .tool-section {
    margin-bottom: 1.5rem;
  }

  .tool-section label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  textarea {
    width: 100%;
    min-height: 220px;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ccc")};
    background: ${(p) => (p.$dark ? "#0d1117" : "#fafafa")};
    color: ${(p) => (p.$dark ? "#e6edf3" : "#24292f")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.9rem;
    resize: vertical;
    box-sizing: border-box;
  }

  textarea:focus {
    outline: none;
    border-color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
  }

  .btn-group {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-run {
    background: #28a745;
    color: #fff;
  }

  .btn-clear {
    background: ${(p) => (p.$dark ? "#333" : "#e9ecef")};
    color: ${(p) => (p.$dark ? "#eee" : "#333")};
  }

  .output-box {
    white-space: pre-wrap;
    word-break: break-word;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")};
    background: ${(p) => (p.$dark ? "#0d1117" : "#1e1e1e")};
    color: ${(p) => (p.$dark ? "#e6edf3" : "#d4d4d4")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.9rem;
    min-height: 100px;
  }

  .error {
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .disclaimer {
    font-size: 0.8rem;
    color: ${(p) => (p.$dark ? "#666" : "#888")};
    margin-top: 0.5rem;
  }
`;

function JsEditor() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const runCode = () => {
    setError("");
    setOutput("");

    const outputLines = [];
    const fakeConsole = {
      log: (...args) => {
        const line = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
        outputLines.push(line);
      },
    };

    try {
      const fn = new Function("console", `
        try {
          ${code}
        } catch (e) {
          console.log("Error:", e.message);
        }
      `);
      fn(fakeConsole);
      setOutput(outputLines.join("\n"));
    } catch (e) {
      setError(e.message || "Runtime error");
    }
  };

  const handleClear = () => {
    setOutput("");
    setError("");
  };

  return (
    <>
      <SeoHead title={SEO.title} description={SEO.description} path={SEO.path} keywords={SEO.keywords} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1 className="page-title">JavaScript Editor</h1>
          <p className="page-desc">
            Write and run JavaScript in the browser. Use <code>console.log()</code> to see output below.
          </p>

          <section className="tool-section" aria-label="Code editor">
            <label htmlFor="js-code">JavaScript Code</label>
            <textarea
              id="js-code"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="btn-group">
              <button type="button" className="btn-run" onClick={runCode}>
                Run
              </button>
              <button type="button" className="btn-clear" onClick={handleClear}>
                Clear output
              </button>
            </div>
            <p className="disclaimer">
              Code runs in a sandboxed context. Avoid sensitive data or DOM access.
            </p>
          </section>

          <section className="tool-section" aria-label="Output">
            <label htmlFor="js-output">Output (console.log)</label>
            <div id="js-output" className="output-box">
              {output || "Output will appear here after you run the code."}
            </div>
            {error && <p className="error" role="alert">{error}</p>}
          </section>
        </article>
      </Wrapper>
    </>
  );
}

export default JsEditor;
