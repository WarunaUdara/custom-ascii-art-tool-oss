<script lang="ts">
  import type { BlendMode, ToneRow } from '../../lib/tone-marks-engine';

  interface Props {
    toneRows: ToneRow[];
    onaddtone: () => void;
    onremovetone: (id: string) => void;
    onupdatetone: (id: string, partial: Partial<ToneRow>) => void;
    onrestoretones: () => void;
    onuploadmark: (id: string, file: File) => void;
  }

  let {
    toneRows = $bindable(),
    onaddtone,
    onremovetone,
    onupdatetone,
    onrestoretones,
    onuploadmark,
  }: Props = $props();

  const BLEND_MODES: { id: BlendMode; name: string }[] = [
    { id: 'source-over', name: 'Original Colours' },
    { id: 'multiply', name: 'Multiply' },
    { id: 'screen', name: 'Screen' },
    { id: 'overlay', name: 'Overlay' },
    { id: 'soft-light', name: 'Soft Light' },
    { id: 'hard-light', name: 'Hard Light' },
    { id: 'hue', name: 'Hue' },
    { id: 'saturation', name: 'Saturation' },
    { id: 'color', name: 'Colour' },
    { id: 'luminosity', name: 'Luminosity' },
  ];

  const BUILTIN_PRESETS = [
    { id: 'dot', name: 'Dot' },
    { id: 'block', name: 'Block' },
    { id: 'cross', name: 'Cross' },
    { id: 'hatch', name: 'Hatch' },
    { id: 'plus', name: 'Plus' },
    { id: 'circle', name: 'Circle' },
    { id: 'stipple', name: 'Stipple' },
    { id: 'char', name: 'Glyph Char' },
  ];

  let activeDragId = $state<string | null>(null);

  function handleDropOnRow(e: DragEvent, toneId: string) {
    e.preventDefault();
    activeDragId = null;
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onuploadmark(toneId, e.dataTransfer.files[0]);
    }
  }
</script>

