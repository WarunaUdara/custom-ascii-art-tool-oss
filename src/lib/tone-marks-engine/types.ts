export type BlendMode =
  | 'source-over' // Original colours
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface ToneRow {
  id: string;
  name: string;
  color: string;
  thresholdStop: number; // 0.0 to 1.0
  markType: 'builtin' | 'custom';
  builtinPreset?: 'char' | 'dot' | 'block' | 'cross' | 'stipple' | 'hatch' | 'plus' | 'circle';
  markChar?: string;
  markDataUrl?: string;
  markImage?: HTMLImageElement;
  blendMode: BlendMode;
  isStrongArea?: boolean; // Dedicated strong-area pixels
  opacity?: number;
}

export interface TextSourceConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  leading: number; // line-height multiplier
  kerning: number; // letter-spacing in px
  color: string;
  bgColor: string;
  align: 'left' | 'center' | 'right';
  padding: number;
}

export interface RandomSwitchConfig {
  enabled: boolean;
  amount: number; // 0.0 to 1.0 (percentage of cells affected)
  reach: number; // 1 to 5 (how many adjacent tone steps can be swapped)
  intervalMs: number; // 100ms to 3000ms
  autoLoop: boolean;
}

export interface ToneMarksConfig {
  sourceType: 'text' | 'image' | 'video';
  gridResolution: number; // columns count
  bgColor: string;
  invert: boolean;
  cellScale: number; // 0.5 to 2.0
  globalBlendMode: BlendMode;
  enableHoverGlow: boolean;
  hoverColor: string;
  hoverRadius: number; // percentage
  hoverIntensity: number;
  fadeSpeed: number;
}

export interface ToneGridDimensions {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  targetW: number;
  targetH: number;
}

export interface ToneRenderStats {
  cols: number;
  rows: number;
  totalCells: number;
  renderTimeMs: number;
  fps: number;
  toneCount: number;
}
