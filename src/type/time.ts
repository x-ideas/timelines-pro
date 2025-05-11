import { isNil } from 'lodash';

/**
 * 精确到日(YYYY/MM/DD)
 */
export type TimelineDate = string;

/** 时间范围 */
export type TimelineDateRange = [
	TimelineDate | undefined,
	TimelineDate | undefined,
];

/**
 * 解析时间字符串
 * 中间使用/分割
 * @example
 * 	1940/9/9 = 19400909
 * -231/8/3 => -002310803
 *
 * @returns 返回的数字为: {4位数的year}{2位数的month}{2位数的day}{2位数的hour}
 */
export function parseTimelineDate(
	str?: TimelineDate,
	splitFlag = '/',
): number | undefined {
	str = str?.trim();
	if (!str) {
		return undefined;
	}
	const items = str.split(splitFlag);

	const yearStr = items[0];
	const monthStr = items[1] ?? '1';
	const dayStr = items[2] ?? '1';
	const hour = items[3] ?? '0';

	if (isNil(yearStr) || isNil(monthStr) || isNil(dayStr)) {
		console.error('year, month, day maybe undefined', str);
		return undefined;
	}

	const isNegative = yearStr.startsWith('-');

	// 防止是负数
	const yy = yearStr.replace('-', '').padStart(4, '0');
	const mm = monthStr.replace('-', '').padStart(2, '0');
	const dd = dayStr.replace('-', '').padStart(2, '0');
	const hh = hour.replace('-', '').padStart(2, '0');

	const res = `${isNegative ? '-' : ''}${yy}${mm}${dd}${hh}`;

	const time = Number.parseInt(res);
	if (typeof time === 'number') {
		return time;
	}
	return undefined;
}

/**
 * 解析时间字符串，返回年月日时
 * @param str
 * @returns { year, month, day, hour }, 其中month, day, hour都是两位数, 01, 03, 04这种
 * month 从1开始
 */
export function parseTimelineDateElements(
	str?: TimelineDate,
): { year: string; month: string; day: string; hour: string } | undefined {
	str = str?.trim();
	if (!str) {
		return undefined;
	}
	const items = str.split('/');

	const yearStr = items[0];
	const monthStr = items[1] ?? '1';
	const dayStr = items[2] ?? '1';
	const hour = items[3] ?? '0';

	if (isNil(yearStr) || isNil(monthStr) || isNil(dayStr)) {
		console.error(
			'[parseTimelineDateElements] time year, month, day maybe undefined',
			str,
		);
		return undefined;
	}

	return {
		year: yearStr,
		month: monthStr.replace('-', '').padStart(2, '0'),
		day: dayStr.replace('-', '').padStart(2, '0'),
		hour: hour.replace('-', '').padStart(2, '0'),
	};
}

/**
 * 两个时间范围是否有交集
 */
export function hasTimeRangeIntersection(
	timeRange1: TimelineDateRange,
	timeRange2: TimelineDateRange,
): boolean {
	const numTimeRange1: [number | undefined, number | undefined] = [
		parseTimelineDate(timeRange1[0]),
		parseTimelineDate(timeRange1[1]),
	];

	const numTimeRange2: [number | undefined, number | undefined] = [
		parseTimelineDate(timeRange2[0]),
		parseTimelineDate(timeRange2[1]),
	];

	return hasTimeRangeIntersectionImpl(numTimeRange1, numTimeRange2);
}

type TimelineDateRangeNumber = [number | undefined, number | undefined];
function hasTimeRangeIntersectionImpl(
	timeRange1: TimelineDateRangeNumber,
	timeRange2: TimelineDateRangeNumber,
): boolean {
	// 左区间为开的情况
	if (isNil(timeRange1[0])) {
		return hasTimeRangeIntersectionImpl_forLeftOpen(
			timeRange1 as [undefined, number | undefined],
			timeRange2,
		);
	}

	if (isNil(timeRange2[0])) {
		return hasTimeRangeIntersectionImpl_forLeftOpen(
			timeRange2 as [undefined, number | undefined],
			timeRange1,
		);
	}

	// 右区间为开的情况
	if (isNil(timeRange1[1])) {
		return hasTimeRangeIntersectionImpl_forRightOpen(
			timeRange1 as [number, undefined],
			timeRange2,
		);
	}
	if (isNil(timeRange2[1])) {
		return hasTimeRangeIntersectionImpl_forRightOpen(
			timeRange2 as [number, undefined],
			timeRange1,
		);
	}

	return hasTimeRangeIntersectionImpl_forClose(
		timeRange1 as [number, number],
		timeRange2 as [number, number],
	);
}

/**
 * 处理range1左开的情况
 */
function hasTimeRangeIntersectionImpl_forLeftOpen(
	range1: [undefined, number | undefined],
	range2: [number | undefined, number | undefined],
): boolean {
	// 两个左开
	if (isNil(range2[0])) {
		return true;
	}

	if (isNil(range1[1])) {
		return true;
	}

	/**
	 *        -----------------
	 *       |
	 * -------------
	 *      |       |
	 * --------------------
	 */
	return range1[1] >= range2[0];
}

/**
 * 处理range1右开的情况
 */
function hasTimeRangeIntersectionImpl_forRightOpen(
	range1: [number, undefined],
	range2: [number | undefined, number | undefined],
): boolean {
	// 两个右开
	if (isNil(range2[1])) {
		return true;
	}
	/**
	 *  ----------------
	 *                 |
	 *         ----------------------
	 *        |        |
	 * --------------------------
	 */
	return range1[0] <= range2[1];
}

/**
 * 全闭区间
 */
function hasTimeRangeIntersectionImpl_forClose(
	range1: [number, number],
	range2: [number, number],
): boolean {
	//
	const min = range1[0] <= range2[0] ? range1 : range2;
	const max = range1[0] <= range2[0] ? range2 : range1;

	return min[1] >= max[0];
}
