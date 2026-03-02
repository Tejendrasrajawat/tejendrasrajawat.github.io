import React, { useContext, useState, useCallback } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";
import SeoHead from "../components/SeoHead";

const SEO = {
  title: "Color Picker & Converter",
  description:
    "Free online color picker. Convert between HEX, RGB, and HSL color formats instantly. Pick a color and copy the code.",
  path: "tools/color-picker",
  keywords: ["color picker", "HEX to RGB", "color converter", "pick color online", "HSL converter"],
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: Number.parseInt(h.substring(0, 2), 16),
    g: Number.parseInt(h.substring(2, 4), 16),
    b: Number.parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

const Wrapper = styled.main`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 700px;

  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }

  .desc {
    color: ${(p) => (p.$dark ? "#aaa" : "#555")};
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  .picker-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  input[type="color"] {
    width: 80px;
    height: 50px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  .hex-input {
    padding: 0.6rem 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ccc")};
    background: ${(p) => (p.$dark ? "#111" : "#fafafa")};
    color: ${(p) => (p.$dark ? "#eee" : "#222")};
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 1rem;
    width: 140px;
  }

  .hex-input:focus {
    outline: none;
    border-color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
  }

  .swatch {
    width: 100%;
    height: 120px;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")};
  }

  .values {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 500px) {
    .values { grid-template-columns: 1fr; }
  }

  .value-card {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$dark ? "#444" : "#ddd")};
    background: ${(p) => (p.$dark ? "#0d1117" : "#f8f9fa")};
    text-align: center;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }

  .value-card:hover {
    box-shadow: 0 0 0 2px ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
  }

  .value-label {
    font-weight: 700;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
    color: ${(p) => (p.$dark ? "#6ea8fe" : "#0d6efd")};
  }

  .value-text {
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.9rem;
    color: ${(p) => (p.$dark ? "#e6edf3" : "#24292f")};
  }

  .copy-hint {
    font-size: 0.8rem;
    color: ${(p) => (p.$dark ? "#666" : "#999")};
    text-align: center;
  }
`;

function ColorPicker() {
  const { state: { darkMode } } = useContext(ThemeContext);
  const [hex, setHex] = useState("#0d6efd");

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const copy = useCallback((text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  return (
    <>
      <SeoHead {...SEO} />
      <Wrapper $dark={darkMode}>
        <article>
          <h1>Color Picker &amp; Converter</h1>
          <p className="desc">Pick a color and get its HEX, RGB, and HSL values. Click any value to copy.</p>

          <div className="picker-row">
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} aria-label="Color picker" />
            <input
              type="text"
              className="hex-input"
              value={hex}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setHex(v);
              }}
              maxLength={7}
              aria-label="HEX color input"
            />
          </div>

          <div className="swatch" style={{ background: hex }} />

          <div className="values">
            <button type="button" className="value-card" onClick={() => copy(hexStr)}>
              <div className="value-label">HEX</div>
              <div className="value-text">{hexStr}</div>
            </button>
            <button type="button" className="value-card" onClick={() => copy(rgbStr)}>
              <div className="value-label">RGB</div>
              <div className="value-text">{rgbStr}</div>
            </button>
            <button type="button" className="value-card" onClick={() => copy(hslStr)}>
              <div className="value-label">HSL</div>
              <div className="value-text">{hslStr}</div>
            </button>
          </div>

          <p className="copy-hint">Click any value card to copy to clipboard</p>
        </article>
      </Wrapper>
    </>
  );
}

export default ColorPicker;
