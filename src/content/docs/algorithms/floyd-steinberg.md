---
title: Floyd-Steinberg (Error Diffusion)
description: Spatial error propagation for continuous-tone illusion without regular pattern artifacts.
---

# Floyd-Steinberg (Error Diffusion)

Published in 1976 by Robert Floyd and Louis Steinberg, this algorithm diffuses the quantization residual error of the current pixel to 4 unprocessed neighboring pixels.

## 1. Error Diffusion Kernel

When pixel $(x, y)$ is quantized, the difference $\epsilon = Y_{\text{original}} - Y_{\text{quantized}}$ is diffused according to the kernel:

$$\begin{array}{c|c|c}
 & \star & \frac{7}{16} \\
\hline
\frac{3}{16} & \frac{5}{16} & \frac{1}{16}
\end{array}$$

## 2. Kernel Implementation

```typescript
const error = oldVal - newVal;

// Propagate error to neighboring cells:
buffer[y * cols + (x + 1)] += error * (7 / 16);
buffer[(y + 1) * cols + (x - 1)] += error * (3 / 16);
buffer[(y + 1) * cols + x] += error * (5 / 16);
buffer[(y + 1) * cols + (x + 1)] += error * (1 / 16);
```
