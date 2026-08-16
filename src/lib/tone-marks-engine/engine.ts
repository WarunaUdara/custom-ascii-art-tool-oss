import type {
  BlendMode,
  RandomSwitchConfig,
  TextSourceConfig,
  ToneGridDimensions,
  ToneMarksConfig,
  ToneRenderStats,
  ToneRow,
} from './types';
import { clearMarkCache, getOrCreateBlendedMarkTile, hexToRgb, lerpColor, type RGB } from './blender';
import { TextRasterizer } from './text-rasterizer';

export const DEFAULT_BUILTIN_TONES: ToneRow[] = [
  {
    id: 'tone-shadow',
    name: 'Shadow',
    color: '#1a0d08',
    thresholdStop: 0.10,
    markType: 'builtin',
    builtinPreset: 'block',
    blendMode: 'source-over',
    isStrongArea: false,
  },
  {
    id: 'tone-mid-1',
    name: 'Midtone S',
    color: '#6e1f0b',
    thresholdStop: 0.28,
    markType: 'builtin',
    builtinPreset: 'hatch',
    blendMode: 'source-over',
    isStrongArea: false,
  },
  {
    id: 'tone-mid-2',
    name: 'Midtone M',
    color: '#b83b14',
    thresholdStop: 0.48,
    markType: 'builtin',
    builtinPreset: 'stipple',
    blendMode: 'source-over',
    isStrongArea: false,
  },
  {
    id: 'tone-mid-3',
    name: 'Midtone L',
    color: '#eb6128',
    thresholdStop: 0.72,
    markType: 'builtin',
    builtinPreset: 'plus',
    blendMode: 'source-over',
    isStrongArea: true,
  },
  {
    id: 'tone-highlight',
    name: 'Highlight',
    color: '#ffd4a8',
    thresholdStop: 0.92,
    markType: 'builtin',
    builtinPreset: 'circle',
    blendMode: 'source-over',
    isStrongArea: true,
  },
];

export class ToneMarksEngine {
  private config: ToneMarksConfig;
  private toneRows: ToneRow[];
  private textConfig: TextSourceConfig;
  private randomConfig: RandomSwitchConfig;

  private outputCanvas: HTMLCanvasElement;
  private outputCtx: CanvasRenderingContext2D;

  private textRasterizer: TextRasterizer;
  private sourceImage: HTMLImageElement | null = null;
  private sourceVideo: HTMLVideoElement | null = null;
  private sourceCanvas: HTMLCanvasElement;
  private sourceCtx: CanvasRenderingContext2D;

  private thumbCanvas: HTMLCanvasElement;
  private thumbCtx: CanvasRenderingContext2D;

  private grid: ToneGridDimensions | null = null;
  private brightnessBuffer: Float32Array | null = null;
  private toneIndicesBuffer: Uint8Array | null = null;
  private jitterOffsetBuffer: Float32Array | null = null;
  private influenceBuffer: Float32Array | null = null;

  private rafId: number | null = null;
  private randomTimerId: any = null;
  private isDestroyed = false;

  private mouse: { x: number; y: number } | null = null;
  private lastStats: ToneRenderStats | null = null;

  public onStatsUpdate?: (stats: ToneRenderStats) => void;

  constructor(
    canvas: HTMLCanvasElement,
    initialConfig?: Partial<ToneMarksConfig>,
    initialTones?: ToneRow[],
    initialText?: Partial<TextSourceConfig>
  ) {
    this.outputCanvas = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get Canvas 2D context');
    this.outputCtx = ctx;

    this.config = {
      sourceType: 'text',
      gridResolution: 72,
      bgColor: '#060608',
      invert: false,
      cellScale: 1.0,
      globalBlendMode: 'source-over',
      enableHoverGlow: true,
      hoverColor: '#ffffff',
      hoverRadius: 18,
      hoverIntensity: 1.0,
      fadeSpeed: 0.18,
      ...initialConfig,
    };

    this.toneRows = initialTones && initialTones.length > 0
      ? JSON.parse(JSON.stringify(initialTones))
      : JSON.parse(JSON.stringify(DEFAULT_BUILTIN_TONES));

    this.textConfig = {
      text: 'MATRIX\nTYPO',
      fontFamily: 'Geist Pixel Grid',
      fontSize: 84,
      leading: 1.15,
      kerning: 3,
      color: '#ffffff',
      bgColor: '#000000',
      align: 'center',
      padding: 30,
      ...initialText,
    };

    this.randomConfig = {
      enabled: false,
      amount: 0.35,
      reach: 2,
      intervalMs: 800,
      autoLoop: false,
    };

    this.textRasterizer = new TextRasterizer();

    this.sourceCanvas = document.createElement('canvas');
    this.sourceCtx = this.sourceCanvas.getContext('2d', { willReadFrequently: true })!;

    this.thumbCanvas = document.createElement('canvas');
    this.thumbCtx = this.thumbCanvas.getContext('2d', { willReadFrequently: true })!;

    this.updateSourceFromText();
    this.startLoop();
  }

