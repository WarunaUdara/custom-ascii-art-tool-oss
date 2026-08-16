import type { TextSourceConfig } from './types';

export class TextRasterizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not create Canvas 2D context for TextRasterizer');
    this.ctx = ctx;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Rasterizes multi-line text with custom font, size, leading, and kerning.
   */
  public renderText(config: TextSourceConfig): HTMLCanvasElement {
    const {
      text = 'ASCII\nMATRIX',
      fontFamily = 'Geist Pixel Grid',
      fontSize = 64,
      leading = 1.2,
      kerning = 2,
      color = '#ffffff',
      bgColor = '#000000',
      align = 'center',
      padding = 40,
    } = config;

    const lines = text.split('\n');
    const lineHeight = fontSize * leading;

    // Temporary measure to find required canvas dimensions
    this.ctx.font = `bold ${fontSize}px ${fontFamily}, monospace`;
    let maxLineWidth = 0;

    for (const line of lines) {
      let lineWidth = 0;
      for (let i = 0; i < line.length; i++) {
        lineWidth += this.ctx.measureText(line[i]).width + kerning;
      }
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
    }

    const totalHeight = Math.max(100, lines.length * lineHeight + padding * 2);
    const totalWidth = Math.max(100, maxLineWidth + padding * 2);

    // Resize canvas
    this.canvas.width = Math.ceil(totalWidth);
    this.canvas.height = Math.ceil(totalHeight);

    // Background fill
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Setup text drawing
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${fontSize}px ${fontFamily}, monospace`;
    this.ctx.textBaseline = 'top';

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const y = padding + lineIndex * lineHeight;

      // Calculate line width for alignment
      let lineWidth = 0;
      for (let i = 0; i < line.length; i++) {
        lineWidth += this.ctx.measureText(line[i]).width + kerning;
      }

      let startX = padding;
      if (align === 'center') {
        startX = (this.canvas.width - lineWidth) / 2;
      } else if (align === 'right') {
        startX = this.canvas.width - padding - lineWidth;
      }

      let currentX = startX;
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        this.ctx.fillText(char, currentX, y);
        currentX += this.ctx.measureText(char).width + kerning;
      }
    }

    return this.canvas;
  }
}
