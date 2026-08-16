---
name: web-design-guidelines
description: "Design standards for modern engineering websites: grid layouts, intersection crosshairs, font loading, dark-mode ergonomics, accessibility, and high-performance Canvas stages."
---

# Web Design Guidelines

## 1. Grid & Intersection Architecture

To achieve precision Vercel-style layouts:
- Use CSS Grid and Flexbox with consistent step scales (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- Use corner intersection markers with `::before` / `::after` pseudo-elements or absolute `+` tokens:

```css
.corner-crosshair {
  position: absolute;
  width: 9px;
  height: 9px;
  color: var(--border-highlight);
  font-family: ui-monospace, monospace;
  font-size: 10px;
  line-height: 1;
}
.corner-crosshair.tl { top: -5px; left: -5px; }
.corner-crosshair.tr { top: -5px; right: -5px; }
.corner-crosshair.bl { bottom: -5px; left: -5px; }
.corner-crosshair.br { bottom: -5px; right: -5px; }
```

## 2. Typography Token System

```css
:root {
  --font-geist-sans: 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-geist-mono: 'Geist Mono', ui-monospace, monospace;
  --font-geist-pixel: 'Geist Pixel Square', monospace;
}
```
