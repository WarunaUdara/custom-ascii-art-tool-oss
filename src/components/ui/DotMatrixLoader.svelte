<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    size?: number;
    dotSize?: number;
    speed?: number;
    bloom?: boolean;
    halo?: number;
    colorPreset?: 'solid-theme' | 'grad-aurora' | 'grad-sunset' | 'grad-neon' | 'solid-mint';
    color?: string;
    animated?: boolean;
    pattern?: 'full' | 'diamond' | 'cross' | 'outline';
    className?: string;
  }

  let {
    size = 48,
    dotSize = 5,
    speed = 1.2,
    bloom = true,
    halo = 0.6,
    colorPreset = 'solid-theme',
    color = '#ff5b35',
    animated = true,
    pattern = 'full',
    className = '',
  }: Props = $props();

  const GRID_SIZE = 5; // 5x5 matrix
  const totalDots = GRID_SIZE * GRID_SIZE;

  // Diagonal sweep index path
  function isDotActive(r: number, c: number, pat: string): boolean {
    if (pat === 'full') return true;
    if (pat === 'cross') return r === 2 || c === 2;
    if (pat === 'diamond') return Math.abs(r - 2) + Math.abs(c - 2) <= 2;
    if (pat === 'outline') return r === 0 || r === 4 || c === 0 || c === 4;
    return true;
  }

  const dots = $derived(
    Array.from({ length: totalDots }, (_, i) => {
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      const isActive = isDotActive(row, col, pattern);
      const slice = row + (4 - col);
      const parity = slice % 2;
      const pathNorm = (row + col) / (GRID_SIZE * 2 - 2);
      return { index: i, row, col, isActive, slice, parity, pathNorm };
    })
  );
</script>

<div
  class="dot-matrix-root {colorPreset} {className}"
  class:animated
  class:bloom
  style="
    --dmx-size: {size}px;
    --dmx-dot-size: {dotSize}px;
    --dmx-speed: {1.8 / Math.max(0.1, speed)}s;
    --dmx-color: {color};
    --dmx-halo: {halo};
  "
  role="status"
  aria-label="Loading"
>
  <div class="dot-matrix-grid">
    {#each dots as dot}
      {#if dot.isActive}
        <span
          class="dmx-dot"
          style="
            --dmx-path: {dot.pathNorm};
            --dmx-diagonal-parity: {dot.parity};
            animation-delay: calc(var(--dmx-speed) * {dot.slice * 0.08}s);
          "
        ></span>
      {:else}
        <span class="dmx-dot inactive"></span>
      {/if}
    {/each}
  </div>
</div>

<style>
  .dot-matrix-root {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--dmx-size);
    height: var(--dmx-size);
    position: relative;
    user-select: none;
  }

  .dot-matrix-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: calc((var(--dmx-size) - (var(--dmx-dot-size) * 5)) / 4);
    width: 100%;
    height: 100%;
    align-items: center;
    justify-items: center;
  }

  .dmx-dot {
    width: var(--dmx-dot-size);
    height: var(--dmx-dot-size);
    background-color: var(--dmx-color, #ff5b35);
    border-radius: 0px !important;
    display: block;
    opacity: 0.2;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .dmx-dot.inactive {
    opacity: 0.04;
  }

  /* Diagonal Alt Sweep Animation */
  .animated .dmx-dot:not(.inactive) {
    animation: dmxDiagonalSweep var(--dmx-speed) infinite ease-in-out;
  }

  @keyframes dmxDiagonalSweep {
    0%, 100% {
      opacity: 0.18;
      transform: scale(0.9);
    }
    45%, 55% {
      opacity: 1.0;
      transform: scale(1.15);
    }
  }

  /* Bloom Glow Treatment */
  .bloom .dmx-dot:not(.inactive) {
    box-shadow: 0 0 calc(6px * var(--dmx-halo, 0.6)) var(--dmx-color);
  }

  /* Color Presets */
  .solid-theme {
    --dmx-color: #ff5b35;
  }

  .grad-aurora {
    --dmx-color: #00ffcc;
  }

  .grad-sunset {
    --dmx-color: #ff3366;
  }

  .grad-neon {
    --dmx-color: #38bdf8;
  }

  .solid-mint {
    --dmx-color: #10b981;
  }
</style>
