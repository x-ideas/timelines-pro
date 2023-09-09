import { isNil } from 'lodash';
import type { App, TFile } from 'obsidian';
import { Events } from 'obsidian';
import { filterFileByTags, filterTimelineEvents } from 'src/apis/filter';
import type { ITimelineSearchParams } from 'src/apis/search-timeline';
import type { FileTagInfos } from 'src/type';
import {
	getTimelineEventsAndTagsInFile,
	parseTimelineDate,
	type ITimelineEventItemParsed,
} from 'src/type';

/**
 * event tag管理
 */
export class EventTagsManage extends Events {
	private app: App | undefined;
	private static _inst: EventTagsManage | undefined;

	// private _state: 'refreshing' | 'finished';

	/**
	 * 文件路径 -> 文件下的event tags集合
	 */
	private tagsMap: Map<TFile, FileTagInfos> = new Map();
	/**
	 * 单例
	 */
	static getInstance() {
		if (!this._inst) {
			this._inst = new EventTagsManage();
		}

		return this._inst;
	}

	/**
	 * 初始化app，一定要调用一次
	 */
	init(app: App) {
		this.app = app;
		// 触发一次刷新
		this.refresh();
	}

	/**
	 * 刷新tags map信息
	 */
	async refresh() {
		if (!this.app) {
			console.error(
				'[refresh] 尚未初始化，请先调用EventTagsManage.getInstance().init(app)'
			);
			return;
		}

		const tag = 'event tag manage refresh';
		console.time(tag);
		const files = this.app.vault.getMarkdownFiles();

		const timelineEvents = await getTimelineEventsAndTagsInFile(
			files,
			this.app
		);

		this.tagsMap = timelineEvents;

		console.timeEnd(tag);
		console.log('刷新生生世世', this.tagsMap);
		// 发送消息
		this.triggerRefreshFinished();
	}

	/**
	 * 搜索event tags
	 */
	async searchTimelineEvents(params: ITimelineSearchParams) {
		if (!this.app) {
			console.error(
				'[searchTimelineEvents] 尚未初始化，请先调用EventTagsManage.getInstance().init(app)'
			);
			return;
		}

		const timelineEventsInFiles: FileTagInfos[] = [];
		// 使用tags过滤文件
		for (const tagInfo of this.tagsMap.values()) {
			if (filterFileByTags(tagInfo.file, this.app, params.tags)) {
				timelineEventsInFiles.push(tagInfo);
			}
		}

		if (!timelineEventsInFiles) {
			// if no files valid for timeline
			return [];
		}

		const res: ITimelineEventItemParsed[] = [];

		// 判断查询时间是否有效
		const start = parseTimelineDate(params.dateStart);
		const end = parseTimelineDate(params.dateEnd);
		if (!isNil(start) && !isNil(end) && start > end) {
			console.error(
				'[timeline] error time search condition',
				'start',
				params.dateStart,
				'end',
				params.dateEnd
			);
			return [];
		}

		// 过滤
		for (const timeline of timelineEventsInFiles) {
			res.push(
				// 单个文件的timeline event过滤
				...filterTimelineEvents(timeline.eventTags, {
					eventTags: params.eventTags,
					dateStart: params.dateStart,
					dateEnd: params.dateEnd,
					name: params.name,
				})
			);
		}

		return res;
	}

	/**
	 * 获取event tag信息
	 */
	getEventTags() {
		return this.tagsMap;
	}

	/**
	 * 更新文件中的event tags信息
	 */
	async updateFileEventTags(aFile: TFile) {
		if (!this.app) {
			console.error(
				'[updateFileEventTags] 尚未初始化，请先调用EventTagsManage.getInstance().init(app)'
			);
			return;
		}

		const timelineEvents = await getTimelineEventsAndTagsInFile(
			[aFile],
			this.app
		);

		for (const [file, info] of timelineEvents) {
			this.tagsMap.set(file, info);
		}

		this.triggerRefreshFinished();
		return this.tagsMap;
	}

	/**
	 * 删除文件下的event tags信息
	 */
	async deleteFileEventTags(aFile: TFile) {
		this.tagsMap.delete(aFile);
		this.triggerRefreshFinished();
	}

	/********* 事件 ********/

	triggerRefreshFinished() {
		this.trigger('event-tags-refresh:finished');
	}

	onRefreshFinished(callback: () => void) {
		this.on('event-tags-refresh:finished', callback);
	}
}
