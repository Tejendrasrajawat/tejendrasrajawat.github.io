import React, { useContext, useState, useMemo } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "Regex Tester",
  description:
    "Free online regular expression tester. Test regex patterns against text with real-time match highlighting. Supports JavaScript regex flavors.",
  path: "tools/regex-tester",
  keywords: ["regex tester", "regular expression tester", "test regex online", "regex match", "JavaScript regex"],
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

  .pattern-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .pattern-row input {
    flex: 1;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ccc")};
    background: ${(p) => (p.$dark ? "#111" : "#fafafa")};
    color: ${(p) => (p.$dark ? "#eee" : "#222")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.9rem;
  }

  .pattern-row input:focus {
    outline: none;
    border-color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
  }

  .flags-input {
    width: 60px;
  }

  textarea {
    width: 100%;
    min-height: 160px;
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

  .match-list {
    margin-top: 1rem;
  }

  .match-item {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    margin-bottom: 0.35rem;
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.85rem;
    background: ${(p) => (p.$dark ? "#0d3321" : "#d4edda")};
    border-left: 3px solid #28a745;
  }

  .match-index {
    font-weight: 700;
    color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
    margin-right: 0.5rem;
  }

  .no-match {
    color: ${(p) => (p.$dark ? "#f87171" : "#dc3545")};
    font-weight: 600;
  }

  .error { color: #dc3545; font-size: 0.9rem; margin-top: 0.5rem; }
`;

function RegexTester() {
  const { state: { darkMode } } = useContext(ThemeContext);
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [], error: "" };
    try {
      const re = new RegExp(pattern, flags);
      const result = [];
      let m;
      if (flags.includes("g")) {
        while ((m = re.exec(text)) !== null) {
          result.push({ value: m[0], index: m.index });
          if (!m[0]) re.lastIndex++;
        }
      } else {
        m = re.exec(text);
        if (m) result.push({ value: m[0], index: m.index });
      }
      return { matches: result, error: "" };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [pattern, flags, text]);

  return (
    <>
      <SeoHead {...SEO} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1>Regex Tester</h1>
          <p className="desc">Test JavaScript regular expressions with real-time matching. Enter a pattern and text below.</p>

          <div className="section">
            <label>Pattern &amp; Flags</label>
            <div className="pattern-row">
              <input type="text" placeholder="e.g. \d+" value={pattern} onChange={(e) => setPattern(e.target.value)} />
              <input type="text" className="flags-input" placeholder="gi" value={flags} onChange={(e) => setFlags(e.target.value)} />
            </div>
            {error && <p className="error" role="alert">{error}</p>}
          </div>

          <div className="section">
            <label htmlFor="regex-text">Test String</label>
            <textarea id="regex-text" placeholder="Paste the text to test against" value={text} onChange={(e) => setText(e.target.value)} />
          </div>

          <div className="section">
            <label htmlFor="regex-matches">Matches ({matches.length})</label>
            <div id="regex-matches" className="match-list">
              {matches.length > 0 ? matches.map((m, i) => (
                <div key={`${m.index}-${i}`} className="match-item">
                  <span className="match-index">#{i + 1} @{m.index}</span>
                  {m.value || "(empty)"}
                </div>
              )) : pattern && text && !error && <p className="no-match">No matches found.</p>}
            </div>
          </div>
        </article>
      </Wrapper>
    </>
  );
}

export default RegexTester;
