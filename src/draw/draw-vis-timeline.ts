import { isNil, omit } from 'lodash-es';
import type { DataGroup, DataItem, TimelineOptions } from 'vis-timeline/esnext';
import { Timeline } from 'vis-timeline/esnext';
import * as vis from 'vis-data';
import {
	type ITimelineEventItemParsed,
	getTimelineEventImagePath,
	getTimelineEventSourcePath,
	getTimelineEventStartTime,
	getTimelineEventEndTime,
} from '../type/timeline-event';

export interface IGroupedTimelineEvent {
	groupName: string;
	events: ITimelineEventItemParsed[];
}

interface IDrawVisTimelineOptions {
	events: IGroupedTimelineEvent[];
	options?: TimelineOptions;
	/** 绘制的容器 */
	container: HTMLElement;
}

/**
 * 绘制vis timeline
 */
export function drawVisTimeline(opt: IDrawVisTimelineOptions) {
	const { events, options, container } = opt;

	const items = new vis.DataSet<DataItem>([]);
	for (const groupEvent of events) {
		for (const event of groupEvent.events) {
			const noteCard = document.createElement('div');
			noteCard.className = 'timeline-card';

			const imagePath = getTimelineEventImagePath(event);
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
					attr: { href: `${getTimelineEventSourcePath(event)}` },
					text: event.title,
				});
			noteCard.createEl('p', { text: event.innerHTML }, (el) => {
				el.innerHTML = event.innerHTML || '';
			});

			// 计算开始时间，结束时间
			const start = getTimelineEventStartTime(event);
			const end = getTimelineEventEndTime(event);

			if (isNil(start)) {
				console.warn('start time is undefined', event);
				continue;
			}

			const opt: DataItem = {
				// id: getTimelineEventId(event) || '',
				content: event.title ?? '',
				title: noteCard.outerHTML,
				start: start,
				className: event.class ?? '',
				// type: event.type,
				end: end ?? undefined,
				group: groupEvent.groupName,
			};

			items.add(opt);
		}
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
			if (groupNameSet.has('other')) {
				continue;
			}
			groupInfos.push({
				id: 'other',
				content: 'other',
			});
			groupNameSet.add('other');
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
