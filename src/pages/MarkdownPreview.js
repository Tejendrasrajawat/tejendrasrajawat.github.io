import React, { useContext, useState, useMemo } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "Markdown Previewer",
  description:
    "Free online Markdown previewer. Write Markdown and see a live HTML preview. Supports headings, lists, code blocks, links, and more.",
  path: "tools/markdown-preview",
  keywords: ["Markdown preview", "Markdown editor", "Markdown to HTML", "online Markdown", "live Markdown"],
};

function parseMarkdown(md) {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/^---$/gm, "<hr />");
  html = html.replace(/\n{2,}/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p>\s*(<h[1-3]>)/g, "$1");
  html = html.replace(/(<\/h[1-3]>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<pre>)/g, "$1");
  html = html.replace(/(<\/pre>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<hr \/>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<blockquote>)/g, "$1");
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, "$1");

  return html;
}

const Wrapper = styled.main`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 1200px;

  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }

  .desc {
    color: ${(p) => (p.$dark ? "#aaa" : "#555")};
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .panels { grid-template-columns: 1fr; }
  }

  .panel label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  textarea {
    width: 100%;
    min-height: 400px;
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

  .preview {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")};
    background: ${(p) => (p.$dark ? "#0d1117" : "#fff")};
    color: ${(p) => (p.$dark ? "#e6edf3" : "#24292f")};
    min-height: 400px;
    line-height: 1.6;
    overflow-y: auto;
  }

  .preview h1, .preview h2, .preview h3 { margin-top: 0.75rem; margin-bottom: 0.5rem; }
  .preview code { background: ${(p) => (p.$dark ? "#333" : "#eee")}; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.85em; }
  .preview pre { padding: 1rem; border-radius: 6px; background: ${(p) => (p.$dark ? "#161b22" : "#f6f8fa")}; overflow-x: auto; }
  .preview pre code { background: none; padding: 0; }
  .preview blockquote { border-left: 3px solid ${(p) => (p.$dark ? "#444" : "#ddd")}; margin: 0.5rem 0; padding: 0.5rem 1rem; opacity: 0.85; }
  .preview a { color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")}; }
  .preview ul { padding-left: 1.5rem; }
  .preview hr { border: none; border-top: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")}; margin: 1rem 0; }
`;

const DEFAULT_MD = `# Hello Markdown

**Bold text** and *italic text*.

- Item one
- Item two

> A blockquote

\`inline code\` and a block:

\`\`\`
const x = 42;
console.log(x);
\`\`\`

[Link example](https://example.com)

---

That's it!`;

function MarkdownPreview() {
  const { state: { darkMode } } = useContext(ThemeContext);
  const [md, setMd] = useState(DEFAULT_MD);

  const html = useMemo(() => parseMarkdown(md), [md]);

  return (
    <>
      <SeoHead {...SEO} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1>Markdown Previewer</h1>
          <p className="desc">Write Markdown on the left and see a live HTML preview on the right.</p>

          <section className="panels">
            <div className="panel">
              <label htmlFor="md-input">Markdown</label>
              <textarea id="md-input" value={md} onChange={(e) => setMd(e.target.value)} />
            </div>
            <div className="panel">
              <label htmlFor="md-preview">Preview</label>
              <div id="md-preview" className="preview" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </section>
        </article>
      </Wrapper>
    </>
  );
}

export default MarkdownPreview;
