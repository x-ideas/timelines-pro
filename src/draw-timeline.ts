import { groupBy, isNil, omit } from 'lodash-es';
import type { DataGroup, DataItem, TimelineOptions } from 'vis-timeline/esnext';
import { Timeline } from 'vis-timeline/esnext';
import * as vis from 'vis-data';
import {
	getEventDateDescription,
	getEventEndTime,
	getEventImagePath,
	getEventSourcePath,
	getEventStartTime,
	getNoteId,
	getSortOrder,
	parseTimeStr,
} from './utils';
import type { IEventItem, ParsedArgs } from './types';
import type { IEventDrawArgs } from './types';

interface IDrawTimelineOptions {
	events: IEventDrawArgs[];
	options?: ParsedArgs;
	/** 绘制的容器 */
	container: HTMLElement;
}

/**
 * 绘制所有的
 */
export function drawVisTimeline(opt: IDrawTimelineOptions) {
	const { events, options, container } = opt;

	const items = new vis.DataSet<DataItem>([]);
	for (const event of events) {
		const noteCard = document.createElement('div');
		noteCard.className = 'timeline-card';

		const imagePath = getEventImagePath(event);
		if (imagePath) {
			noteCard.createDiv({
				cls: 'thumb',
				attr: { style: `background-image: url(${imagePath});` },
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
				attr: { href: `${getEventSourcePath(event)}` },
				text: event.title,
			});
		noteCard.createEl('p', { text: event.innerHTML });

		// 计算开始时间，结束时间
		const start = getEventStartTime(event);
		const end = getEventEndTime(event);

		if (isNil(start)) {
			console.warn('开始时间为空', event);
			continue;
		}

		const opt: DataItem = {
			id: getNoteId(event) || '',
			content: event.title ?? '',
			title: noteCard.outerHTML,
			start: start,
			className: event.class ?? '',
			// type: event.type,
			end: end ?? undefined,
			group: event.groupName ?? '其他',
		};

		items.add(opt);
	}

	// 寻找group信息
	const groupInfos: DataGroup[] = [];
	const groupNameSet = new Set<string>();
	for (const event of events) {
		if (event.groupName) {
			if (groupNameSet.has(event.groupName)) {
				continue;
			}
			groupInfos.push({
				id: event.groupName,
				content: event.groupName,
			});
			groupNameSet.add(event.groupName);
		} else {
			if (groupNameSet.has('其他')) {
				continue;
			}
			groupInfos.push({
				id: '其他',
				content: '其他',
			});
			groupNameSet.add('其他');
		}
	}

	if (process.env.NODE_ENV === 'development') {
		console.log('[timeline]: items', items);
	}

	const timelineOpt: TimelineOptions = {
		showCurrentTime: false,
		showTooltips: false,
		// 删除一些不需要的字段
		...omit(options, 'tags', 'eventTags'),
		template: function (item: any, element: HTMLElement, data: any) {
			const eventContainer = document.createElement('div');
			eventContainer.setText(item.content);
			const eventCard = eventContainer.createDiv();
			eventCard.outerHTML = item.title;
			eventContainer.addEventListener('click', (event) => {
				if (process.env.NODE_ENV === 'development') {
					console.log('[timeline]: click item', item, element, data);
				}
				// 计算位子

				const el = eventContainer.getElementsByClassName(
					'timeline-card'
				)[0] as HTMLElement;
				el?.style.setProperty('display', 'block');
				el?.style.setProperty('top', `-${el.clientHeight + 10}px`);
			});
			return eventContainer;
		},
	};

	if (process.env.NODE_ENV === 'development') {
		console.log('[timeline]: timelineOpt', timelineOpt);
	}

	container.setAttribute('class', 'timeline-vis');
	if (groupInfos.length > 0) {
		new Timeline(container, items, new vis.DataSet(groupInfos), timelineOpt);
	} else {
		new Timeline(container, items, timelineOpt);
	}
}

/** 垂直的timeline */
export function drawTimeline(opt: IDrawTimelineOptions) {
	const { events, options, container } = opt;

	// 组合events
	const groupEvents = groupBy(events, (event) => {
		return getNoteId(event as IEventItem);
	});

	// 排序
	const sortedEvents = Object.values(groupEvents).sort((a, b) => {
		const item1 = a[0];
		const item2 = b[0];

		return getSortOrder(item1) - getSortOrder(item2);
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
			text: getEventDateDescription(first) || '--',
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
			const imagePath = getEventImagePath(event);
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
					attr: { href: `${getEventSourcePath(event)}` },
					text: event.title,
				});
			noteCard.createEl('p', { text: event.innerHTML });
		}

		eventCount++;
	}
}
