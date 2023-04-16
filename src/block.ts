//import Gallery from './svelte/Gallery.svelte'
import type { TimelinesSettings } from './types';
import { RENDER_TIMELINE } from './constants';
import type { TFile, MarkdownView, MetadataCache, Vault } from 'obsidian';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { getValidEvents, parseMarkdownCode } from './utils';
import { drawTimeline, drawVisTimeline } from './draw-timeline';

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
}

export class TimelineProcessor {
	async insertTimelineIntoCurrentNote(
		sourceView: MarkdownView,
		settings: TimelinesSettings,
		vaultFiles: TFile[],
		fileCache: MetadataCache,
		appVault: Vault
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
		} = opt;

		const args = parseMarkdownCode(source);
		// 添加默认的标签
		if (args.tags) {
			args.tags.push(settings.timelineTag);
		} else {
			args.tags = [settings.timelineTag];
		}

		const events = await getValidEvents({
			vaultFiles,
			fileCache,
			appVault,
			parsedArgs: args,
		});

		// Keep only the files that have the time info
		const timeline = document.createElement('div');
		timeline.setAttribute('class', 'timeline');

		if (visTimeline) {
			drawVisTimeline({
				container: timeline,
				events,
				options: args,
			});
		} else {
			drawTimeline({
				container: timeline,
				events,
				options: args,
			});
		}

		el.appendChild(timeline);
	}
}
