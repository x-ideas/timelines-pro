import { TagSelectExp } from '../../expressions/select-exp';
import {
	hasTimeRangeIntersection,
	parseTimelineDateElements,
	type TimelineDateRange,
} from '../../type/time';
import {
	getTimelineEventEndTime,
	getTimelineEventStartTime,
	type ITimelineEventItemParsed,
} from '../../type/timeline-event';
import type * as Sentry from '@sentry/node';
import { filterEventsByName } from './filter-str-property';

/**
 * 对于数字类型的过滤条件
 * 1. 支持完全匹配， 如 3
 * 2. 支持比较操作, 如 >=4
 * 3, 支持范围, 如 [4， 5)
 */
export type NumberSearchCondition = string;

/**
 * timeline事件的过滤条件
 */
export interface ITimelineFilterParams {
	/**
	 * tag列表，用于event过滤，支持逻辑运算，例如：
	 * @example
	 * tag1 && (tag2 || tag3)
	 * 同时支持内置的year_{xxxx}, month_{xx}, day_{xx}标签
	 * @see {@link TagSelectExp}
	 */
	eventTags?: string;

	/** 搜索条件: 开始时间, 应用timeline event中的date字段, /分割 */
	dateStart?: string;
	/** 搜索条件: 结束时间, /分割 */
	dateEnd?: string;

	/**
	 * 过滤milestone
	 */
	milestone?: boolean;

	/**
	 * 过滤value
	 */
	value?: NumberSearchCondition;

	/**
	 * 名称过滤，支持模糊匹配
	 */
	name?: string;

	span?: Sentry.Span;
}

/**
 * 过滤timeline事件
 */
export function filterTimelineEvents(
	events: ITimelineEventItemParsed[],
	params?: ITimelineFilterParams
): ITimelineEventItemParsed[] {
	// const result = [...events];
	if (!params) {
		return events;
	}

	let result = events;
	if (params.eventTags) {
		result = filterByEventTag(result, params);
	}

	if (params.dateStart || params.dateEnd) {
		result = filterByTime(result, params);
	}

	// 按名字过滤
	if (params.name) {
		result = filterEventsByName(result, params);
	}

	return result;
}

/**
 * 根据event tag标签过滤
 */
function filterByEventTag(
	events: ITimelineEventItemParsed[],
	params?: ITimelineFilterParams
): ITimelineEventItemParsed[] {
	if (!params || !params.eventTags) {
		return events;
	}

	const tagSelect = new TagSelectExp(params.eventTags);

	return events.filter((item) => {
		let tags = item.eventTags ? item.eventTags : 'none';

		// 增加时间相关的tag
		const start = getTimelineEventStartTime(item);
		const timeElements = parseTimelineDateElements(start);
		if (timeElements) {
			// 增加额外的时间标签
			tags += `;year_${timeElements.year}`;
			tags += `;month_${timeElements.month}`;
			tags += `;day_${timeElements.day}`;
			tags += `;hour_${timeElements.hour}`;
		}

		return tagSelect.test(tags);
	});
}

/**
 * 按照时间进行过滤
 * @param events
 * @param params
 * @returns
 */
function filterByTime(
	events: ITimelineEventItemParsed[],
	params?: ITimelineFilterParams
): ITimelineEventItemParsed[] {
	if (!params) {
		return events;
	}

	const queryTimeRange: TimelineDateRange = [params.dateStart, params.dateEnd];

	return events.filter((item) => {
		const eventTimeRange: TimelineDateRange = [
			getTimelineEventStartTime(item),
			getTimelineEventEndTime(item),
		];

		// 判断是否有交集
		return hasTimeRangeIntersection(eventTimeRange, queryTimeRange);
	});
}
