<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    text: string;
    speed?: number;
    maxIterations?: number;
    sequential?: boolean;
    revealDirection?: 'start' | 'end' | 'center';
    useOriginalCharsOnly?: boolean;
    characters?: string;
    class?: string;
    encryptedClass?: string;
    parentClass?: string;
    animateOn?: 'mount' | 'hover' | 'both' | 'view';
    as?: string;
  }

  let {
    text,
    speed = 35,
    maxIterations = 12,
    sequential = true,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=~<>[]{}',
    class: className = '',
    encryptedClass = '',
    parentClass = '',
    animateOn = 'both',
    as = 'span',
  }: Props = $props();

  let displayText = $state(text);
  let isAnimating = $state(false);
  let revealedIndices = $state<Set<number>>(new Set());
  let isDecrypted = $state(false);

  let containerEl: HTMLElement | null = $state(null);
  let intervalId: any = null;

  const availableChars = $derived(
    useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter((c) => c !== ' ')
      : characters.split('')
  );

  function shuffle(originalText: string, revealed: Set<number>): string {
    return originalText
      .split('')
      .map((char, i) => {
        if (char === ' ' || char === '\n' || char === '\t') return char;
        if (revealed.has(i)) return originalText[i];
        return availableChars[Math.floor(Math.random() * availableChars.length)];
      })
      .join('');
  }

  function getOrder(len: number): number[] {
    const order: number[] = [];
    if (len <= 0) return order;
    if (revealDirection === 'start') {
      for (let i = 0; i < len; i++) order.push(i);
      return order;
    }
    if (revealDirection === 'end') {
      for (let i = len - 1; i >= 0; i--) order.push(i);
      return order;
    }
    // center outward
    const mid = Math.floor(len / 2);
    let offset = 0;
    while (order.length < len) {
      if (offset % 2 === 0) {
        const idx = mid + offset / 2;
        if (idx >= 0 && idx < len) order.push(idx);
      } else {
        const idx = mid - Math.ceil(offset / 2);
        if (idx >= 0 && idx < len) order.push(idx);
      }
      offset++;
    }
    return order.slice(0, len);
  }

  function triggerDecrypt() {
    if (intervalId) clearInterval(intervalId);

    const len = text.length;
    const order = getOrder(len);
    let pointer = 0;
    let iteration = 0;
    const currentRevealed = new Set<number>();

    isAnimating = true;
    isDecrypted = false;
    revealedIndices = new Set();

    intervalId = setInterval(() => {
      if (sequential) {
        if (pointer < order.length) {
          const idx = order[pointer];
          currentRevealed.add(idx);
          pointer++;
          revealedIndices = new Set(currentRevealed);
          displayText = shuffle(text, currentRevealed);
        } else {
          clearInterval(intervalId);
          intervalId = null;
          isAnimating = false;
          isDecrypted = true;
          displayText = text;
          revealedIndices = new Set(Array.from({ length: text.length }, (_, i) => i));
        }
      } else {
        displayText = shuffle(text, currentRevealed);
        iteration++;
        if (iteration >= maxIterations) {
          clearInterval(intervalId);
          intervalId = null;
          isAnimating = false;
          isDecrypted = true;
          displayText = text;
          revealedIndices = new Set(Array.from({ length: text.length }, (_, i) => i));
        }
      }
    }, speed);
  }

  function handleMouseEnter() {
    if (animateOn === 'hover' || animateOn === 'both') {
      triggerDecrypt();
    }
  }

  onMount(() => {
    if (animateOn === 'mount' || animateOn === 'both' || animateOn === 'view') {
      triggerDecrypt();
    } else {
      displayText = text;
      isDecrypted = true;
    }
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
  bind:this={containerEl}
  class="decrypted-text-root {parentClass}"
  onmouseenter={handleMouseEnter}
>
  <span class="sr-only">{text}</span>
  <span aria-hidden="true" class="letters-wrapper">
    {#each displayText.split('') as char, i}
      {#if char === ' '}
        <span class="char-space">&nbsp;</span>
      {:else}
        <span
          class="char-glyph {revealedIndices.has(i) || (!isAnimating && isDecrypted) ? className : `encrypted ${encryptedClass}`}"
        >{char}</span>
      {/if}
    {/each}
  </span>
</span>

<style>
  .decrypted-text-root {
    display: inline-block;
    cursor: default;
    user-select: none;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .letters-wrapper {
    display: inline-flex;
    align-items: baseline;
    white-space: nowrap;
  }

  .char-glyph {
    display: inline-block;
    font-variant-numeric: tabular-nums;
    min-width: 1ch;
    text-align: center;
    transition: color 0.08s ease;
  }

  .char-space {
    display: inline-block;
    width: 0.5ch;
  }

  .char-glyph.encrypted {
    color: #ff5b35;
    opacity: 0.85;
    text-shadow: 0 0 8px rgba(255, 91, 53, 0.4);
  }
</style>
