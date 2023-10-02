import { isNil, omit } from 'lodash';
import type { DataGroup, DataItem, TimelineOptions } from 'vis-timeline/esnext';
import { Timeline } from 'vis-timeline/esnext';
import * as vis from 'vis-data';
import {
	type ITimelineEventItemParsed,
	getTimelineEventImagePath,
	getTimelineEventSourcePath,
	getTimelineEventStartTime,
	getTimelineEventEndTime,
	getTimelineEventId,
	getTimelineEventMomentTime,
	getTimelineEventEndTimeJudged,
} from '../type/timeline-event';
import { parseTimelineDateElements } from 'src/type';

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

	const milestoneEvents: ITimelineEventItemParsed[] = [];

	for (const groupEvent of events) {
		for (const event of groupEvent.events) {
			// 记录milestone
			if (event.milestone) {
				milestoneEvents.push(event);
				// continue;
			}

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
			noteCard.createEl('p', { text: event.content }, (el) => {
				el.innerHTML = event.content || '';
			});

			// 计算开始时间，结束时间
			const start = parseTimelineDateElements(getTimelineEventStartTime(event));
			const end = parseTimelineDateElements(getTimelineEventEndTime(event));

			if (isNil(start)) {
				console.warn('start time is undefined', event);
				continue;
			}

			const opt: DataItem = {
				content: `${
					event.dateDescription || ''
				}<br><a href=${getTimelineEventSourcePath(
					event
				)} class="internal-link">${event.title || ''}</a>`,
				title: noteCard.outerHTML,
				start: `${start.year}-${start.month}-${start.day}`,
				className: event.class ?? '',
				// type: event.type,
				end: end ? `${end.year}-${end.month}-${end.day}` : undefined,
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

	const timelineOpt: TimelineOptions = {
		showCurrentTime: false,
		showTooltips: false,
		// 删除一些不需要的字段
		...options,
		template: function (item: DataItem, element: HTMLElement, data: any) {
			const eventContainer = document.createElement('div');
			eventContainer.innerHTML = item.content || '';
			// eventContainer.setText(item.content);
			const eventCard = eventContainer.createDiv();
			eventCard.outerHTML = item.title || '';
			// 取消点击事件
			// eventContainer.addEventListener('click', (event) => {
			// 	if (process.env.NODE_ENV === 'development') {
			// 		console.log('[timeline]: click item', item, element, data);
			// 	}
			// 	// 计算位子

			// 	const el = eventContainer.getElementsByClassName(
			// 		'timeline-card'
			// 	)[0] as HTMLElement;
			// 	el?.style.setProperty('display', 'block');
			// 	el?.style.setProperty('top', `-${el.clientHeight + 10}px`);
			// });
			return eventContainer;
		},
	};

	container.setAttribute('class', 'timeline-vis');
	let timeline;
	if (groupInfos.length > 0) {
		timeline = new Timeline(
			container,
			items,
			new vis.DataSet(groupInfos),
			timelineOpt
		);
	} else {
		timeline = new Timeline(container, items, timelineOpt);
	}

	// 增加 milestone(也就是marker)
	for (const milestone of milestoneEvents) {
		const id = getTimelineEventId(milestone) || Math.random().toString(16);

		const endDate = getTimelineEventMomentTime(
			getTimelineEventEndTimeJudged(milestone)
		);
		if (!endDate) {
			console.warn('[timeline]: milestone end date is undefined', milestone);
			continue;
		}

		timeline.addCustomTime(endDate?.valueOf(), id);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		timeline.setCustomTimeMarker(
			`${milestone.dateDescription || ''}:${milestone.milestone || ''}`,
			id
		);
	}
}
