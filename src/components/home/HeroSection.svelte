<script lang="ts">
  import DecryptedText from '../ui/DecryptedText.svelte';

  interface Props {
    onLaunchStudio?: () => void;
  }

  let { onLaunchStudio }: Props = $props();

  const baseUrl = (typeof window !== 'undefined' ? (window as any).__ASTRO_BASE_URL__ : '') || '/custom-ascii-art-tool-oss';

  const FEATURES = [
    {
      num: '01',
      title: '6 DITHER KERNELS',
      desc: 'Bayer 4×4 & 8×8 Ordered, Floyd-Steinberg, Atkinson, 7-Level Quantization, and Stochastic Noise Jitter.',
    },
    {
      num: '02',
      title: '60 FPS VIDEO STREAM',
      desc: 'Frame-by-frame canvas processing with hardware-accelerated MediaRecorder WebM/MP4 rendering.',
    },
    {
      num: '03',
      title: 'CURSOR GLOW MATRIX',
      desc: 'Dynamic distance field mouse hover animation eased across cell luminance buffers.',
    },
    {
      num: '04',
      title: 'SVELTE 5 RUNES',
      desc: 'Fine-grained signal reactivity bypassing Virtual DOM diffing for 120Hz slider updates.',
    },
  ];
</script>

<section class="hero-section">
  <!-- Subtle Background Grid Pattern -->
  <div class="grid-backdrop"></div>

  <div class="hero-content">
    <!-- Top System Tag -->
    <div class="system-badge-row">
      <div class="system-badge font-mono">
        <span class="pulse-dot"></span>
        <DecryptedText text="SYS.V2.0 // OSS ARCHITECTURE" speed={30} />
      </div>
    </div>

    <!-- Main Headline with Decrypted Text & Geist Pixel Font -->
    <div class="headline-wrapper">
      <h1 class="main-title font-pixel">
        <DecryptedText
          text="ASCII & DITHER"
          speed={40}
          sequential={true}
          animateOn="both"
        />
        <br />
        <span class="accent-title">
          <DecryptedText
            text="STUDIO ENGINE"
            speed={40}
            sequential={true}
            animateOn="both"
          />
        </span>
      </h1>
    </div>

    <!-- Subtitle Description -->
    <p class="hero-subtitle font-sans">
      High-performance browser-based matrix transformation engine. Convert static images and live video streams into retro dithered halftone, character density ramps, and custom 7-level palette artwork.
    </p>

    <!-- CTAs -->
    <div class="hero-actions">
      <button
        type="button"
        class="cta-btn primary font-pixel"
        onclick={onLaunchStudio}
      >
        <span>LAUNCH STUDIO</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      <a
        href="https://github.com/WarunaUdara/custom-ascii-art-tool-oss"
        target="_blank"
        rel="noopener noreferrer"
        class="cta-btn secondary font-mono"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>STAR ON GITHUB</span>
      </a>
    </div>

    <!-- Feature Grid Matrix -->
    <div class="features-grid">
      {#each FEATURES as feat}
        <div class="feature-card">
          <div class="card-num font-mono">{feat.num} //</div>
          <div class="card-title font-pixel">
            <DecryptedText text={feat.title} speed={30} animateOn="hover" />
          </div>
          <div class="card-desc font-sans">{feat.desc}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .hero-section {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100%;
    background: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    overflow-y: auto;
  }

  .grid-backdrop {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, #111116 1px, transparent 1px),
      linear-gradient(to bottom, #111116 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.6;
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    max-width: 980px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
    z-index: 10;
  }

  .system-badge-row {
    display: flex;
    justify-content: center;
  }

  .system-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    background: #09090c;
    border: 1px solid #22222a;
    font-size: 11px;
    color: #a1a1aa;
    letter-spacing: 0.05em;
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    background: #ff5b35;
    box-shadow: 0 0 8px rgba(255, 91, 53, 0.8);
  }

  .headline-wrapper {
    margin: 6px 0;
  }

  .main-title {
    font-size: clamp(32px, 6vw, 64px);
    line-height: 1.05;
    color: #ffffff;
    letter-spacing: 0.02em;
    font-weight: 900;
  }

  .accent-title {
    color: #ff5b35;
    text-shadow: 0 0 32px rgba(255, 91, 53, 0.25);
  }

  .hero-subtitle {
    max-width: 640px;
    font-size: 14px;
    line-height: 1.6;
    color: #8b8b93;
    letter-spacing: -0.01em;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 10px 0 16px;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px;
    font-size: 11px;
    cursor: pointer;
    border: 1px solid transparent;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .cta-btn.primary {
    background: #ededed;
    color: #000000;
    font-weight: 700;
  }

  .cta-btn.primary:hover {
    background: #ffffff;
    box-shadow: 0 0 24px rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .cta-btn.secondary {
    background: #09090c;
    color: #ededed;
    border-color: #27272a;
  }

  .cta-btn.secondary:hover {
    border-color: #ff5b35;
    color: #ffffff;
    background: #121216;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    width: 100%;
    margin-top: 12px;
  }

  .feature-card {
    background: #09090c;
    border: 1px solid #1f1f26;
    padding: 18px 16px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    border-color: #ff5b35;
    background: #111116;
    transform: translateY(-2px);
  }

  .card-num {
    font-size: 10px;
    color: #ff5b35;
    font-weight: 700;
  }

  .card-title {
    font-size: 12px;
    color: #ededed;
    letter-spacing: 0.04em;
  }

  .card-desc {
    font-size: 11px;
    color: #71717a;
    line-height: 1.5;
  }

  @media (max-width: 860px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 520px) {
    .features-grid {
      grid-template-columns: 1fr;
    }
    .hero-actions {
      flex-direction: column;
      width: 100%;
    }
    .cta-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
