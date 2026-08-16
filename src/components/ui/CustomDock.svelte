<script lang="ts">
  import { onMount } from 'svelte';
  import DecryptedText from './DecryptedText.svelte';

  interface Props {
    onToggleStudio?: () => void;
    onToggleWaves?: () => void;
    isStudioRoute?: boolean;
  }

  let { onToggleStudio, onToggleWaves, isStudioRoute = false }: Props = $props();

  let isCollapsed = $state(false);
  let activeTooltip = $state<string | null>(null);

  const baseUrl = (typeof window !== 'undefined' ? (window as any).__ASTRO_BASE_URL__ : '') || '/custom-ascii-art-tool-oss';
</script>

<div class="dock-container" class:collapsed={isCollapsed}>
  <div class="dock-bar font-mono">
    <!-- Item 1: Overview / Home -->
    <a
      href={`${baseUrl}/`}
      class="dock-item"
      class:active={!isStudioRoute}
      onmouseenter={() => (activeTooltip = 'Overview')}
      onmouseleave={() => (activeTooltip = null)}
      title="Overview"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span class="dock-label font-pixel">HOME</span>
    </a>

    <span class="dock-divider">|</span>

    <!-- Item 2: Launch Studio -->
    <a
      href={`${baseUrl}/studio/`}
      class="dock-item"
      class:active={isStudioRoute}
      onmouseenter={() => (activeTooltip = 'Studio Tool')}
      onmouseleave={() => (activeTooltip = null)}
      title="Studio Workspace"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="2" y="3" width="20" height="14" rx="0" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <span class="dock-label font-pixel">STUDIO</span>
    </a>

    <span class="dock-divider">|</span>

    <!-- Item 3: Quick Dither Preset / Algorithms -->
    <button
      type="button"
      class="dock-item"
      onclick={() => {
        if (onToggleWaves) onToggleWaves();
      }}
      onmouseenter={() => (activeTooltip = 'Toggle Waves')}
      onmouseleave={() => (activeTooltip = null)}
      title="Toggle Wave Animation"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M2 12c2.5-4 5.5-4 8 0s5.5 4 8 0 5.5-4 8 0" />
        <path d="M2 17c2.5-4 5.5-4 8 0s5.5 4 8 0 5.5-4 8 0" />
      </svg>
      <span class="dock-label font-pixel">WAVES</span>
    </button>

    <span class="dock-divider">|</span>

    <!-- Item 4: GitHub -->
    <a
      href="https://github.com/WarunaUdara/custom-ascii-art-tool-oss"
      target="_blank"
      rel="noopener noreferrer"
      class="dock-item"
      onmouseenter={() => (activeTooltip = 'GitHub')}
      onmouseleave={() => (activeTooltip = null)}
      title="GitHub Source"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
      <span class="dock-label font-pixel">REPO</span>
    </a>

    <span class="dock-divider">|</span>

    <!-- Collapse / Hide Toggle -->
    <button
      type="button"
      class="dock-toggle-btn"
      onclick={() => (isCollapsed = !isCollapsed)}
      title={isCollapsed ? 'Expand Dock' : 'Minimize Dock'}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {#if isCollapsed}
          <polyline points="18 15 12 9 6 15" />
        {:else}
          <polyline points="6 9 12 15 18 9" />
        {/if}
      </svg>
    </button>
  </div>
</div>

<style>
  .dock-container {
    position: fixed;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    display: flex;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
    user-select: none;
  }

  .dock-container.collapsed {
    transform: translate(-50%, calc(100% - 10px));
    opacity: 0.5;
  }

  .dock-container.collapsed:hover {
    transform: translate(-50%, 0);
    opacity: 1;
  }

  .dock-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(9, 9, 12, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid #27272f;
    padding: 4px 10px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85);
  }

  .dock-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: transparent;
    border: 1px solid transparent;
    color: #a1a1aa;
    text-decoration: none;
    cursor: pointer;
    font-size: 10px;
    letter-spacing: 0.04em;
    transition: all 0.15s ease;
  }

  .dock-item:hover {
    background: #18181f;
    border-color: #3f3f4c;
    color: #ffffff;
  }

  .dock-item.active {
    background: #18181f;
    border-color: #ff5b35;
    color: #ff5b35;
    font-weight: 700;
  }

  .dock-label {
    font-size: 9px;
  }

  .dock-divider {
    color: #27272f;
    font-size: 10px;
  }

  .dock-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #71717a;
    padding: 6px 4px;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .dock-toggle-btn:hover {
    color: #ededed;
  }
</style>
