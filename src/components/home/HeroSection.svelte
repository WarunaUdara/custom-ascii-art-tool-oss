<script lang="ts">
  import DecryptedText from '../ui/DecryptedText.svelte';
  import DitherWaves from './DitherWaves.svelte';
  import AdamHandsDither from './AdamHandsDither.svelte';

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
  <!-- Interactive WebGL Dither Waves Background Animation -->
  <DitherWaves
    waveSpeed={0.045}
    waveFrequency={2.5}
    waveAmplitude={0.34}
    waveColor={[1.0, 0.357, 0.208]}
    colorNum={4.0}
    pixelSize={2.2}
    disableAnimation={false}
    enableMouseInteraction={true}
    mouseRadius={0.38}
  />

  <!-- Soft Ambient Contrast Vignette -->
  <div class="vignette-overlay"></div>

  <!-- Subtle Background Grid Pattern Overlay -->
  <div class="grid-backdrop"></div>

  <div class="hero-content">
    <!-- Top System Tag with Precision Corner Ticks -->
    <div class="system-badge-row">
      <div class="system-badge font-mono corner-ticks">
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <span class="pulse-dot"></span>
        <DecryptedText text="SYS.V2.0 // OSS ARCHITECTURE" speed={30} />
      </div>
    </div>

    <!-- Main Headline with Decrypted Text & Geist Pixel Font, Flanked by Adam Hands -->
    <div class="headline-wrapper">
      <AdamHandsDither />

      <h1 class="main-title font-pixel">
        <span class="title-line">
          <DecryptedText
            text="ASCII & DITHER"
            speed={35}
            sequential={true}
            animateOn="both"
          />
        </span>
        <span class="title-line accent-title">
          <DecryptedText
            text="STUDIO ENGINE"
            speed={35}
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

    <!-- CTAs with Decorated Corner Ticks -->
    <div class="hero-actions">
      <a
        href={`${baseUrl}/studio/`}
        class="cta-btn primary font-pixel corner-ticks"
        onclick={(e) => {
          if (onLaunchStudio) {
            e.preventDefault();
            onLaunchStudio();
          }
        }}
      >
        <span class="tick-tl" style="--tick-color: #000000;"></span>
        <span class="tick-tr" style="--tick-color: #000000;"></span>
        <span class="tick-bl" style="--tick-color: #000000;"></span>
        <span class="tick-br" style="--tick-color: #000000;"></span>
        <span>LAUNCH STUDIO</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>

      <a
        href="https://github.com/WarunaUdara/custom-ascii-art-tool-oss"
        target="_blank"
        rel="noopener noreferrer"
        class="cta-btn secondary font-mono corner-ticks"
      >
        <span class="tick-tl"></span>
        <span class="tick-tr"></span>
        <span class="tick-bl"></span>
        <span class="tick-br"></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>STAR ON GITHUB</span>
      </a>
    </div>

    <!-- Feature Grid Matrix with Decorated Corner Ticks on Every Card -->
    <div class="features-grid">
      {#each FEATURES as feat}
        <div class="feature-card corner-ticks">
          <span class="tick-tl"></span>
          <span class="tick-tr"></span>
          <span class="tick-bl"></span>
          <span class="tick-br"></span>
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
    min-height: calc(100vh - 44px);
    background: #000000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px 60px;
    box-sizing: border-box;
    margin: 0 auto;
    overflow: hidden;
  }

  .vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0.8) 100%);
    pointer-events: none;
    z-index: 2;
  }

  .grid-backdrop {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, #14141a 1px, transparent 1px),
      linear-gradient(to bottom, #14141a 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.35;
    pointer-events: none;
    z-index: 3;
  }

  .hero-content {
    position: relative;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 22px;
    z-index: 10;
  }

  .system-badge-row {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .system-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 14px;
    background: rgba(9, 9, 12, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid #27272f;
    font-size: 11px;
    color: #a1a1aa;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    background: #ff5b35;
    box-shadow: 0 0 8px rgba(255, 91, 53, 0.8);
    flex-shrink: 0;
  }

  .headline-wrapper {
    position: relative;
    margin: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 160px;
    text-align: center;
    overflow: visible;
  }

  .main-title {
    position: relative;
    font-size: clamp(28px, 5vw, 56px);
    line-height: 1.15;
    color: #ffffff;
    letter-spacing: 0.02em;
    font-weight: 900;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    margin: 0 auto;
    gap: 6px;
    z-index: 10;
  }

  .title-line {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    text-align: center;
  }

  .accent-title {
    color: #ff5b35;
    text-shadow: 0 0 32px rgba(255, 91, 53, 0.35);
  }

  .hero-subtitle {
    max-width: 640px;
    font-size: 14px;
    line-height: 1.6;
    color: #d4d4d8;
    letter-spacing: -0.01em;
    margin: 0 auto;
    text-align: center;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
  }

  .hero-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin: 8px 0 16px;
    width: 100%;
  }

  .cta-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    font-size: 11px;
    cursor: pointer;
    border: 1px solid transparent;
    text-decoration: none;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .cta-btn.primary {
    background: #ededed;
    color: #000000;
    font-weight: 700;
  }

  .cta-btn.primary:hover {
    background: #ffffff;
    box-shadow: 0 0 24px rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }

  .cta-btn.secondary {
    background: rgba(9, 9, 12, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #ededed;
    border-color: #27272f;
  }

  .cta-btn.secondary:hover {
    border-color: #ff5b35;
    color: #ffffff;
    background: #14141a;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    width: 100%;
    margin-top: 8px;
  }

  .feature-card {
    position: relative;
    background: rgba(9, 9, 12, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid #22222a;
    padding: 18px 16px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    border-color: #ff5b35;
    background: rgba(17, 17, 22, 0.96);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 91, 53, 0.12);
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
    white-space: nowrap;
  }

  .card-desc {
    font-size: 11px;
    color: #a1a1aa;
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
