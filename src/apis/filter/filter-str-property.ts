import { minimatch } from 'minimatch';
import type { ITimelineEventItemParsed } from 'src/type';
import type { ITimelineFilterParams } from './filter-timeline-event';
/**
 * 过滤字符串属性
 * @param pattern 模式
 * @param val 待校验的字符串
 */
export function filterStrProperty(pattern: string, val?: string) {
	return minimatch(val || '', pattern);
}

export function filterEventsByName(
	events: ITimelineEventItemParsed[],
	params?: ITimelineFilterParams
): ITimelineEventItemParsed[] {
	const pattern = params?.name;
	if (pattern) {
		return events.filter((event) => {
			return filterStrProperty(pattern, event.name);
		});
	}

	return events;
}
