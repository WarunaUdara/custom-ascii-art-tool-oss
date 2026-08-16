<script lang="ts">
  import type { CellStyle, DitherAlgorithm, EngineConfig } from '../../lib/dither-engine';
  import PalettePicker from './PalettePicker.svelte';

  interface Props {
    config: EngineConfig;
    hasMedia: boolean;
    isVideo: boolean;
    isRecording: boolean;
    recordStatusText: string;
    onchange: (partial: Partial<EngineConfig>) => void;
    onExportPng: () => void;
    onToggleVideoRecord: () => void;
  }

  let {
    config = $bindable(),
    hasMedia,
    isVideo,
    isRecording,
    recordStatusText,
    onchange,
    onExportPng,
    onToggleVideoRecord,
  }: Props = $props();

  const ALGORITHMS: { id: DitherAlgorithm; name: string }[] = [
    { id: 'threshold', name: '7-Level Quantization' },
    { id: 'bayer4', name: 'Bayer Matrix (4x4 Ordered)' },
    { id: 'bayer8', name: 'Bayer Matrix (8x8 Ordered)' },
    { id: 'floyd-steinberg', name: 'Floyd-Steinberg (Error Diffusion)' },
    { id: 'atkinson', name: 'Atkinson Dither (High Contrast)' },
    { id: 'noise-jitter', name: 'Stochastic Noise Jitter' },
  ];

  const RAMPS = [
    { label: 'Standard', value: ' .:-=+*#%@' },
    { label: 'Density (20)', value: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$' },
    { label: 'Blocks', value: ' ░▒▓█' },
    { label: 'Binary', value: ' 01' },
    { label: 'Dots', value: ' ·:•*' },
  ];
</script>

<div class="controls-panel">
  <div class="panel-header">
    <div class="title-group">
      <h2 class="pixel-heading">DITHER ENGINE</h2>
      <span class="version-tag font-pixel-grid">V2.0</span>
    </div>
    <span class="system-status-dot" title="Engine Active"></span>
  </div>

  <div class="panel-divider"></div>

  <!-- Resolution -->
  <div class="field">
    <div class="field-label">
      <span>Grid Resolution</span>
      <span class="val font-mono">{config.resolution} cols</span>
    </div>
    <input
      type="range"
      min="10"
      max="240"
      step="1"
      value={config.resolution}
      oninput={(e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        config.resolution = val;
        onchange({ resolution: val });
      }}
    />
  </div>

  <!-- Algorithm -->
  <div class="field">
    <div class="field-label">
      <span>Dithering Kernel</span>
    </div>
    <select
      value={config.algorithm}
      onchange={(e) => {
        const val = (e.target as HTMLSelectElement).value as DitherAlgorithm;
        config.algorithm = val;
        onchange({ algorithm: val });
      }}
    >
      {#each ALGORITHMS as algo}
        <option value={algo.id}>{algo.name}</option>
      {/each}
    </select>
  </div>

  {#if config.algorithm === 'noise-jitter'}
    <div class="field">
      <div class="field-label">
        <span>Jitter Amplitude</span>
        <span class="val font-mono">{Math.round(config.jitterAmount * 100)}%</span>
      </div>
      <input
        type="range"
        min="0.05"
        max="1.0"
        step="0.05"
        value={config.jitterAmount}
        oninput={(e) => {
          const val = parseFloat((e.target as HTMLInputElement).value);
          config.jitterAmount = val;
          onchange({ jitterAmount: val });
        }}
      />
    </div>
  {/if}

  <!-- Cell Style -->
  <div class="field">
    <div class="field-label">
      <span>Glyph Style</span>
    </div>
    <select
      value={config.style}
      onchange={(e) => {
        const val = (e.target as HTMLSelectElement).value as CellStyle;
        config.style = val;
        onchange({ style: val });
      }}
    >
      <option value="char">ASCII Characters</option>
      <option value="block">Solid Rectangles</option>
      <option value="dot">Halftone Dots</option>
    </select>
  </div>

  <!-- Character Ramp (if ASCII) -->
  {#if config.style === 'char'}
    <div class="field">
      <div class="field-label">
        <span>Character Ramp</span>
      </div>
      <input
        type="text"
        class="ramp-input font-mono"
        value={config.ramp}
        oninput={(e) => {
          const val = (e.target as HTMLInputElement).value;
          config.ramp = val;
          onchange({ ramp: val });
        }}
      />
      <div class="ramp-presets">
        {#each RAMPS as rampPreset}
          <button
            type="button"
            class="ramp-btn font-mono"
            onclick={() => {
              config.ramp = rampPreset.value;
              onchange({ ramp: rampPreset.value });
            }}
          >
            {rampPreset.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Invert & Background -->
  <div class="toggle-row">
    <span>Invert Luminance</span>
    <label class="switch">
      <input
        type="checkbox"
        checked={config.invert}
        onchange={(e) => {
          const val = (e.target as HTMLInputElement).checked;
          config.invert = val;
          onchange({ invert: val });
        }}
      />
      <span class="slider-toggle"></span>
    </label>
  </div>

  <div class="field">
    <div class="field-label">
      <span>Canvas Background</span>
    </div>
    <div class="color-row">
      <input
        type="color"
        value={config.bgColor}
        oninput={(e) => {
          const val = (e.target as HTMLInputElement).value;
          config.bgColor = val;
          onchange({ bgColor: val });
        }}
      />
      <span class="hex-text font-mono">{config.bgColor}</span>
    </div>
  </div>

  <div class="panel-divider"></div>

  <!-- Tonal Palette -->
  <div class="field">
    <div class="field-label">
      <span>Tonal Palette (7 Levels)</span>
    </div>
    <PalettePicker
      bind:colors={config.levelColors}
      onchange={(colors) => onchange({ levelColors: colors })}
    />
  </div>

  <div class="panel-divider"></div>

  <!-- Interactive Hover Glow -->
  <div class="section-title pixel-subheading">HOVER GLOW MATRIX</div>

  <div class="toggle-row">
    <span>Enable Glow</span>
    <label class="switch">
      <input
        type="checkbox"
        checked={config.hoverEnabled}
        onchange={(e) => {
          const val = (e.target as HTMLInputElement).checked;
          config.hoverEnabled = val;
          onchange({ hoverEnabled: val });
        }}
      />
      <span class="slider-toggle"></span>
    </label>
  </div>

  {#if config.hoverEnabled}
    <div class="field">
      <div class="field-label">
        <span>Glow Color</span>
      </div>
      <div class="color-row">
        <input
          type="color"
          value={config.hoverColor}
          oninput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            config.hoverColor = val;
            onchange({ hoverColor: val });
          }}
        />
        <span class="hex-text font-mono">{config.hoverColor}</span>
      </div>
    </div>

    <div class="field">
      <div class="field-label">
        <span>Radius</span>
        <span class="val font-mono">{config.hoverRadius}%</span>
      </div>
      <input
        type="range"
        min="2"
        max="60"
        value={config.hoverRadius}
        oninput={(e) => {
          const val = parseInt((e.target as HTMLInputElement).value, 10);
          config.hoverRadius = val;
          onchange({ hoverRadius: val });
        }}
      />
    </div>

    <div class="field">
      <div class="field-label">
        <span>Fade Rate</span>
        <span class="val font-mono">{config.fadeSpeed}</span>
      </div>
      <input
        type="range"
        min="2"
        max="60"
        value={config.fadeSpeed}
        oninput={(e) => {
          const val = parseInt((e.target as HTMLInputElement).value, 10);
          config.fadeSpeed = val;
          onchange({ fadeSpeed: val });
        }}
      />
    </div>
  {/if}

  <div class="panel-divider"></div>

  <!-- Actions -->
  <div class="actions-section">
    <button
      type="button"
      class="action-btn primary font-pixel"
      disabled={!hasMedia}
      onclick={onExportPng}
    >
      EXPORT PNG
    </button>

    {#if isVideo}
      <button
        type="button"
        class="action-btn record-btn font-pixel"
        class:recording={isRecording}
        onclick={onToggleVideoRecord}
      >
        {isRecording ? 'STOP & SAVE' : 'RECORD STREAM'}
      </button>

      {#if recordStatusText}
        <div class="record-status font-mono" class:active={isRecording}>
          {recordStatusText}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .controls-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px;
    background: #000000;
    border-right: 1px solid #1f1f26;
    width: 320px;
    min-width: 320px;
    height: 100%;
    overflow-y: auto;
    color: #ededed;
    font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 12px;
    position: relative;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title-group {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .pixel-heading {
    font-family: 'Geist Pixel Square', monospace;
    font-size: 13px;
    letter-spacing: 0.05em;
    color: #ffffff;
    margin: 0;
  }

  .pixel-subheading {
    font-family: 'Geist Pixel Square', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: #a1a1aa;
    margin-top: 4px;
  }

  .version-tag {
    font-size: 9px;
    background: #18181b;
    border: 1px solid #27272a;
    color: #ff5b35;
    padding: 1px 5px;
  }

  .system-status-dot {
    width: 6px;
    height: 6px;
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
  }

  .panel-divider {
    height: 1px;
    background: #18181b;
    margin: 2px 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: 'Geist Mono', monospace;
  }

  .field-label .val {
    color: #f4f4f5;
  }

  input[type='range'] {
    width: 100%;
    accent-color: #ff5b35;
    cursor: pointer;
    height: 3px;
    background: #27272a;
  }

  select,
  input[type='text'] {
    width: 100%;
    background: #09090b;
    color: #ededed;
    border: 1px solid #27272a;
    padding: 7px 10px;
    font-family: inherit;
    font-size: 11px;
    outline: none;
    transition: border-color 0.15s;
  }

  select:focus,
  input[type='text']:focus {
    border-color: #ff5b35;
  }

  .ramp-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  .ramp-btn {
    font-size: 9px;
    background: #09090b;
    border: 1px solid #27272a;
    color: #a1a1aa;
    padding: 3px 6px;
    cursor: pointer;
  }

  .ramp-btn:hover {
    border-color: #ff5b35;
    color: #ffffff;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #71717a;
    font-family: 'Geist Mono', monospace;
  }

  .switch {
    position: relative;
    width: 32px;
    height: 16px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider-toggle {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: #18181b;
    border: 1px solid #27272a;
    transition: 0.15s;
  }

  .slider-toggle:before {
    content: '';
    position: absolute;
    height: 10px;
    width: 10px;
    left: 2px;
    top: 2px;
    background: #71717a;
    transition: 0.15s;
  }

  input:checked + .slider-toggle {
    background: #ff5b35;
    border-color: #ff5b35;
  }

  input:checked + .slider-toggle:before {
    transform: translateX(15px);
    background: #ffffff;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  input[type='color'] {
    width: 32px;
    height: 22px;
    border: 1px solid #27272a;
    background: none;
    cursor: pointer;
    padding: 1px;
  }

  .hex-text {
    font-size: 10px;
    color: #71717a;
  }

  .actions-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }

  .action-btn {
    width: 100%;
    padding: 10px;
    font-size: 11px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }

  .action-btn.primary {
    background: #ededed;
    color: #000000;
    font-weight: 700;
  }

  .action-btn.primary:hover:not(:disabled) {
    background: #ffffff;
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.2);
  }

  .action-btn.record-btn {
    background: #09090b;
    color: #ededed;
    border-color: #27272a;
  }

  .action-btn.record-btn.recording {
    background: #7f1d1d;
    color: #fecaca;
    border-color: #ef4444;
  }

  .action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .record-status {
    font-size: 10px;
    color: #71717a;
    text-align: center;
  }

  .record-status.active {
    color: #ff5b35;
    font-weight: 600;
  }
</style>
