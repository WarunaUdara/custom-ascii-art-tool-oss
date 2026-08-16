---
name: astro
description: "Best practices and workflows for building with the Astro web framework, Starlight documentation engine, content collections, and multi-framework UI islands."
---

# Astro Best Practices & Workflow

## Core Concepts

### 1. Islands Architecture
Astro renders HTML on the server by default. To make an interactive Svelte/React component run on the client, specify a `client:*` directive:

```astro
---
import Studio from '../components/studio/Studio.svelte';
---

<!-- Hydrate immediately on page load -->
<Studio client:load />

<!-- Or hydrate only when visible in the viewport -->
<Studio client:visible />

<!-- Or client-only (skips SSR rendering if browser-specific APIs like Canvas/WebGL are used during mount) -->
<Studio client:only="svelte" />
```

### 2. Starlight Documentation
Starlight is Astro's documentation framework. Custom pages can use Starlight layouts or custom full-screen overrides.

```astro
---
import StarlightPage from '@astrojs/starlight/components/StarlightPage.astro';
import Studio from '../../components/studio/Studio.svelte';
---

<StarlightPage frontmatter={{ title: 'Interactive Studio', template: 'splash' }}>
  <Studio client:only="svelte" />
</StarlightPage>
```

### 3. Content Collections
Content collections in `src/content/docs/` provide type-safe markdown/MDX routing. Update `astro.config.mjs` sidebar configurations whenever adding new content routes.
