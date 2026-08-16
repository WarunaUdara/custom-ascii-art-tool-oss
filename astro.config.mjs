// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
	site: 'https://warunaudara.github.io',
	base: '/custom-ascii-art-tool-oss',
	integrations: [svelte()],
});
