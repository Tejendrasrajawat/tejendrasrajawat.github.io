import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "JWT Decoder",
  description:
    "Decode JWT (JSON Web Token) online. View header and payload of any JWT. Free JWT decoder and inspector for developers.",
  path: "tools/jwt-decoder",
  keywords: ["JWT decoder", "decode JWT", "JWT inspector", "JSON Web Token", "JWT payload"],
};

function base64UrlDecode(str) {
  try {
    let base64 = str.replaceAll("-", "+").replaceAll("_", "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=====".slice(0, 4 - pad);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

const Wrapper = styled.main`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 900px;

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
    min-height: 120px;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ccc")};
    background: ${(p) => (p.$dark ? "#111" : "#fafafa")};
    color: ${(p) => (p.$dark ? "#eee" : "#222")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.85rem;
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

  .btn-decode {
    background: #0d6efd;
    color: #fff;
  }

  .btn-clear {
    background: ${(p) => (p.$dark ? "#333" : "#e9ecef")};
    color: ${(p) => (p.$dark ? "#eee" : "#333")};
  }

  .error {
    color: #dc3545;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .block {
    margin-bottom: 1.5rem;
  }

  .block-title {
    font-weight: 700;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .block pre {
    margin: 0;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")};
    background: ${(p) => (p.$dark ? "#0d1117" : "#f8f9fa")};
    color: ${(p) => (p.$dark ? "#e6edf3" : "#24292f")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.85rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

function JwtDecoder() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const [token, setToken] = useState("");
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  const handleDecode = () => {
    setError("");
    setHeader(null);
    setPayload(null);

    const trimmed = token.trim();
    if (!trimmed) return;

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      setError("Invalid JWT: expected 3 parts separated by dots.");
      return;
    }

    const [h, p] = parts;
    const decodedHeader = base64UrlDecode(h);
    const decodedPayload = base64UrlDecode(p);

    if (!decodedHeader) setError("Failed to decode JWT header.");
    if (!decodedPayload) setError((e) => (e ? e + " " : "") + "Failed to decode JWT payload.");

    setHeader(decodedHeader);
    setPayload(decodedPayload);
  };

  const handleClear = () => {
    setToken("");
    setHeader(null);
    setPayload(null);
    setError("");
  };

  return (
    <>
      <SeoHead title={SEO.title} description={SEO.description} path={SEO.path} keywords={SEO.keywords} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1 className="page-title">JWT Decoder</h1>
          <p className="page-desc">
            Paste a JWT (JSON Web Token) to decode its header and payload. No verification — decode only.
          </p>

          <section className="tool-section" aria-label="JWT input">
            <label htmlFor="jwt-input">JWT Token</label>
            <textarea
              id="jwt-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <div className="btn-group">
              <button type="button" className="btn-decode" onClick={handleDecode}>
                Decode
              </button>
              <button type="button" className="btn-clear" onClick={handleClear}>
                Clear
              </button>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
          </section>

          {(header !== null || payload !== null) && (
            <section aria-label="Decoded JWT">
              {header && (
                <div className="block">
                  <div className="block-title">Header</div>
                  <pre>{JSON.stringify(header, null, 2)}</pre>
                </div>
              )}
              {payload && (
                <div className="block">
                  <div className="block-title">Payload</div>
                  <pre>{JSON.stringify(payload, null, 2)}</pre>
                </div>
              )}
            </section>
          )}
        </article>
      </Wrapper>
    </>
  );
}

export default JwtDecoder;
