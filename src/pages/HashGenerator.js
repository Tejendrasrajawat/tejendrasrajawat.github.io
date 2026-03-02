import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "Hash Generator (SHA-256 / SHA-1 / MD5)",
  description:
    "Generate SHA-256, SHA-384, SHA-512, and SHA-1 hashes online. Free client-side hash calculator for text strings. No data sent to any server.",
  path: "tools/hash-generator",
  keywords: ["hash generator", "SHA-256 hash", "SHA-1 hash", "online hash", "hash calculator"],
};

const ALGORITHMS = ["SHA-256", "SHA-384", "SHA-512", "SHA-1"];

async function computeHash(algo, text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

  .result-block {
    margin-bottom: 0.75rem;
  }

  .result-label {
    font-weight: 700;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
  }

  .result-hash {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")};
    background: ${(p) => (p.$dark ? "#0d1117" : "#f8f9fa")};
    color: ${(p) => (p.$dark ? "#e6edf3" : "#24292f")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.85rem;
    word-break: break-all;
  }
`;

function HashGenerator() {
  const { state: { darkMode } } = useContext(ThemeContext);
  const [input, setInput] = useState("");
  const [results, setResults] = useState({});

  const generate = async () => {
    if (!input) return;
    const res = {};
    for (const algo of ALGORITHMS) {
      res[algo] = await computeHash(algo, input);
    }
    setResults(res);
  };

  return (
    <>
      <SeoHead {...SEO} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1>Hash Generator</h1>
          <p className="desc">Generate cryptographic hashes (SHA-256, SHA-384, SHA-512, SHA-1) from any text. Runs locally in your browser.</p>

          <div className="section">
            <label htmlFor="hash-input">Input Text</label>
            <textarea id="hash-input" placeholder="Enter text to hash" value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="btn-group">
              <button type="button" className="btn-primary" onClick={generate}>Generate Hashes</button>
              <button type="button" className="btn-secondary" onClick={() => { setInput(""); setResults({}); }}>Clear</button>
            </div>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="section">
              {ALGORITHMS.map((algo) => (
                <div key={algo} className="result-block">
                  <div className="result-label">{algo}</div>
                  <div className="result-hash">{results[algo]}</div>
                </div>
              ))}
            </div>
          )}
        </article>
      </Wrapper>
    </>
  );
}

export default HashGenerator;
