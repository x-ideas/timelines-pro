import type { MetadataCache, TFile, Vault } from 'obsidian';
import {
	getTimelineEventInFile,
	type ITimelineEventItemExtend,
} from 'src/type/timeline-event';
import {
	filterFileByTags,
	filterTimelineEvents,
	type ITimelineFilterParams,
} from 'src/filter';
import { parseTimelineDate } from 'src/type/time';
import { isNil } from 'lodash-es';
import type * as Sentry from '@sentry/node';

export interface ITimelineSearchParams extends ITimelineFilterParams {
	/**
	 * tag列表，用于文件过滤，支持逻辑运算，例如：
	 * @example
	 * tag1 && (tag2 || tag3)
	 */
	tags?: string;

	/**
	 * 组名，当一旦出现group，就会按照vis group方式绘制
	 */
	group?: string;
}

interface ISearchTimelineEventsParams {
	/** obsidian相关的信息 */
	vaultFiles: TFile[];
	fileCache: MetadataCache;
	appVault: Vault;
	/**
	 * 搜索和绘制参数
	 * 目前绘制参数，在timeline-vis-pro下才生效
	 */
	params: ITimelineSearchParams;

	/**  */
	span?: Sentry.Span;
}

/**
 * 获取所有有效的的events对象
 * 1. 通过tags对文件过滤
 * 2. 通过event-tags对event过滤
 */
export async function searchTimelineEvents(
	opt: ISearchTimelineEventsParams
): Promise<ITimelineEventItemExtend[]> {
	if (process.env.NODE_ENV !== 'production') {
		console.log('[timeline] before file filter ', opt.vaultFiles.length);
	}

	// 使用tags过滤文件
	const fileList = opt.vaultFiles.filter((file) =>
		filterFileByTags(file, opt.fileCache, opt.params.tags)
	);
	if (process.env.NODE_ENV !== 'production') {
		console.log('[timeline] after file filter', fileList.length);
	}
	if (!fileList) {
		// if no files valid for timeline
		return [];
	}

	const res: ITimelineEventItemExtend[] = [];
	const timelineEventsInFiles = await getTimelineEventInFile(
		fileList,
		opt.appVault
	);

	// 判断查询时间是否有效
	const start = parseTimelineDate(opt.params.dateStart);
	const end = parseTimelineDate(opt.params.dateEnd);
	if (!isNil(start) && !isNil(end) && start > end) {
		console.error(
			'[timeline] error time search condition',
			'start',
			opt.params.dateStart,
			'end',
			opt.params.dateEnd
		);
		return [];
	}

	// 过滤
	for (const timeline of timelineEventsInFiles.values()) {
		res.push(
			// 单个文件的timeline event过滤
			...filterTimelineEvents(timeline, {
				eventTags: opt.params.eventTags,
				dateStart: opt.params.dateStart,
				dateEnd: opt.params.dateEnd,
			})
		);
	}

	return res;
}
