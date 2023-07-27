//import Gallery from './svelte/Gallery.svelte'
import type { TimelinesSettings } from './types';
import { RENDER_TIMELINE } from './constants';
import type { TFile, MarkdownView, MetadataCache, Vault } from 'obsidian';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { parseMarkdownCode } from './utils';
import { drawTimeline, drawVisTimeline } from './draw-timeline';
import { insertFileLinkIfNeed } from './insert-file-link';
import { searchTimelineEvents } from './apis/search-timeline';
import * as Sentry from '@sentry/node';

interface IRunOpt {
	/**
	 * source code of the block，垂直模式下为tag列表，水平模式下为参数列表, 能够从中解析出tags，用于文件过滤，也能解析出event-tags，例如：
	 * @example
	 * // 垂直模式
	 *  tag1;tag2;tag3
	 * // 水平模式
	 * 	tags=tag1;tag2;tag3
	 * 	divHeight=400
	 * 	startDate=-1000
	 * 	endDate=3000
	 */
	source: string;
	el: HTMLElement;
	settings: TimelinesSettings;
	vaultFiles: TFile[];
	fileCache: MetadataCache;
	appVault: Vault;
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

	async run(opt: IRunOpt) {
		const {
			source,
			el,
			settings,
			vaultFiles,
			fileCache,
			appVault,
			visTimeline,
			currentFile,
		} = opt;

		const args = parseMarkdownCode(source);

		const transaction = Sentry.startTransaction({
			name: 'TimelineProcessor Run',
			description: 'ob timeline插件运行',
		});

		const search = transaction.startChild({
			op: 'timeline search',
			description: 'timeline标签搜索阶段',
			data: {
				...args,
				filesCount: vaultFiles.length,
			},
			tags: {
				filesCount: vaultFiles.length,
			},
		});

		const events = await searchTimelineEvents({
			vaultFiles,
			fileCache,
			appVault,
			params: args,
		});

		search.finish();

		// Keep only the files that have the time info
		const timeline = document.createElement('div');
		timeline.setAttribute('class', 'timeline');

		if (visTimeline) {
			const visDraw = transaction.startChild({
				op: 'timeline vis draw',
				description: 'timeline绘制阶段(vis)',
				data: {
					// 事件个数
					eventCount: events.length,
				},
				tags: {
					// 事件个数
					eventCount: events.length,
				},
			});
			drawVisTimeline({
				container: timeline,
				events,
				options: args,
			});

			visDraw.finish();
		} else {
			const draw = transaction.startChild({
				op: 'timeline draw',
				description: 'timeline绘制阶段',
				data: {
					// 事件个数
					eventCount: events.length,
				},
				tags: {
					// 事件个数
					eventCount: events.length,
				},
			});
			drawTimeline({
				container: timeline,
				events,
				options: args,
			});

			draw.finish();
		}

		el.appendChild(timeline);

		if (currentFile && args.autoInsetFileLinks) {
			const insert = transaction.startChild({
				op: 'timeline insert',
				description: 'timeline插入文件链接阶段',
				data: {
					// 事件个数
					eventCount: events.length,
				},
				tags: {
					// 事件个数
					eventCount: events.length,
				},
			});
			insertFileLinkIfNeed(currentFile, app, events);

			insert.finish();
		} else {
			!currentFile && console.error('[timeline] currentFile is null');
		}

		transaction.finish();
	}
}
