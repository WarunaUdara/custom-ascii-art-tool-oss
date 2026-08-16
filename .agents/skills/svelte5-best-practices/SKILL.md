---
name: svelte5-best-practices
description: "Svelte 5 runes, snippets, fine-grained reactivity, and modern best practices for TypeScript and canvas/UI component development. Use when creating or refactoring Svelte 5 components."
---

# Svelte 5 Best Practices

## Core Reactivity Runes

### `$state` & `$state.raw`
```svelte
<script lang="ts">
  let resolution = $state(80);
  let palette = $state<string[]>(['#000', '#fff']);
  
  // Use $state.raw for large objects or arrays where deep reactivity is not needed (e.g., Pixel Buffers / Float32Array)
  let pixelBuffer = $state.raw<Float32Array | null>(null);
</script>
```

### `$derived` & `$derived.by`
```svelte
<script lang="ts">
  let cols = $state(80);
  let aspect = $state(16 / 9);
  let rows = $derived(Math.max(1, Math.round(cols / aspect)));
  
  let formattedDetails = $derived.by(() => {
    return `${cols}x${rows} grid (${cols * rows} cells)`;
  });
</script>
```

### `$effect` & `$effect.pre`
```svelte
<script lang="ts">
  import { untrack } from 'svelte';

  // Runs on state changes after DOM updates
  $effect(() => {
    // Only re-run when resolution changes, not when other untracked state changes
    engine.setResolution(resolution);
    untrack(() => engine.render());
  });
</script>
```

### Component Props (`$props` and `$bindable`)
```svelte
<script lang="ts">
  interface Props {
    label: string;
    value: number;
    min?: number;
    max?: number;
    onchange?: (val: number) => void;
  }

  let { label, value = $bindable(80), min = 10, max = 220, onchange }: Props = $props();
</script>

<div class="field">
  <label>{label}: <span>{value}</span></label>
  <input type="range" bind:value {min} {max} oninput={() => onchange?.(value)} />
</div>
```

---

## Svelte 5 Rules & Traps

1. **Use `onclick` instead of `on:click`**: Svelte 5 standardizes DOM event listeners to standard lowercase properties (`onclick`, `onkeydown`, `oninput`).
2. **Use `$bindable()` for two-way bindings**: Any prop meant to be bound via `bind:value` must declare `let { value = $bindable() } = $props()`.
3. **Avoid Over-Reactivity on Animation Loops**: For 60fps canvas/video rendering loops, do not put mutable frame buffers inside deeply reactive `$state`. Keep high-frequency TypedArrays in `$state.raw` or plain class instances.
