import type {
  AnsiColorMode,
  BrailleCell,
  BrailleRenderConfig,
  BrailleRenderStats,
  BrailleRGB,
  DrawTool,
} from './types';
import { encodeSubpixelsToBraille } from './braille-encoder';
import {
  formatBrailleGridToAnsi,
  formatBrailleGridToPlainText,
  formatBrailleGridToShellScript,
} from './ansi-formatter';

export class BrailleEngine {
  private config: BrailleRenderConfig;
  private targetCanvas: HTMLCanvasElement;
  private targetCtx: CanvasRenderingContext2D;

  private sourceCanvas: HTMLCanvasElement;
  private sourceCtx: CanvasRenderingContext2D;
  private sourceImage: HTMLImageElement | null = null;
  private sourceVideo: HTMLVideoElement | null = null;

  // Drawing Canvas Layer (Sub-pixel level)
  private paintCanvas: HTMLCanvasElement;
  private paintCtx: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastDrawPos: { x: number; y: number } | null = null;
  private currentTool: DrawTool = 'brush';
  private brushColor: string = '#ff5b35';
  private brushSize: number = 2;

  private grid: BrailleCell[][] = [];
  private rafId: number | null = null;
  private isDestroyed = false;

  public onStatsUpdate?: (stats: BrailleRenderStats) => void;
  public onGridUpdate?: (grid: BrailleCell[][]) => void;

  constructor(
    canvas: HTMLCanvasElement,
    initialConfig?: Partial<BrailleRenderConfig>
  ) {
    this.targetCanvas = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get Canvas 2D context for BrailleEngine');
    this.targetCtx = ctx;

    this.config = {
      mode: 'convert',
      cols: 80,
      threshold: 0.42,
      invert: false,
      edgeEnhance: 0.4,
      dither: 'floyd-steinberg',
      colorMode: 'truecolor',
      customColor: '#ff5b35',
      customBgColor: '#0a0a0f',
      enableBgColor: false,
      charSpacing: 0,
      crtEffect: false,
      fontSize: 14,
      ...initialConfig,
    };

    this.sourceCanvas = document.createElement('canvas');
    this.sourceCtx = this.sourceCanvas.getContext('2d', { willReadFrequently: true })!;

    this.paintCanvas = document.createElement('canvas');
    this.paintCtx = this.paintCanvas.getContext('2d', { willReadFrequently: true })!;

    this.initDefaultBlank();
    this.startLoop();
  }

  private initDefaultBlank(): void {
    const subW = this.config.cols * 2;
    const subH = Math.round(this.config.cols * 1.2) * 4;

    this.paintCanvas.width = subW;
    this.paintCanvas.height = subH;
    this.paintCtx.fillStyle = '#000000';
    this.paintCtx.fillRect(0, 0, subW, subH);

    this.sourceCanvas.width = subW;
    this.sourceCanvas.height = subH;
    this.sourceCtx.fillStyle = '#000000';
    this.sourceCtx.fillRect(0, 0, subW, subH);

    // Stamp a default cyber logo in paint canvas
    this.paintCtx.fillStyle = '#ff5b35';
    this.paintCtx.font = `bold ${Math.round(subW * 0.16)}px 'Geist Pixel Square', monospace`;
    this.paintCtx.textAlign = 'center';
    this.paintCtx.textBaseline = 'middle';
    this.paintCtx.fillText('BRAILLE', subW / 2, subH / 2 - 14);

    this.paintCtx.fillStyle = '#ffffff';
    this.paintCtx.font = `bold ${Math.round(subW * 0.10)}px 'Geist Mono', monospace`;
    this.paintCtx.fillText('2x4 SUBPIXEL', subW / 2, subH / 2 + 18);

    this.render();
  }

  // -------------------------------------------------------------
  // Config & Mode
  // -------------------------------------------------------------

  public setConfig(partial: Partial<BrailleRenderConfig>): void {
    this.config = { ...this.config, ...partial };
    this.render();
  }

