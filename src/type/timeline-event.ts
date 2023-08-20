import type { DataAdapter, TFile, Vault } from 'obsidian';
import {
	parseTimelineDate,
	parseTimelineDateElements,
	type TimelineDate,
} from './time';
import moment from 'moment';
import { isNil } from 'lodash';

/**
 * timeline event模型（存放在dataset中）
 */
export interface ITimelineEventItemSource {
	/** 类名 */
	class?: string;

	/**
	 * event的标签，;分割
	 * @example
	 * tag1;tag2;tag3
	 */
	eventTags?: string;

	/**
	 * 日期, 精确到日(YYYY/MM/DD)，兼有排序和聚合的功能
	 */
	date?: TimelineDate;

	/** 日期的提示 */
	dateDescription?: string;

	/**
	 * 开始时间，格式同date
	 * @see {@link date}
	 */
	dateStart?: TimelineDate;

	/**
	 * 结束时间，格式同date
	 * @see {@link date}
	 */
	dateEnd?: TimelineDate;

	/**
	 * 用来做id, 最终的id优先级为  dateId > sortOrder
	 */
	dateId?: string;

	/**
	 * 名字，用于标记一类event
	 * 如,项目的名字
	 */
	name?: string;

	/**
	 * 标题，用于展示
	 */
	title?: string;

	/** 图片地址（相对于event的文件） */
	img?: string;

	/**
	 * 该事件的值，如5km, 40min
	 */
	value?: string;

	/**
	 * 单位
	 */
	unit?: 'distance' | 'time';

	/**
	 * 是否是里程碑
	 * 为'true'的时候表示是里程碑
	 */
	milestone?: string;
	/**
	 * 内容
	 */
	content?: string;
}

/** 扩展的timeline event属性，
 * @description
 * 1. 增加了一些用于之后逻辑判断的字段
 * 如关联的文件file, 如innerHTML
 *
 * 2. 对属性做了一次解析
 *
 */
export interface ITimelineEventItemParsed
	extends Omit<ITimelineEventItemSource, 'value' | 'milestone'> {
	/** 图片的地址 */
	imgRealPath?: string;
	/** 内部html */
	content?: string;

	/** 解析eventTags之后的数据(按照;分割了一下) */
	parsedEventTags?: string[];

	/**
	 * 转换为number
	 */
	value?: number;
	/**
	 * 是否是里程碑
	 * 转换成boolean
	 */
	milestone?: boolean;

	/** 关联的文件 */
	file: TFile;
}

/******* 字段解析方法 *******/

/**
 * 获取timeline的id
 */
export function getTimelineEventId(
	dataset?: Pick<ITimelineEventItemSource, 'date' | 'dateStart' | 'dateEnd'>
) {
	if (dataset) {
		if (dataset['date']) {
			return getTimelineEventTime(dataset['date']) + '';
		}

		if (dataset['dateStart'] && dataset['dateEnd']) {
			// 范围
			return `${getTimelineEventTime(
				dataset['dateStart']
			)}-${getTimelineEventTime(dataset['dateEnd'])}`;
		}

		// 将dataStart看作是data一样的功能
		if (dataset.dateStart) {
			return getTimelineEventTime(dataset.dateStart) + '';
		}
	}
	return null;
}

/**
 * 解析时间字符串
 * 中间使用/分割
 * @example
 * 	1940/9/9 = 19400909
 * -231/8/3 => -002310803
 */
export function getTimelineEventTime(str?: TimelineDate): number {
	return parseTimelineDate(str) || 0;
}

/**
 * 将时间字符串转换为moment对象，一般用于开放接口，供外界使用
 */
export function getTimelineEventMomentTime(
	str?: TimelineDate
): moment.Moment | undefined {
	const info = parseTimelineDateElements(str);

	function parse(str?: string) {
		if (isNil(str)) {
			return undefined;
		}

		const res = Number.parseInt(str);
		if (Number.isNaN(res)) {
			return undefined;
		}

		return res;
	}

	const month = parse(info?.month);

	const date = moment({
		year: parse(info?.year),
		// 这里的month从0开始计算
		month: month ? month - 1 : month,
		day: parse(info?.day),
	});

	if (!date.isValid()) {
		console.error(`[timelines-pro] invalid date: ${str}`);
		return undefined;
	}

	return date;
}

/**
 * 获取timeline event的时间描述（用于展示）
 * 取dateDescription字段，如果没有dateDescription字段，则返回getTimelineEventId()的值
 */
