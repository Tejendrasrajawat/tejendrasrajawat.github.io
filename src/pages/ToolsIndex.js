import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "Free Online Developer Tools",
  description:
    "Free online developer tools — JSON viewer, JSON diff, JavaScript editor, JWT decoder, Base64 encoder, URL encoder, regex tester, Markdown preview, hash generator, and color picker. All tools run in your browser.",
  path: "tools",
  keywords: [
    "developer tools", "online tools", "JSON formatter", "JWT decoder",
    "Base64 encoder", "regex tester", "hash generator", "color picker",
    "URL encoder", "Markdown preview", "JavaScript editor",
  ],
};

const TOOLS = [
  {
    name: "JSON Viewer",
    desc: "Format, validate, and pretty-print JSON data.",
    path: "/tools/json-viewer",
    icon: "{ }",
    color: "#0d6efd",
  },
  {
    name: "JSON Compare",
    desc: "Diff two JSON objects side by side.",
    path: "/tools/json-compare",
    icon: "< >",
    color: "#6f42c1",
  },
  {
    name: "JavaScript Editor",
    desc: "Write and run JavaScript in the browser.",
    path: "/tools/js-editor",
    icon: "JS",
    color: "#f0db4f",
  },
  {
    name: "JWT Decoder",
    desc: "Decode JWT header and payload instantly.",
    path: "/tools/jwt-decoder",
    icon: "JWT",
    color: "#fb015b",
  },
  {
    name: "Base64 Encoder / Decoder",
    desc: "Encode or decode Base64 strings.",
    path: "/tools/base64-encoder-decoder",
    icon: "B64",
    color: "#20c997",
  },
  {
    name: "URL Encoder / Decoder",
    desc: "Percent-encode or decode URLs and query strings.",
    path: "/tools/url-encoder-decoder",
    icon: "%",
    color: "#fd7e14",
  },
  {
    name: "Regex Tester",
    desc: "Test regular expressions with real-time matching.",
    path: "/tools/regex-tester",
    icon: ".*",
    color: "#e83e8c",
  },
  {
    name: "Markdown Previewer",
    desc: "Write Markdown and see a live HTML preview.",
    path: "/tools/markdown-preview",
    icon: "MD",
    color: "#198754",
  },
  {
    name: "Hash Generator",
    desc: "Generate SHA-256, SHA-384, SHA-512, and SHA-1 hashes.",
    path: "/tools/hash-generator",
    icon: "#",
    color: "#6610f2",
  },
  {
    name: "Color Picker",
    desc: "Pick a color and convert between HEX, RGB, and HSL.",
    path: "/tools/color-picker",
    icon: "C",
    color: "#0dcaf0",
  },
];

const Wrapper = styled.main`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 1100px;

  h1 {
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    color: ${(p) => (p.$dark ? "#aaa" : "#555")};
    margin-bottom: 2rem;
    font-size: 1rem;
    max-width: 600px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  .card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 12px;
    border: 1px solid ${(p) => (p.$dark ? "#333" : "#e0e0e0")};
    background: ${(p) => (p.$dark ? "#111" : "#fff")};
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px ${(p) => (p.$dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)")};
  }

  .icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    color: #fff;
    font-family: "Monaco", "Menlo", "Consolas", monospace;
  }

  .card-body h2 {
    font-size: 1.05rem;
    margin: 0 0 0.25rem;
  }

  .card-body p {
    margin: 0;
    font-size: 0.88rem;
    color: ${(p) => (p.$dark ? "#aaa" : "#666")};
    line-height: 1.45;
  }

  .privacy-note {
    margin-top: 2.5rem;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    background: ${(p) => (p.$dark ? "#0d1117" : "#f0f6ff")};
    border: 1px solid ${(p) => (p.$dark ? "#1c2937" : "#cce0ff")};
    font-size: 0.9rem;
    color: ${(p) => (p.$dark ? "#aaa" : "#555")};
  }

  .privacy-note strong {
    color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
  }
`;

function ToolsIndex() {
  const { state: { darkMode } } = useContext(ThemeContext);

  return (
    <>
      <SeoHead {...SEO} />
      <Wrapper $dark={darkMode}>
        <h1>Developer Tools</h1>
        <p className="subtitle">
          Free, fast, and privacy-first. Every tool runs entirely in your browser — nothing is sent to any server.
        </p>

        <div className="grid">
          {TOOLS.map((t) => (
            <Link key={t.path} to={t.path} className="card">
              <div className="icon" style={{ background: t.color }}>{t.icon}</div>
              <div className="card-body">
                <h2>{t.name}</h2>
                <p>{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="privacy-note">
          <strong>Privacy first:</strong> All tools process data locally in your browser. No data is stored, logged, or sent to any external server.
        </div>
      </Wrapper>
    </>
  );
}

export default ToolsIndex;
