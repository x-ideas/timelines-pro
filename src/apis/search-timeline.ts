import type { ITimelineFilterParams } from './filter';

/**
 *
 */
export interface ITimelineSearchParams extends ITimelineFilterParams {
	/**
	 * tag列表，用于文件过滤，支持逻辑运算，例如：
	 * @example
	 * tag1 && (tag2 || tag3)
	 */
	tags?: string;
}