  // -------------------------------------------------------------
  // Tone Rows Management
  // -------------------------------------------------------------

  public getToneRows(): ToneRow[] {
    return this.toneRows;
  }

  public setToneRows(rows: ToneRow[]): void {
    this.toneRows = rows;
    this.sortToneRows();
    clearMarkCache();
    this.render();
  }

  public addToneRow(): void {
    const id = `tone-mid-${Date.now()}`;
    const count = this.toneRows.length;
    const newStop = 0.5;
    const newTone: ToneRow = {
      id,
      name: `Tone ${count}`,
      color: '#d94b18',
      thresholdStop: newStop,
      markType: 'builtin',
      builtinPreset: 'stipple',
      blendMode: this.config.globalBlendMode || 'source-over',
      isStrongArea: false,
    };
    this.toneRows.push(newTone);
    this.sortToneRows();
    clearMarkCache();
    this.render();
  }

  public removeToneRow(id: string): void {
    if (this.toneRows.length <= 2) return; // Keep at least 2
    this.toneRows = this.toneRows.filter(r => r.id !== id);
    this.sortToneRows();
    clearMarkCache();
    this.render();
  }

  public updateToneRow(id: string, partial: Partial<ToneRow>): void {
    const idx = this.toneRows.findIndex(r => r.id === id);
    if (idx === -1) return;
    this.toneRows[idx] = { ...this.toneRows[idx], ...partial };
    this.sortToneRows();
    clearMarkCache();
    this.render();
  }

  public restoreBuiltinTones(): void {
    this.toneRows = JSON.parse(JSON.stringify(DEFAULT_BUILTIN_TONES));
    clearMarkCache();
    this.render();
  }

