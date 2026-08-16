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
      <div class="drop-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m16 16-4-4-4 4" />
        </svg>
      </div>
      <div class="drop-text-primary">Click or drop an image / video</div>
      <div class="drop-text-sub">Supports PNG, JPG, WebP, MP4, WebM, MOV</div>
    </div>
  {/if}

  <div class="canvas-wrapper" style="display: {hasMedia ? 'flex' : 'none'};">
    <canvas bind:this={canvasRef} id="dither-canvas"></canvas>
  </div>

  {#if hasMedia && stats}
    <div class="stats-badge">
      <span>{stats.cols}×{stats.rows} ({stats.totalCells.toLocaleString()} cells)</span>
      <span class="divider">|</span>
      <span>{stats.renderTimeMs}ms</span>
      <span class="divider">|</span>
      <span>{stats.fps} FPS</span>
      <button
        type="button"
        class="replace-btn"
        onclick={() => fileInput?.click()}
        title="Change Media File"
      >
        Change File
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
    background: #08080a;
    position: relative;
    overflow: hidden;
    min-height: 480px;
  }

  .stage-container.dragging {
    background: #0d0e12;
  }

  .dropzone-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 2px dashed #23232c;
    border-radius: 12px;
    padding: 48px 36px;
    cursor: pointer;
    color: #8b8b93;
    transition: all 0.2s ease;
    background: #111116;
  }

  .dropzone-box:hover,
  .stage-container.dragging .dropzone-box {
    border-color: #ff5b35;
    color: #e4e4e7;
    transform: scale(1.01);
  }

  .drop-icon {
    color: #ff5b35;
  }

  .drop-text-primary {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .drop-text-sub {
    font-size: 10px;
    color: #63636e;
    font-family: inherit;
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
    max-height: 80vh;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    cursor: crosshair;
  }

  .stats-badge {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(18, 18, 22, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid #23232b;
    padding: 6px 14px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    color: #9d9da8;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .divider {
    color: #3b3b47;
  }

  .replace-btn {
    background: #ff5b35;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 9px;
    font-family: inherit;
    cursor: pointer;
    font-weight: 600;
  }

  .replace-btn:hover {
    background: #ff704d;
  }
</style>
