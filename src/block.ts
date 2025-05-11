import type { TimelinesSettings } from './types';
import { RENDER_TIMELINE } from './constants';
import type { TFile, MarkdownView, App } from 'obsidian';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import type { ITimelineMarkdownParams } from './utils';
import { parseMarkdownCodeSource } from './utils';
import { drawTimeline } from './draw/draw-timeline';
import { insertFileLinkIfNeed } from './insert-link/insert-file-link';
import type { ITimelineEventItemParsed } from './type';
import {
	drawVisTimeline,
	type IGroupedTimelineEvent,
} from './draw/draw-vis-timeline';
import { omit } from 'lodash-es';
import { EventTagsManage } from './event-tags-manage';

interface IRunOpt {
	/**
	 * source code of the block，垂直模式下为tag列表，水平模式下为参数列表, 能够从中解析出tags，用于文件过滤，也能解析出event-tags，例如：
	 * @example
	 *  tags=tag1 && (tag2 || tag3)
	 * eventTags=tag1 && (tag2 || tag3)
	 */
	source: string;
	el: HTMLElement;
	settings: TimelinesSettings;
	vaultFiles: TFile[];
	app: App;
	// fileCache: MetadataCache;
	// appVault: Vault;

	/**
	 * 是否使用vis-timeline绘制
	 */
	visTimeline: boolean;

	currentFile: TFile | null;
}

export class TimelineProcessor {
	async insertTimelineIntoCurrentNote(
		sourceView: MarkdownView,
		settings: TimelinesSettings,
		vaultFiles: TFile[],
		app: App,
		// fileCache: MetadataCache,
		// appVault: Vault,
		currentFile: TFile | null,
	) {
		const editor = sourceView.editor;
		if (editor) {
			const source = editor.getValue();
			const match = RENDER_TIMELINE.exec(source);
			if (match) {
				const source = match[1];

				const div = document.createElement('div');
				const rendered = document.createElement('div');
				rendered.addClass('timeline-rendered');
				rendered.setText(new Date().toString());

				div.appendChild(
					document.createComment(`TIMELINE BEGIN source='${match[1]}'`),
				);
				await this.runUnion({
					source: source,
					el: div,
					settings,
					vaultFiles,
					app,
					// fileCache,
					// appVault,
					visTimeline: false,
					currentFile,
				});
				div.appendChild(rendered);
				div.appendChild(document.createComment('TIMELINE END'));

				editor.setValue(source.replace(match[0], div.innerHTML));
			}
		}
	}

	/**
	 * 绘制一个垂直的时间轴
	 */
	async runOneVerticle(
		filterParam: ITimelineMarkdownParams,
		opt: Omit<IRunOpt, 'source'>,
	) {
		const {
			el,
			// settings,
			// vaultFiles,
			// app,
			// // fileCache,
			// // appVault,
			// visTimeline,
			currentFile,
		} = opt;

		const label = '[ob timelines]: timeline标签搜索阶段';
		console.time(label);

		// 搜索
		const events =
			await EventTagsManage.getInstance().searchTimelineEvents(filterParam);

		console.timeEnd(label);

		console.log('[ob timelines]: 搜索结果', events);

		// 绘制
		// Keep only the files that have the time info
		const timeline = document.createElement('div');
		timeline.setAttribute('class', 'timeline');

		const drawLabel = '[ob timelines]: timeline绘制阶段';

		console.time(drawLabel);
		drawTimeline({
			container: timeline,
			events: events || [],
		});

		console.timeEnd();

		el.appendChild(timeline);

		// 插入文件链接
		const { autoInsetFileLinks = false } = filterParam;

		if (currentFile && autoInsetFileLinks) {
			insertFileLinkIfNeed(currentFile, opt.app.vault, events || []);
		} else {
			if (!currentFile) {
				console.error('[timeline] currentFile is null');
			}
		}
	}

	/**
	 * 绘制多个时间轴（水平方向）
	 */
	async runManyHorizontal(
		filterParams: ITimelineMarkdownParams[],
		opt: Omit<IRunOpt, 'source'>,
	) {
		const {
			el,
			// settings,
			// vaultFiles,
			// fileCache,
			// appVault,
			// app,
			// visTimeline,
			currentFile,
		} = opt;

		const groupedEvents: IGroupedTimelineEvent[] = [];
		let extraOptions: ITimelineMarkdownParams = {};
		for (const filterParam of filterParams) {
			const label = '[ob timelines]: timeline标签搜索阶段';
			console.time(label);

			const res =
				await EventTagsManage.getInstance().searchTimelineEvents(filterParam);
			console.timeEnd(label);

			groupedEvents.push({
				groupName: filterParam.groupName || 'no-group',
				events: res || [],
			});

			// 额外的绘制参数可以存在任何一个配置中间
			extraOptions = Object.assign(
				{},
				extraOptions,
				omit(filterParam, [
					'tags',
					'eventTags',
					'groupName',
					'dateStart',
					'dateEnd',
				]),
			);
		}

		console.log('[ob timelines]: 搜索结果', groupedEvents);

		drawVisTimeline({
			events: groupedEvents,
			container: el,
			options: extraOptions,
		});

		// 插入文件链接
		const { autoInsetFileLinks = false } = extraOptions;

		if (currentFile && autoInsetFileLinks) {
			const allEvents = groupedEvents.reduce<ITimelineEventItemParsed[]>(
				(prev, cur) => {
					return prev.concat(cur.events);
				},
				[],
			);
			insertFileLinkIfNeed(currentFile, opt.app.vault, allEvents);
		} else {
			if (!currentFile) {
				console.error('[timeline] currentFile is null');
			}
		}
	}

	async runUnion(opt: IRunOpt) {
		const { source } = opt;

		const args = parseMarkdownCodeSource(source);
		// 是否有group配置
		const hasGroupName = args.some((item) => !!item.groupName);

		if (args.length > 1 || hasGroupName) {
			// 多个配置的话，需要有groupName配置，如果没有的话，会被分配一个随机的名字

			// 处理一下groupName
			args.forEach((item, index) => {
				// 增加一个随机的名字
				item.groupName = item.groupName || `group-${index}`;
			});
			// 水平方向
			this.runManyHorizontal(args, opt);
		} else if (args.length === 1) {
			// 垂直
			this.runOneVerticle(args[0], opt);
		}
	}
}
