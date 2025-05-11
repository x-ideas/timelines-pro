import type { ITimelineEventItemParsed } from '../../type';
import type { ITimelineFilterParams } from './filter-timeline-event';
import { StringSelectExp } from '../../expressions/select-exp';
/**
 * 过滤字符串属性
 * @param pattern 模式
 * @param val 待校验的字符串
 */
export function filterStrProperty(pattern: string, val?: string) {
	if (!val) {
		return false;
	}

	// 依然支持逻辑运算
	const strSelect = new StringSelectExp(pattern);

	return strSelect.test(val || '');
}

/**
 * 根据名称过滤timeline事件
 */
export function filterEventsByName(
	events: ITimelineEventItemParsed[],
	params?: ITimelineFilterParams,
): ITimelineEventItemParsed[] {
	const pattern = params?.name;
	if (pattern) {
		return events.filter((event) => {
			return filterStrProperty(pattern, event.name);
		});
	}

	return events;
}
