import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "Base64 Encoder / Decoder",
  description:
    "Free online Base64 encoder and decoder. Encode text to Base64 or decode Base64 strings instantly. No data leaves your browser.",
  path: "tools/base64-encoder-decoder",
  keywords: ["Base64 encoder", "Base64 decoder", "encode Base64", "decode Base64 online", "Base64 converter"],
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
    min-height: 140px;
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

function Base64Tool() {
  const { state: { darkMode } } = useContext(ThemeContext);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    setError("");
    try {
      const bytes = new TextEncoder().encode(input);
      let binary = "";
      bytes.forEach((b) => { binary += String.fromCharCode(b); });
      setOutput(btoa(binary));
    } catch (e) { setError("Encoding failed: " + e.message); }
  };

  const decode = () => {
    setError("");
    try {
      const binary = atob(input);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      setOutput(new TextDecoder().decode(bytes));
    } catch (e) { setError("Invalid Base64 string."); }
  };

  return (
    <>
      <SeoHead {...SEO} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1>Base64 Encoder / Decoder</h1>
          <p className="desc">Encode or decode Base64 strings instantly. All processing happens in your browser.</p>

          <div className="section">
            <label htmlFor="b64-input">Input</label>
            <textarea id="b64-input" placeholder="Paste text or Base64 string here" value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="btn-group">
              <button type="button" className="btn-primary" onClick={encode}>Encode</button>
              <button type="button" className="btn-primary" onClick={decode}>Decode</button>
              <button type="button" className="btn-secondary" onClick={() => { setInput(""); setOutput(""); setError(""); }}>Clear</button>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
          </div>

          <div className="section">
            <label htmlFor="b64-output">Result</label>
            <textarea id="b64-output" readOnly value={output} placeholder="Result will appear here" />
          </div>
        </article>
      </Wrapper>
    </>
  );
}

export default Base64Tool;
