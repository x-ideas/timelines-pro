import type { TimelineOptions } from 'vis-timeline';

/** 绘制参数 */
export type TimelineEventDrawParams = TimelineOptions & {
	/**
	 * 是否自动插入文件链接
	 */
	autoInsetFileLinks?: boolean;
};
