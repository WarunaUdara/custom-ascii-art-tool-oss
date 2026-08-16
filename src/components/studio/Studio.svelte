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
  import HeroSection from '../home/HeroSection.svelte';
  import CustomDock from '../ui/CustomDock.svelte';

  interface Props {
    initialView?: 'hero' | 'studio';
  }

  let { initialView = 'hero' }: Props = $props();

  let activeView = $state<'hero' | 'studio'>(initialView);
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

  function initEngine() {
    if (canvasRef && !engine) {
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
  }

  onMount(() => {
    initEngine();
  });

  $effect(() => {
    if (activeView === 'studio' && canvasRef && !engine) {
      initEngine();
    }
  });

  onDestroy(() => {
    engine?.destroy();
  });

  function handleConfigChange(partial: Partial<EngineConfig>) {
    engine?.updateConfig(partial);
  }

  async function handleFileSelected(file: File) {
    activeView = 'studio';
    if (!engine) initEngine();
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

  function launchStudio() {
    activeView = 'studio';
  }
</script>

<div class="app-container">
  <!-- View Toggle Header Bar -->
  <div class="view-switch-bar">
    <div class="switch-tabs">
      <button
        type="button"
        class="tab-btn font-pixel"
        class:active={activeView === 'hero'}
        onclick={() => (activeView = 'hero')}
      >
        OVERVIEW
      </button>
      <button
        type="button"
        class="tab-btn font-pixel"
        class:active={activeView === 'studio'}
        onclick={() => (activeView = 'studio')}
      >
        STUDIO WORKSPACE
      </button>
    </div>

    {#if activeView === 'studio'}
      <div class="workspace-hint font-mono">
        DRAG & DROP IMAGE OR VIDEO TO BEGIN
      </div>
    {/if}
  </div>

  <div class="main-viewport">
    {#if activeView === 'hero'}
      <HeroSection onLaunchStudio={launchStudio} />
    {/if}

    <!-- Always keep the Studio workspace mounted in background or active to preserve canvas memory -->
    <div class="studio-wrapper" class:hidden={activeView !== 'studio'}>
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

      <CustomDock isStudioRoute={true} />
    </div>
  </div>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    flex: 1;
    background: #000000;
    overflow: hidden;
  }

  .view-switch-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 36px;
    min-height: 36px;
    background: #09090c;
    border-bottom: 1px solid #1a1a22;
    z-index: 50;
  }

  .switch-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tab-btn {
    background: transparent;
    border: 1px solid transparent;
    color: #71717a;
    font-size: 10px;
    letter-spacing: 0.05em;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn:hover {
    color: #ededed;
  }

  .tab-btn.active {
    background: #18181b;
    border-color: #27272a;
    color: #ff5b35;
    font-weight: 700;
  }

  .workspace-hint {
    font-size: 9px;
    color: #52525b;
    letter-spacing: 0.04em;
  }

  .main-viewport {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .studio-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    flex: 1;
    background: #000000;
    overflow: hidden;
  }

  .studio-wrapper.hidden {
    display: none;
  }

  @media (max-width: 768px) {
    .studio-wrapper {
      flex-direction: column;
      height: auto;
      min-height: 100%;
      overflow-y: auto;
    }
    .workspace-hint {
      display: none;
    }
  }
</style>
