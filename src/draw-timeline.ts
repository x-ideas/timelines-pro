import { TimelineOptions } from 'vis-timeline';
import { groupBy } from 'lodash-es';
import {
	getEventDateDescription,
	getEventImagePath,
	getEventSourcePath,
	getNoteId,
	getSortOrder,
	parseTimeStr,
} from './utils';
import { IEventArgs } from './types';

interface IDrawTimelineOptions {
	events: HTMLElement[];
	options?: TimelineOptions;
	/** 绘制的容器 */
	container: HTMLElement;
}

/**
 * 绘制所有的
 */
export function drawVisTimeline(opt: IDrawTimelineOptions) {}

export function drawTimeline(opt: IDrawTimelineOptions) {
	const { events, options, container } = opt;

	// 组合events
	const groupEvents = groupBy(events, (event) => {
		return getNoteId(event.dataset as IEventArgs);
	});

	// 排序
	const sortedEvents = Object.values(groupEvents).sort((a, b) => {
		const item1 = a[0];
		const item2 = b[0];

		return getSortOrder(item1.dataset) - getSortOrder(item2.dataset);
	});

	if (process.env.NODE_ENV === 'development') {
		console.log('[timeline]: groupEvents', groupEvents);
		console.log('[timeline]: sortedEvents', sortedEvents);
	}

	let eventCount = 0;
	for (const events of sortedEvents) {
		// 相同的一组
		const first = events[0];
		if (!first) {
			continue;
		}

		let noteContainer = opt.container.createDiv({ cls: 'timeline-container' });
		let noteHeader = noteContainer.createEl('h2', {
			text: getEventDateDescription(first.dataset) || '--',
		});
		let eventContainer = noteContainer.createDiv({
			cls: 'timeline-event-list',
			attr: { style: 'display: block' },
		});
		noteHeader.addEventListener('click', (event) => {
			if (eventContainer.style.getPropertyValue('display') === 'none') {
				eventContainer.style.setProperty('display', 'block');
				return;
			}
			eventContainer.style.setProperty('display', 'none');
		});
		if (eventCount % 2 == 0) {
			// if its even add it to the left
			noteContainer.addClass('timeline-left');
		} else {
			// else add it to the right
			noteContainer.addClass('timeline-right');
			noteHeader.setAttribute('style', 'text-align: right;');
		}

		for (const event of events) {
			// 绘制单个事件
			let noteCard = eventContainer.createDiv({ cls: 'timeline-card' });
			// add an image only if available
			const imagePath = getEventImagePath(event.dataset);
			if (imagePath) {
				noteCard.createDiv({
					cls: 'thumb',
					attr: {
						style: `background-image: url(${imagePath});`,
					},
				});
			}
			if (event.dataset.class) {
				noteCard.addClass(event.dataset.class);
			}

			noteCard
				.createEl('article')
				.createEl('h3')
				.createEl('a', {
					cls: 'internal-link',
					attr: { href: `${getEventSourcePath(event.dataset)}` },
					text: event.dataset.title,
				});
			noteCard.createEl('p', { text: event.innerHTML });
		}

		eventCount++;
	}
}
