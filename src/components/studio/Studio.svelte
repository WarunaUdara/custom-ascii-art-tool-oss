<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    DitherEngine,
    DEFAULT_ASCII_RAMP,
    DEFAULT_LEVEL_COLORS,
    type EngineConfig,
    type RenderStats,
  } from '../../lib/dither-engine';
  import ControlsPanel from './ControlsPanel.svelte';
  import CanvasStage from './CanvasStage.svelte';

  let canvasRef: HTMLCanvasElement | null = $state(null);
  let engine: DitherEngine | null = $state.raw(null);

  let hasMedia = $state(false);
  let isVideo = $state(false);
  let isRecording = $state(false);
  let recordStatusText = $state('');
  let currentFileName = $state('dither-artwork');
  let stats = $state<RenderStats | null>(null);

  let config = $state<EngineConfig>({
    resolution: 80,
    style: 'char',
    ramp: DEFAULT_ASCII_RAMP,
    invert: false,
    bgColor: '#0b0b0d',
    levelColors: [...DEFAULT_LEVEL_COLORS],
    algorithm: 'threshold',
    jitterAmount: 0.3,
    hoverEnabled: true,
    hoverColor: '#ffffff',
    hoverRadius: 18,
    hoverIntensity: 100,
    fadeSpeed: 18,
    fps: 30,
    playbackRate: 1.0,
  });

  onMount(() => {
    if (canvasRef) {
      engine = new DitherEngine(
        canvasRef,
        config,
        {
          onRecordProgress: (text, recording) => {
            recordStatusText = text;
            isRecording = recording;
          },
          onStatsUpdate: (newStats) => {
            stats = newStats;
          },
        }
      );
    }
  });

  onDestroy(() => {
    engine?.destroy();
  });

  function handleConfigChange(partial: Partial<EngineConfig>) {
    engine?.updateConfig(partial);
  }

  async function handleFileSelected(file: File) {
    if (!engine) return;
    currentFileName = (file.name || 'output').replace(/\.[^.]+$/, '');
    const isVid =
      (file.type || '').startsWith('video/') ||
      /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);

    try {
      if (isVid) {
        await engine.loadVideo(file);
        isVideo = true;
      } else {
        await engine.loadImage(file);
        isVideo = false;
      }
      hasMedia = true;
    } catch (err) {
      console.error('Failed to load media file:', err);
    }
  }

  function handleExportPng() {
    engine?.exportPng(`${currentFileName}-dither.png`);
  }

  function handleToggleVideoRecord() {
    if (!engine) return;
    if (isRecording) {
      engine.stopVideo();
    } else {
      engine.startVideoRender(`${currentFileName}-dither`);
    }
  }
</script>

<div class="studio-wrapper">
  <ControlsPanel
    bind:config
    {hasMedia}
    {isVideo}
    {isRecording}
    {recordStatusText}
    onchange={handleConfigChange}
    onExportPng={handleExportPng}
    onToggleVideoRecord={handleToggleVideoRecord}
  />

  <CanvasStage
    bind:canvasRef
    {hasMedia}
    {stats}
    onFileSelected={handleFileSelected}
  />
</div>

<style>
  .studio-wrapper {
    display: flex;
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    background: #08080a;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .studio-wrapper {
      flex-direction: column;
      height: auto;
      min-height: 100vh;
    }
  }
</style>
