<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ToneMarksEngine,
    type BlendMode,
    type RandomSwitchConfig,
    type TextSourceConfig,
    type ToneMarksConfig,
    type ToneRenderStats,
    type ToneRow,
  } from '../../lib/tone-marks-engine';
  import ToneRowsPanel from './ToneRowsPanel.svelte';
  import TextSourcePanel from './TextSourcePanel.svelte';
  import RandomizerPanel from './RandomizerPanel.svelte';
  import ToneMarksStage from './ToneMarksStage.svelte';

  let canvasRef = $state<HTMLCanvasElement | null>(null);
  let engine: ToneMarksEngine | null = null;

  let toneRows = $state<ToneRow[]>([]);
  let stats = $state<ToneRenderStats | null>(null);
  let textConfig = $state<TextSourceConfig>({
    text: 'TONE\nMATRIX',
    fontFamily: 'Geist Pixel Grid',
    fontSize: 84,
    leading: 1.15,
    kerning: 3,
    color: '#ffffff',
    bgColor: '#000000',
    align: 'center',
    padding: 30,
  });

  let engineConfig = $state<ToneMarksConfig>({
    sourceType: 'text',
    gridResolution: 72,
    bgColor: '#060608',
    invert: false,
    cellScale: 1.0,
    globalBlendMode: 'source-over',
    enableHoverGlow: true,
    hoverColor: '#ffffff',
    hoverRadius: 18,
    hoverIntensity: 1.0,
    fadeSpeed: 0.18,
  });

  let randomConfig = $state<RandomSwitchConfig>({
    enabled: false,
    amount: 0.35,
    reach: 2,
    intervalMs: 800,
    autoLoop: false,
  });

  onMount(() => {
    if (!canvasRef) return;

    engine = new ToneMarksEngine(
      canvasRef,
      engineConfig,
      undefined,
      textConfig
    );

    toneRows = engine.getToneRows();
    engine.onStatsUpdate = (newStats) => {
      stats = newStats;
    };

    // Global Keydown Listener for 'Q' hotkey shuffle
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'q' || e.key === 'Q') {
        engine?.triggerRandomSwitch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine?.destroy();
    };
  });

  function handleAddTone() {
    if (!engine) return;
    engine.addToneRow();
    toneRows = [...engine.getToneRows()];
  }

  function handleRemoveTone(id: string) {
    if (!engine) return;
    engine.removeToneRow(id);
    toneRows = [...engine.getToneRows()];
  }

  function handleUpdateTone(id: string, partial: Partial<ToneRow>) {
    if (!engine) return;
    engine.updateToneRow(id, partial);
    toneRows = [...engine.getToneRows()];
  }

  function handleRestoreTones() {
    if (!engine) return;
    engine.restoreBuiltinTones();
    toneRows = [...engine.getToneRows()];
  }

  async function handleUploadMark(toneId: string, file: File) {
    if (!engine) return;
    await engine.setMarkFromFile(toneId, file);
    toneRows = [...engine.getToneRows()];
  }

  function handleSourceTypeChange(type: 'text' | 'image' | 'video') {
    engineConfig.sourceType = type;
    engine?.setConfig({ sourceType: type });
  }

  function handleUpdateText(partial: Partial<TextSourceConfig>) {
    textConfig = { ...textConfig, ...partial };
    engine?.updateTextSource(partial);
  }

  async function handleUploadMedia(file: File) {
    if (!engine) return;
    if (file.type.startsWith('video/')) {
      await engine.loadSourceVideo(file);
      engineConfig.sourceType = 'video';
    } else {
      await engine.loadSourceImage(file);
      engineConfig.sourceType = 'image';
    }
  }

  function handleUpdateRandom(partial: Partial<RandomSwitchConfig>) {
    randomConfig = { ...randomConfig, ...partial };
    engine?.setRandomConfig(partial);
  }

  function handleTriggerShuffle() {
    engine?.triggerRandomSwitch();
  }

  function handleExportPng() {
    engine?.exportPng('tone-matrix-artwork.png');
  }

  function handleCopyText() {
    engine?.copyAsciiToClipboard();
  }

  function handleExportTxt() {
    engine?.exportAsciiTxtFile('tone-matrix-artwork.txt');
  }
</script>

