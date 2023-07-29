//import Gallery from './svelte/Gallery.svelte'
import type { TimelinesSettings } from './types';
import { RENDER_TIMELINE } from './constants';
import type { TFile, MarkdownView, MetadataCache, Vault } from 'obsidian';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import type { ITimelineMarkdownParams } from './utils';
import { parseMarkdownCode, parseMarkdownCodeSource } from './utils';
import { drawTimeline } from './draw/draw-timeline';
import { insertFileLinkIfNeed } from './insert-link/insert-file-link';
import { searchTimelineEvents } from './apis/search-timeline';
import * as Sentry from '@sentry/node';
import type { ITimelineEventItemParsed } from './type';
import {
	drawVisTimeline,
	type IGroupedTimelineEvent,
} from './draw/draw-vis-timeline';
import type { TimelineOptions } from 'vis-timeline';
import { omit } from 'lodash-es';

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
	fileCache: MetadataCache;
	appVault: Vault;

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
		fileCache: MetadataCache,
		appVault: Vault,
		currentFile: TFile | null
	) {
		const editor = sourceView.editor;
		if (editor) {
			const source = editor.getValue();
			const match = RENDER_TIMELINE.exec(source);
			if (match) {
				const tagList = match[1];

				const div = document.createElement('div');
				const rendered = document.createElement('div');
				rendered.addClass('timeline-rendered');
				rendered.setText(new Date().toString());

				div.appendChild(
					document.createComment(`TIMELINE BEGIN tags='${match[1]}'`)
				);
				await this.run({
					source: tagList,
					el: div,
					settings,
					vaultFiles,
					fileCache,
					appVault,
					visTimeline: false,
					currentFile,
				});
				div.appendChild(rendered);
				div.appendChild(document.createComment('TIMELINE END'));

				editor.setValue(source.replace(match[0], div.innerHTML));
			}
		}
	}

	// async run(opt: IRunOpt) {
	// 	const { source } = opt;

	// 	const args = parseMarkdownCode(source);

	// 	this.runImpl(args, opt);
	// }

	/**
	 *
	 */
	// async runImpl(
	// 	filterParam: ITimelineMarkdownParams,
	// 	opt: Omit<IRunOpt, 'source'>
	// ) {
	// 	const {
	// 		el,
	// 		settings,
	// 		vaultFiles,
	// 		fileCache,
	// 		appVault,
	// 		visTimeline,
	// 		currentFile,
	// 	} = opt;

	// 	const transaction = Sentry.startTransaction({
	// 		name: 'TimelineProcessor Run',
	// 		description: 'ob timeline插件运行',
	// 	});

	// 	const search = transaction.startChild({
	// 		op: 'timeline search',
	// 		description: 'timeline标签搜索阶段',
	// 		data: {
	// 			...filterParam,
	// 			filesCount: vaultFiles.length,
	// 		},
	// 		tags: {
	// 			filesCount: vaultFiles.length,
	// 		},
	// 	});

	// 	// 搜索
	// 	const events = await searchTimelineEvents({
	// 		vaultFiles,
	// 		fileCache,
	// 		appVault,
	// 		params: filterParam,
	// 	});

	// 	search.finish();

	// 	// Keep only the files that have the time info
	// 	const timeline = document.createElement('div');
	// 	timeline.setAttribute('class', 'timeline');

	// 	// 绘制
	// 	if (visTimeline) {
	// 		const visDraw = transaction.startChild({
	// 			op: 'timeline vis draw',
	// 			description: 'timeline绘制阶段(vis)',
	// 			data: {
	// 				// 事件个数
	// 				eventCount: events.length,
	// 			},
	// 			tags: {
	// 				// 事件个数
	// 				eventCount: events.length,
	// 			},
	// 		});
	// 		drawVisTimeline({
	// 			container: timeline,
	// 			events,
	// 			options: filterParam,
	// 		});

	// 		visDraw.finish();
	// 	} else {
	// 		const draw = transaction.startChild({
	// 			op: 'timeline draw',
	// 			description: 'timeline绘制阶段',
	// 			data: {
	// 				// 事件个数
	// 				eventCount: events.length,
	// 			},
	// 			tags: {
	// 				// 事件个数
	// 				eventCount: events.length,
	// 			},
	// 		});
	// 		drawTimeline({
	// 			container: timeline,
	// 			events,
	// 			options: filterParam,
	// 		});

	// 		draw.finish();
	// 	}

	// 	el.appendChild(timeline);

	// 	const { autoInsetFileLinks = true } = filterParam;

	// 	// 插入文件链接
	// 	if (currentFile && autoInsetFileLinks) {
	// 		const insert = transaction.startChild({
	// 			op: 'timeline insert',
	// 			description: 'timeline插入文件链接阶段',
	// 			data: {
	// 				// 事件个数
	// 				eventCount: events.length,
	// 			},
	// 			tags: {
	// 				// 事件个数
	// 				eventCount: events.length,
	// 			},
	// 		});
	// 		insertFileLinkIfNeed(currentFile, app, events);

	// 		insert.finish();
	// 	} else {
	// 		if (!currentFile) {
	// 			console.error('[timeline] currentFile is null');
	// 		}
	// 	}

	// 	transaction.finish();
	// }

	/**
	 * 绘制一个垂直的时间轴
	 */
	async runOneVerticle(
		filterParam: ITimelineMarkdownParams,
		opt: Omit<IRunOpt, 'source'>
	) {
		const {
			el,
			settings,
			vaultFiles,
			fileCache,
			appVault,
			visTimeline,
			currentFile,
		} = opt;

		// 搜索
		const events = await searchTimelineEvents({
			vaultFiles,
			fileCache,
			appVault,
			params: filterParam,
		});

		// 绘制
		// Keep only the files that have the time info
		const timeline = document.createElement('div');
		timeline.setAttribute('class', 'timeline');

		drawTimeline({
			container: timeline,
			events,
		});

		el.appendChild(timeline);

		// 插入文件链接
		const { autoInsetFileLinks = true } = filterParam;

		if (currentFile && autoInsetFileLinks) {
			insertFileLinkIfNeed(currentFile, app, events);
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
		opt: Omit<IRunOpt, 'source'>
	) {
		const {
			el,
			settings,
			vaultFiles,
			fileCache,
			appVault,
			visTimeline,
			currentFile,
		} = opt;

		const events: IGroupedTimelineEvent[] = [];
		let extraOptions: TimelineOptions = {};
		for (const filterParam of filterParams) {
			const res = await searchTimelineEvents({
				vaultFiles,
				fileCache,
				appVault,
				params: filterParam,
			});
			events.push({
				groupName: filterParam.groupName || 'no-group',
				events: res,
			});

			// 额外的绘制参数可以存在任何一个配置中间
			extraOptions = Object.assign(
				{},
				extraOptions,
				omit(filterParam, ['autoInsetFileLinks', 'tags', 'eventTags'])
			);
		}

		drawVisTimeline({
			events,
			container: el,
			options: extraOptions,
		});
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
