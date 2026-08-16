export type CellStyle = 'char' | 'block' | 'dot';

export type DitherAlgorithm = 
  | 'threshold'
  | 'bayer4'
  | 'bayer8'
  | 'floyd-steinberg'
  | 'atkinson'
  | 'noise-jitter';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface EngineConfig {
  resolution: number;        // Number of grid columns (10 to 250)
  style: CellStyle;          // Rendering glyph style
  ramp: string;              // Character ramp from shadow to highlight
  invert: boolean;           // Invert luminance mapping
  bgColor: string;           // Hex background color
  levelColors: string[];     // 7-step hex color palette (Shadow -> Highlight)
  algorithm: DitherAlgorithm;// Selected dithering / quantization algorithm
  jitterAmount: number;      // Stochastic perturbation intensity (0.0 to 1.0)
  
  // Hover Glow Animation parameters
  hoverEnabled: boolean;
  hoverColor: string;
  hoverRadius: number;       // In percentage (2 to 60)
  hoverIntensity: number;    // In percentage (0 to 100)
  fadeSpeed: number;         // Easing factor (2 to 60)
  
  // Video parameters
  fps: number;
  playbackRate: number;
}

export interface GridDimensions {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  targetW: number;
  targetH: number;
}

export interface MousePosition {
  x: number; // Internal canvas pixel X
  y: number; // Internal canvas pixel Y
}

export interface RenderStats {
  cols: number;
  rows: number;
  totalCells: number;
  fps: number;
  renderTimeMs: number;
}
