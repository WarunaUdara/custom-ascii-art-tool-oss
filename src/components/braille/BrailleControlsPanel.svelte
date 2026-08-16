<script lang="ts">
  import type { AnsiColorMode, BrailleRenderConfig, DitherMode, DrawTool } from '../../lib/braille-engine';

  interface Props {
    config: BrailleRenderConfig;
    selectedTool: DrawTool;
    brushColor: string;
    brushSize: number;
    onupdateconfig: (partial: Partial<BrailleRenderConfig>) => void;
    onselecttool: (tool: DrawTool) => void;
    onupdatebrushcolor: (color: string) => void;
    onupdatebrushsize: (size: number) => void;
    onclearcanvas: () => void;
    onuploadmedia: (file: File) => void;
  }

  let {
    config = $bindable(),
    selectedTool = 'brush',
    brushColor = '#ff5b35',
    brushSize = 2,
    onupdateconfig,
    onselecttool,
    onupdatebrushcolor,
    onupdatebrushsize,
    onclearcanvas,
    onuploadmedia,
  }: Props = $props();

  const COLOR_MODES: { id: AnsiColorMode; name: string }[] = [
    { id: 'truecolor', name: '24-Bit Truecolor (16.7M)' },
    { id: '256color', name: '256-Color (xterm)' },
    { id: '16color', name: '16-Color (Standard ANSI)' },
    { id: 'amber', name: 'Amber Phosphor CRT' },
    { id: 'green', name: 'Matrix Green CRT' },
    { id: 'mono', name: 'Monochrome White' },
  ];

  const DITHER_MODES: { id: DitherMode; name: string }[] = [
    { id: 'floyd-steinberg', name: 'Floyd-Steinberg Diffusion' },
    { id: 'threshold', name: 'Hard Threshold' },
  ];
</script>

