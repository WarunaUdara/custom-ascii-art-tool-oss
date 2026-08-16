<script lang="ts">
  import type { ToneRenderStats } from '../../lib/tone-marks-engine';

  interface Props {
    canvasRef: HTMLCanvasElement | null;
    stats: ToneRenderStats | null;
    onExportPng: () => void;
    onCopyText: () => void;
    onExportTxt: () => void;
    onMouseMove: (x: number, y: number) => void;
    onMouseLeave: () => void;
  }

  let {
    canvasRef = $bindable(null),
    stats,
    onExportPng,
    onCopyText,
    onExportTxt,
    onMouseMove,
    onMouseLeave,
  }: Props = $props();

  let copiedFeedback = $state(false);

  function handleCopy() {
    onCopyText();
    copiedFeedback = true;
    setTimeout(() => {
      copiedFeedback = false;
    }, 2000);
  }

  function handleCanvasMove(e: MouseEvent) {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.height;
    onMouseMove(x, y);
  }
</script>

<div class="stage-viewport" role="region" aria-label="Tone Marks Canvas Viewport">
  <!-- Top Export Actions Bar -->
  <div class="stage-top-bar">
    <div class="stage-tag font-pixel">STAGE 02 // TONE MATRIX ENGINE</div>
    
    <div class="export-actions">
      <!-- Copy Text -->
      <button
        type="button"
        class="stage-btn secondary font-pixel corner-ticks"
        onclick={handleCopy}
        title="Copy ASCII character matrix to clipboard"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="14" height="14" x="8" y="8" rx="0" ry="0"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span>{copiedFeedback ? 'COPIED!' : 'COPY ASCII'}</span>
      </button>

      <!-- Save TXT -->
      <button
        type="button"
        class="stage-btn secondary font-pixel corner-ticks"
        onclick={onExportTxt}
        title="Download plain text .txt file"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span>SAVE .TXT</span>
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

  <!-- Canvas Container -->
  <div class="canvas-display-wrapper">
    <canvas
      bind:this={canvasRef}
      id="tone-marks-canvas"
      onmousemove={handleCanvasMove}
      onmouseleave={onMouseLeave}
    ></canvas>
  </div>

  <!-- Bottom Telemetry HUD with Decorated Corners -->
  {#if stats}
    <div class="telemetry-hud font-mono corner-ticks">
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>
      <div class="hud-item">
        <span class="hud-label">GRID</span>
        <span class="hud-value">{stats.cols}×{stats.rows}</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">CELLS</span>
        <span class="hud-value">{stats.totalCells.toLocaleString()}</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">TONES</span>
        <span class="hud-value">{stats.toneCount}</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">LATENCY</span>
        <span class="hud-value">{stats.renderTimeMs.toFixed(1)}ms</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">RATE</span>
        <span class="hud-value highlight">{stats.fps} FPS</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .stage-viewport {
    flex: 1;
    height: 100%;
    position: relative;
    background: #000000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .stage-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #09090c;
    border-bottom: 1px solid #1f1f26;
    z-index: 10;
  }

  .stage-tag {
    font-size: 11px;
    color: #a1a1aa;
    letter-spacing: 0.05em;
  }

  .export-actions {
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

  .canvas-display-wrapper {
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

  canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 91, 53, 0.1);
    border: 1px solid #27272f;
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

  @media (max-width: 860px) {
    .stage-top-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      padding: 8px 12px;
    }
    .export-actions {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4px;
    }
    .stage-btn {
      padding: 6px 4px;
      font-size: 9px;
      justify-content: center;
    }
    .canvas-display-wrapper {
      padding: 12px;
    }
    .telemetry-hud {
      bottom: 8px;
      padding: 4px 8px;
      gap: 6px;
      font-size: 8px;
      max-width: calc(100% - 16px);
      overflow-x: auto;
    }
  }
</style>
