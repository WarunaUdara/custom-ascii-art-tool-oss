import type {
  EngineConfig,
  GridDimensions,
  MousePosition,
  RenderStats,
  RGBColor,
} from './types';
import {
  calculateLuminance,
  DEFAULT_ASCII_RAMP,
  DEFAULT_LEVEL_COLORS,
  hexToRgb,
} from './quantizer';
import { applyDithering } from './kernels';
import { renderGridToCanvas, updateHoverInfluence, generateAsciiText } from './renderer';

export class DitherEngine {
  private config: EngineConfig;
  private outputCanvas: HTMLCanvasElement;
  private outputCtx: CanvasRenderingContext2D;

  private sourceImage: HTMLImageElement | null = null;
  private sourceVideo: HTMLVideoElement | null = null;
  private sourceCanvas: HTMLCanvasElement;
  private sourceCtx: CanvasRenderingContext2D;

  private thumbCanvas: HTMLCanvasElement;
  private thumbCtx: CanvasRenderingContext2D;

  private grid: GridDimensions | null = null;
  private brightnessBuffer: Float32Array | null = null;
  private levelsBuffer: Uint8Array | null = null;
  private influenceBuffer: Float32Array | null = null;

  private mouse: MousePosition | null = null;
  private rafId: number | null = null;
  private isDirty = true;
  private isProcessing = false;

  // Video recording state
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private onRecordProgress?: (text: string, isRecording: boolean) => void;
  private onStatsUpdate?: (stats: RenderStats) => void;

  constructor(
    canvas: HTMLCanvasElement,
    initialConfig?: Partial<EngineConfig>,
    callbacks?: {
      onRecordProgress?: (text: string, isRecording: boolean) => void;
      onStatsUpdate?: (stats: RenderStats) => void;
    }
  ) {
    this.outputCanvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Failed to obtain 2D canvas context');
    this.outputCtx = ctx;

    this.sourceCanvas = document.createElement('canvas');
    this.sourceCtx = this.sourceCanvas.getContext('2d', { willReadFrequently: true })!;

    this.thumbCanvas = document.createElement('canvas');
    this.thumbCtx = this.thumbCanvas.getContext('2d', { willReadFrequently: true })!;

    this.config = {
      resolution: 80,
      style: 'char',
      ramp: DEFAULT_ASCII_RAMP,
      invert: false,
      bgColor: '#0b0b0d',
      levelColors: [...DEFAULT_LEVEL_COLORS],
      algorithm: 'threshold',
      jitterAmount: 0.3,
      hoverEnabled: true,
      hoverColor: '#ffffff',
      hoverRadius: 18,
      hoverIntensity: 100,
      fadeSpeed: 18,
      fps: 30,
      playbackRate: 1.0,
      ...initialConfig,
    };

    this.onRecordProgress = callbacks?.onRecordProgress;
    this.onStatsUpdate = callbacks?.onStatsUpdate;

    this.setupListeners();
    this.startLoop();
  }

  private setupListeners(): void {
    this.outputCanvas.addEventListener('mousemove', (e) => {
      const rect = this.outputCanvas.getBoundingClientRect();
      const scaleX = this.outputCanvas.width / rect.width;
      const scaleY = this.outputCanvas.height / rect.height;
      this.mouse = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    });

    this.outputCanvas.addEventListener('mouseleave', () => {
      this.mouse = null;
    });
  }

  public updateConfig(newConfig: Partial<EngineConfig>): void {
    const prevResolution = this.config.resolution;
    const prevAlgorithm = this.config.algorithm;
    const prevInvert = this.config.invert;

    this.config = { ...this.config, ...newConfig };

    const geometryChanged = newConfig.resolution !== undefined && newConfig.resolution !== prevResolution;
    const algorithmChanged = newConfig.algorithm !== undefined && newConfig.algorithm !== prevAlgorithm;
    const invertChanged = newConfig.invert !== undefined && newConfig.invert !== prevInvert;

    if (geometryChanged || algorithmChanged || invertChanged) {
      this.isDirty = true;
    }
  }

  public getConfig(): Readonly<EngineConfig> {
    return this.config;
  }