<div class="tone-rows-panel">
  <div class="panel-header">
    <div class="header-title font-pixel">MIDTONES & CUSTOM MARKS</div>
    <div class="header-actions">
      <button
        type="button"
        class="header-btn font-pixel corner-ticks"
        onclick={onaddtone}
        title="Add new midtone row"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <span>+ ADD TONE</span>
      </button>
      <button
        type="button"
        class="header-btn secondary font-pixel corner-ticks"
        onclick={onrestoretones}
        title="Restore original built-in tones and marks"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <span>RESTORE</span>
      </button>
    </div>
  </div>

  <div class="tone-list">
    {#each toneRows as tone, i (tone.id)}
      <div
        class="tone-row-card corner-ticks"
        class:dragging-over={activeDragId === tone.id}
        class:strong-area={tone.isStrongArea}
        ondragover={(e) => {
          e.preventDefault();
          activeDragId = tone.id;
        }}
        ondragleave={() => {
          activeDragId = null;
        }}
        ondrop={(e) => handleDropOnRow(e, tone.id)}
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>

        <!-- Top Header of Row -->
        <div class="row-header">
          <div class="row-info">
            <span class="row-idx font-mono">#{i + 1}</span>
            <input
              type="text"
              class="row-name-input font-pixel"
              value={tone.name}
              oninput={(e) => onupdatetone(tone.id, { name: (e.target as HTMLInputElement).value })}
            />
          </div>

          <div class="row-top-right">
            <!-- Strong area toggle -->
            <label class="strong-toggle font-mono" title="Mark as dedicated strong-area pixel">
              <input
                type="checkbox"
                checked={tone.isStrongArea}
                onchange={(e) => onupdatetone(tone.id, { isStrongArea: (e.target as HTMLInputElement).checked })}
              />
              <span class="toggle-tag font-mono">STRONG</span>
            </label>

            {#if toneRows.length > 2}
              <button
                type="button"
                class="remove-row-btn font-mono"
                onclick={() => onremovetone(tone.id)}
                title="Remove this tone row"
              >
                ✕
              </button>
            {/if}
          </div>
        </div>

        <!-- Middle Controls: Color Picker & Stop Slider -->
        <div class="row-controls">
          <div class="color-picker-group">
            <input
              type="color"
              class="tone-color-input"
              value={tone.color}
              oninput={(e) => onupdatetone(tone.id, { color: (e.target as HTMLInputElement).value })}
            />
            <span class="color-hex font-mono">{tone.color}</span>
          </div>

          <div class="slider-group">
            <div class="slider-label font-mono">
              <span>STOP</span>
              <span class="tabular-nums font-mono">{Math.round(tone.thresholdStop * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={tone.thresholdStop}
              oninput={(e) => onupdatetone(tone.id, { thresholdStop: parseFloat((e.target as HTMLInputElement).value) })}
            />
          </div>
        </div>

        <!-- Mark & Blending Row -->
        <div class="row-mark-controls">
          <!-- Mark Type & Preset -->
          <div class="mark-type-box">
            {#if tone.markType === 'custom' && tone.markDataUrl}
              <div class="custom-mark-preview" title="Custom Uploaded Mark Texture">
                <img src={tone.markDataUrl} alt="Custom Mark" />
                <button
                  type="button"
                  class="revert-mark-btn font-mono"
                  onclick={() => onupdatetone(tone.id, { markType: 'builtin', markDataUrl: undefined, markImage: undefined })}
                  title="Switch back to built-in vector mark"
                >
                  ✕
                </button>
              </div>
            {:else}
              <select
                class="builtin-select font-mono"
                value={tone.builtinPreset || 'dot'}
                onchange={(e) => onupdatetone(tone.id, { markType: 'builtin', builtinPreset: (e.target as HTMLSelectElement).value as any })}
              >
                {#each BUILTIN_PRESETS as preset}
                  <option value={preset.id}>{preset.name}</option>
                {/each}
              </select>
            {/if}

            <!-- Upload Custom File -->
            <label class="upload-mark-btn font-pixel" title="Upload custom mark / drop image file here">
              <input
                type="file"
                accept="image/*"
                style="display:none;"
                onchange={(e) => {
                  const input = e.target as HTMLInputElement;
                  if (input.files && input.files[0]) {
                    onuploadmark(tone.id, input.files[0]);
                  }
                }}
              />
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>MARK</span>
            </label>
          </div>

          <!-- Blend Mode Dropdown -->
          <div class="blend-mode-box">
            <select
              class="blend-select font-mono"
              value={tone.blendMode}
              onchange={(e) => onupdatetone(tone.id, { blendMode: (e.target as HTMLSelectElement).value as BlendMode })}
              title="Colour Blending Mode (preserves transparency & micro-details)"
            >
              {#each BLEND_MODES as bm}
                <option value={bm.id}>{bm.name}</option>
              {/each}
            </select>
          </div>
        </div>

        {#if activeDragId === tone.id}
          <div class="drop-target-hint font-mono">
            DROP IMAGE MARK HERE TO ASSIGN
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .tone-rows-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    color: #ededed;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid #1f1f26;
  }

  .header-title {
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #ffffff;
  }

  .header-actions {
    display: flex;
    gap: 6px;
  }

  .header-btn {
    background: #ff5b35;
    color: #000000;
    border: none;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .header-btn:hover {
    background: #ff7454;
  }

  .header-btn.secondary {
    background: #181820;
    color: #a1a1aa;
    border: 1px solid #27272f;
  }

  .header-btn.secondary:hover {
    border-color: #ff5b35;
    color: #ffffff;
  }

  .tone-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tone-row-card {
    position: relative;
    background: #0d0d12;
    border: 1px solid #1f1f26;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.15s ease;
  }

  .tone-row-card:hover {
    border-color: #2e2e3a;
  }

  .tone-row-card.strong-area {
    border-left: 2px solid #ff5b35;
  }

  .tone-row-card.dragging-over {
    border-color: #ff5b35;
    background: #181418;
  }

  .row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .row-info {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .row-idx {
    font-size: 10px;
    color: #ff5b35;
    font-weight: 700;
  }

  .row-name-input {
    background: transparent;
    border: 1px solid transparent;
    color: #ffffff;
    font-size: 11px;
    padding: 2px 4px;
    width: 110px;
  }

  .row-name-input:focus {
    border-color: #27272f;
    outline: none;
    background: #000000;
  }

  .row-top-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .strong-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 9px;
  }

  .strong-toggle input {
    accent-color: #ff5b35;
    cursor: pointer;
  }

  .toggle-tag {
    color: #71717a;
    font-size: 9px;
  }

  .strong-toggle input:checked + .toggle-tag {
    color: #ff5b35;
    font-weight: 600;
  }

  .remove-row-btn {
    background: transparent;
    border: none;
    color: #71717a;
    font-size: 11px;
    cursor: pointer;
    padding: 2px 4px;
  }

  .remove-row-btn:hover {
    color: #ef4444;
  }

  .row-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .color-picker-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tone-color-input {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border: 1px solid #27272f;
    padding: 0;
    cursor: pointer;
    background: none;
  }

  .color-hex {
    font-size: 10px;
    color: #a1a1aa;
  }

  .slider-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #71717a;
  }

  .slider-group input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: #1f1f26;
    outline: none;
  }

  .slider-group input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: #ff5b35;
    cursor: pointer;
  }

  .row-mark-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px dashed #1a1a22;
  }

  .mark-type-box {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .builtin-select,
  .blend-select {
    background: #14141a;
    border: 1px solid #27272f;
    color: #d4d4d8;
    font-size: 10px;
    padding: 4px 6px;
    cursor: pointer;
    outline: none;
  }

  .builtin-select:focus,
  .blend-select:focus {
    border-color: #ff5b35;
  }

  .upload-mark-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #181820;
    border: 1px solid #27272f;
    color: #d4d4d8;
    font-size: 9px;
    padding: 4px 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .upload-mark-btn:hover {
    border-color: #ff5b35;
    color: #ffffff;
  }

  .custom-mark-preview {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #14141a;
    border: 1px solid #ff5b35;
    padding: 2px 4px;
  }

  .custom-mark-preview img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .revert-mark-btn {
    background: none;
    border: none;
    color: #71717a;
    font-size: 9px;
    cursor: pointer;
    padding: 0 2px;
  }

  .revert-mark-btn:hover {
    color: #ef4444;
  }

  .drop-target-hint {
    background: #ff5b35;
    color: #000000;
    font-size: 9px;
    font-weight: 700;
    text-align: center;
    padding: 4px;
    letter-spacing: 0.05em;
  }
</style>
