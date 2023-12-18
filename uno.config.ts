import { defineConfig } from 'unocss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
	cli: {
		entry: {
			patterns: ['src/**/*.svelte'],
			outFile: 'src/uno.css',
		},
	},
}) as ReturnType<typeof defineConfig>;