<div class="braille-controls-panel">
  <!-- Mode Switcher -->
  <div class="mode-tabs">
    <button
      type="button"
      class="mode-tab-btn font-pixel corner-ticks"
      class:active={config.mode === 'convert'}
      onclick={() => onupdateconfig({ mode: 'convert' })}
    >
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>
      <span>01. MEDIA CONVERT</span>
    </button>
    <button
      type="button"
      class="mode-tab-btn font-pixel corner-ticks"
      class:active={config.mode === 'draw'}
      onclick={() => onupdateconfig({ mode: 'draw' })}
    >
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>
      <span>02. SUBPIXEL PAINTER</span>
    </button>
  </div>

  {#if config.mode === 'convert'}
    <!-- Media Upload Zone -->
    <div class="upload-zone-box">
      <label class="media-upload-target font-mono corner-ticks" title="Click or drop image/video">
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <input
          type="file"
          accept="image/*,video/*"
          style="display:none;"
          onchange={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.files && input.files[0]) {
              onuploadmedia(input.files[0]);
            }
          }}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m16 16-4-4-4 4" />
        </svg>
        <span class="upload-title font-pixel">SELECT IMAGE OR VIDEO</span>
        <span class="upload-hint font-mono">PNG · JPG · WEBP · MP4 · WEBM</span>
      </label>
    </div>
  {:else}
    <!-- Drawing Toolbar -->
    <div class="drawing-tools-box">
      <div class="tools-header font-pixel">PAINT TOOLS (2x4 SUBPIXELS)</div>
      
      <div class="tool-buttons-row">
        <button
          type="button"
          class="tool-btn font-pixel"
          class:active={selectedTool === 'brush'}
          onclick={() => onselecttool('brush')}
          title="Subpixel Paint Brush"
        >
          BRUSH
        </button>
        <button
          type="button"
          class="tool-btn font-pixel"
          class:active={selectedTool === 'eraser'}
          onclick={() => onselecttool('eraser')}
          title="Subpixel Eraser"
        >
          ERASER
        </button>
        <button
          type="button"
          class="tool-btn secondary font-pixel"
          onclick={onclearcanvas}
          title="Clear Paint Canvas"
        >
          CLEAR
        </button>
      </div>

      <div class="brush-props-grid">
        <!-- Brush Color -->
        <div class="brush-prop">
          <span class="prop-label font-mono">COLOR</span>
          <div class="color-wrap">
            <input
              type="color"
              value={brushColor}
              oninput={(e) => onupdatebrushcolor((e.target as HTMLInputElement).value)}
            />
            <span class="font-mono text-xs">{brushColor}</span>
          </div>
        </div>

        <!-- Brush Size -->
        <div class="brush-prop">
          <div class="prop-label font-mono">
            <span>SIZE</span>
            <span class="tabular-nums font-mono">{brushSize}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={brushSize}
            oninput={(e) => onupdatebrushsize(parseInt((e.target as HTMLInputElement).value))}
          />
        </div>
      </div>
    </div>
  {/if}

  <div class="panel-divider"></div>

  <!-- Terminal Color Mode -->
  <div class="field">
    <div class="field-label font-mono">
      <span>ANSI ESCAPE COLOR MODE</span>
    </div>
    <select
      class="select-input font-mono"
      value={config.colorMode}
      onchange={(e) => onupdateconfig({ colorMode: (e.target as HTMLSelectElement).value as AnsiColorMode })}
    >
      {#each COLOR_MODES as cm}
        <option value={cm.id}>{cm.name}</option>
      {/each}
    </select>
  </div>

  <!-- Dithering Algorithm -->
  <div class="field">
    <div class="field-label font-mono">
      <span>SUB-PIXEL QUANTIZATION</span>
    </div>
    <select
      class="select-input font-mono"
      value={config.dither}
      onchange={(e) => onupdateconfig({ dither: (e.target as HTMLSelectElement).value as DitherMode })}
    >
      {#each DITHER_MODES as dm}
        <option value={dm.id}>{dm.name}</option>
      {/each}
    </select>
  </div>

  <div class="panel-divider"></div>

  <!-- Sliders Grid -->
  <div class="sliders-list">
    <!-- Columns -->
    <div class="slider-field">
      <div class="slider-label font-mono">
        <span>TERMINAL COLUMNS</span>
        <span class="tabular-nums font-mono">{config.cols} COLS ({config.cols * 2}px SUB)</span>
      </div>
      <input
        type="range"
        min="30"
        max="140"
        step="2"
        value={config.cols}
        oninput={(e) => onupdateconfig({ cols: parseInt((e.target as HTMLInputElement).value) })}
      />
    </div>

    <!-- Threshold -->
    <div class="slider-field">
      <div class="slider-label font-mono">
        <span>LUMINANCE THRESHOLD</span>
        <span class="tabular-nums font-mono">{Math.round(config.threshold * 100)}%</span>
      </div>
      <input
        type="range"
        min="0.05"
        max="0.95"
        step="0.02"
        value={config.threshold}
        oninput={(e) => onupdateconfig({ threshold: parseFloat((e.target as HTMLInputElement).value) })}
      />
    </div>

    <!-- Edge Enhance -->
    <div class="slider-field">
      <div class="slider-label font-mono">
        <span>SOBEL EDGE CONTOUR</span>
        <span class="tabular-nums font-mono">{config.edgeEnhance.toFixed(2)}x</span>
      </div>
      <input
        type="range"
        min="0.0"
        max="1.5"
        step="0.05"
        value={config.edgeEnhance}
        oninput={(e) => onupdateconfig({ edgeEnhance: parseFloat((e.target as HTMLInputElement).value) })}
      />
    </div>
  </div>

  <div class="panel-divider"></div>

  <!-- Toggles -->
  <div class="toggles-group font-mono">
    <div class="toggle-row">
      <span>INVERT DOTS</span>
      <input
        type="checkbox"
        checked={config.invert}
        onchange={(e) => onupdateconfig({ invert: (e.target as HTMLInputElement).checked })}
      />
    </div>

    <div class="toggle-row">
      <span>CRT PHOSPHOR SCANLINES</span>
      <input
        type="checkbox"
        checked={config.crtEffect}
        onchange={(e) => onupdateconfig({ crtEffect: (e.target as HTMLInputElement).checked })}
      />
    </div>
  </div>
</div>

<style>
  .braille-controls-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    color: #ededed;
  }

  .mode-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .mode-tab-btn {
    position: relative;
    background: #0d0d12;
    border: 1px solid #1f1f26;
    color: #71717a;
    padding: 8px 10px;
    font-size: 10px;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;
  }

  .mode-tab-btn:hover {
    border-color: #ff5b35;
    color: #ededed;
  }

  .mode-tab-btn.active {
    background: #14141c;
    border-color: #ff5b35;
    color: #ffffff;
    font-weight: 700;
  }

  .media-upload-target {
    position: relative;
    background: #0d0d12;
    border: 1px dashed #27272f;
    padding: 20px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;
  }

  .media-upload-target:hover {
    border-color: #ff5b35;
    background: #121218;
  }

  .upload-title {
    font-size: 11px;
    color: #ededed;
  }

  .upload-hint {
    font-size: 9px;
    color: #71717a;
  }

  .drawing-tools-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #0d0d12;
    border: 1px solid #1f1f26;
    padding: 12px;
  }

  .tools-header {
    font-size: 10px;
    letter-spacing: 0.05em;
    color: #a1a1aa;
  }

  .tool-buttons-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
  }

  .tool-btn {
    background: #14141a;
    border: 1px solid #27272f;
    color: #ededed;
    font-size: 10px;
    padding: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tool-btn.active {
    background: #ff5b35;
    color: #000000;
    font-weight: 700;
    border-color: #ff5b35;
  }

  .tool-btn.secondary:hover {
    border-color: #ef4444;
    color: #ef4444;
  }

  .brush-props-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 6px;
  }

  .brush-prop {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .prop-label {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #71717a;
  }

  .color-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .color-wrap input[type='color'] {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border: 1px solid #27272f;
    padding: 0;
    cursor: pointer;
    background: none;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 9px;
    color: #71717a;
    letter-spacing: 0.05em;
  }

  .select-input {
    background: #0d0d12;
    border: 1px solid #27272f;
    color: #ededed;
    font-size: 11px;
    padding: 6px 8px;
    outline: none;
    cursor: pointer;
  }

  .select-input:focus {
    border-color: #ff5b35;
  }

  .panel-divider {
    height: 1px;
    background: #1f1f26;
    margin: 2px 0;
  }

  .sliders-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #71717a;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: #1f1f26;
    outline: none;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: #ff5b35;
    cursor: pointer;
  }

  .toggles-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #0d0d12;
    border: 1px solid #1f1f26;
    padding: 10px 12px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: #a1a1aa;
  }

  .toggle-row input[type='checkbox'] {
    accent-color: #ff5b35;
    cursor: pointer;
  }
</style>
