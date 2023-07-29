import type { TimelineOptions } from 'vis-timeline';

/** timeline绘制参数 */
export type TimelineEventDrawParams = TimelineOptions & {
	/**
	 * 是否自动插入文件链接,默认true
	 */
	autoInsetFileLinks?: boolean;

	/**
	 * 组名，当一旦出现group，就会按照vis group方式绘制
	 */
	groupName?: string;
};
