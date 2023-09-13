import type { Plugin } from 'obsidian';
import { Notice, type TFile, type WorkspaceLeaf } from 'obsidian';
import { Menu } from 'obsidian';
import { ItemView } from 'obsidian';

import Component from './timeline-events-manage.svelte';

import { RenameModal } from '../rename-modal';
import { includes } from 'lodash';

import { EventTagsManage } from 'src/event-tags-manage';

export const TIMELINE_PANEL = 'xxx-timeline-panel-view';

/** 搜索全文用的, rename用的 相比于搜索，多了一个g */
function getSearchTagRegExpGlobal(tag: string) {
	const aa = tag.replace(/\//g, '\\/');

	return new RegExp(`data-event-tags\\s*=\\s*(.*?['";])${aa}([';\\/])`, 'g');
}
/** 给搜索组件用的，搜索时使用(比如，点击触发搜索，右击搜索) */
function getSearchTagRegExp2(tag: string) {
	// 处理tag中的/字符串,因为最后会用reg包装，防止/的干扰
	const aa = tag.replace(/\//g, '\\/');

	return `/data-event-tags\\s*=\\s*(.*?)['";]${aa}[';\\/]/`;
	// return tag;
}

/**
 *
 */
function getSearchNameRegExp(name: string) {
	// 转义名称中的\字符
	const splitName = name.split('\\');
	// return `/data-name\\W*=\\W*${splitName.join('\\/')}/`;
	return name;
}

function getSearchNameRegExpGlobal(name: string) {
	// 转义名称中的\字符
	// const splitName = name.split('\\');
	// return new RegExp(`data-name\\W*=\\W*${splitName.join('\\/')}`, 'g');
	return name;
}

export class TimelineEventsPanel extends ItemView {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	component: Component;

	changeEventRef?: ReturnType<typeof this.app.metadataCache.on>;
	deleteEventRef?: ReturnType<typeof this.app.metadataCache.on>;

	initLoading = true;

	constructor(leaf: WorkspaceLeaf) {
		console.log('[timeine] TimelineEventsPanel constructor');
		super(leaf);

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

		EventTagsManage.getInstance().onRefreshFinished(() => {
			this.initLoading = false;
			this.refreshUI();
		});
	}

	onMenu = (uiEvent: MouseEvent, target: HTMLElement) => {
		console.log('[timeline] onMenu', uiEvent, target);

		const menu = new Menu();

		const eventTag = target?.dataset['fullName'];

		if (eventTag) {
			menu.addItem((item) => {
				item.setTitle(`renameTag: "${eventTag}"`);
				item.setIcon('renameTag');
				item.onClick(() => {
					new RenameModal(this.app, eventTag, (newName: string) => {
						// 修改文件
						this.renameTag(eventTag, newName);
					}).open();
				});
			});
		}

		if (eventTag) {
			menu.addItem((item) => {
				// 搜索
				item.setTitle(`search: "${eventTag}"`);
				item.setIcon('search');
				item.onClick(() => {
					this.search(getSearchTagRegExp2(eventTag));
				});
			});
		}

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

	/** 刷新view */
	private refreshUI() {
		const eventTagSet = new Set<string>();
		const tagCountMap = new Map<string, number>();

		const nameSet = new Set<string>();
		const nameCountMap = new Map<string, number>();

		const infos = EventTagsManage.getInstance().getEventTags();
		for (const timeline of infos.values()) {
			for (const event of timeline.eventTags) {
				event.parsedEventTags?.forEach((tag) => {
					eventTagSet.add(tag);

					// 计数
					const count = tagCountMap.get(tag) || 0;
					tagCountMap.set(tag, count + 1);
				});

				if (event.name) {
					nameSet.add(event.name);

					// 计数
					const count = nameCountMap.get(event.name) || 0;
					nameCountMap.set(event.name, count + 1);
				}
			}
		}

		const tagArray = Array.from(eventTagSet);

		this.component.$set({
			initLoading: this.initLoading,
			tags: tagArray.sort(),
			tagCountMap,
			names: Array.from(nameSet).sort(),
			nameCountMap,
		});
	}

	/** 重命名 */
	private async renameTag(oldTag: string, newTag: string) {
		if (oldTag === newTag) {
			return new Notice('the new tag is same with old one');
		}

		const tagInfos = EventTagsManage.getInstance().getEventTags();

		// 找到需要修改的文件
		const files: TFile[] = [];
		for (const timeline of tagInfos.values()) {
			for (const event of timeline.eventTags) {
				if (includes(event.eventTags, oldTag)) {
					if (event.file.path) {
						files.push(event.file);
					}
				}
			}
		}

		// 正则规则: eventTags: 'a;b'
		const reg = getSearchTagRegExpGlobal(oldTag);

		// 修改文件
		for (const file of files) {
			const fileContent = await this.app.vault.read(file);
			const newFileContent = fileContent.replace(
				reg,
				// newTag,
				(match, p1, p2, offset, origin, groups) => {
					// console.log('rename tags:', match, 'p1', p1, 'p2', p2);
					return `data-event-tags=${p1 ? p1 : ''}${newTag}${p2 ? p2 : ''}`;
				}
			);

			this.app.vault.modify(file, newFileContent);
		}
		new Notice('replace success');
	}

	/** 搜索 */
	private search(str: string) {
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
			searchPlugin.instance.openGlobalSearch(str);
		}
	}

	/**
	 * 文件更新
	 */
	async onFileUpdated(file: TFile) {
		const res = await EventTagsManage.getInstance().updateFileEventTags(file);

		if (res) {
			this.refreshUI();
		}
	}

	/**
	 * 文件删除
	 */
	async onFileDeleted(file: TFile) {
		await EventTagsManage.getInstance().deleteFileEventTags(file);
		this.refreshUI();
	}

	/** 生命周期 */
	async onOpen() {
		this.component = new Component({
			target: this.contentEl,
			props: {
				tags: [],
				names: [],
				onTagClick: (tag: string) => {
					this.search(getSearchTagRegExp2(tag));
				},
				onNameClick: (name: string) => {
					this.search(getSearchNameRegExp(name));
				},
			},
		});

		const label = '[ob timelines] 初始化all event tags';
		console.time(label);

		await EventTagsManage.getInstance().refresh();

		console.timeEnd(label);
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