  public async loadImage(file: File): Promise<void> {
    this.stopVideo();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          this.sourceImage = img;
          this.sourceCanvas.width = img.width;
          this.sourceCanvas.height = img.height;
          this.sourceCtx.drawImage(img, 0, 0);
          this.isDirty = true;
          resolve();
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public async loadVideo(file: File): Promise<HTMLVideoElement> {
    this.sourceImage = null;
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = 'auto';

    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        this.sourceVideo = video;
        this.sourceCanvas.width = video.videoWidth;
        this.sourceCanvas.height = video.videoHeight;
        video.playbackRate = this.config.playbackRate;
        this.isDirty = true;
        resolve(video);
      };
      video.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
    });
  }

  private ensureGrid(): void {
    if (!this.sourceImage && !this.sourceVideo) return;

    const aspect = this.sourceImage
      ? this.sourceImage.width / this.sourceImage.height
      : this.sourceCanvas.width / this.sourceCanvas.height;

    const cols = this.config.resolution;
    const rows = Math.max(1, Math.round(cols / aspect));

    if (
      this.grid &&
      this.grid.cols === cols &&
      this.grid.rows === rows &&
      !this.isDirty
    ) {
      return;
    }

    const targetW = 1000;
    const targetH = Math.round(targetW / aspect);

    if (this.outputCanvas.width !== targetW || this.outputCanvas.height !== targetH) {
      this.outputCanvas.width = targetW;
      this.outputCanvas.height = targetH;
    }

    const cellW = targetW / cols;
    const cellH = targetH / rows;

    this.grid = { cols, rows, cellW, cellH, targetW, targetH };
    this.brightnessBuffer = new Float32Array(cols * rows);
    this.influenceBuffer = new Float32Array(cols * rows);
    this.thumbCanvas.width = cols;
    this.thumbCanvas.height = rows;
  }

  private sampleLuminance(): void {
    if (!this.grid || !this.brightnessBuffer) return;
    const { cols, rows } = this.grid;

    // Fast hardware downscale using thumbnail canvas
    this.thumbCtx.drawImage(this.sourceCanvas, 0, 0, cols, rows);
    const imgData = this.thumbCtx.getImageData(0, 0, cols, rows).data;
    const invert = this.config.invert;

    for (let i = 0, p = 0; i < this.brightnessBuffer.length; i++, p += 4) {
      this.brightnessBuffer[i] = calculateLuminance(
        imgData[p],
        imgData[p + 1],
        imgData[p + 2],
        invert
      );
    }

    // Apply selected dithering algorithm
    this.levelsBuffer = applyDithering(
      this.brightnessBuffer,
      cols,
      rows,
      this.config.algorithm,
      7,
      this.config.jitterAmount
    );
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
      this.ensureGrid();
      this.sampleLuminance();
    } else if (this.isDirty) {
      this.ensureGrid();
      this.sampleLuminance();
      this.isDirty = false;
    }

    if (!this.grid || !this.levelsBuffer) return;

    if (this.config.hoverEnabled && this.influenceBuffer) {
      const radiusPx = (this.config.hoverRadius / 100) * this.outputCanvas.width;
      const intensity = this.config.hoverIntensity / 100;
      const speed = this.config.fadeSpeed / 100;
      updateHoverInfluence(
        this.influenceBuffer,
        this.grid,
        this.mouse,
        radiusPx,
        intensity,
        speed
      );
    }

    const levelRgb: RGBColor[] = this.config.levelColors.map(hexToRgb);
    const hoverRgb = hexToRgb(this.config.hoverColor);

    renderGridToCanvas({
      ctx: this.outputCtx,
      canvas: this.outputCanvas,
      dimensions: this.grid,
      levels: this.levelsBuffer,
      levelRgb,
      hoverRgb,
      influence: this.influenceBuffer || new Float32Array(0),
      style: this.config.style,
      ramp: this.config.ramp,
      bgColor: this.config.bgColor,
    });

    const elapsed = performance.now() - startTime;
    if (this.onStatsUpdate && this.grid) {
      this.onStatsUpdate({
        cols: this.grid.cols,
        rows: this.grid.rows,
        totalCells: this.grid.cols * this.grid.rows,
        fps: Math.round(1000 / Math.max(1, elapsed)),
        renderTimeMs: parseFloat(elapsed.toFixed(2)),
      });
    }
  }

  private startLoop(): void {
    const step = () => {
      this.render();
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  public stopLoop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public exportPng(filename: string = 'dither-art.png'): void {
    const prevMouse = this.mouse;
    this.mouse = null;
    if (this.influenceBuffer) this.influenceBuffer.fill(0);
    this.render();

    const link = document.createElement('a');
    link.download = filename;
    link.href = this.outputCanvas.toDataURL('image/png');
    link.click();
    this.mouse = prevMouse;
  }

  /**
   * Exports the current frame as a raw ASCII character plain text string.
   */
  public exportAsciiText(): string {
    if (!this.grid || !this.levelsBuffer) return '';
    return generateAsciiText(this.levelsBuffer, this.grid, this.config.ramp);
  }

  /**
   * Copies the raw ASCII character string directly to the clipboard.
   */
  public async copyAsciiToClipboard(): Promise<boolean> {
    const text = this.exportAsciiText();
    if (!text) return false;
    try {
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Downloads the raw ASCII art as a .txt file.
   */
  public exportAsciiTxtFile(filename: string = 'dither-ascii.txt'): void {
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

  public async startVideoRender(filename: string = 'dither-video'): Promise<void> {
    if (!this.sourceVideo) return;
    const mime = this.pickVideoMime();
    if (!mime) {
      this.onRecordProgress?.('Unsupported browser video format', false);
      return;
    }

    const stream = this.outputCanvas.captureStream(this.config.fps);
    this.recordedChunks = [];

    try {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 8_000_000,
      });
    } catch (e) {
      this.onRecordProgress?.('Failed to start recorder', false);
      return;
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const isMp4 = this.mediaRecorder?.mimeType.includes('mp4');
      const blob = new Blob(this.recordedChunks, {
        type: isMp4 ? 'video/mp4' : 'video/webm',
      });
      const ext = isMp4 ? 'mp4' : 'webm';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.${ext}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      this.onRecordProgress?.(`Exported ${ext.toUpperCase()}`, false);
      this.mediaRecorder = null;
    };

    this.mediaRecorder.start(250);
    this.onRecordProgress?.('Rendering video...', true);

    this.sourceVideo.currentTime = 0;
    await this.sourceVideo.play();
  }

  public stopVideo(): void {
    if (this.sourceVideo) {
      this.sourceVideo.pause();
      this.sourceVideo = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  private pickVideoMime(): string {
    const formats = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    for (const f of formats) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(f)) {
        return f;
      }
    }
    return '';
  }

  public destroy(): void {
    this.stopLoop();
    this.stopVideo();
  }
}
