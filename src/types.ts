import { TimelineOptions } from 'vis-timeline';

export interface TimelinesSettings {
	/** 标签 */
	timelineTag: string;
	/**  */
	sortDirection: boolean;
	/** 用来选中没有eventTags的tag，默认为none */
	noTag: string;
}

/**
 * block中支持的参数
 */
export interface SourceArgs {
	/**
	 * tag列表，用于event过滤，例如：
	 * @example
	 * tag1;tag2;tag3
	 */
	eventTags?: string;
	/**
	 * tag列表，用于文件过滤，例如：
	 * @example
	 * tag1;tag2;tag3
	 */
	tags?: string;
}

/**
 * 解析SourceArgs得到的参数
 */
export interface ParsedArgs extends TimelineOptions {
	/**
	 * tag列表，用于event过滤，例如：
	 * 里边有个特殊的tag: none，可以用来选中那些没有tag的event
	 */
	eventTags?: string[];
	/**
	 * tag列表，用于文件过滤，例如：
	 */
	tags?: string[];
}

export interface CardContainer {
	date: string;
	title: string;
	img: string;
	innerHTML: string;
	path: string;
	endDate: string;
	type: string;
	class: string;
}

export type NoteData = CardContainer[];
export type AllNotesData = NoteData[];

/**
 * event属性（存放在dataset中）
 */
export interface IEventItem {
	/** 类名 */
	class?: string;
	/**
	 * 组名字(相同的group会被放在一起)
	 */
	groupName?: string;

	/**
	 * event的标签，;分割
	 * @example
	 * tag1;tag2;tag3
	 */
	eventTags?: string;

	/**
	 * 日期, 精确到日(YYYY-MM-DD)，兼有排序和聚合的功能
	 */
	date?: string;

	/** 日期的提示 */
	dateDescription?: string;

	/** 开始时间，格式同date */
	dateStart?: string;
	/** 结束时间，格式同date */
	dateEnd?: string;

	/**
	 * 用来做id, 最终的id优先级为  dateId > sortOrder
	 */
	dateId?: string;

	/**
	 * 标题，用于展示
	 */
	title?: string;

	/** 图片地址（相对于event的文件） */
	img?: string;
}

/** 绘制的Event的参数 */
export interface IEventDrawArgs extends IEventItem {
	/** 事件所在的文件地址 */
	path?: string;
	/** 图片的地址 */
	imgRealPath?: string;

	innerHTML?: string;
}
