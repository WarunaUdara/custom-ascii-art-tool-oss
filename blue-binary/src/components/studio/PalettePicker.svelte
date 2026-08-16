<script lang="ts">
  import { DEFAULT_LEVEL_COLORS } from '../../lib/dither-engine';

  interface Props {
    colors: string[];
    onchange?: (colors: string[]) => void;
  }

  let { colors = $bindable([...DEFAULT_LEVEL_COLORS]), onchange }: Props = $props();

  const labels = ['Shadow', 'Low', 'Mid-Low', 'Mid', 'Mid-High', 'High', 'Highlight'];

  const PRESETS: { name: string; colors: string[] }[] = [
    {
      name: 'Solar Flare',
      colors: ['#1a0a06', '#3a1408', '#6b220c', '#a8330f', '#d9531c', '#f2823c', '#ffd39b'],
    },
    {
      name: 'Cyberpunk Neon',
      colors: ['#0d0221', '#1f0842', '#541388', '#9318b8', '#d01bc7', '#f72585', '#4cc9f0'],
    },
    {
      name: 'GameBoy Green',
      colors: ['#081820', '#182b2a', '#243c2c', '#346856', '#588a68', '#88c070', '#e0f8d0'],
    },
    {
      name: 'Amber CRT',
      colors: ['#110900', '#2b1700', '#542d00', '#8a4b00', '#c46b00', '#ff9100', '#ffc477'],
    },
    {
      name: 'Monochrome',
      colors: ['#000000', '#222222', '#555555', '#888888', '#aaaaaa', '#cccccc', '#ffffff'],
    },
    {
      name: 'Blueprint Cyan',
      colors: ['#040d1a', '#081c36', '#0f386b', '#185da8', '#2589eb', '#67b0ff', '#bde0fe'],
    },
  ];

  function updateColor(idx: number, hex: string) {
    colors[idx] = hex;
    colors = [...colors];
    onchange?.(colors);
  }

  function applyPreset(presetColors: string[]) {
    colors = [...presetColors];
    onchange?.(colors);
  }
</script>

<div class="palette-container">
  <div class="presets-row">
    {#each PRESETS as preset}
      <button 
        type="button" 
        class="preset-chip" 
        onclick={() => applyPreset(preset.colors)}
        title={preset.name}
      >
        <div class="preset-preview">
          {#each preset.colors as col}
            <span class="preview-stripe" style="background-color: {col};"></span>
          {/each}
        </div>
        <span class="preset-name">{preset.name}</span>
      </button>
    {/each}
  </div>

  <div class="levels-grid">
    {#each colors as color, i}
      <div class="level-item">
        <label for="lvl-{i}">{labels[i] || `Lvl ${i}`}</label>
        <div class="color-input-wrapper">
          <input
            id="lvl-{i}"
            type="color"
            value={color}
            oninput={(e) => updateColor(i, (e.target as HTMLInputElement).value)}
          />
          <span class="hex-text">{color}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .palette-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .presets-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .preset-chip {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: #0d0d10;
    border: 1px solid #1f1f26;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .preset-chip:hover {
    border-color: #ff5b35;
    background: #141418;
  }

  .preset-preview {
    display: flex;
    height: 6px;
    border-radius: 2px;
    overflow: hidden;
    width: 100%;
    border: 1px solid #23232b;
  }

  .preview-stripe {
    flex: 1;
    height: 100%;
  }

  .preset-name {
    font-size: 10px;
    color: #a0a0ab;
    font-family: 'Geist Mono', ui-monospace, monospace;
    letter-spacing: -0.02em;
  }

  .levels-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 4px;
    border: 1px solid #1a1a22;
    padding: 8px;
    background: #09090c;
    border-radius: 4px;
  }

  .level-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: #8b8b93;
    font-family: 'Geist Mono', ui-monospace, monospace;
  }

  .level-item label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: 70px;
    color: #71717a;
  }

  .color-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  input[type='color'] {
    width: 28px;
    height: 20px;
    border: 1px solid #262630;
    background: none;
    border-radius: 3px;
    cursor: pointer;
    padding: 1px;
  }

  .hex-text {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 10px;
    color: #d4d4d8;
  }
</style>
