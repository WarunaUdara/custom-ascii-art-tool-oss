---
name: frontend-design
description: "Guidelines and design philosophy for crafting high-craft, distinctive, and functional frontend interfaces. Prioritizes typography hierarchy, intentional spacing, crisp borders, tactile micro-interactions, and avoiding generic cliché templates."
---

# Frontend Design Philosophy & Principles

## 1. Core Principles

1. **Precision & Intention**: Every pixel, border, and transition must have purpose. Avoid arbitrary padding or decorative clutter.
2. **Typography as Structure**: Strong type scales with high legibility. Pair crisp monospace/bitmap headers with clean neutral body typography.
3. **Contrast & Hierarchy**: Differentiate primary actions from background controls using contrast and surface elevation rather than heavy drop shadows.
4. **Tactile Micro-Interactions**: Inputs, toggles, sliders, and buttons should provide instant feedback with subtle easing (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 2. Vercel-Style Engineering Aesthetics

- **Grid Lines & Intersections**: 1px subtle borders with crosshair corner connectors (`+`).
- **Dark Surface Palette**: Deep black background (`#000000` / `#09090b`), surface containers (`#121215`), subtle borders (`#27272a`), active accents (`#ffffff` or vibrant neon/orange).
- **HUD & Telemetry Badges**: Compact pill badges showing live stats (FPS, dimensions, ms render latency).
