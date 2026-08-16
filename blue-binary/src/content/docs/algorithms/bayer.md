---
title: Bayer Matrix (Ordered Dithering)
description: High-speed ordered spatial dithering using recursive threshold matrices.
---

# Bayer Matrix (Ordered Dithering)

Ordered dithering introduces high-frequency spatial patterns that fool the human eye into perceiving smooth gradients using only a restricted palette.

## 1. Threshold Matrix

The classic Bayer matrix $M_N$ is defined recursively. For an $8\times8$ matrix with values from $0$ to $63$:

$$M_8 = \frac{1}{64} \begin{bmatrix}
0 & 32 & 8 & 40 & 2 & 34 & 10 & 42 \\
48 & 16 & 56 & 24 & 50 & 18 & 58 & 26 \\
12 & 44 & 4 & 36 & 14 & 46 & 6 & 38 \\
60 & 28 & 52 & 20 & 62 & 30 & 54 & 22 \\
3 & 35 & 11 & 43 & 1 & 33 & 9 & 41 \\
51 & 19 & 59 & 27 & 49 & 17 & 57 & 25 \\
15 & 47 & 7 & 39 & 13 & 45 & 5 & 37 \\
63 & 31 & 55 & 23 & 61 & 29 & 53 & 21
\end{bmatrix}$$

## 2. Why Ordered Dithering is Fast
Unlike error diffusion algorithms, every pixel in Bayer dithering can be evaluated **independently and in parallel** ($O(1)$ per pixel):

$$Y_{\text{dithered}}(x, y) = Y(x, y) + \left(\frac{M(x \pmod N, y \pmod N)}{N^2} - 0.5\right) \cdot \Delta_{\text{step}}$$
