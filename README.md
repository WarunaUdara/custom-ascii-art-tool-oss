# Custom ASCII Art / Dither Filter Tool

A single-file, zero-dependency web tool that converts images and videos into dithered/ASCII art. Runs entirely in the browser — no server required.

## Features

- **Image input** → dithered PNG export
- **Video input** → MP4/WebM export (upload-ready for YouTube, TikTok, etc.)
- Multiple cell styles: ASCII characters, solid blocks, round dots
- 7-level tonal color ramp (fully customizable)
- Hover glow animation (configurable radius, intensity, fade speed)
- Invert tonal mapping
- Adjustable grid resolution (10–220 cols)
- Background color picker

## Quick Start

Open `dither-tool.html` directly in any modern browser, or host it on GitHub Pages / Netlify / Vercel.

```bash
# Serve locally (optional)
npx serve .
# or
python3 -m http.server 8000
```

## Usage

1. Drag & drop an image (`.png`, `.jpg`, `.webp`, etc.) or video (`.mp4`, `.webm`, `.mov`)
2. Tweak settings in the left panel
3. **Image**: Click **Download PNG** for a static frame
4. **Video**: Click **Render Video** → wait for playback to finish → auto-downloads MP4/WebM

## Tech

- Pure HTML/CSS/JS (ES6 modules not required)
- `canvas.captureStream()` + `MediaRecorder` for video export
- No build step, no dependencies, no tracking

## License

MIT — see [LICENSE](LICENSE)