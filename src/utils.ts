import type { ITimelineSearchParams } from './apis/search-timeline';
import type { TimelineEventDrawParams } from './type/draw-params';

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
 */
export function parseMarkdownCode(
	source: string
): ITimelineSearchParams & TimelineEventDrawParams {
	// 解析
	const sourceArgs: ITimelineSearchParams & TimelineEventDrawParams = {
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

	// 额外处理tags

	// const tagList: string[] = [];
	// sourceArgs.tags?.split(';').forEach((tag) => parseTag(tag, tagList));

	// // 收集白名单event-tags
	// const eventWhiteTags = sourceArgs['eventTags']
	// 	?.split(';')
	// 	.reduce<string[]>((accu, tag) => {
	// 		// const tagList: string[] = [];
	// 		// parseTag(tag, tagList);
	// 		// accu.push(...tagList);
	// 		// NOTE: 不解析tag，直接全匹配
	// 		accu.push(tag);
	// 		return accu;
	// 	}, []);

	// 转换
	// const args: ParsedArgs = {
	// 	// height: sourceArgs.divHeight,
	// 	// start: sourceArgs.startDate,
	// 	// end: sourceArgs.endDate,
	// 	// min: sourceArgs.minDate,
	// 	// max: sourceArgs.maxDate,
	// 	tags: tagList,
	// 	eventTags: eventWhiteTags,
	// };

	return sourceArgs;
}
