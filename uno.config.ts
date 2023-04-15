import { defineConfig } from 'unocss';

export default defineConfig({
	cli: {
		entry: {
			patterns: ['src/**/*.svelte'],
			outFile: 'src/uno.css',
		},
	},
	// ...
});
