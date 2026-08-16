# Contributing to ASCII & Dither Studio Engine

Thank you for your interest in contributing to **ASCII & Dither Studio Engine**! We welcome bug reports, feature enhancements, mathematical algorithm optimizations, and UI/UX refinements.

---

## 🛠️ Development Workflow

### 1. Prerequisites
- **[Bun](https://bun.sh/)** ($\ge$ v1.1.0) or Node.js ($\ge$ v18.0.0)
- **Git**

### 2. Fork & Setup
```bash
# Clone your fork
git clone https://github.com/<your-username>/custom-ascii-art-tool-oss.git
cd custom-ascii-art-tool-oss

# Install dependencies with Bun
bun install

# Launch local development server
bun run dev
```

The application will be available locally at `http://localhost:4321/custom-ascii-art-tool-oss/`.

---

## 📦 Project Architecture

```
custom-ascii-art-tool-oss/
├── src/
│   ├── components/
│   │   ├── home/                # Landing page & WebGL DitherWaves background
│   │   ├── studio/              # Svelte 5 interactive Studio Workspace components
│   │   └── ui/                  # Reusable UI islands (DecryptedText, CustomDock)
│   ├── layouts/
│   │   └── Layout.astro         # App shell & precision engineering header
│   ├── lib/dither-engine/       # Framework-agnostic Dithering & ASCII Engine
│   │   ├── types.ts             # Strongly typed configurations & render telemetry
│   │   ├── quantizer.ts         # ITU-R BT.601 luminance & 7-level quantization
│   │   ├── kernels.ts           # Bayer 4x4/8x8, Floyd-Steinberg, Atkinson, Jitter
│   │   ├── renderer.ts          # Canvas 2D ASCII, blocks, and halftone glyph renderer
│   │   └── engine.ts            # Video stream coordinator & MediaRecorder pipeline
│   ├── pages/
│   │   ├── index.astro          # Landing Page (Base URL)
│   │   ├── studio.astro         # Dedicated Studio Workspace Tool
│   │   └── 404.astro            # Custom 404 Page
│   └── styles/
│       └── custom.css           # Geist Pixel & Mono typography tokens, precision lines
├── public/                      # Static assets, fonts, robots.txt, and .nojekyll
└── astro.config.mjs             # Astro + Svelte config
```

---

## 🌿 Contribution Guidelines

1. **Atomic Git Commits**:
   - Follow [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat(...)`: A new user-facing feature or algorithm.
     - `fix(...)`: A bug fix or layout correction.
     - `perf(...)`: Performance optimization (e.g. SIMD / WebGL / WebWorker offloading).
     - `refactor(...)`: Code refactoring without behavioral change.
     - `docs(...)`: Documentation updates.
2. **Quality Assurance**:
   - Verify that `bun run build` succeeds with zero errors and zero warnings before submitting a pull request.
3. **Open an Issue / PR**:
   - Provide a clear explanation of your change, with screenshots or animated screen recordings for UI/algorithm modifications.

---

## 📄 License
By contributing to this repository, you agree that your contributions will be licensed under the [MIT License](LICENSE).
