import type { RGBColor } from './types';

export const DEFAULT_LEVEL_COLORS: string[] = [
  '#1a0a06', // 0: Shadow
  '#3a1408', // 1: Low
  '#6b220c', // 2: Mid-low
  '#a8330f', // 3: Mid
  '#d9531c', // 4: Mid-high
  '#f2823c', // 5: High
  '#ffd39b', // 6: Highlight
];

export const DEFAULT_ASCII_RAMP = ' .:-=+*#%@';

/**
 * Parses a 6-digit hex color string into an RGBColor tuple.
 */
export function hexToRgb(hex: string): RGBColor {
  const cleanHex = hex.replace('#', '');
  const parsed = parseInt(cleanHex, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

/**
 * Converts RGB components back to hex format (#rrggbb).
 */
export function rgbToHex(rgb: RGBColor): string {
  const r = Math.round(rgb.r).toString(16).padStart(2, '0');
  const g = Math.round(rgb.g).toString(16).padStart(2, '0');
  const b = Math.round(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Linearly interpolates between two RGB colors.
 * @param a Start color
 * @param b End color
 * @param t Blend weight (0.0 to 1.0)
 */
export function lerpColor(a: RGBColor, b: RGBColor, t: number): RGBColor {
  const clampedT = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * clampedT),
    g: Math.round(a.g + (b.g - a.g) * clampedT),
    b: Math.round(a.b + (b.b - a.b) * clampedT),
  };
}

/**
 * Standard Rec. 601 perceived luminance calculation.
 * Returns a normalized brightness between 0.0 (black) and 1.0 (white).
 */
export function calculateLuminance(r: number, g: number, b: number, invert = false): number {
  let lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0;
  if (invert) lum = 1.0 - lum;
  return Math.max(0.0, Math.min(1.0, lum));
}

/**
 * Quantizes a continuous 0.0..1.0 brightness value into discrete palette indices.
 */
export function quantizeLevel(brightness: number, steps: number = 7): number {
  return Math.min(steps - 1, Math.max(0, Math.floor(brightness * steps)));
}
