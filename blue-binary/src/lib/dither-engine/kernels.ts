import { quantizeLevel } from './quantizer';
import type { DitherAlgorithm } from './types';

// Bayer 4x4 Matrix (scaled 0..15)
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Bayer 8x8 Matrix (scaled 0..63)
const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/**
 * Applies selected dithering algorithm across the input luminance grid.
 * Populates and returns a Uint8Array of quantized level indices (0..steps-1).
 */
export function applyDithering(
  inputBrightness: Float32Array,
  cols: number,
  rows: number,
  algorithm: DitherAlgorithm,
  steps: number = 7,
  jitterAmount: number = 0.2
): Uint8Array {
  const levels = new Uint8Array(cols * rows);

  switch (algorithm) {
    case 'bayer4':
      applyBayer(inputBrightness, levels, cols, rows, BAYER_4X4, 4, 16, steps);
      break;

    case 'bayer8':
      applyBayer(inputBrightness, levels, cols, rows, BAYER_8X8, 8, 64, steps);
      break;

    case 'floyd-steinberg':
      applyFloydSteinberg(inputBrightness, levels, cols, rows, steps);
      break;

    case 'atkinson':
      applyAtkinson(inputBrightness, levels, cols, rows, steps);
      break;

    case 'noise-jitter':
      applyNoiseJitter(inputBrightness, levels, cols, rows, steps, jitterAmount);
      break;

    case 'threshold':
    default:
      for (let i = 0; i < inputBrightness.length; i++) {
        levels[i] = quantizeLevel(inputBrightness[i], steps);
      }
      break;
  }

  return levels;
}

/**
 * Ordered Bayer matrix dithering.
 */
function applyBayer(
  src: Float32Array,
  dest: Uint8Array,
  cols: number,
  rows: number,
  matrix: number[][],
  size: number,
  divisor: number,
  steps: number
) {
  const stepSize = 1.0 / (steps - 1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const b = src[idx];
      const threshold = (matrix[r % size][c % size] / divisor) - 0.5;
      const ditheredB = Math.max(0.0, Math.min(1.0, b + threshold * stepSize));
      dest[idx] = quantizeLevel(ditheredB, steps);
    }
  }
}

/**
 * Floyd-Steinberg spatial error diffusion.
 * Distributes residual quantization error to 4 neighboring pixels.
 */
function applyFloydSteinberg(
  src: Float32Array,
  dest: Uint8Array,
  cols: number,
  rows: number,
  steps: number
) {
  // Clone float buffer to carry error diffusion across neighbors
  const buffer = new Float32Array(src);
  const maxIdx = steps - 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x;
      const oldVal = Math.max(0.0, Math.min(1.0, buffer[idx]));
      const lvl = quantizeLevel(oldVal, steps);
      dest[idx] = lvl;

      const newVal = lvl / maxIdx;
      const error = oldVal - newVal;

      // Distribute error:
      // (x+1, y)   += 7/16
      // (x-1, y+1) += 3/16
      // (x,   y+1) += 5/16
      // (x+1, y+1) += 1/16
      if (x + 1 < cols) {
        buffer[y * cols + (x + 1)] += error * (7 / 16);
      }
      if (y + 1 < rows) {
        if (x > 0) {
          buffer[(y + 1) * cols + (x - 1)] += error * (3 / 16);
        }
        buffer[(y + 1) * cols + x] += error * (5 / 16);
        if (x + 1 < cols) {
          buffer[(y + 1) * cols + (x + 1)] += error * (1 / 16);
        }
      }
    }
  }
}

/**
 * Atkinson error diffusion (Bill Atkinson, Apple MacPaint 1984).
 * Diffuses 3/4 of error to 6 neighbors, holding 1/4 to create high contrast.
 */
function applyAtkinson(
  src: Float32Array,
  dest: Uint8Array,
  cols: number,
  rows: number,
  steps: number
) {
  const buffer = new Float32Array(src);
  const maxIdx = steps - 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x;
      const oldVal = Math.max(0.0, Math.min(1.0, buffer[idx]));
      const lvl = quantizeLevel(oldVal, steps);
      dest[idx] = lvl;

      const newVal = lvl / maxIdx;
      const error = oldVal - newVal;
      const fraction = error / 8.0;

      // Atkinson error kernel:
      // (x+1, y), (x+2, y)
      // (x-1, y+1), (x, y+1), (x+1, y+1)
      // (x, y+2)
      if (x + 1 < cols) buffer[y * cols + (x + 1)] += fraction;
      if (x + 2 < cols) buffer[y * cols + (x + 2)] += fraction;
      if (y + 1 < rows) {
        if (x > 0) buffer[(y + 1) * cols + (x - 1)] += fraction;
        buffer[(y + 1) * cols + x] += fraction;
        if (x + 1 < cols) buffer[(y + 1) * cols + (x + 1)] += fraction;
      }
      if (y + 2 < rows) {
        buffer[(y + 2) * cols + x] += fraction;
      }
    }
  }
}

/**
 * Noise jitter dithering.
 * Adds pseudorandom stochastic perturbation per cell.
 */
function applyNoiseJitter(
  src: Float32Array,
  dest: Uint8Array,
  cols: number,
  rows: number,
  steps: number,
  jitterAmount: number
) {
  const stepSize = 1.0 / (steps - 1);
  for (let i = 0; i < src.length; i++) {
    const jitter = (Math.random() - 0.5) * jitterAmount * stepSize;
    const b = Math.max(0.0, Math.min(1.0, src[i] + jitter));
    dest[i] = quantizeLevel(b, steps);
  }
}
