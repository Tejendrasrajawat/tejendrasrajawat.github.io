import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "JSON Viewer",
  description:
    "Free online JSON viewer. Format, validate, and visualize JSON data with a tree view. Pretty print JSON for debugging and development.",
  path: "tools/json-viewer",
  keywords: ["JSON viewer", "JSON formatter", "pretty print JSON", "validate JSON", "JSON tree"],
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
    min-height: 180px;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ccc")};
    background: ${(p) => (p.$dark ? "#111" : "#fafafa")};
    color: ${(p) => (p.$dark ? "#eee" : "#222")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.9rem;
    resize: vertical;
    box-sizing: border-box;
  }

  textarea:focus {
    outline: none;
    border-color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
    box-shadow: 0 0 0 2px ${(p) => (p.$dark ? "#6ea8fe33" : "#0d6efd33")};
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

  .btn-format {
    background: #0d6efd;
    color: #fff;
  }

  .btn-clear {
    background: ${(p) => (p.$dark ? "#333" : "#e9ecef")};
    color: ${(p) => (p.$dark ? "#eee" : "#333")};
  }

  button:hover {
    opacity: 0.9;
  }

  .error {
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .output {
    white-space: pre-wrap;
    word-break: break-all;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")};
    background: ${(p) => (p.$dark ? "#0d1117" : "#f8f9fa")};
    color: ${(p) => (p.$dark ? "#e6edf3" : "#24292f")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.9rem;
    min-height: 80px;
  }
`;

function JsonViewer() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [formatted, setFormatted] = useState("");

  const handleFormat = () => {
    setError("");
    if (!input.trim()) {
      setFormatted("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setFormatted(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(e.message || "Invalid JSON");
      setFormatted("");
    }
  };

  const handleClear = () => {
    setInput("");
    setFormatted("");
    setError("");
  };

  return (
    <>
      <SeoHead title={SEO.title} description={SEO.description} path={SEO.path} keywords={SEO.keywords} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1 className="page-title">JSON Viewer</h1>
          <p className="page-desc">
            Paste or type JSON below to format and validate it. Get a readable, indented view for debugging and development.
          </p>

          <section className="tool-section" aria-label="JSON input">
            <label htmlFor="json-input">JSON Input</label>
            <textarea
              id="json-input"
              placeholder='{"name": "example", "items": [1, 2, 3]}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-describedby={error ? "json-error" : undefined}
            />
            <div className="btn-group">
              <button type="button" className="btn-format" onClick={handleFormat}>
                Format / Validate
              </button>
              <button type="button" className="btn-clear" onClick={handleClear}>
                Clear
              </button>
            </div>
            {error && (
              <p id="json-error" className="error" role="alert">
                {error}
              </p>
            )}
          </section>

          <section className="tool-section" aria-label="Formatted output">
            <label htmlFor="json-output">Formatted JSON</label>
            <div id="json-output" className="output">
              {formatted || "Formatted output will appear here."}
            </div>
          </section>
        </article>
      </Wrapper>
    </>
  );
}

export default JsonViewer;
