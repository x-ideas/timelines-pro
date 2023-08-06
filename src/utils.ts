import type { ITimelineSearchParams } from './apis/search-timeline';
import type { TimelineEventDrawParams } from './type/draw-params';

export type ITimelineMarkdownParams = ITimelineSearchParams &
	TimelineEventDrawParams;

/**
 * Create date of passed string
 * @date - string date in the format YYYY-MM-DD-HH
 */
// export function createDate(date: string): Date {
// 	const dateComp = date.split(',');
// 	// cannot simply replace '-' as need to support negative years
// 	return new Date(
// 		+(dateComp[0] ?? 0),
// 		+(dateComp[1] ?? 0),
// 		+(dateComp[2] ?? 0),
// 		+(dateComp[3] ?? 0)
// 	);
// }

/**
 * 解析source中的markdown代码
 * 支持解析group
 */
export function parseMarkdownCode(source: string): ITimelineMarkdownParams {
	// 解析
	const sourceArgs: ITimelineMarkdownParams = {
		// 默认值
		// divHeight: 400,
		// startDate: moment().subtract(1000, 'year').format('YYYY-MM-DD'),
		// endDate: moment().add(3000, 'year').format('YYYY-MM-DD'),
		// minDate: moment().subtract(1000, 'year').format('YYYY-MM-DD'),
		// maxDate: moment().add(3000, 'year').format('YYYY-MM-DD'),
	};
	source.split('\n').map((e) => {
		e = e.trim();
		if (e) {
			const param = e.split('=');
			if (param[1]) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				sourceArgs[param[0]] = param[1]?.trim();
			}
		}
	});

	return sourceArgs;
}

/**
 * 解析source中的markdown代码, 按照空白行(\n\n)分割，支持group
 * @param source
 * @returns
 */
export function parseMarkdownCodeSource(
	source: string
): ITimelineMarkdownParams[] {
	// 按照空白行分割
	const sourceList = source.trim().split('\n\n');

	return sourceList.map((aSource) => {
		return parseMarkdownCode(aSource);
	});
}
