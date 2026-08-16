// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
	integrations: [
		svelte(),
		starlight({
			title: 'Dither & ASCII Engine',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/WarunaUdara/custom-ascii-art-tool-oss' }],
			sidebar: [
				{
					label: 'Overview',
					items: [
						{ label: 'Introduction', slug: 'index' },
						{ label: 'Interactive Studio', slug: 'studio' },
					],
				},
				{
					label: 'Dithering Algorithms',
					items: [
						{ label: 'Quantization & Ramps', slug: 'algorithms/quantization' },
						{ label: 'Bayer Matrix (Ordered)', slug: 'algorithms/bayer' },
						{ label: 'Floyd-Steinberg (Error Diffusion)', slug: 'algorithms/floyd-steinberg' },
						{ label: 'Atkinson Dither', slug: 'algorithms/atkinson' },
					],
				},
				{
					label: 'API Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});

