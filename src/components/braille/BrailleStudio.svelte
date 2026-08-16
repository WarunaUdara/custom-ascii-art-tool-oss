<script lang="ts">
  import { onMount } from 'svelte';
  import {
    BrailleEngine,
    type BrailleRenderConfig,
    type BrailleRenderStats,
    type DrawTool,
  } from '../../lib/braille-engine';
  import BrailleControlsPanel from './BrailleControlsPanel.svelte';
  import TerminalPreviewStage from './TerminalPreviewStage.svelte';

  let canvasRef = $state<HTMLCanvasElement | null>(null);
  let engine: BrailleEngine | null = null;

  let stats = $state<BrailleRenderStats | null>(null);
  let selectedTool = $state<DrawTool>('brush');
  let brushColor = $state('#ff5b35');
  let brushSize = $state(2);

  let config = $state<BrailleRenderConfig>({
    mode: 'convert',
    cols: 80,
    threshold: 0.42,
    invert: false,
    edgeEnhance: 0.4,
    dither: 'floyd-steinberg',
    colorMode: 'truecolor',
    customColor: '#ff5b35',
    customBgColor: '#0a0a0f',
    enableBgColor: false,
    charSpacing: 0,
    crtEffect: false,
    fontSize: 14,
  });

  onMount(() => {
    if (!canvasRef) return;

    engine = new BrailleEngine(canvasRef, config);
    engine.onStatsUpdate = (newStats) => {
      stats = newStats;
    };

    return () => {
      engine?.destroy();
    };
  });

  function handleConfigChange(partial: Partial<BrailleRenderConfig>) {
    config = { ...config, ...partial };
    engine?.setConfig(partial);
  }

  function handleSelectTool(tool: DrawTool) {
    selectedTool = tool;
    engine?.setTool(tool);
  }

  function handleUpdateBrushColor(c: string) {
    brushColor = c;
    engine?.setBrushColor(c);
  }

  function handleUpdateBrushSize(s: number) {
    brushSize = s;
    engine?.setBrushSize(s);
  }

  function handleClearCanvas() {
    engine?.clearPaintCanvas();
  }

  async function handleUploadMedia(file: File) {
    if (!engine) return;
    if (file.type.startsWith('video/')) {
      await engine.loadVideo(file);
      config.mode = 'convert';
    } else {
      await engine.loadImage(file);
      config.mode = 'convert';
    }
  }

  function handleExportScript() {
    engine?.exportShellScript('terminal-art.sh');
  }

  function handleCopyAnsi() {
    engine?.copyAnsiToClipboard();
  }

  function handleCopyBraille() {
    engine?.copyBrailleTextToClipboard();
  }

  function handleExportPng() {
    engine?.exportPng('braille-terminal-artwork.png');
  }
</script>

<div class="braille-studio-container">
  <!-- Left Controls Sidebar -->
  <aside class="sidebar-panel">
    <div class="sidebar-header">
      <div class="brand-tag font-pixel">03 // ANSI & BRAILLE STUDIO</div>
      <div class="brand-sub font-mono">2x4 SUBPIXEL MATRIX & CLI GENERATOR</div>
    </div>

    <div class="sidebar-scrollable">
      <BrailleControlsPanel
        {config}
        {selectedTool}
        {brushColor}
        {brushSize}
        onupdateconfig={handleConfigChange}
        onselecttool={handleSelectTool}
        onupdatebrushcolor={handleUpdateBrushColor}
        onupdatebrushsize={handleUpdateBrushSize}
        onclearcanvas={handleClearCanvas}
        onuploadmedia={handleUploadMedia}
      />
    </div>
  </aside>

  <!-- Right Terminal Stage -->
  <main class="stage-container">
    <TerminalPreviewStage
      bind:canvasRef
      {stats}
      {config}
      onExportScript={handleExportScript}
      onCopyAnsi={handleCopyAnsi}
      onCopyBraille={handleCopyBraille}
      onExportPng={handleExportPng}
      onPaintStart={(x, y) => engine?.handlePaintStart(x, y)}
      onPaintMove={(x, y) => engine?.handlePaintMove(x, y)}
      onPaintEnd={() => engine?.handlePaintEnd()}
    />
  </main>
</div>

<style>
  .braille-studio-container {
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

  .stage-container {
    flex: 1;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
</style>
