<script lang="ts">
  import { onMount } from 'svelte';
  import DotMatrixLoader from './DotMatrixLoader.svelte';
  import DecryptedText from './DecryptedText.svelte';

  let isNavigating = $state(false);
  let destinationLabel = $state('INITIALIZING WORKSPACE...');

  onMount(() => {
    // Intercept internal page link clicks for smooth cyber transition
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.href);
      if (
        url.origin === window.location.origin &&
        !target.hasAttribute('download') &&
        target.target !== '_blank' &&
        url.pathname !== window.location.pathname
      ) {
        if (url.pathname.includes('studio')) {
          destinationLabel = 'LOADING DITHER STUDIO...';
        } else {
          destinationLabel = 'ROUTING TO OVERVIEW...';
        }

        isNavigating = true;
        e.preventDefault();

        setTimeout(() => {
          window.location.href = target.href;
        }, 320);
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  });
</script>

{#if isNavigating}
  <div class="transition-overlay" role="dialog" aria-modal="true" aria-label="Loading page">
    <div class="loader-box font-mono">
      <DotMatrixLoader size={44} dotSize={5} speed={1.6} bloom={true} color="#ff5b35" />
      
      <div class="status-row">
        <span class="pulse-indicator"></span>
        <span class="status-text font-pixel">{destinationLabel}</span>
      </div>

      <div class="telemetry-bar font-mono">
        <span>SYS.TRANSITION // 120HZ</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .transition-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(4, 4, 6, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.15s ease-out forwards;
    user-select: none;
  }

  .loader-box {
    background: #09090c;
    border: 1px solid #27272f;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 91, 53, 0.15);
    animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #ededed;
    letter-spacing: 0.06em;
  }

  .pulse-indicator {
    width: 6px;
    height: 6px;
    background: #ff5b35;
    box-shadow: 0 0 8px rgba(255, 91, 53, 0.9);
  }

  .status-text {
    font-size: 11px;
    color: #ededed;
  }

  .telemetry-bar {
    font-size: 9px;
    color: #71717a;
    letter-spacing: 0.08em;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
  }
</style>
