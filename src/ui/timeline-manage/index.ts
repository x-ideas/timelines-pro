import type { Plugin } from 'obsidian';
import { Notice, type TFile, type WorkspaceLeaf } from 'obsidian';
import { Menu } from 'obsidian';
import { ItemView } from 'obsidian';

import Component from './timeline-manage.svelte';

import { RenameModal } from '../rename-modal';
import { includes } from 'lodash-es';
import {
	type ITimelineEventItemParsed,
	getTimelineEventInFile,
} from 'src/type/timeline-event';
import * as Sentry from '@sentry/node';

export const TIMELINE_PANEL = 'xxx-timeline-panel-view';

/** 搜索全文用的 */
function getSearchTagRegExp(tag: string) {
	return new RegExp(`data-event-tags\\W*=\\W*['"](.*)${tag}(.*)['"]`, 'g');
}
/** 给搜索组件用的 */
function getSearchTagRegExp2(tag: string) {
	return `/data-event-tags\\W*=\\W*['"](.*)${tag}(.*)['"]/`;
}

export class TimelinePanel extends ItemView {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	component: Component;

	eventTagsMap: Map<string, ITimelineEventItemParsed[]>;

	changeEventRef?: ReturnType<typeof this.app.metadataCache.on>;
	deleteEventRef?: ReturnType<typeof this.app.metadataCache.on>;

	constructor(leaf: WorkspaceLeaf) {
		console.log('[timeine] TimelinePanel constructor');
		super(leaf);

		this.eventTagsMap = new Map();

		this.icon = 'tags';

		this.changeEventRef = this.app.metadataCache.on(
			'changed',
			(file, fileContent, cache) => {
				this.onFileUpdated(file);
			}
		);

		this.deleteEventRef = this.app.metadataCache.on('deleted', (file) => {
			this.onFileDeleted(file);
		});

		// 注册菜单
		document.on('contextmenu', '.timeline-event-tag-wrapper', this.onMenu, {
			capture: true,
		});
		this.register(() => {
			document.off('contextmenu', '.timeline-event-tag-wrapper', this.onMenu, {
				capture: true,
			});
		});
	}

	onMenu = (uiEvent: MouseEvent, deleteTarget: HTMLElement) => {
		console.log('[timeline] onMenu', uiEvent, deleteTarget);

		const menu = new Menu();
		const eventTag = (deleteTarget.querySelector('.tag') as HTMLElement)
			?.innerText;

		menu.addItem((item) => {
			item.setTitle(`rename: "${eventTag}"`);
			item.setIcon('rename');
			item.onClick(() => {
				new RenameModal(this.app, eventTag, (newName) => {
					// 修改文件
					this.rename(eventTag, newName);
				}).open();
			});
		});

		menu.addItem((item) => {
			// 搜索
			item.setTitle(`search: "${eventTag}"`);
			item.setIcon('search');
			item.onClick(() => {
				this.search(eventTag);
			});
		});

		this.app.workspace.trigger(
			'timeline-event-tag-wrapper:contextmenu',
			menu,
			eventTag
		);
		setTimeout(() => {
			menu.showAtMouseEvent(uiEvent);
		}, 0);
	};

	getViewType() {
		return TIMELINE_PANEL;
	}

	getDisplayText() {
		return 'timeline event tags';
	}

	/** 初始化event tags */
	async initEventTags() {
		const files = this.app.vault.getMarkdownFiles();

		const transaction = Sentry.startTransaction({
			name: 'Timeline-Pro UI(初始化all event tags)',
			description: 'ob timeline UI(初始化all event tags)',
			data: {
				filesCount: files.length,
			},
			tags: {
				filesCount: files.length,
			},
		});

		const timelineEvents = await getTimelineEventInFile(files, this.app.vault);

		this.eventTagsMap = timelineEvents;
		console.log('[timeline] initEventTags', timelineEvents);
		transaction.finish();
	}

	/** 刷新view */
	private refreshUI() {
		const eventTagSet = new Set<string>();
		const tagCountMap = new Map<string, number>();

		for (const timeline of this.eventTagsMap.values()) {
			for (const event of timeline) {
				event.parsedEventTags?.forEach((tag) => {
					eventTagSet.add(tag);

					// 计数
					const count = tagCountMap.get(tag) || 0;
					tagCountMap.set(tag, count + 1);
				});
			}
		}

		const tagArray = Array.from(eventTagSet);

		this.component.$set({ tags: tagArray, tagCountMap });
	}

	/** 重命名 */
	private async rename(oldTag: string, newTag: string) {
		if (oldTag === newTag) {
			return new Notice('the new tag is same with old one');
		}

		// 找到需要修改的文件
		const files: TFile[] = [];
		for (const timeline of this.eventTagsMap.values()) {
			for (const event of timeline) {
				if (includes(event.eventTags, oldTag)) {
					if (event.file.path) {
						files.push(event.file);
					}
				}
			}
		}

		// 正则规则: eventTags: 'a;b'
		const reg = getSearchTagRegExp(oldTag);

		// 修改文件
		for (const file of files) {
			const fileContent = await this.app.vault.read(file);
			const newFileContent = fileContent.replace(
				reg,
				(match, p1, p2, offset, origin, groups) => {
					return `data-event-tags='${p1 ? p1 : ''}${newTag}${p2 ? p2 : ''}'`;
				}
			);

			this.app.vault.modify(file, newFileContent);
		}
	}

	/** 搜索 */
	private search(tag: string) {
		const searchPlugin: Plugin =
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.app.internalPlugins.getPluginById('global-search');
		console.log('[timeline] search', this.app);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (searchPlugin && searchPlugin.instance) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			searchPlugin.instance.openGlobalSearch(getSearchTagRegExp2(tag));
		}
	}

	/**
	 * 文件更新
	 */
	async onFileUpdated(file: TFile) {
		const timelineEvents = await getTimelineEventInFile([file], this.app.vault);

		for (const [path, events] of timelineEvents) {
			// 覆盖
			this.eventTagsMap.set(path, events);
		}

		this.refreshUI();
	}

	/**
	 * 文件删除
	 */
	async onFileDeleted(file: TFile) {
		this.eventTagsMap.delete(file.path);
		this.refreshUI();
	}

	/** 生命周期 */
	async onOpen() {
		this.component = new Component({
			target: this.contentEl,
			props: {
				tags: [],
				onClick: (tag: string) => {
					this.search(tag);
				},
			},
		});
		await this.initEventTags();

		this.refreshUI();
	}

	/** 生命周期 */
	async onClose() {
		this.component.$destroy();

		if (this.changeEventRef) {
			this.app.metadataCache.offref(this.changeEventRef);
		}

		if (this.deleteEventRef) {
			this.app.metadataCache.offref(this.deleteEventRef);
		}
	}
}
