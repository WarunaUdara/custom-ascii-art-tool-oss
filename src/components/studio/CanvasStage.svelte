<script lang="ts">
  import type { RenderStats } from '../../lib/dither-engine';

  interface Props {
    canvasRef: HTMLCanvasElement | null;
    hasMedia: boolean;
    stats: RenderStats | null;
    onFileSelected: (file: File) => void;
  }

  let {
    canvasRef = $bindable(null),
    hasMedia,
    stats,
    onFileSelected,
  }: Props = $props();

  let fileInput: HTMLInputElement | null = $state(null);
  let isDragging = $state(false);

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      onFileSelected(input.files[0]);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  }
</script>

<div
  class="stage-container"
  class:dragging={isDragging}
  ondragover={(e) => {
    e.preventDefault();
    isDragging = true;
  }}
  ondragleave={() => {
    isDragging = false;
  }}
  ondrop={handleDrop}
  role="region"
  aria-label="Canvas Stage Viewport"
>
  <!-- L-shaped corner intersection brackets -->
  <span class="corner-bracket tl">┌</span>
  <span class="corner-bracket tr">┐</span>
  <span class="corner-bracket bl">└</span>
  <span class="corner-bracket br">┘</span>

  <input
    type="file"
    accept="image/*,video/*"
    bind:this={fileInput}
    style="display:none;"
    onchange={handleFileChange}
  />

  {#if !hasMedia}
    <div
      class="dropzone-box"
      onclick={() => fileInput?.click()}
      onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
      tabindex="0"
      role="button"
      aria-label="Upload Image or Video"
    >
      <span class="corner-bracket tl">┌</span>
      <span class="corner-bracket tr">┐</span>
      <span class="corner-bracket bl">└</span>
      <span class="corner-bracket br">┘</span>

      <div class="drop-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m16 16-4-4-4 4" />
        </svg>
      </div>
      <div class="drop-title font-pixel">SELECT SOURCE MEDIA</div>
      <div class="drop-subtitle font-mono">CLICK OR DRAG IMAGE / VIDEO</div>
      <div class="drop-formats font-mono">PNG · JPG · WEBP · MP4 · WEBM</div>
    </div>
  {/if}

  <div class="canvas-wrapper" style="display: {hasMedia ? 'flex' : 'none'};">
    <canvas bind:this={canvasRef} id="dither-canvas"></canvas>
  </div>

  {#if hasMedia && stats}
    <div class="telemetry-hud font-mono">
      <span class="corner-bracket tl">┌</span>
      <span class="corner-bracket tr">┐</span>
      <span class="corner-bracket bl">└</span>
      <span class="corner-bracket br">┘</span>

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
        <span class="hud-label">LATENCY</span>
        <span class="hud-value">{stats.renderTimeMs}ms</span>
      </div>
      <span class="hud-divider">|</span>
      <div class="hud-item">
        <span class="hud-label">RATE</span>
        <span class="hud-value highlight">{stats.fps} FPS</span>
      </div>
      <button
        type="button"
        class="replace-btn font-pixel"
        onclick={() => fileInput?.click()}
        title="Change Media File"
      >
        CHANGE
      </button>
    </div>
  {/if}
</div>

<style>
  .stage-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #000000;
    position: relative;
    overflow: hidden;
    min-height: 480px;
  }

  .stage-container.dragging {
    background: #09090c;
  }

  .dropzone-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid #27272a;
    background: #09090b;
    padding: 48px 40px;
    cursor: pointer;
    color: #71717a;
    position: relative;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dropzone-box:hover,
  .stage-container.dragging .dropzone-box {
    border-color: #ff5b35;
    background: #111115;
    transform: translateY(-1px);
  }

  .drop-icon {
    color: #ff5b35;
    margin-bottom: 4px;
  }

  .drop-title {
    font-size: 13px;
    letter-spacing: 0.06em;
    color: #ededed;
  }

  .drop-subtitle {
    font-size: 10px;
    letter-spacing: 0.04em;
    color: #a1a1aa;
  }

  .drop-formats {
    font-size: 9px;
    color: #52525b;
    margin-top: 4px;
  }

  .canvas-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    max-height: 100%;
  }

  canvas#dither-canvas {
    max-width: 100%;
    max-height: 82vh;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.9);
    border: 1px solid #1f1f26;
    cursor: crosshair;
  }

  .telemetry-hud {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(9, 9, 11, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid #27272a;
    padding: 8px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 10px;
    color: #a1a1aa;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.9);
    z-index: 20;
    position: absolute;
  }

  .hud-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .hud-label {
    color: #52525b;
    font-size: 9px;
  }

  .hud-value {
    color: #ededed;
    font-weight: 500;
  }

  .hud-value.highlight {
    color: #22c55e;
  }

  .hud-divider {
    color: #27272a;
  }

  .replace-btn {
    background: #18181b;
    color: #ededed;
    border: 1px solid #27272a;
    padding: 3px 8px;
    font-size: 9px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .replace-btn:hover {
    background: #ff5b35;
    border-color: #ff5b35;
    color: #ffffff;
  }
</style>