<div class="marks-studio-container">
  <!-- Left Controls Sidebar -->
  <aside class="sidebar-panel">
    <div class="sidebar-header">
      <div class="brand-tag font-pixel">02 // TONE MATRIX & CUSTOM MARKS</div>
      <div class="brand-sub font-mono">MULTI-LEVEL PIXEL BLENDING ENGINE</div>
    </div>

    <div class="sidebar-scrollable">
      <!-- Section 1: Typography & Media Source -->
      <TextSourcePanel
        sourceType={engineConfig.sourceType}
        {textConfig}
        onupdatesource={handleSourceTypeChange}
        onupdatetext={handleUpdateText}
        onuploadmedia={handleUploadMedia}
      />

      <div class="panel-divider"></div>

      <!-- Section 2: Procedural Tone Switcher (Q Key) -->
      <RandomizerPanel
        {randomConfig}
        onupdateconfig={handleUpdateRandom}
        ontrigger={handleTriggerShuffle}
      />

      <div class="panel-divider"></div>

      <!-- Section 3: Midtones & Custom Marks List -->
      <ToneRowsPanel
        {toneRows}
        onaddtone={handleAddTone}
        onremovetone={handleRemoveTone}
        onupdatetone={handleUpdateTone}
        onrestoretones={handleRestoreTones}
        onuploadmark={handleUploadMark}
      />

      <div class="panel-divider"></div>

      <!-- Section 4: Engine Resolution & Canvas Settings -->
      <div class="engine-settings font-mono">
        <div class="settings-title font-pixel">ENGINE PARAMETERS</div>
        
        <div class="setting-row">
          <span>GRID RESOLUTION</span>
          <span class="tabular-nums font-mono">{engineConfig.gridResolution} COLS</span>
        </div>
        <input
          type="range"
          min="24"
          max="160"
          step="2"
          value={engineConfig.gridResolution}
          oninput={(e) => {
            const val = parseInt((e.target as HTMLInputElement).value);
            engineConfig.gridResolution = val;
            engine?.setConfig({ gridResolution: val });
          }}
        />

        <div class="setting-row">
          <span>CELL SCALE</span>
          <span class="tabular-nums font-mono">{engineConfig.cellScale.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.8"
          step="0.05"
          value={engineConfig.cellScale}
          oninput={(e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            engineConfig.cellScale = val;
            engine?.setConfig({ cellScale: val });
          }}
        />

        <div class="setting-row toggle-line">
          <span>INVERT LUMINANCE</span>
          <input
            type="checkbox"
            checked={engineConfig.invert}
            onchange={(e) => {
              const val = (e.target as HTMLInputElement).checked;
              engineConfig.invert = val;
              engine?.setConfig({ invert: val });
            }}
          />
        </div>
      </div>
    </div>
  </aside>

  <!-- Right Canvas Viewport Stage -->
  <main class="stage-container">
    <ToneMarksStage
      bind:canvasRef
      {stats}
      onExportPng={handleExportPng}
      onCopyText={handleCopyText}
      onExportTxt={handleExportTxt}
      onMouseMove={(x, y) => engine?.handleMouseMove(x, y)}
      onMouseLeave={() => engine?.handleMouseLeave()}
    />
  </main>
</div>

<style>
  .marks-studio-container {
    display: flex;
    width: 100vw;
    height: calc(100vh - 44px);
    background: #000000;
    overflow: hidden;
  }

  .sidebar-panel {
    width: 360px;
    min-width: 360px;
    height: 100%;
    background: #09090c;
    border-right: 1px solid #1f1f26;
    display: flex;
    flex-direction: column;
    z-index: 20;
  }

  .sidebar-header {
    padding: 14px 16px;
    border-bottom: 1px solid #1f1f26;
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: #060608;
  }

  .brand-tag {
    font-size: 11px;
    color: #ffffff;
    letter-spacing: 0.05em;
  }

  .brand-sub {
    font-size: 9px;
    color: #ff5b35;
    letter-spacing: 0.06em;
  }

  .sidebar-scrollable {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel-divider {
    height: 1px;
    background: #1f1f26;
    margin: 2px 0;
  }

  .engine-settings {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #0d0d12;
    border: 1px solid #1f1f26;
    padding: 12px;
  }

  .settings-title {
    font-size: 11px;
    color: #ededed;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #71717a;
  }

  .setting-row.toggle-line {
    padding-top: 4px;
    align-items: center;
  }

  .engine-settings input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: #1f1f26;
    outline: none;
  }

  .engine-settings input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: #ff5b35;
    cursor: pointer;
  }

  .engine-settings input[type='checkbox'] {
    accent-color: #ff5b35;
    cursor: pointer;
  }

  .stage-container {
    flex: 1;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
</style>
