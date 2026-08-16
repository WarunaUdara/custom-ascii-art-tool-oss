# ASCII & Dither Studio Engine 🎨✨

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-v7.2-ff5d01.svg?style=flat-square&logo=astro)](https://astro.build/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5.56-ff3e00.svg?style=flat-square&logo=svelte)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0%20Shaders-990000.svg?style=flat-square&logo=webgl)](https://www.khronos.org/webgl/)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-22c55e.svg?style=flat-square&logo=github)](https://warunaudara.github.io/custom-ascii-art-tool-oss/)

**High-Performance Browser-Based Image & Video Dithering, Halftone, and ASCII Matrix Transformation Engine.**

[**🌐 Live Interactive Studio**](https://warunaudara.github.io/custom-ascii-art-tool-oss/studio/) · [**📖 Overview & Algorithms**](https://warunaudara.github.io/custom-ascii-art-tool-oss/) · [**Report Bug**](https://github.com/WarunaUdara/custom-ascii-art-tool-oss/issues)

</div>

---

```
  █████╗ ███████╗ ██████╗██╗██╗    ██████╗ ██╗████████╗██╗  ██╗███████╗██████╗ 
 ██╔══██╗██╔════╝██╔════╝██║██║    ██╔══██╗██║╚══██╔══╝██║  ██║██╔════╝██╔══██╗
 ███████║███████╗██║     ██║██║    ██║  ██║██║   ██║   ███████║█████╗  ██████╔╝
 ██╔══██║╚════██║██║     ██║██║    ██║  ██║██║   ██║   ██╔══██║██╔══╝  ██╔══██╗
 ██║  ██║███████║╚██████╗██║██║    ██████╔╝██║   ██║   ██║  ██║███████╗██║  ██║
 ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝    ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
```

---

## ⚡ Overview

**ASCII & Dither Studio Engine** is a zero-latency, framework-agnostic transformation pipeline designed to render images and video streams into retro dithered matrix art, character density ramps, and halftone dot patterns at **60+ FPS**.

Built with **Astro**, **Svelte 5 Runes**, and **WebGL/Canvas 2D**, the tool executes entirely on the client side with zero server dependency, preserving complete user privacy.

---

## 🚀 Key Features

* **🧮 6 Dithering Algorithms**:
  * **7-Level Uniform Quantization**: ITU-R BT.601 luminance mapping across custom palettes.
  * **Bayer Matrix (4×4 Ordered)**: Classic 16-threshold cross-hatch matrix.
  * **Bayer Matrix (8×8 Ordered)**: High-fidelity 64-threshold retro pattern.
  * **Floyd-Steinberg Error Diffusion**: Spatial error distribution ($\frac{7}{16}, \frac{3}{16}, \frac{5}{16}, \frac{1}{16}$) preserving smooth continuous gradients.
  * **Atkinson Dither**: Apple Macintosh high-contrast $75\%$ error dispersion.
  * **Stochastic Noise Jitter**: Uniform pseudo-random noise dithering.
* **🎥 Real-Time 60 FPS Video Stream Processor**:
  * Upload `.mp4`, `.webm`, `.mov`, `.mkv` videos.
  * Frame-by-frame Canvas 2D rasterization with hardware-accelerated `MediaRecorder` export.
* **✨ Dynamic Cursor Glow Matrix**:
  * Real-time distance-field mouse hover animation smoothly blended into per-cell luminance buffers.
* **🎛️ 7-Level Tonal Palette Manager**:
  * Custom retro presets: *Solar Flare*, *Cyberpunk Neon*, *GameBoy Green*, *Amber CRT*, *Monochrome*, *Blueprint Cyan*.
* **📐 Vercel & Geist Pixel Aesthetics**:
  * Precision engineering design system with razor-sharp 0px borders and Geist Pixel typography.
* **🌊 WebGL GLSL Dither Waves Background**:
  * GPU-accelerated 4-octave Fractal Brownian Motion (FBM) shader with live Bayer 8x8 matrix dithering.

---

## 🧮 Algorithm Mathematics

### 1. Luminance Calculation (ITU-R BT.601)
$$Y = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

### 2. Bayer Ordered Dithering Matrix ($4\times4$)
$$M_4 = \frac{1}{16} \begin{bmatrix} 0 & 8 & 2 & 10 \\ 12 & 4 & 14 & 6 \\ 3 & 11 & 1 & 9 \\ 15 & 7 & 13 & 5 \end{bmatrix}$$

### 3. Floyd-Steinberg Error Kernel
$$\begin{array}{|c|c|c|}
\hline
& \mathbf{P} & \frac{7}{16} \\
\hline
\frac{3}{16} & \frac{5}{16} & \frac{1}{16} \\
\hline
\end{array}$$

### 4. Atkinson Error Kernel ($75\%$ Total Diffusion)
$$\begin{array}{|c|c|c|c|}
\hline
& & \mathbf{P} & \frac{1}{8} \\
\hline
& \frac{1}{8} & \frac{1}{8} & \frac{1}{8} \\
\hline
& & \frac{1}{8} & \\
\hline
\end{array}$$

---

## 🛠️ Quickstart

### Prerequisites
- **[Bun](https://bun.sh/)** ($\ge$ v1.1.0) or Node.js ($\ge$ v18.0.0)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/WarunaUdara/custom-ascii-art-tool-oss.git
cd custom-ascii-art-tool-oss

# 2. Install dependencies
bun install

# 3. Start local development server
bun run dev
```

Visit `http://localhost:4321/custom-ascii-art-tool-oss/` in your browser.

### Production Build

```bash
bun run build
bun run preview
```

---

## 📁 Repository Structure

```
custom-ascii-art-tool-oss/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Pages CI/CD workflow
├── public/
│   ├── fonts/                   # Bundled Geist Pixel, Mono, & Sans woff2 files
│   ├── favicon.svg              # Vector favicon
│   ├── og-image.png             # Social OpenGraph sharing card (1200x630)
│   ├── robots.txt               # Search engine crawler instructions
│   └── .nojekyll                # Disables legacy Jekyll processing on GitHub Pages
├── src/
│   ├── components/
│   │   ├── home/                # Landing page & WebGL DitherWaves background
│   │   │   ├── DitherWaves.svelte
│   │   │   └── HeroSection.svelte
│   │   ├── studio/              # Interactive Svelte 5 Studio workspace
│   │   │   ├── CanvasStage.svelte
│   │   │   ├── ControlsPanel.svelte
│   │   │   ├── PalettePicker.svelte
│   │   │   └── Studio.svelte
│   │   └── ui/                  # DecryptedText and CustomDock components
│   │       ├── CustomDock.svelte
│   │       └── DecryptedText.svelte
│   ├── layouts/
│   │   └── Layout.astro         # Master HTML shell & precision header
│   ├── lib/dither-engine/       # TypeScript Core Engine
│   │   ├── engine.ts            # Media & animation loop coordinator
│   │   ├── kernels.ts           # Dithering matrices & error diffusers
│   │   ├── quantizer.ts         # Luminance & color interpolation
│   │   ├── renderer.ts          # Canvas 2D cell renderer
│   │   └── types.ts             # Strongly typed configurations & metrics
│   ├── pages/
│   │   ├── index.astro          # Landing Page (Base URL)
│   │   ├── studio.astro         # Studio Workspace Tool
│   │   └── 404.astro            # Custom 404 handler
│   └── styles/
│       └── custom.css           # Design tokens, sharp geometry & typography
├── astro.config.mjs             # Astro + Svelte + Sitemap integration config
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript strict configuration
├── CONTRIBUTING.md              # Open source contribution guidelines
├── CODE_OF_CONDUCT.md           # Community code of conduct
└── LICENSE                      # MIT License
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Developed with ❤️ by [**Waruna Udara**](https://github.com/WarunaUdara).