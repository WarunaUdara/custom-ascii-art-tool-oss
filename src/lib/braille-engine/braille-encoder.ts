import type { BrailleCell, BrailleRGB, DitherMode } from './types';

// Bit positions for 2x4 Braille grid
export const BRAILLE_DOT_MAP = [
  [0x01, 0x08], // Row 0 (dots 1, 4)
  [0x02, 0x10], // Row 1 (dots 2, 5)
  [0x04, 0x20], // Row 2 (dots 3, 6)
  [0x40, 0x80], // Row 3 (dots 7, 8)
];

const UNICODE_BRAILLE_BASE = 0x2800;

export function getBrailleChar(dotMask: number): string {
  return String.fromCharCode(UNICODE_BRAILLE_BASE + (dotMask & 0xff));
}

/**
 * Converts a raw sub-pixel RGBA buffer into a 2D matrix of Braille cells.
 * Target sub-pixel resolution: (cols * 2) width x (rows * 4) height.
 */
export function encodeSubpixelsToBraille(
  rgbaData: Uint8ClampedArray,
  subW: number,
  subH: number,
  cols: number,
  rows: number,
  threshold: number = 0.5,
  invert: boolean = false,
  dither: DitherMode = 'floyd-steinberg',
  edgeEnhance: number = 0
): BrailleCell[][] {
  const lumBuffer = new Float32Array(subW * subH);
  const colorBuffer: BrailleRGB[] = new Array(subW * subH);

  // Extract luminance and color
  for (let y = 0; y < subH; y++) {
    for (let x = 0; x < subW; x++) {
      const idx = (y * subW + x);
      const p = idx * 4;
      const r = rgbaData[p];
      const g = rgbaData[p + 1];
      const b = rgbaData[p + 2];
      const a = rgbaData[p + 3] / 255;

      let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255 * a;
      if (invert) lum = 1.0 - lum;

      lumBuffer[idx] = lum;
      colorBuffer[idx] = { r, g, b };
    }
  }

  // Edge enhancement filter (Sobel)
  if (edgeEnhance > 0.05) {
    const edgeBuffer = new Float32Array(subW * subH);
    for (let y = 1; y < subH - 1; y++) {
      for (let x = 1; x < subW - 1; x++) {
        const idx = y * subW + x;
        const gx =
          -lumBuffer[(y - 1) * subW + (x - 1)] +
          lumBuffer[(y - 1) * subW + (x + 1)] -
          2 * lumBuffer[y * subW + (x - 1)] +
          2 * lumBuffer[y * subW + (x + 1)] -
          lumBuffer[(y + 1) * subW + (x - 1)] +
          lumBuffer[(y + 1) * subW + (x + 1)];

        const gy =
          -lumBuffer[(y - 1) * subW + (x - 1)] -
          2 * lumBuffer[(y - 1) * subW + x] -
          lumBuffer[(y - 1) * subW + (x + 1)] +
          lumBuffer[(y + 1) * subW + (x - 1)] +
          2 * lumBuffer[(y + 1) * subW + x] +
          lumBuffer[(y + 1) * subW + (x + 1)];

        const mag = Math.hypot(gx, gy) * edgeEnhance;
        edgeBuffer[idx] = Math.min(1.0, lumBuffer[idx] + mag);
      }
    }
    for (let i = 0; i < lumBuffer.length; i++) {
      lumBuffer[i] = edgeBuffer[i] || lumBuffer[i];
    }
  }

  // Bit matrix for active dots
  const bitMatrix = new Uint8Array(subW * subH);

  if (dither === 'floyd-steinberg') {
    const errBuffer = new Float32Array(lumBuffer);
    for (let y = 0; y < subH; y++) {
      for (let x = 0; x < subW; x++) {
        const idx = y * subW + x;
        const oldVal = errBuffer[idx];
        const newVal = oldVal >= threshold ? 1.0 : 0.0;
        bitMatrix[idx] = newVal > 0.5 ? 1 : 0;
        const err = oldVal - newVal;

        if (x + 1 < subW) errBuffer[idx + 1] += err * (7 / 16);
        if (x - 1 >= 0 && y + 1 < subH) errBuffer[(y + 1) * subW + (x - 1)] += err * (3 / 16);
        if (y + 1 < subH) errBuffer[(y + 1) * subW + x] += err * (5 / 16);
        if (x + 1 < subW && y + 1 < subH) errBuffer[(y + 1) * subW + (x + 1)] += err * (1 / 16);
      }
    }
  } else {
    // Simple Threshold
    for (let i = 0; i < lumBuffer.length; i++) {
      bitMatrix[i] = lumBuffer[i] >= threshold ? 1 : 0;
    }
  }

  // Aggregate 2x4 sub-pixel clusters into Braille cells
  const grid: BrailleCell[][] = [];

  for (let charY = 0; charY < rows; charY++) {
    const rowCells: BrailleCell[] = [];
    const baseY = charY * 4;

    for (let charX = 0; charX < cols; charX++) {
      const baseX = charX * 2;
      let mask = 0;
      let rSum = 0, gSum = 0, bSum = 0, activeCount = 0;

      for (let subRow = 0; subRow < 4; subRow++) {
        const py = baseY + subRow;
        if (py >= subH) continue;

        for (let subCol = 0; subCol < 2; subCol++) {
          const px = baseX + subCol;
          if (px >= subW) continue;

          const pIdx = py * subW + px;
          if (bitMatrix[pIdx] === 1) {
            mask |= BRAILLE_DOT_MAP[subRow][subCol];
            const rgb = colorBuffer[pIdx];
            rSum += rgb.r;
            gSum += rgb.g;
            bSum += rgb.b;
            activeCount++;
          }
        }
      }

      // Average color across active subpixels
      const fg: BrailleRGB = activeCount > 0
        ? {
            r: Math.round(rSum / activeCount),
            g: Math.round(gSum / activeCount),
            b: Math.round(bSum / activeCount),
          }
        : { r: 120, g: 120, b: 120 };

      // If empty cell, use character ' ' or blank braille
      const char = mask === 0 ? ' ' : getBrailleChar(mask);

      rowCells.push({
        char,
        code: mask,
        fg,
      });
    }

    grid.push(rowCells);
  }

  return grid;
}
