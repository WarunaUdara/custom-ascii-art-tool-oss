---
title: Atkinson Dither
description: Apple MacPaint 1984 high-contrast error diffusion algorithm.
---

# Atkinson Dithering

Developed by Bill Atkinson at Apple Computer for the original Macintosh (1984), the Atkinson kernel produces clean, punchy, high-contrast dither patterns.

## 1. The $\frac{3}{4}$ Error Retention Trick

While Floyd-Steinberg diffuses $100\%$ ($\frac{16}{16}$) of the quantization error, Atkinson diffuses only **$\frac{6}{8} = 75\%$** across 6 neighbors:

$$\begin{array}{c|c|c|c}
 & \star & \frac{1}{8} & \frac{1}{8} \\
\hline
\frac{1}{8} & \frac{1}{8} & \frac{1}{8} & \\
\hline
 & \frac{1}{8} & & 
\end{array}$$

Retaining $\frac{1}{4}$ of the error prevents blown-out speckling and preserves sharp edges in high-frequency regions.
