---
title: Luminance Quantization & Tonal Ramps
description: Mathematical principles behind linear color interpolation and discrete tonal mapping.
---

# Luminance Quantization & Tonal Ramps

Tonal quantization is the process of mapping continuous optical luminance values into a finite set of discrete color bins or glyphs.

## 1. Perceived Luminance Calculation

Human vision is disproportionately sensitive to green light and less sensitive to blue light. We calculate perceived brightness using the standard **ITU-R BT.601** luminance weights:

$$Y = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

```typescript
export function calculateLuminance(r: number, g: number, b: number, invert = false): number {
  let lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0;
  if (invert) lum = 1.0 - lum;
  return Math.max(0.0, Math.min(1.0, lum));
}
```

---

## 2. 7-Level Discrete Binning

Once normalized to $[0.0, 1.0]$, the continuous brightness is partitioned into 7 tonal steps:

$$\text{level} = \min\left(6, \lfloor Y \times 7 \rfloor\right)$$

| Level | Tonal Region | Default Color | Standard Glyph |
| :---: | :--- | :--- | :---: |
| **0** | Shadow | `#1a0a06` | `' '` (Space) |
| **1** | Low Shadow | `#3a1408` | `.` |
| **2** | Mid-Low | `#6b220c` | `:` |
| **3** | Midtone | `#a8330f` | `-` |
| **4** | Mid-High | `#d9531c` | `+` |
| **5** | High | `#f2823c` | `*` |
| **6** | Highlight | `#ffd39b` | `@` |
