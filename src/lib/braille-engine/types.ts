export type AnsiColorMode =
  | 'truecolor' // 24-bit RGB (\x1b[38;2;R;G;Bm)
  | '256color'  // 8-bit xterm 256 colors (\x1b[38;5;Nm)
  | '16color'   // 4-bit standard ANSI
  | 'amber'     // Amber CRT Phosphor (#ffb000)
  | 'green'     // Green Matrix CRT (#00ff66)
  | 'mono';     // Monochrome white

export type DitherMode =
  | 'threshold'
  | 'floyd-steinberg'
  | 'bayer'
  | 'edge-preserve';

export type DrawTool =
  | 'brush'
  | 'eraser'
  | 'line'
  | 'rect'
  | 'circle'
  | 'text';

export interface BrailleRGB {
  r: number;
  g: number;
  b: number;
}

export interface BrailleCell {
  char: string;
  code: number;
  fg: BrailleRGB;
  bg?: BrailleRGB;
}

export interface BrailleRenderConfig {
  mode: 'convert' | 'draw';
  cols: number; // Character columns in terminal
  threshold: number; // 0.0 to 1.0
  invert: boolean;
  edgeEnhance: number; // 0.0 to 2.0
  dither: DitherMode;
  colorMode: AnsiColorMode;
  customColor: string;
  customBgColor: string;
  enableBgColor: boolean;
  charSpacing: number;
  crtEffect: boolean;
  fontSize: number; // For preview rendering (px)
}

export interface BrailleRenderStats {
  cols: number;
  rows: number;
  subpixelW: number;
  subpixelH: number;
  totalSubpixels: number;
  renderTimeMs: number;
  fps: number;
}
