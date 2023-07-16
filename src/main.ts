import type { TimelinesSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { TimelinesSettingTab } from './settings';
import { TimelineProcessor } from './block';
import { Plugin, MarkdownView } from 'obsidian';
import { TIMELINE_PANEL, TimelinePanel } from './ui/timeline-manage';
import './app.css';

export default class TimelinesPlugin extends Plugin {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	settings: TimelinesSettings;

	changeEventRef?: ReturnType<typeof this.app.metadataCache.on>;

	async onload() {
		// Load message
		await this.loadSettings();
		console.log('Loaded Timelines Plugin');

		// Register timeline block renderer
		// 垂直
		this.registerMarkdownCodeBlockProcessor(
			'timelines-pro',
			async (source, el, ctx) => {
				const currentFile = this.app.metadataCache.getFirstLinkpathDest(
					ctx.sourcePath,
					''
				);
				const proc = new TimelineProcessor();
				await proc.run({
					source,
					el,
					settings: this.settings,
					vaultFiles: this.app.vault.getMarkdownFiles(),
					fileCache: this.app.metadataCache,
					appVault: this.app.vault,
					visTimeline: false,
					currentFile: currentFile,
				});
			}
		);

		// Register vis-timeline block renderer
		// 水平
		this.registerMarkdownCodeBlockProcessor(
			'timeline-vis-pro',
			async (source, el, ctx) => {
				// 获取当前文件
				const currentFile = this.app.metadataCache.getFirstLinkpathDest(
					ctx.sourcePath,
					''
				);

				const proc = new TimelineProcessor();
				await proc.run({
					source,
					el,
					settings: this.settings,
					vaultFiles: this.app.vault.getMarkdownFiles(),
					fileCache: this.app.metadataCache,
					appVault: this.app.vault,
					visTimeline: true,
					currentFile,
				});
			}
		);

		this.addCommand({
			id: 'render',
			name: 'Render timeline ',
			callback: async () => {
				const proc = new TimelineProcessor();
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);

				if (view) {
					await proc.insertTimelineIntoCurrentNote(
						view,
						this.settings,
						this.app.vault.getMarkdownFiles(),
						this.app.metadataCache,
						this.app.vault,
						view.file
					);
				}
			},
		});

		this.addSettingTab(new TimelinesSettingTab(this.app, this));

		this.registerView(TIMELINE_PANEL, (leaf) => new TimelinePanel(leaf));

		this.addRibbonIcon('tags', 'Timeline', () => {
			this.activateView();
		});
	}

	onunload() {
		console.log('unloading plugin');

		// this.app.workspace.detachLeavesOfType(TIMELINE_PANEL);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(TIMELINE_PANEL);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: TIMELINE_PANEL,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(TIMELINE_PANEL)[0]
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