export function getTimelineEventDateDescription(
	dataset?: ITimelineEventItemParsed
) {
	return dataset?.['dateDescription'] || getTimelineEventId(dataset);
}

/**
 * 获取timeline中的图片地址
 */
export function getTimelineEventImagePath(dataset?: ITimelineEventItemParsed) {
	return dataset?.['imgRealPath'];
}

/**
 * 获取timeline所在的文件地址
 */
export function getTimelineEventSourcePath(dataset?: ITimelineEventItemParsed) {
	return dataset?.file.path;
}

/**
 * 获取timeline开始时间
 * 暴露给外界使用
 */
export function getTimelineEventStartTime(dataset?: ITimelineEventItemParsed) {
	return dataset?.date || dataset?.dateStart || undefined;
}

/**
 * 获取timeline结束时间(直接取dateEnd字段)
 * 一些场景需要考虑dateEnd是否设置，则用这个函数
 */
export function getTimelineEventEndTime(dataset?: ITimelineEventItemParsed) {
	return dataset?.dateEnd || undefined;
}

/**
 * 获取timeline结束时间，有dateEnd则取dateEnd, 没有的话，则考虑date, dateStart字段
 * 暴露给外界使用
 */
export function getTimelineEventEndTimeJudged(
	dataset?: ITimelineEventItemParsed
) {
	return getTimelineEventEndTime(dataset) || getTimelineEventStartTime(dataset);
}

/**
 * 从dataset中获取排序字段（做了一些解析工作）
 */
export function getTimelineSortOrder(
	dataset?: Pick<ITimelineEventItemSource, 'date' | 'dateStart'>
) {
	if (dataset) {
		return (
			getTimelineEventTime(dataset['date']) ||
			getTimelineEventTime(dataset['dateStart'])
		);
	}
	return -1;
}

/*********** 数据解析 *************/

/**
 * Return URL for specified image path
 * @param path - image path
 */
function getImgUrl(vaultAdaptor: DataAdapter, path: string): string {
	if (!path) {
		return '';
	}

	const regex = new RegExp('^https://');
	if (path.match(regex)) {
		return path;
	}

	return vaultAdaptor.getResourcePath(path);
}

/**
 * 从文件中解析出事件
 * @returns {Map<string, ITimelineEventItemParsed[]>} key为文件地址, value为事件列表
 */
export async function getTimelineEventInFile(
	files: TFile[],
	appVault: Vault
): Promise<Map<string, ITimelineEventItemParsed[]>> {
	const domparser = new DOMParser();
	const res = new Map<string, ITimelineEventItemParsed[]>();

	for (const file of files) {
		const doc = domparser.parseFromString(
			await appVault.read(file),
			'text/html'
		);
		// timeline div
		const timelineData = doc.getElementsByClassName('ob-timelines');

		const timelines: ITimelineEventItemParsed[] = [];
		// NOTE: 额外dataset处理一些参数
		const notePath = file.path;
		const path = notePath;
		for (const event of timelineData as any) {
			if (!(event instanceof HTMLElement)) {
				continue;
			}

			let eventTags: string[] = [];
			if (event.dataset['eventTags']) {
				eventTags = event.dataset['eventTags']
					.split(';')
					.reduce<string[]>((accu, tag) => {
						accu.push(tag);
						return accu;
					}, [])
					.filter((tag) => !!tag);
			}

			// event.dataset.path = notePath;

			let imgRealPath = '';
			if (event.dataset.img) {
				// console.log('real image', file. + event.dataset.img);
				imgRealPath = getImgUrl(appVault.adapter, event.dataset.img);
			}

			// 添加到结果中
			const timelineEvent: ITimelineEventItemParsed = {
				...event.dataset,
				date: event.dataset.date ? event.dataset.date : event.dataset.dateStart,
				content: event.innerHTML,
				imgRealPath,
				parsedEventTags: eventTags,
				file: file,
				// 一些属性的额外处理
				//  解析成数字
				name: event.dataset['name'] || 'unknown',
				value: parseNumber(event.dataset['value']),
				milestone: parseBoolean(event.dataset['milestone']),
			};

			timelines.push(timelineEvent);
		}
		res.set(path, timelines);
	}

	return res;
}

function parseNumber(value?: string): number | undefined {
	if (value) {
		const num = Number(value);
		if (!isNaN(num)) {
			return num;
		}
	}
	return undefined;
}

function parseBoolean(value?: string): boolean | undefined {
	if (value) {
		return value === 'true';
	}
	return undefined;
}
