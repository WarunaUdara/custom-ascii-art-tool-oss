import type { BlendMode, ToneRow } from './types';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const val = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return {
    r: (val >> 16) & 255,
    g: (val >> 8) & 255,
    b: val & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1)}`;
}

export function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

/**
 * Cache for pre-rendered and blended tone mark tiles.
 * Key: `${toneId}_${color}_${blendMode}_${size}`
 */
const markTileCache = new Map<string, HTMLCanvasElement>();

export function clearMarkCache(): void {
  markTileCache.clear();
}

/**
 * Renders a built-in or custom mark into a cached tile canvas,
 * blending the tone color according to the selected blendMode while preserving transparency and texture.
 */
export function getOrCreateBlendedMarkTile(
  tone: ToneRow,
  tileSize: number
): HTMLCanvasElement {
  const key = `${tone.id}_${tone.color}_${tone.blendMode}_${tileSize}_${tone.markType}_${tone.markChar || ''}`;
  const cached = markTileCache.get(key);
  if (cached && cached.width === tileSize && cached.height === tileSize) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  if (tone.markType === 'custom' && tone.markImage && tone.markImage.complete) {
    renderCustomImageMark(ctx, tone.markImage, tone.color, tone.blendMode, tileSize);
  } else {
    renderBuiltinMark(ctx, tone, tileSize);
  }

  markTileCache.set(key, canvas);
  return canvas;
}

/**
 * Blends a custom uploaded image mark with the tone color using standard or composite operations,
 * strictly preserving alpha transparency and detail.
 */
function renderCustomImageMark(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  color: string,
  blendMode: BlendMode,
  size: number
): void {
  // Step 1: Draw the original uploaded image scaled to tile size
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  if (blendMode === 'source-over') {
    // If source-over/original colors, return as-is
    return;
  }

  // Create temporary layer for tint blending
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // Draw original image into temp buffer
  tempCtx.drawImage(img, 0, 0, size, size);

  // Apply selected blend mode on top of the image
  tempCtx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
  tempCtx.fillStyle = color;
  tempCtx.fillRect(0, 0, size, size);

  // Mask by original image alpha channel to preserve transparency & cutout shape
  tempCtx.globalCompositeOperation = 'destination-in';
  tempCtx.drawImage(img, 0, 0, size, size);

  // Draw blended result to target
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(tempCanvas, 0, 0, size, size);
}

/**
 * Renders high-quality built-in vector marks / glyphs.
 */
function renderBuiltinMark(
  ctx: CanvasRenderingContext2D,
  tone: ToneRow,
  size: number
): void {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = tone.color;
  ctx.strokeStyle = tone.color;
  ctx.lineWidth = Math.max(1, size * 0.12);

  const half = size / 2;
  const pad = size * 0.15;

  const preset = tone.builtinPreset || 'dot';

  switch (preset) {
    case 'char': {
      const char = tone.markChar || '#';
      ctx.font = `bold ${Math.round(size * 0.85)}px 'Geist Pixel Square', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, half, half);
      break;
    }
    case 'dot': {
      const r = (size / 2) * (0.35 + (tone.thresholdStop * 0.5));
      ctx.beginPath();
      ctx.arc(half, half, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'block': {
      const bSize = size * (0.4 + tone.thresholdStop * 0.55);
      const bHalf = bSize / 2;
      ctx.fillRect(half - bHalf, half - bHalf, bSize, bSize);
      break;
    }
    case 'cross': {
      ctx.beginPath();
      ctx.moveTo(pad, pad);
      ctx.lineTo(size - pad, size - pad);
      ctx.moveTo(size - pad, pad);
      ctx.lineTo(pad, size - pad);
      ctx.stroke();
      break;
    }
    case 'plus': {
      ctx.beginPath();
      ctx.moveTo(half, pad);
      ctx.lineTo(half, size - pad);
      ctx.moveTo(pad, half);
      ctx.lineTo(size - pad, half);
      ctx.stroke();
      break;
    }
    case 'hatch': {
      ctx.beginPath();
      ctx.moveTo(0, size);
      ctx.lineTo(size, 0);
      ctx.stroke();
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(half, half, half - pad, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'stipple': {
      const sRadius = Math.max(1, size * 0.08);
      const count = 3 + Math.floor(tone.thresholdStop * 6);
      for (let i = 0; i < count; i++) {
        const sx = pad + (Math.sin(i * 1.5) * 0.5 + 0.5) * (size - pad * 2);
        const sy = pad + (Math.cos(i * 2.3) * 0.5 + 0.5) * (size - pad * 2);
        ctx.beginPath();
        ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(half, half, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}