  public getConfig(): BrailleRenderConfig {
    return this.config;
  }

  public setTool(tool: DrawTool): void {
    this.currentTool = tool;
  }

  public setBrushColor(color: string): void {
    this.brushColor = color;
  }

  public setBrushSize(size: number): void {
    this.brushSize = size;
  }

  public clearPaintCanvas(): void {
    this.paintCtx.fillStyle = '#000000';
    this.paintCtx.fillRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
    this.render();
  }

  // -------------------------------------------------------------
  // Media Loading
  // -------------------------------------------------------------

  public async loadImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.sourceImage = img;
          this.sourceVideo = null;
          this.config.mode = 'convert';
          this.sourceCanvas.width = img.width;
          this.sourceCanvas.height = img.height;
          this.sourceCtx.drawImage(img, 0, 0);
          this.render();
          resolve();
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public async loadVideo(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        this.sourceVideo = video;
        this.sourceImage = null;
        this.config.mode = 'convert';
        this.sourceCanvas.width = video.videoWidth;
        this.sourceCanvas.height = video.videoHeight;
        video.play().then(resolve).catch(resolve);
      };
      video.onerror = reject;
    });
  }

  // -------------------------------------------------------------
  // Interactive Paint Operations (Sub-pixel drawing)
  // -------------------------------------------------------------

  public handlePaintStart(subX: number, subY: number): void {
    this.isDrawing = true;
    this.lastDrawPos = { x: subX, y: subY };
    this.drawStroke(subX, subY);
  }

  public handlePaintMove(subX: number, subY: number): void {
    if (!this.isDrawing) return;
    this.drawStroke(subX, subY);
    this.lastDrawPos = { x: subX, y: subY };
  }

  public handlePaintEnd(): void {
    this.isDrawing = false;
    this.lastDrawPos = null;
  }

  private drawStroke(x: number, y: number): void {
    if (this.currentTool === 'eraser') {
      this.paintCtx.fillStyle = '#000000';
      this.paintCtx.fillRect(
        Math.floor(x - this.brushSize),
        Math.floor(y - this.brushSize),
        this.brushSize * 2,
        this.brushSize * 2
      );
    } else {
      this.paintCtx.fillStyle = this.brushColor;
      this.paintCtx.strokeStyle = this.brushColor;
      this.paintCtx.lineWidth = this.brushSize;
      this.paintCtx.lineCap = 'round';

      if (this.lastDrawPos) {
        this.paintCtx.beginPath();
        this.paintCtx.moveTo(this.lastDrawPos.x, this.lastDrawPos.y);
        this.paintCtx.lineTo(x, y);
        this.paintCtx.stroke();
      } else {
        this.paintCtx.beginPath();
        this.paintCtx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
        this.paintCtx.fill();
      }
    }
    this.render();
  }

  // -------------------------------------------------------------
  // Render & Format Loop
  // -------------------------------------------------------------

  public render(): void {
    const startTime = performance.now();

    const cols = Math.max(16, this.config.cols);
    const subW = cols * 2;

    let sourceW = this.sourceCanvas.width || 400;
    let sourceH = this.sourceCanvas.height || 300;

    if (this.config.mode === 'draw') {
      sourceW = this.paintCanvas.width;
      sourceH = this.paintCanvas.height;
    } else if (this.sourceVideo && this.sourceVideo.readyState >= 2) {
      this.sourceCtx.drawImage(
        this.sourceVideo,
        0,
        0,
        this.sourceCanvas.width,
        this.sourceCanvas.height
      );
    }

    const aspect = sourceW / Math.max(1, sourceH);
    // 2x4 subpixels per character cell, character cell aspect ratio ~ 0.5 (W:H)
    const charAspect = 0.5;
    const rows = Math.max(4, Math.round(cols / (aspect / charAspect)));
    const subH = rows * 4;

    // Rescale source into temporary sub-pixel buffer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = subW;
    tempCanvas.height = subH;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;

    if (this.config.mode === 'draw') {
      tempCtx.drawImage(this.paintCanvas, 0, 0, subW, subH);
    } else {
      tempCtx.drawImage(this.sourceCanvas, 0, 0, subW, subH);
    }

    const imgData = tempCtx.getImageData(0, 0, subW, subH).data;

    // Encode to Braille Grid
    this.grid = encodeSubpixelsToBraille(
      imgData,
      subW,
      subH,
      cols,
      rows,
      this.config.threshold,
      this.config.invert,
      this.config.dither,
      this.config.edgeEnhance
    );

    this.drawGridToTargetCanvas(cols, rows);

    const elapsed = performance.now() - startTime;
    const fps = elapsed > 0 ? Math.min(144, Math.round(1000 / Math.max(1, elapsed))) : 60;

    const stats: BrailleRenderStats = {
      cols,
      rows,
      subpixelW: subW,
      subpixelH: subH,
      totalSubpixels: subW * subH,
      renderTimeMs: elapsed,
      fps,
    };

    this.onStatsUpdate?.(stats);
    this.onGridUpdate?.(this.grid);
  }

  private drawGridToTargetCanvas(cols: number, rows: number): void {
    const fontSize = this.config.fontSize || 14;
    const charW = fontSize * 0.6;
    const charH = fontSize * 1.15;

    const targetW = Math.ceil(cols * charW);
    const targetH = Math.ceil(rows * charH);

    this.targetCanvas.width = targetW;
    this.targetCanvas.height = targetH;

    this.targetCtx.fillStyle = this.config.customBgColor || '#0a0a0f';
    this.targetCtx.fillRect(0, 0, targetW, targetH);

    this.targetCtx.font = `${fontSize}px 'Geist Pixel Square', monospace`;
    this.targetCtx.textBaseline = 'top';

    const colorMode = this.config.colorMode;

    for (let r = 0; r < rows; r++) {
      const row = this.grid[r];
      if (!row) continue;
      const y = r * charH;

      for (let c = 0; c < cols; c++) {
        const cell = row[c];
        if (!cell || cell.char === ' ') continue;
        const x = c * charW;

        if (colorMode === 'truecolor' || colorMode === '256color' || colorMode === '16color') {
          this.targetCtx.fillStyle = `rgb(${cell.fg.r},${cell.fg.g},${cell.fg.b})`;
        } else if (colorMode === 'amber') {
          this.targetCtx.fillStyle = '#ffb000';
        } else if (colorMode === 'green') {
          this.targetCtx.fillStyle = '#00ff66';
        } else {
          this.targetCtx.fillStyle = '#ededed';
        }

        this.targetCtx.fillText(cell.char, x, y);
      }
    }

    // CRT Scanlines effect
    if (this.config.crtEffect) {
      this.targetCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < targetH; y += 3) {
        this.targetCtx.fillRect(0, y, targetW, 1);
      }
    }
  }

  private startLoop(): void {
    const loop = () => {
      if (this.isDestroyed) return;
      if (this.sourceVideo && this.config.mode === 'convert') {
        this.render();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------
  // Exports
  // -------------------------------------------------------------

  public getGrid(): BrailleCell[][] {
    return this.grid;
  }

  public exportShellScript(filename = 'terminal-art.sh'): void {
    const script = formatBrailleGridToShellScript(this.grid, this.config.colorMode);
    const blob = new Blob([script], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.sh') ? filename : `${filename}.sh`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  public async copyAnsiToClipboard(): Promise<boolean> {
    const ansi = formatBrailleGridToAnsi(this.grid, this.config.colorMode);
    try {
      await navigator.clipboard.writeText(ansi);
      return true;
    } catch {
      return false;
    }
  }

  public async copyBrailleTextToClipboard(): Promise<boolean> {
    const text = formatBrailleGridToPlainText(this.grid);
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  public exportPng(filename = 'braille-terminal.png'): void {
    const a = document.createElement('a');
    a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    a.href = this.targetCanvas.toDataURL('image/png');
    a.click();
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.sourceVideo) this.sourceVideo.pause();
  }
}