  public async setMarkFromFile(toneId: string, file: File): Promise<void> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          this.updateToneRow(toneId, {
            markType: 'custom',
            markDataUrl: dataUrl,
            markImage: img,
          });
          resolve();
        };
        img.onerror = reject;
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private sortToneRows(): void {
    this.toneRows.sort((a, b) => a.thresholdStop - b.thresholdStop);
  }

  // -------------------------------------------------------------
  // Sources (Text, Image, Video)
  // -------------------------------------------------------------

  public updateTextSource(config: Partial<TextSourceConfig>): void {
    this.textConfig = { ...this.textConfig, ...config };
    if (this.config.sourceType === 'text') {
      this.updateSourceFromText();
      this.render();
    }
  }

  public getTextConfig(): TextSourceConfig {
    return this.textConfig;
  }

  private updateSourceFromText(): void {
    const canvas = this.textRasterizer.renderText(this.textConfig);
    this.sourceCanvas.width = canvas.width;
    this.sourceCanvas.height = canvas.height;
    this.sourceCtx.clearRect(0, 0, canvas.width, canvas.height);
    this.sourceCtx.drawImage(canvas, 0, 0);
    this.sourceImage = null;
    this.sourceVideo = null;
    this.updateGridGeometry();
  }

  public async loadSourceImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          this.sourceImage = img;
          this.sourceVideo = null;
          this.config.sourceType = 'image';
          this.sourceCanvas.width = img.width;
          this.sourceCanvas.height = img.height;
          this.sourceCtx.clearRect(0, 0, img.width, img.height);
          this.sourceCtx.drawImage(img, 0, 0);
          this.updateGridGeometry();
          this.render();
          resolve();
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public async loadSourceVideo(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        if (!video.videoWidth) return;
        this.sourceVideo = video;
        this.sourceImage = null;
        this.config.sourceType = 'video';
        this.sourceCanvas.width = video.videoWidth;
        this.sourceCanvas.height = video.videoHeight;
        this.updateGridGeometry();
        video.play().then(resolve).catch(resolve);
      };
      video.onerror = reject;
    });
  }

  // -------------------------------------------------------------
  // Grid & Luminance
  // -------------------------------------------------------------

  public setConfig(partial: Partial<ToneMarksConfig>): void {
    this.config = { ...this.config, ...partial };
    if (partial.sourceType === 'text') {
      this.updateSourceFromText();
    }
    if (partial.gridResolution) {
      this.updateGridGeometry();
    }
    this.render();
  }

  public getConfig(): ToneMarksConfig {
    return this.config;
  }

  private updateGridGeometry(): void {
    const cols = Math.max(8, this.config.gridResolution);
    const aspect = this.sourceCanvas.width / Math.max(1, this.sourceCanvas.height);
    const rows = Math.max(1, Math.round(cols / aspect));

    const targetW = 960;
    const targetH = Math.round(targetW / aspect);

    this.outputCanvas.width = targetW;
    this.outputCanvas.height = targetH;

    const cellW = targetW / cols;
    const cellH = targetH / rows;

    this.grid = { cols, rows, cellW, cellH, targetW, targetH };
    this.brightnessBuffer = new Float32Array(cols * rows);
    this.toneIndicesBuffer = new Uint8Array(cols * rows);
    this.jitterOffsetBuffer = new Float32Array(cols * rows);
    this.influenceBuffer = new Float32Array(cols * rows);

    this.thumbCanvas.width = cols;
    this.thumbCanvas.height = rows;
  }

  private sampleLuminance(): void {
    if (!this.grid || !this.brightnessBuffer || !this.toneIndicesBuffer) return;
    const { cols, rows } = this.grid;

    this.thumbCtx.drawImage(this.sourceCanvas, 0, 0, cols, rows);
    const imgData = this.thumbCtx.getImageData(0, 0, cols, rows).data;
    const invert = this.config.invert;

    const numTones = this.toneRows.length;
    if (numTones < 2) return;

    for (let i = 0, p = 0; i < this.brightnessBuffer.length; i++, p += 4) {
      const alpha = imgData[p + 3] / 255;
      let lum = ((imgData[p] * 0.299 + imgData[p + 1] * 0.587 + imgData[p + 2] * 0.114) / 255) * alpha;
      if (invert) lum = 1.0 - lum;
      this.brightnessBuffer[i] = lum;

      // Find closest tone row based on threshold stops
      let toneIdx = 0;
      for (let t = 0; t < numTones; t++) {
        if (lum >= this.toneRows[t].thresholdStop) {
          toneIdx = t;
        }
      }

      // Add jitter permutation if present
      if (this.jitterOffsetBuffer && this.jitterOffsetBuffer[i] !== 0) {
        const shifted = Math.max(0, Math.min(numTones - 1, toneIdx + Math.round(this.jitterOffsetBuffer[i])));
        toneIdx = shifted;
      }

      this.toneIndicesBuffer[i] = toneIdx;
    }
  }

  // -------------------------------------------------------------
  // Random Tone Switching & Hotkey Q
  // -------------------------------------------------------------

  public setRandomConfig(config: Partial<RandomSwitchConfig>): void {
    this.randomConfig = { ...this.randomConfig, ...config };
    if (this.randomTimerId) clearInterval(this.randomTimerId);
    if (this.randomConfig.autoLoop && this.randomConfig.enabled) {
      this.randomTimerId = setInterval(() => {
        this.triggerRandomSwitch();
      }, Math.max(100, this.randomConfig.intervalMs));
    }
  }

  public getRandomConfig(): RandomSwitchConfig {
    return this.randomConfig;
  }

  /**
   * Procedurally mutates / shuffles midtone marks across the matrix.
   * Can be triggered on timer or instantly via 'Q' keypress.
   */
  public triggerRandomSwitch(
    customAmount?: number,
    customReach?: number
  ): void {
    if (!this.jitterOffsetBuffer || !this.grid) return;
    const amount = customAmount !== undefined ? customAmount : this.randomConfig.amount;
    const reach = customReach !== undefined ? customReach : this.randomConfig.reach;

    const total = this.jitterOffsetBuffer.length;
    for (let i = 0; i < total; i++) {
      if (Math.random() < amount) {
        const offset = (Math.floor(Math.random() * (reach * 2 + 1)) - reach);
        this.jitterOffsetBuffer[i] = offset;
      } else {
        this.jitterOffsetBuffer[i] = 0;
      }
    }
    this.render();
  }

  // -------------------------------------------------------------
  // Render Loop & Canvas Drawing
  // -------------------------------------------------------------

  public handleMouseMove(x: number, y: number): void {
    this.mouse = { x, y };
  }

  public handleMouseLeave(): void {
    this.mouse = null;
  }

  public render(): void {
    const startTime = performance.now();

    if (this.sourceVideo && this.sourceVideo.readyState >= 2) {
      this.sourceCtx.drawImage(
        this.sourceVideo,
        0,
        0,
        this.sourceCanvas.width,
        this.sourceCanvas.height
      );
    }

    this.sampleLuminance();

    if (!this.grid || !this.toneIndicesBuffer) return;
    const { cols, rows, cellW, cellH } = this.grid;
    const tileSize = Math.max(12, Math.round(Math.min(cellW, cellH) * 1.5));

    // Clear canvas background
    this.outputCtx.fillStyle = this.config.bgColor;
    this.outputCtx.fillRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);

    // Update mouse hover influence
    if (this.config.enableHoverGlow && this.influenceBuffer) {
      const radiusPx = (this.config.hoverRadius / 100) * this.outputCanvas.width;
      for (let r = 0; r < rows; r++) {
        const rowOffset = r * cols;
        const cy = r * cellH + cellH / 2;
        for (let c = 0; c < cols; c++) {
          const idx = rowOffset + c;
          let target = 0;
          if (this.mouse) {
            const cx = c * cellW + cellW / 2;
            const dist = Math.hypot(cx - this.mouse.x, cy - this.mouse.y);
            const t = 1.0 - Math.min(1.0, dist / radiusPx);
            target = Math.max(0, t) * this.config.hoverIntensity;
          }
          this.influenceBuffer[idx] += (target - this.influenceBuffer[idx]) * this.config.fadeSpeed;
          if (Math.abs(this.influenceBuffer[idx]) < 0.001) this.influenceBuffer[idx] = 0;
        }
      }
    }

    const hoverRgb = hexToRgb(this.config.hoverColor);
    const drawScale = this.config.cellScale;
    const drawW = cellW * drawScale;
    const drawH = cellH * drawScale;

    // Draw cached mark tiles
    for (let r = 0; r < rows; r++) {
      const rowOffset = r * cols;
      const cy = r * cellH + cellH / 2;

      for (let c = 0; c < cols; c++) {
        const idx = rowOffset + c;
        const toneIdx = this.toneIndicesBuffer[idx];
        const tone = this.toneRows[toneIdx] || this.toneRows[0];
        const tile = getOrCreateBlendedMarkTile(tone, tileSize);

        const cx = c * cellW + cellW / 2;
        const dx = cx - drawW / 2;
        const dy = cy - drawH / 2;

        const inf = this.influenceBuffer ? this.influenceBuffer[idx] : 0;

        if (inf > 0.01) {
          // Glow boost
          this.outputCtx.save();
          this.outputCtx.globalAlpha = Math.min(1.0, 0.8 + inf * 0.4);
          this.outputCtx.drawImage(tile, dx, dy, drawW, drawH);
          this.outputCtx.restore();
        } else {
          this.outputCtx.drawImage(tile, dx, dy, drawW, drawH);
        }
      }
    }

    const elapsed = performance.now() - startTime;
    const fps = elapsed > 0 ? Math.min(144, Math.round(1000 / Math.max(1, elapsed))) : 60;

    this.lastStats = {
      cols,
      rows,
      totalCells: cols * rows,
      renderTimeMs: elapsed,
      fps,
      toneCount: this.toneRows.length,
    };

    this.onStatsUpdate?.(this.lastStats);
  }

  private startLoop(): void {
    const loop = () => {
      if (this.isDestroyed) return;
      if (this.sourceVideo || (this.config.enableHoverGlow && this.mouse)) {
        this.render();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------
  // Exports
  // -------------------------------------------------------------

  public exportPng(filename: string = 'tone-matrix.png'): void {
    const prevMouse = this.mouse;
    this.mouse = null;
    this.render();
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.outputCanvas.toDataURL('image/png');
    link.click();
    this.mouse = prevMouse;
  }

  public exportAsciiText(): string {
    if (!this.grid || !this.toneIndicesBuffer) return '';
    const { cols, rows } = this.grid;
    const lines: string[] = [];
    for (let r = 0; r < rows; r++) {
      let line = '';
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const toneIdx = this.toneIndicesBuffer[idx];
        const tone = this.toneRows[toneIdx];
        const ch = tone.markChar || (tone.builtinPreset === 'block' ? '█' : tone.builtinPreset === 'dot' ? '•' : '#');
        line += ch;
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  public async copyAsciiToClipboard(): Promise<boolean> {
    const text = this.exportAsciiText();
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  public exportAsciiTxtFile(filename: string = 'tone-matrix.txt'): void {
    const text = this.exportAsciiText();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.randomTimerId) clearInterval(this.randomTimerId);
    if (this.sourceVideo) this.sourceVideo.pause();
    clearMarkCache();
  }
}
