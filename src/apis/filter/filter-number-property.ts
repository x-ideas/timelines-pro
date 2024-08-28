import { isNil } from 'lodash-es';

// export function filterNumberProperty(
// 	events: ITimelineEventItemParsed[],
// 	key: keyof ITimelineEventItemParsed,
// 	params?: ITimelineFilterParams
// ): ITimelineEventItemParsed[] {
// 	if (key === 'value') {
// 	}

// 	return events;
// }

export function isNumberMatch(numCondition: string, val?: string) {
	const filter = new NumberFilter(numCondition);
}

/**
 * 对于数字类型的过滤条件
 * 1. 支持完全匹配， 如 =3, 3
 * 2. 支持比较操作, 如 >=4
 * 3, 支持范围, 如 [4， 5)
 * 4. 支持逻辑运算, 如 >=4 || <5
 */
class NumberFilter {
	filter: string;
	constructor(_filter: string) {
		this.filter = _filter;
	}

	test(val?: string): boolean {
		if (isNil(val)) {
			return false;
		}
		return true;
	}
}
