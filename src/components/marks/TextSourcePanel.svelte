<script lang="ts">
  import type { TextSourceConfig } from '../../lib/tone-marks-engine';

  interface Props {
    sourceType: 'text' | 'image' | 'video';
    textConfig: TextSourceConfig;
    onupdatesource: (type: 'text' | 'image' | 'video') => void;
    onupdatetext: (partial: Partial<TextSourceConfig>) => void;
    onuploadmedia: (file: File) => void;
  }

  let {
    sourceType,
    textConfig = $bindable(),
    onupdatesource,
    onupdatetext,
    onuploadmedia,
  }: Props = $props();

  const FONTS = [
    { id: 'Geist Pixel Grid', name: 'Geist Pixel Grid' },
    { id: 'Geist Pixel Square', name: 'Geist Pixel Square' },
    { id: 'Geist Mono', name: 'Geist Mono' },
    { id: 'Geist Sans', name: 'Geist Sans' },
    { id: 'Georgia, serif', name: 'Classic Serif' },
    { id: 'Courier New, monospace', name: 'Retro Terminal' },
  ];
</script>

<div class="text-source-panel">
  <!-- Mode Selector Tabs -->
  <div class="source-tabs">
    <button
      type="button"
      class="source-tab-btn font-pixel corner-ticks"
      class:active={sourceType === 'text'}
      onclick={() => onupdatesource('text')}
    >
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>
      <span>01. TEXT TYPOGRAPHY</span>
    </button>
    <button
      type="button"
      class="source-tab-btn font-pixel corner-ticks"
      class:active={sourceType !== 'text'}
      onclick={() => onupdatesource('image')}
    >
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>
      <span>02. MEDIA FILE</span>
    </button>
  </div>

  {#if sourceType === 'text'}
    <div class="typography-controls">
      <!-- Multi-line Text Area -->
      <div class="field">
        <div class="field-label font-mono">
          <span>SOURCE TEXT (MULTILINE)</span>
        </div>
        <textarea
          class="text-input font-pixel"
          rows="3"
          value={textConfig.text}
          oninput={(e) => onupdatetext({ text: (e.target as HTMLTextAreaElement).value })}
          placeholder="Type multiline text..."
        ></textarea>
      </div>

      <!-- Font Family -->
      <div class="field">
        <div class="field-label font-mono">
          <span>TYPEFACE</span>
        </div>
        <select
          class="font-select font-mono"
          value={textConfig.fontFamily}
          onchange={(e) => onupdatetext({ fontFamily: (e.target as HTMLSelectElement).value })}
        >
          {#each FONTS as f}
            <option value={f.id}>{f.name}</option>
          {/each}
        </select>
      </div>

      <!-- Size, Leading, Kerning Sliders -->
      <div class="sliders-grid">
        <!-- Font Size -->
        <div class="slider-field">
          <div class="field-label font-mono">
            <span>SIZE</span>
            <span class="tabular-nums font-mono">{textConfig.fontSize}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="180"
            step="2"
            value={textConfig.fontSize}
            oninput={(e) => onupdatetext({ fontSize: parseInt((e.target as HTMLInputElement).value) })}
          />
        </div>

        <!-- Leading (Line-Height) -->
        <div class="slider-field">
          <div class="field-label font-mono">
            <span>LEADING</span>
            <span class="tabular-nums font-mono">{textConfig.leading.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="2.2"
            step="0.05"
            value={textConfig.leading}
            oninput={(e) => onupdatetext({ leading: parseFloat((e.target as HTMLInputElement).value) })}
          />
        </div>

        <!-- Kerning (Letter-Spacing) -->
        <div class="slider-field">
          <div class="field-label font-mono">
            <span>KERNING</span>
            <span class="tabular-nums font-mono">{textConfig.kerning}px</span>
          </div>
          <input
            type="range"
            min="-5"
            max="30"
            step="1"
            value={textConfig.kerning}
            oninput={(e) => onupdatetext({ kerning: parseInt((e.target as HTMLInputElement).value) })}
          />
        </div>
      </div>
    </div>
  {:else}
    <!-- Media Upload Box -->
    <div class="media-upload-section">
      <label class="media-drop-box corner-ticks font-mono" title="Click or drag file">
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m16 16-4-4-4 4" />
        </svg>
        <span class="upload-title font-pixel">UPLOAD SOURCE IMAGE / VIDEO</span>
        <span class="upload-sub">PNG · JPG · WEBP · MP4 · WEBM</span>
      </label>
    </div>
  {/if}
</div>

<style>
  .text-source-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    color: #ededed;
  }

  .source-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .source-tab-btn {
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

  .source-tab-btn:hover {
    border-color: #ff5b35;
    color: #ededed;
  }

  .source-tab-btn.active {
    background: #14141c;
    border-color: #ff5b35;
    color: #ffffff;
    font-weight: 700;
  }

  .typography-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #0d0d12;
    border: 1px solid #1f1f26;
    padding: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #71717a;
    letter-spacing: 0.05em;
  }

  .text-input {
    background: #060608;
    border: 1px solid #27272f;
    color: #ffffff;
    font-size: 12px;
    padding: 8px;
    resize: vertical;
    outline: none;
    line-height: 1.3;
  }

  .text-input:focus {
    border-color: #ff5b35;
  }

  .font-select {
    background: #060608;
    border: 1px solid #27272f;
    color: #ededed;
    font-size: 11px;
    padding: 6px 8px;
    outline: none;
    cursor: pointer;
  }

  .font-select:focus {
    border-color: #ff5b35;
  }

  .sliders-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .slider-field input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: #1f1f26;
    outline: none;
  }

  .slider-field input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: #ff5b35;
    cursor: pointer;
  }

  .media-drop-box {
    position: relative;
    background: #0d0d12;
    border: 1px dashed #27272f;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;
  }

  .media-drop-box:hover {
    border-color: #ff5b35;
    background: #121218;
  }

  .upload-title {
    font-size: 11px;
    color: #ededed;
  }

  .upload-sub {
    font-size: 9px;
    color: #71717a;
  }
</style>
