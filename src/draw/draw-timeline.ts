import { groupBy } from 'lodash';
import type { TimelineOptions } from 'vis-timeline/esnext';
import {
	type ITimelineEventItemParsed,
	getTimelineEventImagePath,
	getTimelineEventSourcePath,
	getTimelineEventId,
	type ITimelineEventItemSource,
	getTimelineSortOrder,
	getTimelineEventDateDescription,
} from '../type/timeline-event';

interface IDrawTimelineOptions {
	events: ITimelineEventItemParsed[];
	options?: TimelineOptions;
	/** 绘制的容器 */
	container: HTMLElement;
}

/** 垂直的timeline */
export function drawTimeline(opt: IDrawTimelineOptions) {
	const { events, container } = opt;

	// 组合events
	const groupEvents = groupBy(events, (event) => {
		return getTimelineEventId(event as ITimelineEventItemSource);
	});

	// 排序
	const sortedEvents = Object.values(groupEvents).sort((a, b) => {
		const item1 = a[0];
		const item2 = b[0];

		return getTimelineSortOrder(item1) - getTimelineSortOrder(item2);
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

		const noteContainer = container.createDiv({ cls: 'timeline-container' });
		const noteHeader = noteContainer.createEl('h2', {
			text: getTimelineEventDateDescription(first) || '--',
		});
		const eventContainer = noteContainer.createDiv({
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
			const noteCard = eventContainer.createDiv({ cls: 'timeline-card' });
			// add an image only if available
			const imagePath = getTimelineEventImagePath(event);
			if (imagePath) {
				noteCard.createDiv({
					cls: 'thumb',
					attr: {
						style: `background-image: url(${imagePath});`,
					},
				});
			}
			if (event.class) {
				noteCard.addClass(event.class);
			}

			noteCard
				.createEl('article')
				.createEl('h3')
				.createEl('a', {
					cls: 'internal-link',
					attr: { href: `${getTimelineEventSourcePath(event)}` },
					text: event.title,
				});
			noteCard.createEl('p', { text: event.innerHTML }, (el) => {
				el.innerHTML = event.innerHTML || '';
			});
		}

		eventCount++;
	}
}
