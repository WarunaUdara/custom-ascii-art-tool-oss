<script lang="ts">
  import type { BrailleRenderConfig, BrailleRenderStats } from '../../lib/braille-engine';

  interface Props {
    canvasRef: HTMLCanvasElement | null;
    stats: BrailleRenderStats | null;
    config: BrailleRenderConfig;
    onExportScript: () => void;
    onCopyAnsi: () => void;
    onCopyBraille: () => void;
    onExportPng: () => void;
    onPaintStart: (x: number, y: number) => void;
    onPaintMove: (x: number, y: number) => void;
    onPaintEnd: () => void;
  }

  let {
    canvasRef = $bindable(null),
    stats,
    config,
    onExportScript,
    onCopyAnsi,
    onCopyBraille,
    onExportPng,
    onPaintStart,
    onPaintMove,
    onPaintEnd,
  }: Props = $props();

  let copyAnsiFeedback = $state(false);
  let copyBrailleFeedback = $state(false);

  function handleCopyAnsiClick() {
    onCopyAnsi();
    copyAnsiFeedback = true;
    setTimeout(() => {
      copyAnsiFeedback = false;
    }, 2000);
  }

  function handleCopyBrailleClick() {
    onCopyBraille();
    copyBrailleFeedback = true;
    setTimeout(() => {
      copyBrailleFeedback = false;
    }, 2000);
  }

  function handleMouseDown(e: MouseEvent) {
    if (config.mode !== 'draw' || !canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * (config.cols * 2);
    const y = ((e.clientY - rect.top) / rect.height) * (stats?.subpixelH || 100);
    onPaintStart(x, y);
  }

  function handleMouseMove(e: MouseEvent) {
    if (config.mode !== 'draw' || !canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * (config.cols * 2);
    const y = ((e.clientY - rect.top) / rect.height) * (stats?.subpixelH || 100);
    onPaintMove(x, y);
  }
</script>

<div class="terminal-stage-container" role="region" aria-label="ANSI Braille Terminal Stage">
  <!-- Top Export Actions Toolbar -->
  <div class="stage-top-actions">
    <div class="stage-identity font-pixel">STAGE 03 // ANSI & BRAILLE STUDIO</div>

    <div class="export-buttons-group">
      <!-- Download .sh Script -->
      <button
        type="button"
        class="stage-btn script-btn font-pixel corner-ticks"
        onclick={onExportScript}
        title="Download executable Bash Shell Script (.sh) for terminal banners"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        <span>DOWNLOAD .SH SCRIPT</span>
      </button>

      <!-- Copy ANSI Escapes -->
      <button
        type="button"
        class="stage-btn secondary font-pixel corner-ticks"
        onclick={handleCopyAnsiClick}
        title="Copy raw ANSI escape sequences for bashrc / terminal MOTD"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="14" height="14" x="8" y="8" rx="0" ry="0"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span>{copyAnsiFeedback ? 'COPIED ANSI!' : 'COPY ANSI'}</span>
      </button>

      <!-- Copy Plain Braille Text -->
      <button
        type="button"
        class="stage-btn secondary font-pixel corner-ticks"
        onclick={handleCopyBrailleClick}
        title="Copy plain Unicode Braille characters (no color codes) for Discord / GitHub"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>{copyBrailleFeedback ? 'COPIED BRAILLE!' : 'COPY BRAILLE'}</span>
      </button>

      <!-- Export PNG -->
      <button
        type="button"
        class="stage-btn primary font-pixel corner-ticks"
        onclick={onExportPng}
        title="Export full resolution PNG image"
      >
        <span class="tick-tl" style="--tick-color: #000000;"></span>
        <span class="tick-tr" style="--tick-color: #000000;"></span>
        <span class="tick-bl" style="--tick-color: #000000;"></span>
        <span class="tick-br" style="--tick-color: #000000;"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>EXPORT PNG</span>
      </button>
    </div>
  </div>

  <!-- Terminal Window Simulator -->
  <div class="terminal-window-wrapper">
    <div class="terminal-window corner-ticks">
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>

      <!-- Terminal Window Chrome Bar -->
      <div class="terminal-titlebar">
        <div class="window-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="terminal-title font-mono">
          bash — {stats ? `${stats.cols}×${stats.rows}` : '80x24'} — 2x4 Unicode Braille
        </div>
        <div class="window-right font-mono">
          <span class="color-badge font-mono">{config.colorMode.toUpperCase()}</span>
        </div>
      </div>

      <!-- Terminal Canvas Stage -->
      <div class="terminal-body" class:crt={config.crtEffect} class:draw-mode={config.mode === 'draw'}>
        <canvas
          bind:this={canvasRef}
          id="braille-terminal-canvas"
          onmousedown={handleMouseDown}
          onmousemove={handleMouseMove}
          onmouseup={onPaintEnd}
          onmouseleave={onPaintEnd}
        ></canvas>
      </div>
    </div>
  </div>

  <!-- Bottom Telemetry HUD -->
  {#if stats}
    <div class="telemetry-hud font-mono corner-ticks">
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>
      <div class="hud-item">
        <span class="hud-label">COLS</span>
        <span class="hud-value">{stats.cols}</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">ROWS</span>
        <span class="hud-value">{stats.rows}</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">SUBPIXELS (2x4)</span>
        <span class="hud-value highlight">{stats.subpixelW}×{stats.subpixelH} ({stats.totalSubpixels.toLocaleString()} dots)</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">LATENCY</span>
        <span class="hud-value">{stats.renderTimeMs.toFixed(1)}ms</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">RATE</span>
        <span class="hud-value">{stats.fps} FPS</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .terminal-stage-container {
    flex: 1;
    height: 100%;
    position: relative;
    background: #000000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .stage-top-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #09090c;
    border-bottom: 1px solid #1f1f26;
    z-index: 10;
  }

  .stage-identity {
    font-size: 11px;
    color: #a1a1aa;
    letter-spacing: 0.05em;
  }

  .export-buttons-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stage-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 10px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }

  .stage-btn.script-btn {
    background: #ff5b35;
    color: #000000;
    font-weight: 700;
  }

  .stage-btn.script-btn:hover {
    background: #ff7454;
    box-shadow: 0 0 14px rgba(255, 91, 53, 0.4);
  }

  .stage-btn.primary {
    background: #ededed;
    color: #000000;
    font-weight: 700;
  }

  .stage-btn.primary:hover {
    background: #ffffff;
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.25);
  }

  .stage-btn.secondary {
    background: #121218;
    color: #ededed;
    border-color: #27272f;
  }

  .stage-btn.secondary:hover {
    border-color: #ff5b35;
    color: #ffffff;
    background: #181822;
  }

  .terminal-window-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: 
      linear-gradient(to right, #0d0d14 1px, transparent 1px),
      linear-gradient(to bottom, #0d0d14 1px, transparent 1px);
    background-size: 24px 24px;
    overflow: auto;
    padding: 24px;
  }

  .terminal-window {
    position: relative;
    background: #0a0a0f;
    border: 1px solid #27272f;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 91, 53, 0.1);
    max-width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .terminal-titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: #111116;
    border-bottom: 1px solid #1f1f26;
    user-select: none;
  }

  .window-dots {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 8px;
    height: 8px;
  }

  .dot.red { background: #ef4444; }
  .dot.yellow { background: #eab308; }
  .dot.green { background: #22c55e; }

  .terminal-title {
    font-size: 10px;
    color: #a1a1aa;
    letter-spacing: 0.04em;
  }

  .color-badge {
    font-size: 9px;
    color: #ff5b35;
    background: rgba(255, 91, 53, 0.1);
    padding: 2px 6px;
  }

  .terminal-body {
    position: relative;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: #06060a;
  }

  .terminal-body.draw-mode canvas {
    cursor: crosshair;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .telemetry-hud {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(9, 9, 12, 0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid #27272f;
    padding: 6px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 10px;
    z-index: 20;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    white-space: nowrap;
  }

  .hud-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .hud-label {
    color: #71717a;
    font-size: 9px;
  }

  .hud-value {
    color: #ededed;
    font-weight: 500;
  }

  .hud-value.highlight {
    color: #ff5b35;
    font-weight: 700;
  }

  .hud-divider {
    color: #27272f;
  }
</style>
