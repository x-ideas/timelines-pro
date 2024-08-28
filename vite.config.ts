import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import builtins from 'builtin-modules';
import UnoCSS from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte(), UnoCSS()],
	build: {
		lib: {
			entry: 'src/main.ts',
			fileName: 'main',
			formats: ['es'],
		},
		rollupOptions: {
			output: {
				dir: 'dist',
			},
			external: [
				'obsidian',
				'electron',
				'@codemirror/autocomplete',
				'@codemirror/collab',
				'@codemirror/commands',
				'@codemirror/language',
				'@codemirror/lint',
				'@codemirror/search',
				'@codemirror/state',
				'@codemirror/view',
				'@lezer/common',
				'@lezer/highlight',
				'@lezer/lr',
				...builtins,
			],
		},
	},
});
