import type { TimelinesSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { TimelinesSettingTab } from './settings';
import { TimelineProcessor } from './block';
import { Plugin, MarkdownView } from 'obsidian';

export default class TimelinesPlugin extends Plugin {
	// @ts-ignore
	settings: TimelinesSettings;

	async onload() {
		// Load message
		await this.loadSettings();
		console.log('Loaded Timelines Plugin');

		// Register timeline block renderer
		// 垂直
		this.registerMarkdownCodeBlockProcessor(
			'timeline-pro',
			async (source, el, ctx) => {
				const proc = new TimelineProcessor();
				await proc.run({
					source,
					el,
					settings: this.settings,
					vaultFiles: this.app.vault.getMarkdownFiles(),
					fileCache: this.app.metadataCache,
					appVault: this.app.vault,
					visTimeline: false,
				});
			}
		);

		// Register vis-timeline block renderer
		// 水平
		this.registerMarkdownCodeBlockProcessor(
			'timeline-vis-pro',
			async (source, el, ctx) => {
				const proc = new TimelineProcessor();
				await proc.run({
					source,
					el,
					settings: this.settings,
					vaultFiles: this.app.vault.getMarkdownFiles(),
					fileCache: this.app.metadataCache,
					appVault: this.app.vault,
					visTimeline: true,
				});
			}
		);

		this.addCommand({
			id: 'render-timeline',
			name: 'Render Timeline',
			callback: async () => {
				const proc = new TimelineProcessor();
				let view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					await proc.insertTimelineIntoCurrentNote(
						view,
						this.settings,
						this.app.vault.getMarkdownFiles(),
						this.app.metadataCache,
						this.app.vault
					);
				}
			},
		});

		this.addSettingTab(new TimelinesSettingTab(this.app, this));
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
