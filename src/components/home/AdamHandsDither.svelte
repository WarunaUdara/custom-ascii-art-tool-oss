<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  const BASE_COLOR = '#ff5b35'; // Brand vibrant orange accent
  const ASCII_RAMP = ' .:-=+*#%@';

  function hexToRgb(hex: string): [number, number, number] {
    const v = parseInt(hex.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  // Generates high-contrast vivid tonal palette for maximum visibility
  function generateTonalPalette(baseHex: string): [number, number, number][] {
    const [r, g, b] = hexToRgb(baseHex);
    const stops = [
      0.18, // 0: Deep Shadow
      0.35, // 1: Low Tone
      0.55, // 2: Mid-Low Tone
      0.75, // 3: Mid Tone
      0.95, // 4: Mid-High Tone
      1.15, // 5: Base Highlight
      1.45, // 6: Apex Luminous Highlight (bright glow)
    ];

    return stops.map((factor) => {
      if (factor <= 1.0) {
        return [
          Math.round(r * factor),
          Math.round(g * factor),
          Math.round(b * factor),
        ];
      } else {
        const t = factor - 1.0;
        return [
          Math.round(r + (255 - r) * Math.min(1, t * 1.8)),
          Math.round(g + (255 - g) * Math.min(1, t * 1.8)),
          Math.round(b + (255 - b) * Math.min(1, t * 1.8)),
        ];
      }
    });
  }

  const LEVEL_RGB = generateTonalPalette(BASE_COLOR);

  function lerpColor(
    rgbA: [number, number, number],
    rgbB: [number, number, number],
    t: number
  ): [number, number, number] {
    return [
      Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * t),
      Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * t),
      Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * t),
    ];
  }

  interface HandData {
    target: { x: number; y: number };
    cur: { x: number; y: number };
    hoverCanvasPos: { x: number; y: number } | null;
    needsHighlightRedraw: boolean;
  }

  let rootRef: HTMLDivElement | null = $state(null);

  // Left Hand Canvas References
  let leftWrapRef: HTMLDivElement | null = $state(null);
  let leftShadowCanvasRef: HTMLCanvasElement | null = $state(null);
  let leftMidCanvasRef: HTMLCanvasElement | null = $state(null);
  let leftHighlightCanvasRef: HTMLCanvasElement | null = $state(null);

  // Right Hand Canvas References
  let rightWrapRef: HTMLDivElement | null = $state(null);
  let rightShadowCanvasRef: HTMLCanvasElement | null = $state(null);
  let rightMidCanvasRef: HTMLCanvasElement | null = $state(null);
  let rightHighlightCanvasRef: HTMLCanvasElement | null = $state(null);

  let imagesReady = $state(false);
  let isRevealed = $state(false);

  let leftState: HandData = {
    target: { x: 0, y: 0 },
    cur: { x: 0, y: 0 },
    hoverCanvasPos: null,
    needsHighlightRedraw: false,
  };

  let rightState: HandData = {
    target: { x: 0, y: 0 },
    cur: { x: 0, y: 0 },
    hoverCanvasPos: null,
    needsHighlightRedraw: false,
  };

  let leftOffset = $state({ x: 0, y: 0 });
  let rightOffset = $state({ x: 0, y: 0 });

  let redrawLeftHighlight: (() => void) | null = null;
  let redrawRightHighlight: (() => void) | null = null;
  let animId: number | null = null;

  const baseUrl = (typeof window !== 'undefined' ? (window as any).__ASTRO_BASE_URL__ : '') || '/custom-ascii-art-tool-oss';

  function handleMouseMove(e: MouseEvent) {
    // 1. Left Hand Hitbox & Parallax
    if (leftWrapRef && leftHighlightCanvasRef) {
      const rect = leftWrapRef.getBoundingClientRect();
      const isOverLeft =
        e.clientX >= rect.left - 60 &&
        e.clientX <= rect.right + 60 &&
        e.clientY >= rect.top - 80 &&
        e.clientY <= rect.bottom + 80;

      if (isOverLeft) {
        const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1));
        const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1));
        leftState.target = { x: nx, y: ny };

        const canvas = leftHighlightCanvasRef;
        const scaleX = canvas.width / (rect.width || 1);
        const scaleY = canvas.height / (rect.height || 1);
        leftState.hoverCanvasPos = {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
        leftState.needsHighlightRedraw = true;
      } else {
        if (leftState.hoverCanvasPos !== null || leftState.target.x !== 0) {
          leftState.target = { x: 0, y: 0 };
          leftState.hoverCanvasPos = null;
          leftState.needsHighlightRedraw = true;
        }
      }
    }

    // 2. Right Hand Hitbox & Parallax
    if (rightWrapRef && rightHighlightCanvasRef) {
      const rect = rightWrapRef.getBoundingClientRect();
      const isOverRight =
        e.clientX >= rect.left - 60 &&
        e.clientX <= rect.right + 60 &&
        e.clientY >= rect.top - 80 &&
        e.clientY <= rect.bottom + 80;

      if (isOverRight) {
        const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1));
        const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1));
        rightState.target = { x: nx, y: ny };

        const canvas = rightHighlightCanvasRef;
        const scaleX = canvas.width / (rect.width || 1);
        const scaleY = canvas.height / (rect.height || 1);
        rightState.hoverCanvasPos = {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
        rightState.needsHighlightRedraw = true;
      } else {
        if (rightState.hoverCanvasPos !== null || rightState.target.x !== 0) {
          rightState.target = { x: 0, y: 0 };
          rightState.hoverCanvasPos = null;
          rightState.needsHighlightRedraw = true;
        }
      }
    }
  }

  function handleMouseLeave() {
    leftState.target = { x: 0, y: 0 };
    leftState.hoverCanvasPos = null;
    leftState.needsHighlightRedraw = true;

    rightState.target = { x: 0, y: 0 };
    rightState.hoverCanvasPos = null;
    rightState.needsHighlightRedraw = true;
  }

  function setupHandRenderer(
    imgSrc: string,
    isLeft: boolean,
    shadowCanvas: HTMLCanvasElement | null,
    midCanvas: HTMLCanvasElement | null,
    highlightCanvas: HTMLCanvasElement | null,
    stateObj: HandData
  ) {
    if (!shadowCanvas || !midCanvas || !highlightCanvas) return null;

    const shadowCtx = shadowCanvas.getContext('2d');
    const midCtx = midCanvas.getContext('2d');
    const highlightCtx = highlightCanvas.getContext('2d');
    if (!shadowCtx || !midCtx || !highlightCtx) return null;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;

    let updateHighlight: (() => void) | null = null;

    img.onload = () => {
      const aspect = img.width / img.height;
      const targetW = 960;
      const targetH = Math.round(targetW / aspect);

      shadowCanvas.width = targetW;
      shadowCanvas.height = targetH;
      midCanvas.width = targetW;
      midCanvas.height = targetH;
      highlightCanvas.width = targetW;
      highlightCanvas.height = targetH;

      const cols = 80;
      const rows = Math.max(1, Math.round(cols / aspect));
      const cellW = targetW / cols;
      const cellH = targetH / rows;

      const thumb = document.createElement('canvas');
      thumb.width = cols;
      thumb.height = rows;
      const thumbCtx = thumb.getContext('2d', { willReadFrequently: true });
      if (!thumbCtx) return;

      thumbCtx.drawImage(img, 0, 0, cols, rows);
      const imgData = thumbCtx.getImageData(0, 0, cols, rows).data;

      const level = new Uint8Array(cols * rows);
      const influence = new Float32Array(cols * rows);

      for (let i = 0, p = 0; i < level.length; i++, p += 4) {
        const a = imgData[p + 3] / 255;
        const b = ((imgData[p] * 0.299 + imgData[p + 1] * 0.587 + imgData[p + 2] * 0.114) / 255) * a;
        level[i] = Math.min(6, Math.floor(b * 7));
      }

      const hoverRgb = hexToRgb('#ffffff');
      const radiusPx = (24 / 100) * targetW;
      const intensity = 1.0;
      const speed = 0.22;
      const fontSize = Math.max(7, Math.min(cellW, cellH) * 1.08);

      // 1. Layer 1: Shadows (Levels 1, 2)
      shadowCtx.clearRect(0, 0, targetW, targetH);
      shadowCtx.textAlign = 'center';
      shadowCtx.textBaseline = 'middle';
      shadowCtx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const lvl = level[idx];
          if (lvl === 0 || lvl > 2) continue;

          const cx = c * cellW + cellW / 2;
          const cy = r * cellH + cellH / 2;
          const rampIdx = Math.min(ASCII_RAMP.length - 1, Math.round((lvl / 6) * (ASCII_RAMP.length - 1)));
          const ch = ASCII_RAMP[rampIdx];
          if (ch && ch !== ' ') {
            const rgb = LEVEL_RGB[lvl];
            shadowCtx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            shadowCtx.fillText(ch, cx, cy);
          }
        }
      }

      // 2. Layer 2: Midtones (Levels 3, 4)
      midCtx.clearRect(0, 0, targetW, targetH);
      midCtx.textAlign = 'center';
      midCtx.textBaseline = 'middle';
      midCtx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const lvl = level[idx];
          if (lvl < 3 || lvl > 4) continue;

          const cx = c * cellW + cellW / 2;
          const cy = r * cellH + cellH / 2;
          const rampIdx = Math.min(ASCII_RAMP.length - 1, Math.round((lvl / 6) * (ASCII_RAMP.length - 1)));
          const ch = ASCII_RAMP[rampIdx];
          if (ch && ch !== ' ') {
            const rgb = LEVEL_RGB[lvl];
            midCtx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            midCtx.fillText(ch, cx, cy);
          }
        }
      }

      // 3. Layer 3: Highlights (Levels 5, 6 + interactive hover glow)
      const drawHighlight = () => {
        highlightCtx.clearRect(0, 0, targetW, targetH);
        highlightCtx.textAlign = 'center';
        highlightCtx.textBaseline = 'middle';
        highlightCtx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`;

        let anyActiveInfluence = false;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const lvl = level[idx];
            if (lvl < 5) continue;

            let target = 0;
            if (stateObj.hoverCanvasPos) {
              const cx = c * cellW + cellW / 2;
              const cy = r * cellH + cellH / 2;
              const dist = Math.hypot(cx - stateObj.hoverCanvasPos.x, cy - stateObj.hoverCanvasPos.y);
              const t = 1 - Math.min(1, dist / radiusPx);
              target = Math.max(0, t) * intensity;
            }

            influence[idx] += (target - influence[idx]) * speed;
            if (Math.abs(influence[idx]) < 0.002) {
              influence[idx] = 0;
            } else {
              anyActiveInfluence = true;
            }

            const inf = influence[idx];
            const base = LEVEL_RGB[lvl];
            const rgb = inf > 0.001 ? lerpColor(base, hoverRgb, inf) : base;
            const color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;

            const cx = c * cellW + cellW / 2;
            const cy = r * cellH + cellH / 2;
            const rampIdx = Math.min(ASCII_RAMP.length - 1, Math.round((lvl / 6) * (ASCII_RAMP.length - 1)));
            const ch = ASCII_RAMP[rampIdx];
            if (ch && ch !== ' ') {
              highlightCtx.fillStyle = color;
              highlightCtx.fillText(ch, cx, cy);
            }
          }
        }

        stateObj.needsHighlightRedraw = anyActiveInfluence || stateObj.hoverCanvasPos !== null;
      };

      drawHighlight();
      updateHighlight = drawHighlight;

      if (isLeft) leftDone = true;
      else rightDone = true;
      checkBothDone();
    };

    return () => {
      if (updateHighlight) updateHighlight();
    };
  }

  let leftDone = false;
  let rightDone = false;

  function checkBothDone() {
    if (leftDone && rightDone) {
      imagesReady = true;
      setTimeout(() => {
        isRevealed = true;
      }, 50);
    }
  }

  onMount(() => {
    // Parallax physics spring loop
    const tick = () => {
      const leftDx = leftState.target.x - leftState.cur.x;
      const leftDy = leftState.target.y - leftState.cur.y;
      if (Math.abs(leftDx) > 0.0005 || Math.abs(leftDy) > 0.0005) {
        leftState.cur.x += leftDx * 0.14;
        leftState.cur.y += leftDy * 0.14;
        leftOffset = { x: leftState.cur.x, y: leftState.cur.y };
      }

      const rightDx = rightState.target.x - rightState.cur.x;
      const rightDy = rightState.target.y - rightState.cur.y;
      if (Math.abs(rightDx) > 0.0005 || Math.abs(rightDy) > 0.0005) {
        rightState.cur.x += rightDx * 0.14;
        rightState.cur.y += rightDy * 0.14;
        rightOffset = { x: rightState.cur.x, y: rightState.cur.y };
      }

      if (leftState.needsHighlightRedraw && redrawLeftHighlight) {
        redrawLeftHighlight();
      }
      if (rightState.needsHighlightRedraw && redrawRightHighlight) {
        redrawRightHighlight();
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Setup Left & Right Hand Renderers
    redrawLeftHighlight = setupHandRenderer(
      `${baseUrl}/adam-hands/left-hand.png`,
      true,
      leftShadowCanvasRef,
      leftMidCanvasRef,
      leftHighlightCanvasRef,
      leftState
    );

    redrawRightHighlight = setupHandRenderer(
      `${baseUrl}/adam-hands/right-hand.png`,
      false,
      rightShadowCanvasRef,
      rightMidCanvasRef,
      rightHighlightCanvasRef,
      rightState
    );

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
  });

  onDestroy(() => {
    if (animId) cancelAnimationFrame(animId);
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    }
  });
</script>

<div
  bind:this={rootRef}
  class="adam-hands-container"
  aria-hidden="true"
>
  <!-- PROMINENT DUAL REACHING HANDS FLANKING & TOUCHING THE HEADLINE DIRECTLY -->
  <div class="hands-viewport">
    <!-- LEFT HAND (Reaches from left screen edge touching the left side of heading) -->
    <div
      bind:this={leftWrapRef}
      class="hand-wrapper left-hand"
      class:revealed={isRevealed}
    >
      <!-- Layer 1: Shadow Plane -->
      <div
        class="plane-layer"
        style="transform: translate3d({leftOffset.x * 1.2}px, {leftOffset.y * 1.0}px, 0) scale(0.995); opacity: 0.9;"
      >
        <canvas bind:this={leftShadowCanvasRef} class="hand-canvas"></canvas>
      </div>

      <!-- Layer 2: Midtone Plane -->
      <div
        class="plane-layer"
        style="transform: translate3d({leftOffset.x * 2.6}px, {leftOffset.y * 2.0}px, 0); opacity: 1.0;"
      >
        <canvas bind:this={leftMidCanvasRef} class="hand-canvas"></canvas>
      </div>

      <!-- Layer 3: Highlight Plane + Glow -->
      <div
        class="plane-layer"
        style="transform: translate3d({leftOffset.x * 4.2}px, {leftOffset.y * 3.2}px, 0);"
      >
        <canvas
          bind:this={leftHighlightCanvasRef}
          class="hand-canvas highlight-glow"
        ></canvas>
      </div>
    </div>

    <!-- RIGHT HAND (Reaches from right screen edge touching the right side of heading) -->
    <div
      bind:this={rightWrapRef}
      class="hand-wrapper right-hand"
      class:revealed={isRevealed}
    >
      <!-- Layer 1: Shadow Plane -->
      <div
        class="plane-layer"
        style="transform: translate3d({rightOffset.x * 1.2}px, {rightOffset.y * 1.0}px, 0) scale(0.995); opacity: 0.9;"
      >
        <canvas bind:this={rightShadowCanvasRef} class="hand-canvas"></canvas>
      </div>

      <!-- Layer 2: Midtone Plane -->
      <div
        class="plane-layer"
        style="transform: translate3d({rightOffset.x * 2.6}px, {rightOffset.y * 2.0}px, 0); opacity: 1.0;"
      >
        <canvas bind:this={rightMidCanvasRef} class="hand-canvas"></canvas>
      </div>

      <!-- Layer 3: Highlight Plane + Glow -->
      <div
        class="plane-layer"
        style="transform: translate3d({rightOffset.x * 4.2}px, {rightOffset.y * 3.2}px, 0);"
      >
        <canvas
          bind:this={rightHighlightCanvasRef}
          class="hand-canvas highlight-glow"
        ></canvas>
      </div>
    </div>
  </div>
</div>

<style>
  .adam-hands-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    overflow: visible;
  }

  .hands-viewport {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100vw;
    max-width: 1600px;
    height: 480px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }

  .hand-wrapper {
    width: 46%;
    max-width: 620px;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: clip-path 1400ms cubic-bezier(0.16, 1, 0.3, 1),
                -webkit-clip-path 1400ms cubic-bezier(0.16, 1, 0.3, 1),
                opacity 1200ms ease,
                transform 1400ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hand-wrapper.left-hand {
    justify-content: flex-start;
    clip-path: inset(0 100% 0 0);
    -webkit-clip-path: inset(0 100% 0 0);
    opacity: 0;
    transform: translate3d(-80px, 0, 0);
  }

  .hand-wrapper.left-hand.revealed {
    clip-path: inset(0 0% 0 0);
    -webkit-clip-path: inset(0 0% 0 0);
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .hand-wrapper.right-hand {
    justify-content: flex-end;
    clip-path: inset(0 0 0 100%);
    -webkit-clip-path: inset(0 0 0 100%);
    opacity: 0;
    transform: translate3d(80px, 0, 0);
  }

  .hand-wrapper.right-hand.revealed {
    clip-path: inset(0 0 0 0%);
    -webkit-clip-path: inset(0 0 0 0%);
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .plane-layer {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    transition: transform 0.08s ease-out;
  }

  .left-hand .plane-layer {
    justify-content: flex-start;
  }

  .right-hand .plane-layer {
    justify-content: flex-end;
  }

  .hand-canvas {
    display: block;
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .highlight-glow {
    filter: drop-shadow(0 0 36px rgba(255, 91, 53, 0.65));
  }

  @media (max-width: 1200px) {
    .hands-viewport {
      height: 400px;
    }
    .hand-wrapper {
      width: 44%;
      max-width: 500px;
    }
  }

  @media (max-width: 768px) {
    .hands-viewport {
      height: 240px;
      opacity: 0.55;
    }
    .hand-wrapper {
      width: 46%;
      max-width: 260px;
    }
  }

  @media (max-width: 480px) {
    .hands-viewport {
      height: 180px;
      opacity: 0.40;
    }
    .hand-wrapper {
      width: 48%;
      max-width: 180px;
    }
  }
</style>
