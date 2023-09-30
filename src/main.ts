import type { TimelinesSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { TimelinesSettingTab } from './settings';
import { TimelineProcessor } from './block';
import { Plugin, MarkdownView } from 'obsidian';
import {
	TIMELINE_PANEL,
	TimelineEventsPanel,
} from './ui/timeline-events-manage';
import './app.css';

import type { ITimelineMarkdownParams } from './utils';
import * as TimelineEventApi from './type/timeline-event';
import { CreateTimelineEventModal } from './ui/create-timeline-event-modal';
import { insertFileLinkIfNeed } from './insert-link/insert-file-link';
import { EventTagsManage } from './event-tags-manage';
import { TagSuggestions } from './suggestion/tag-suggestion';
import { TimelineSuggestion } from './suggestion/timeline-suggestion';
import { ValueUnitSuggesiton } from './suggestion/value-unit-suggestion';
import { drawVisTimeline } from './draw/draw-vis-timeline';
import { MarkdownBlockTagSuggestion } from './suggestion/markdown-block-tag-suggestion';

export default class TimelinesPlugin extends Plugin {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	settings: TimelinesSettings;

	changeEventRef?: ReturnType<typeof this.app.metadataCache.on>;

	tagSuggestion: TagSuggestions;
	timelineSuggestion: TimelineSuggestion;
	valueUnitSuggestion: ValueUnitSuggesiton;
	markdownBlockTagSuggestion: MarkdownBlockTagSuggestion;

	async onload() {
		// Load message
		await this.loadSettings();
		console.log('Loaded Timelines Plugin');

		this.tagSuggestion = new TagSuggestions(this.app);
		this.timelineSuggestion = new TimelineSuggestion(this.app);
		this.valueUnitSuggestion = new ValueUnitSuggesiton(this.app);
		this.markdownBlockTagSuggestion = new MarkdownBlockTagSuggestion(this.app);

		setTimeout(() => {
			// 初始化
			EventTagsManage.getInstance().init(this.app);
		}, 0);

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
				await proc.runUnion({
					source,
					el,
					settings: this.settings,
					vaultFiles: this.app.vault.getMarkdownFiles(),
					// fileCache: this.app.metadataCache,
					// appVault: this.app.vault,
					app: this.app,
					visTimeline: false,
					currentFile: currentFile,
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
						this.app,
						// this.app.metadataCache,
						// this.app.vault,
						view.file
					);
				}
			},
		});

		this.addCommand({
			id: 'show event tags panel',
			name: 'Show Event Tags Panel',
			callback: () => {
				this.activateView();
			},
		});

		this.addSettingTab(new TimelinesSettingTab(this.app, this));

		this.registerView(TIMELINE_PANEL, (leaf) => new TimelineEventsPanel(leaf));

		this.registerEditorSuggest(this.tagSuggestion);
		this.registerEditorSuggest(this.timelineSuggestion);
		this.registerEditorSuggest(this.valueUnitSuggestion);
		this.registerEditorSuggest(this.markdownBlockTagSuggestion);

		this.addRibbonIcon('tags', 'Timeline', () => {
			this.activateView();
		});
	}

	onunload() {
		console.log('unloading timeline plugin');

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

	/**** 暴露出去的接口 */

	/**
	 * 搜索timeline event
	 */
	private searchTimelineEvents = (
		filter?: ITimelineMarkdownParams
	): Promise<TimelineEventApi.ITimelineEventItemParsed[]> => {
		const vaultFiles = this.app.vault.getMarkdownFiles();

		const label = '[ob timelines]: 搜索';
		console.time(label);

		return EventTagsManage.getInstance()
			.searchTimelineEvents(filter || {})
			.then((events) => {
				console.timeEnd(label);

				return (events || []).sort((a, b) => {
					return (
						TimelineEventApi.getTimelineSortOrder(a) -
						TimelineEventApi.getTimelineSortOrder(b)
					);
				});
			});
	};

	private showCreateModal = (
		onOk: (info: TimelineEventApi.ITimelineEventItemSource) => void
	) => {
		new CreateTimelineEventModal(this.app, (info) => {
			// 修改文件
			// this.rename(eventTag, newName);
			if (typeof onOk === 'function') {
				onOk(info);
			}
		}).open();
	};

	api = {
		...TimelineEventApi,
		searchTimelineEvents: this.searchTimelineEvents,
		showCreateModal: this.showCreateModal,
		insertFileLinkIfNeed: insertFileLinkIfNeed,
		drawVisTimeline: drawVisTimeline,
	};
}
