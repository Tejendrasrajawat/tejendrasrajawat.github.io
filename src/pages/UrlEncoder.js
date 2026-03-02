import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "URL Encoder / Decoder",
  description:
    "Free online URL encoder and decoder. Percent-encode or decode URLs and query strings. Privacy-first — runs entirely in your browser.",
  path: "tools/url-encoder-decoder",
  keywords: ["URL encoder", "URL decoder", "percent encoding", "encode URL online", "decode URL"],
};

const Wrapper = styled.main`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 900px;

  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }

  .desc {
    color: ${(p) => (p.$dark ? "#aaa" : "#555")};
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  .section { margin-bottom: 1.5rem; }

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  textarea {
    width: 100%;
    min-height: 120px;
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
  }

  .btn-group { display: flex; gap: 0.75rem; margin: 0.75rem 0; }

  button {
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-primary { background: #0d6efd; color: #fff; }
  .btn-secondary {
    background: ${(p) => (p.$dark ? "#333" : "#e9ecef")};
    color: ${(p) => (p.$dark ? "#eee" : "#333")};
  }

  button:hover { opacity: 0.9; }

  .error { color: #dc3545; font-size: 0.9rem; margin-top: 0.5rem; }
`;

function UrlEncoder() {
  const { state: { darkMode } } = useContext(ThemeContext);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    setError("");
    try { setOutput(encodeURIComponent(input)); } catch (e) { setError(e.message); }
  };

  const decode = () => {
    setError("");
    try { setOutput(decodeURIComponent(input)); } catch (e) { setError("Invalid percent-encoded string."); }
  };

  return (
    <>
      <SeoHead {...SEO} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1>URL Encoder / Decoder</h1>
          <p className="desc">Encode or decode URLs and query parameters. No data leaves your browser.</p>

          <div className="section">
            <label htmlFor="url-input">Input</label>
            <textarea id="url-input" placeholder="https://example.com/path?q=hello world" value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="btn-group">
              <button type="button" className="btn-primary" onClick={encode}>Encode</button>
              <button type="button" className="btn-primary" onClick={decode}>Decode</button>
              <button type="button" className="btn-secondary" onClick={() => { setInput(""); setOutput(""); setError(""); }}>Clear</button>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
          </div>

          <div className="section">
            <label htmlFor="url-output">Result</label>
            <textarea id="url-output" readOnly value={output} placeholder="Result will appear here" />
          </div>
        </article>
      </Wrapper>
    </>
  );
}

export default UrlEncoder;
