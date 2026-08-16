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
    { label: 'Standard Density', value: ' .:-=+*#%@' },
    { label: 'High Detail (20 chars)', value: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$' },
    { label: 'Blocks & Shades', value: ' ░▒▓█' },
    { label: 'Binary Matrix', value: ' 01' },
    { label: 'Minimalist Dot', value: ' ·:•*' },
  ];
</script>

<div class="controls-panel">
  <div class="panel-header">
    <h2>Engine Controls</h2>
    <span class="badge">v2.0</span>
  </div>

  <!-- Resolution -->
  <div class="field">
    <div class="field-label">
      <span>Grid Resolution</span>
      <span class="val">{config.resolution} cols</span>
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
      <span>Dithering Algorithm</span>
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
        <span>Jitter Intensity</span>
        <span class="val">{Math.round(config.jitterAmount * 100)}%</span>
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
      <span>Cell Style</span>
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
            class="ramp-btn"
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
      <span>Background Color</span>
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
      <span class="hex-text">{config.bgColor}</span>
    </div>
  </div>

  <hr />

  <!-- Tonal Palette -->
  <div class="field">
    <div class="field-label">
      <span>Tonal Ramp Palette</span>
    </div>
    <PalettePicker
      bind:colors={config.levelColors}
      onchange={(colors) => onchange({ levelColors: colors })}
    />
  </div>

  <hr />

  <!-- Interactive Hover Glow -->
  <div class="section-title">Interactive Hover Glow</div>

  <div class="toggle-row">
    <span>Enable Hover Glow</span>
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
        <span class="hex-text">{config.hoverColor}</span>
      </div>
    </div>

    <div class="field">
      <div class="field-label">
        <span>Glow Radius</span>
        <span class="val">{config.hoverRadius}%</span>
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
        <span>Fade Speed</span>
        <span class="val">{config.fadeSpeed}</span>
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

  <hr />

  <!-- Actions -->
  <div class="actions-section">
    <button
      type="button"
      class="action-btn primary"
      disabled={!hasMedia}
      onclick={onExportPng}
    >
      Download PNG (Static Frame)
    </button>

    {#if isVideo}
      <button
        type="button"
        class="action-btn record-btn"
        class:recording={isRecording}
        onclick={onToggleVideoRecord}
      >
        {isRecording ? 'Stop & Save Video' : 'Render Video Stream'}
      </button>

      {#if recordStatusText}
        <div class="record-status" class:active={isRecording}>
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
    gap: 16px;
    padding: 20px;
    background: #121215;
    border-right: 1px solid #23232a;
    width: 320px;
    min-width: 320px;
    height: 100%;
    overflow-y: auto;
    color: #e4e4e7;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .panel-header h2 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #ff5b35;
    margin: 0;
  }

  .badge {
    font-size: 9px;
    background: #2b1812;
    color: #ff5b35;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
  }

  .section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8b8b93;
    margin-top: 4px;
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
    color: #8b8b93;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .field-label .val {
    color: #e4e4e7;
    font-weight: 600;
  }

  input[type='range'] {
    width: 100%;
    accent-color: #ff5b35;
    cursor: pointer;
  }

  select,
  input[type='text'] {
    width: 100%;
    background: #1a1a20;
    color: #e4e4e7;
    border: 1px solid #282832;
    border-radius: 6px;
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
    background: #1a1a20;
    border: 1px solid #2a2a34;
    color: #9d9da8;
    padding: 3px 6px;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
  }

  .ramp-btn:hover {
    border-color: #ff5b35;
    color: #e4e4e7;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #8b8b93;
  }

  .switch {
    position: relative;
    width: 36px;
    height: 18px;
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
    background: #25252e;
    border-radius: 999px;
    transition: 0.2s;
  }

  .slider-toggle:before {
    content: '';
    position: absolute;
    height: 12px;
    width: 12px;
    left: 3px;
    top: 3px;
    background: #71717a;
    border-radius: 50%;
    transition: 0.2s;
  }

  input:checked + .slider-toggle {
    background: #ff5b35;
  }

  input:checked + .slider-toggle:before {
    transform: translateX(18px);
    background: #fff;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  input[type='color'] {
    width: 36px;
    height: 24px;
    border: 1px solid #2b2b34;
    background: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 1px;
  }

  .hex-text {
    font-size: 10px;
    color: #8b8b93;
  }

  hr {
    border: none;
    border-top: 1px solid #202026;
    margin: 4px 0;
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
    border-radius: 6px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: background-color 0.15s, opacity 0.15s;
  }

  .action-btn.primary {
    background: #ff5b35;
    color: #ffffff;
  }

  .action-btn.primary:hover:not(:disabled) {
    background: #ff704d;
  }

  .action-btn.record-btn {
    background: #25252e;
    color: #e4e4e7;
    border: 1px solid #33333f;
  }

  .action-btn.record-btn.recording {
    background: #7f1d1d;
    color: #fecaca;
    border-color: #ef4444;
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .record-status {
    font-size: 10px;
    color: #8b8b93;
    text-align: center;
  }

  .record-status.active {
    color: #ff5b35;
    font-weight: 600;
  }
</style>
