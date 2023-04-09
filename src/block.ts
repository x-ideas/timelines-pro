//import Gallery from './svelte/Gallery.svelte'
import type { TimelinesSettings } from './types';
import { RENDER_TIMELINE } from './constants';
import { TFile, MarkdownView, MetadataCache, Vault } from 'obsidian';
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
		let editor = sourceView.editor;
		if (editor) {
			const source = editor.getValue();
			let match = RENDER_TIMELINE.exec(source);
			if (match) {
				let tagList = match[1];

				let div = document.createElement('div');
				let rendered = document.createElement('div');
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
		let timeline = document.createElement('div');
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

		// // Filter all markdown files to only those containing the tag list
		// let fileList = vaultFiles.filter((file) =>
		// 	FilterMDFiles(file, tagList, fileCache)
		// );
		// if (!fileList) {
		// 	// if no files valid for timeline
		// 	return;
		// }

		// let timelineNotes = [] as AllNotesData;
		// let timelineDates = [];

		// if (process.env.NODE_ENV === 'development') {
		// 	console.log('[timeline]: fileList', fileList);
		// }

		// for (let file of fileList) {
		// 	// Create a DOM Parser
		// 	const domparser = new DOMParser();
		// 	const doc = domparser.parseFromString(
		// 		await appVault.read(file),
		// 		'text/html'
		// 	);
		// 	// timeline div
		// 	let timelineData = doc.getElementsByClassName('ob-timelines');

		// 	for (let event of timelineData as any) {
		// 		if (!(event instanceof HTMLElement)) {
		// 			continue;
		// 		}

		// 		// 新增过滤

		// 		/** tags: ;分割 */
		// 		if (event.dataset['event-tags']) {
		// 			const eventTags = event.dataset['event-tags']
		// 				.split(';')
		// 				.reduce<string[]>((accu, tag) => {
		// 					const tagList: string[] = [];
		// 					parseTag(tag, tagList);
		// 					accu.push(...tagList);
		// 					return accu;
		// 				}, []);

		// 			// 如果没有交集，跳过
		// 			if (!eventTags.some((tag) => eventWhiteTagsSet.has(tag))) {
		// 				continue;
		// 			}
		// 		}

		// 		let noteId;
		// 		// 使用sortOrder作为判断条件
		// 		// check if a valid date is specified
		// 		if (event.dataset.date[0] == '-') {
		// 			// if it is a negative year
		// 			noteId =
		// 				+event.dataset.date
		// 					.substring(1, event.dataset.date.length)
		// 					.split('-')
		// 					.join('') * -1;
		// 		} else {
		// 			noteId = +event.dataset.date.split('-').join('');
		// 		}
		// 		//
		// 		if (!Number.isInteger(noteId)) {
		// 			continue;
		// 		}
		// 		// if not title is specified use note name
		// 		let noteTitle = event.dataset.title ?? file.name;
		// 		let noteClass = event.dataset.class ?? '';
		// 		let notePath = '/' + file.path;
		// 		let type = event.dataset.type ?? 'box';
		// 		let endDate = event.dataset.end ?? null;

		// 		if (!timelineNotes[noteId]) {
		// 			timelineNotes[noteId] = [];
		// 			timelineNotes[noteId][0] = {
		// 				date: event.dataset.date,
		// 				title: noteTitle,
		// 				img: getImgUrl(appVault.adapter, event.dataset.img),
		// 				innerHTML: event.innerHTML,
		// 				path: notePath,
		// 				class: noteClass,
		// 				type: type,
		// 				endDate: endDate,
		// 			};
		// 			timelineDates.push(noteId);
		// 		} else {
		// 			let note = {
		// 				date: event.dataset.date,
		// 				title: noteTitle,
		// 				img: getImgUrl(appVault.adapter, event.dataset.img),
		// 				innerHTML: event.innerHTML,
		// 				path: notePath,
		// 				class: noteClass,
		// 				type: type,
		// 				endDate: endDate,
		// 			};
		// 			// if note_id already present prepend or append to it
		// 			if (settings.sortDirection) {
		// 				timelineNotes[noteId].unshift(note);
		// 			} else {
		// 				timelineNotes[noteId].push(note);
		// 			}
		// 			console.debug('Repeat date: %o', timelineNotes[noteId]);
		// 		}
		// 	}
		// }

		// if (process.env.NODE_ENV === 'development') {
		// 	console.debug('[timeline] timelineNotes', timelineNotes);
		// }

		// // Sort events based on setting
		// if (settings.sortDirection) {
		// 	// default is ascending
		// 	timelineDates = timelineDates.sort((d1, d2) => d1 - d2);
		// } else {
		// 	// else it is descending
		// 	timelineDates = timelineDates.sort((d1, d2) => d2 - d1);
		// }

		// if (!visTimeline) {
		// 	let eventCount = 0;
		// 	// Build the timeline html element
		// 	for (let date of timelineDates) {
		// 		let noteContainer = timeline.createDiv({ cls: 'timeline-container' });
		// 		let noteHeader = noteContainer.createEl('h2', {
		// 			text: timelineNotes[date][0].date
		// 				.replace(/-0*$/g, '')
		// 				.replace(/-0*$/g, '')
		// 				.replace(/-0*$/g, ''),
		// 		});
		// 		let eventContainer = noteContainer.createDiv({
		// 			cls: 'timeline-event-list',
		// 			attr: { style: 'display: block' },
		// 		});

		// 		noteHeader.addEventListener('click', (event) => {
		// 			if (eventContainer.style.getPropertyValue('display') === 'none') {
		// 				eventContainer.style.setProperty('display', 'block');
		// 				return;
		// 			}
		// 			eventContainer.style.setProperty('display', 'none');
		// 		});

		// 		if (eventCount % 2 == 0) {
		// 			// if its even add it to the left
		// 			noteContainer.addClass('timeline-left');
		// 		} else {
		// 			// else add it to the right
		// 			noteContainer.addClass('timeline-right');
		// 			noteHeader.setAttribute('style', 'text-align: right;');
		// 		}

		// 		if (!timelineNotes[date]) {
		// 			continue;
		// 		}

		// 		for (let eventAtDate of timelineNotes[date]) {
		// 			let noteCard = eventContainer.createDiv({ cls: 'timeline-card' });
		// 			// add an image only if available
		// 			if (eventAtDate.img) {
		// 				noteCard.createDiv({
		// 					cls: 'thumb',
		// 					attr: { style: `background-image: url(${eventAtDate.img});` },
		// 				});
		// 			}
		// 			if (eventAtDate.class) {
		// 				noteCard.addClass(eventAtDate.class);
		// 			}

		// 			noteCard
		// 				.createEl('article')
		// 				.createEl('h3')
		// 				.createEl('a', {
		// 					cls: 'internal-link',
		// 					attr: { href: `${eventAtDate.path}` },
		// 					text: eventAtDate.title,
		// 				});
		// 			noteCard.createEl('p', { text: eventAtDate.innerHTML });
		// 		}
		// 		eventCount++;
		// 	}

		// 	// Replace the selected tags with the timeline html
		// 	el.appendChild(timeline);
		// 	return;
		// }

		// // Create a DataSet
		// let items = new DataSet([]);

		// timelineDates.forEach((date) => {
		// 	// add all events at this date
		// 	Object.values(timelineNotes[date]).forEach((event) => {
		// 		// Create Event Card
		// 		let noteCard = document.createElement('div');
		// 		noteCard.className = 'timeline-card';
		// 		// add an image only if available
		// 		if (event.img) {
		// 			noteCard.createDiv({
		// 				cls: 'thumb',
		// 				attr: { style: `background-image: url(${event.img});` },
		// 			});
		// 		}
		// 		if (event.class) {
		// 			noteCard.addClass(event.class);
		// 		}

		// 		noteCard
		// 			.createEl('article')
		// 			.createEl('h3')
		// 			.createEl('a', {
		// 				cls: 'internal-link',
		// 				attr: { href: `${event.path}` },
		// 				text: event.title,
		// 			});
		// 		noteCard.createEl('p', { text: event.innerHTML });

		// 		let startDate = event.date?.replace(/(.*)-\d*$/g, '$1');
		// 		let start, end;
		// 		if (startDate[0] == '-') {
		// 			// handle negative year
		// 			let startComp = startDate.substring(1, startDate.length).split('-');
		// 			start = new Date(+`-${startComp[0]}`, +startComp[1], +startComp[2]);
		// 		} else {
		// 			start = new Date(startDate);
		// 		}

		// 		let endDate = event.endDate?.replace(/(.*)-\d*$/g, '$1');
		// 		if (endDate && endDate[0] == '-') {
		// 			// handle negative year
		// 			let endComp = endDate.substring(1, endDate.length).split('-');
		// 			end = new Date(+`-${endComp[0]}`, +endComp[1], +endComp[2]);
		// 		} else {
		// 			end = new Date(endDate);
		// 		}

		// 		if (start.toString() === 'Invalid Date') {
		// 			return;
		// 		}

		// 		if (
		// 			(event.type === 'range' || event.type === 'background') &&
		// 			end.toString() === 'Invalid Date'
		// 		) {
		// 			return;
		// 		}

		// 		// Add Event data
		// 		items.add({
		// 			id: items.length + 1,
		// 			content: event.title ?? '',
		// 			title: noteCard.outerHTML,
		// 			start: start,
		// 			className: event.class ?? '',
		// 			type: event.type,
		// 			end: end ?? null,
		// 		});
		// 	});
		// });

		// // Configuration for the Timeline
		// let options: TimelineOptions = {
		// 	minHeight: +args.divHeight,
		// 	showCurrentTime: false,
		// 	showTooltips: false,
		// 	template: function (item: any) {
		// 		let eventContainer = document.createElement('div');
		// 		eventContainer.setText(item.content);
		// 		let eventCard = eventContainer.createDiv();
		// 		eventCard.outerHTML = item.title;
		// 		eventContainer.addEventListener('click', (event) => {
		// 			let el = eventContainer.getElementsByClassName(
		// 				'timeline-card'
		// 			)[0] as HTMLElement;
		// 			el.style.setProperty('display', 'block');
		// 			el.style.setProperty('top', `-${el.clientHeight + 10}px`);
		// 		});
		// 		return eventContainer;
		// 	},
		// 	start: createDate(args.startDate),
		// 	end: createDate(args.endDate),
		// 	min: createDate(args.minDate),
		// 	max: createDate(args.maxDate),
		// };

		// if (process.env.NODE_ENV === 'development') {
		// 	console.debug('[timeline] options', options);
		// }

		// // Create a Timeline
		// timeline.setAttribute('class', 'timeline-vis');
		// new Timeline(timeline, items, options);

		// Replace the selected tags with the timeline html
		el.appendChild(timeline);
	}
}
