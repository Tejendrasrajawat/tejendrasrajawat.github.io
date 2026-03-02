import React, { useContext, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "JSON Compare",
  description:
    "Compare two JSON objects online. Diff JSON side by side, find differences in keys and values. Free JSON comparison tool for developers.",
  path: "tools/json-compare",
  keywords: ["JSON compare", "JSON diff", "compare JSON", "JSON difference", "diff JSON"],
};

function getDiff(obj1, obj2, path = "") {
  const diffs = [];
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

  allKeys.forEach((key) => {
    const p = path ? `${path}.${key}` : key;
    const v1 = obj1?.[key];
    const v2 = obj2?.[key];

    if (v1 === undefined && v2 !== undefined) {
      diffs.push({ path: p, type: "added", value: v2 });
    } else if (v1 !== undefined && v2 === undefined) {
      diffs.push({ path: p, type: "removed", value: v1 });
    } else if (typeof v1 === "object" && v1 !== null && typeof v2 === "object" && v2 !== null && !Array.isArray(v1) && !Array.isArray(v2)) {
      diffs.push(...getDiff(v1, v2, p));
    } else if (JSON.stringify(v1) !== JSON.stringify(v2)) {
      diffs.push({ path: p, type: "changed", old: v1, new: v2 });
    }
  });

  return diffs;
}

const Wrapper = styled.main`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 1200px;

  .page-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .page-desc {
    color: ${(p) => (p.$dark ? "#aaa" : "#555")};
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .panels {
      grid-template-columns: 1fr;
    }
  }

  .panel label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  textarea {
    width: 100%;
    min-height: 200px;
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

  .btn-compare {
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

  .diff-list {
    margin-top: 1rem;
  }

  .diff-item {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.85rem;
  }

  .diff-item.added {
    background: ${(p) => (p.$dark ? "#0d3321" : "#d4edda")};
    border-left: 4px solid #28a745;
  }

  .diff-item.removed {
    background: ${(p) => (p.$dark ? "#3d1f1f" : "#f8d7da")};
    border-left: 4px solid #dc3545;
  }

  .diff-item.changed {
    background: ${(p) => (p.$dark ? "#332a0d" : "#fff3cd")};
    border-left: 4px solid #ffc107;
  }

  .diff-path {
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .diff-value {
    opacity: 0.9;
  }

  .no-diff {
    color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
    font-weight: 600;
    padding: 1rem;
  }
`;

function JsonCompare() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const [json1, setJson1] = useState("");
  const [json2, setJson2] = useState("");
  const [error, setError] = useState("");
  const [diffs, setDiffs] = useState([]);

  const handleCompare = () => {
    setError("");
    setDiffs([]);
    try {
      const o1 = json1.trim() ? JSON.parse(json1) : {};
      const o2 = json2.trim() ? JSON.parse(json2) : {};
      const result = getDiff(o1, o2);
      setDiffs(result);
    } catch (e) {
      setError(e.message || "Invalid JSON in one or both inputs.");
    }
  };

  const handleClear = () => {
    setJson1("");
    setJson2("");
    setError("");
    setDiffs([]);
  };

  return (
    <>
      <SeoHead title={SEO.title} description={SEO.description} path={SEO.path} keywords={SEO.keywords} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1 className="page-title">JSON Compare</h1>
          <p className="page-desc">
            Paste two JSON objects below to compare them. See added, removed, and changed keys and values.
          </p>

          <section className="panels">
            <div className="panel">
              <label htmlFor="json-a">JSON A</label>
              <textarea
                id="json-a"
                placeholder='{"a": 1, "b": 2}'
                value={json1}
                onChange={(e) => setJson1(e.target.value)}
              />
            </div>
            <div className="panel">
              <label htmlFor="json-b">JSON B</label>
              <textarea
                id="json-b"
                placeholder='{"a": 1, "b": 3, "c": 4}'
                value={json2}
                onChange={(e) => setJson2(e.target.value)}
              />
            </div>
          </section>

          <div className="btn-group">
            <button type="button" className="btn-compare" onClick={handleCompare}>
              Compare
            </button>
            <button type="button" className="btn-clear" onClick={handleClear}>
              Clear
            </button>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <section className="diff-list" aria-label="Comparison result">
            {diffs.length > 0 &&
              diffs.map((d) => (
                <div key={`${d.path}-${d.type}-${JSON.stringify(d.value ?? d.old ?? d.new)}`} className={`diff-item ${d.type}`}>
                  <div className="diff-path">{d.path}</div>
                  <div className="diff-value">
                    {d.type === "added" && <>Added: {JSON.stringify(d.value)}</>}
                    {d.type === "removed" && <>Removed: {JSON.stringify(d.value)}</>}
                    {d.type === "changed" && (
                      <>
                        Was: {JSON.stringify(d.old)} → Now: {JSON.stringify(d.new)}
                      </>
                    )}
                  </div>
                </div>
              ))}
            {diffs.length === 0 && (json1 !== "" || json2 !== "") && !error && (
              <p className="no-diff">No differences found. JSON objects are equal.</p>
            )}
          </section>
        </article>
      </Wrapper>
    </>
  );
}

export default JsonCompare;
