import type { CellStyle, GridDimensions, MousePosition, RGBColor } from './types';
import { lerpColor } from './quantizer';

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  dimensions: GridDimensions;
  levels: Uint8Array;
  levelRgb: RGBColor[];
  hoverRgb: RGBColor;
  influence: Float32Array;
  style: CellStyle;
  ramp: string;
  bgColor: string;
}

/**
 * Draws the dithered ASCII / Block / Dot matrix to the target Canvas 2D context.
 */
export function renderGridToCanvas(opts: RenderOptions): void {
  const {
    ctx,
    canvas,
    dimensions,
    levels,
    levelRgb,
    hoverRgb,
    influence,
    style,
    ramp,
    bgColor,
  } = opts;

  const { cols, rows, cellW, cellH } = dimensions;
  const activeRamp = ramp.length > 0 ? ramp : ' .:-=+*#%@';
  const rampMaxIdx = activeRamp.length - 1;

  // Clear canvas background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Setup font properties for ASCII mode
  if (style === 'char') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.max(6, Math.min(cellW, cellH) * 1.05);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  }

  for (let r = 0; r < rows; r++) {
    const rowOffset = r * cols;
    const cy = r * cellH + cellH / 2;

    for (let c = 0; c < cols; c++) {
      const idx = rowOffset + c;
      const lvl = levels[idx];
      const inf = influence ? influence[idx] : 0;
      const baseColor = levelRgb[lvl] || levelRgb[0];

      // Interpolate hover color glow if within mouse influence
      const finalRgb = inf > 0.001 ? lerpColor(baseColor, hoverRgb, inf) : baseColor;
      const colorStr = `rgb(${finalRgb.r},${finalRgb.g},${finalRgb.b})`;
      const cx = c * cellW + cellW / 2;

      ctx.fillStyle = colorStr;

      if (style === 'block') {
        ctx.fillRect(
          Math.floor(c * cellW),
          Math.floor(r * cellH),
          Math.ceil(cellW),
          Math.ceil(cellH)
        );
      } else if (style === 'dot') {
        const maxRadius = Math.min(cellW, cellH) / 2;
        const radius = maxRadius * (0.25 + (lvl / 6.0) * 0.75);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fill();
      } else {
        // ASCII Character
        const rampIdx = Math.min(rampMaxIdx, Math.round((lvl / 6.0) * rampMaxIdx));
        const char = activeRamp[rampIdx];
        if (char && char !== ' ') {
          ctx.fillText(char, cx, cy);
        }
      }
    }
  }
}

/**
 * Generates raw multi-line ASCII plain text string from the current quantized levels buffer.
 */
export function generateAsciiText(
  levels: Uint8Array,
  dimensions: GridDimensions,
  ramp: string
): string {
  const { cols, rows } = dimensions;
  const activeRamp = ramp.length > 0 ? ramp : ' .:-=+*#%@';
  const rampMaxIdx = activeRamp.length - 1;
  const lines: string[] = [];

  for (let r = 0; r < rows; r++) {
    const rowOffset = r * cols;
    let line = '';
    for (let c = 0; c < cols; c++) {
      const idx = rowOffset + c;
      const lvl = levels[idx];
      const rampIdx = Math.min(rampMaxIdx, Math.round((lvl / 6.0) * rampMaxIdx));
      line += activeRamp[rampIdx] || ' ';
    }
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Updates the hover influence float buffer based on mouse cursor distance.
 */
export function updateHoverInfluence(
  influence: Float32Array,
  dimensions: GridDimensions,
  mouse: MousePosition | null,
  radiusPx: number,
  intensity: number,
  speed: number
): void {
  const { cols, rows, cellW, cellH } = dimensions;

  for (let r = 0; r < rows; r++) {
    const rowOffset = r * cols;
    const cy = r * cellH + cellH / 2;

    for (let c = 0; c < cols; c++) {
      const idx = rowOffset + c;
      let target = 0;

      if (mouse) {
        const cx = c * cellW + cellW / 2;
        const dist = Math.hypot(cx - mouse.x, cy - mouse.y);
        const t = 1.0 - Math.min(1.0, dist / radiusPx);
        target = Math.max(0, t) * intensity;
      }

      influence[idx] += (target - influence[idx]) * speed;
      if (Math.abs(influence[idx]) < 0.0005) {
        influence[idx] = 0;
      }
    }
  }
}
