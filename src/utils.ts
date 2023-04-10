import { DataSet } from 'vis-data';
import { TFile, MetadataCache, DataAdapter, moment, Vault } from 'obsidian';
import { getAllTags } from 'obsidian';
import { IEventItem, IEventDrawArgs, ParsedArgs, SourceArgs } from './types';
import { isNil } from 'lodash-es';

export function parseTag(tag: string, tagList: string[]) {
	tag = tag.trim();

	// Skip empty tags
	if (tag.length === 0) {
		return;
	}

	// Parse all subtags out of the given tag.
	// I.e., #hello/i/am would yield [#hello/i/am, #hello/i, #hello]. */
	tagList.push(tag);
	while (tag.contains('/')) {
		tag = tag.substring(0, tag.lastIndexOf('/'));
		tagList.push(tag);
	}
}
/**
 * 根据tagList(白名单），过滤文件
 *
 */
export function FilterMDFiles(
	file: TFile,
	tagList: string[],
	metadataCache: MetadataCache
) {
	if (!tagList || tagList.length === 0) {
		return true;
	}

	const cached = metadataCache.getFileCache(file);
	if (cached) {
		// 文件的tag
		let tags = getAllTags(cached)?.map((e) => e.slice(1, e.length));

		if (tags && tags.length > 0) {
			let filetags: string[] = [];
			tags.forEach((tag) => parseTag(tag, filetags));
			return tagList.every((val) => {
				return filetags.indexOf(val as string) >= 0;
			});
		}
	}

	return false;
}

/**
 * Create date of passed string
 * @date - string date in the format YYYY-MM-DD-HH
 */
export function createDate(date: string): Date {
	let dateComp = date.split(',');
	// cannot simply replace '-' as need to support negative years
	return new Date(
		+(dateComp[0] ?? 0),
		+(dateComp[1] ?? 0),
		+(dateComp[2] ?? 0),
		+(dateComp[3] ?? 0)
	);
}

/**
 * Return URL for specified image path
 * @param path - image path
 */
export function getImgUrl(vaultAdaptor: DataAdapter, path: string): string {
	if (!path) {
		return '';
	}

	let regex = new RegExp('^https://');
	if (path.match(regex)) {
		return path;
	}

	return vaultAdaptor.getResourcePath(path);
}

export function getNoteId(dataset?: IEventItem) {
	if (dataset) {
		if (dataset['date']) {
			return parseTimeStr(dataset['date']) + '';
		}

		if (dataset['dateStart'] && dataset['dateEnd']) {
			// 范围
			return `${parseTimeStr(dataset['dateStart'])}-${parseTimeStr(
				dataset['dateEnd']
			)}`;
		}
	}
	return null;
}

/**
 * 从dataset中获取排序字段（做了一些解析工作）
 */
export function getSortOrder(dataset?: IEventItem) {
	if (dataset) {
		return parseTimeStr(dataset['date']) || parseTimeStr(dataset['dateStart']);
	}
	return -1;
}

/**
 * 解析source中的markdown代码
 */
export function parseMarkdownCode(source: string): ParsedArgs {
	// 解析
	const sourceArgs: SourceArgs = {
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
			let param = e.split('=');
			if (param[1]) {
				// @ts-ignore
				sourceArgs[param[0]] = param[1]?.trim();
			}
		}
	});

	// 额外处理tags

	let tagList: string[] = [];
	sourceArgs.tags?.split(';').forEach((tag) => parseTag(tag, tagList));

	// 收集白名单event-tags
	const eventWhiteTags = sourceArgs['eventTags']
		?.split(';')
		.reduce<string[]>((accu, tag) => {
			// const tagList: string[] = [];
			// parseTag(tag, tagList);
			// accu.push(...tagList);
			// NOTE: 不解析tag，直接全匹配
			accu.push(tag);
			return accu;
		}, []);

	// 转换
	const args: ParsedArgs = {
		// height: sourceArgs.divHeight,
		// start: sourceArgs.startDate,
		// end: sourceArgs.endDate,
		// min: sourceArgs.minDate,
		// max: sourceArgs.maxDate,
		tags: tagList,
		eventTags: eventWhiteTags,
	};

	return args;
}

interface IGetEventsOptions {
	/** obsidian相关的信息 */
	vaultFiles: TFile[];
	fileCache: MetadataCache;
	appVault: Vault;
	/** 解析后的参数 */
	parsedArgs: ParsedArgs;
}

/**
 * 获取所有有效的的events对象
 * 1. 通过tags对文件过滤
 * 2. 通过event-tags对event过滤
 */
export async function getValidEvents(
	opt: IGetEventsOptions
): Promise<IEventDrawArgs[]> {
	// 使用tags过滤文件
	let fileList = opt.vaultFiles.filter((file) =>
		FilterMDFiles(file, opt.parsedArgs.tags || [], opt.fileCache)
	);
	if (!fileList) {
		// if no files valid for timeline
		return [];
	}

	const res: IEventDrawArgs[] = [];

	// 过滤
	const eventWhiteTags = new Set(opt.parsedArgs['eventTags']);

	for (let file of fileList) {
		// Create a DOM Parser
		const domparser = new DOMParser();
		const doc = domparser.parseFromString(
			await opt.appVault.read(file),
			'text/html'
		);
		// timeline div
		let timelineData = doc.getElementsByClassName('ob-timelines');

		for (let event of timelineData as any) {
			if (!(event instanceof HTMLElement)) {
				continue;
			}

			/** event的tag属性 */
			/** tags: ;分割 */
			if (event.dataset['eventTags']) {
				const eventTags = event.dataset['eventTags']
					.split(';')
					.reduce<string[]>((accu, tag) => {
						// const tagList: string[] = [];
						// parseTag(tag, tagList);
						// accu.push(...tagList);
						// NOTE: 不解析tag,直接全匹配
						accu.push(tag);
						return accu;
					}, []);

				// 如果没有交集，跳过（或的关系)
				if (
					eventWhiteTags.size > 0 &&
					!eventTags.some((tag) => eventWhiteTags.has(tag))
				) {
					continue;
				}
			} else {
				if (eventWhiteTags.size > 0 && !eventWhiteTags.has('none')) {
					// 没有包含none的话，则表示不选中
					continue;
				}
			}

			// NOTE: 额外dataset处理一些参数
			let notePath = '/' + file.path;
			event.dataset.path = notePath;

			if (event.dataset.img) {
				event.dataset.imgRealPath = getImgUrl(
					opt.appVault.adapter,
					event.dataset.img
				);
			}
			// 读取innerHTML
			event.dataset.innerHTML = event.innerHTML;

			// 添加到结果中
			res.push(event.dataset);
		}
	}

	return res;
}

/**
 * 解析时间字符串
 * 中间使用/分割
 * @example
 * 	1940/9/9 = 19400909
 * -231/8/3 => -002310803
 */
export function parseTimeStr(str?: string): number {
	str = str?.trim();
	if (!str) {
		return 0;
	}
	const items = str.split('/');

	const yearStr = items[0];
	const monthStr = items[1];
	const dayStr = items[2];

	if (isNil(yearStr) || isNil(monthStr) || isNil(dayStr)) {
		console.error('解析的时间中，年，月，日可能不存在');
		return 0;
	}

	const isNegative = yearStr.startsWith('-');

	// 防止是负数
	const yy = yearStr.replace('-', '').padStart(4, '0');
	const mm = monthStr.replace('-', '').padStart(2, '0');
	const dd = dayStr.replace('-', '').padStart(2, '0');

	const res = `${isNegative ? '-' : ''}${yy}${mm}${dd}`;

	const time = Number.parseInt(res);
	if (Number.isNumber(time)) {
		return time;
	}
	return 0;
}

export function getEventImage(dataset?: IEventDrawArgs) {
	if (dataset?.img && dataset.path) {
		return ``;
	}
}

export function getEventDateDescription(dataset?: IEventDrawArgs) {
	return dataset?.['dateDescription'] || getNoteId(dataset);
}

export function getEventImagePath(dataset?: IEventDrawArgs) {
	return dataset?.['imgRealPath'];
}

export function getEventSourcePath(dataset?: IEventDrawArgs) {
	return dataset?.path;
}

export function getEventStartTime(dataset?: IEventDrawArgs) {
	return dataset?.date || dataset?.dateStart || undefined;
}

export function getEventEndTime(dataset?: IEventDrawArgs) {
	return dataset?.dateEnd || undefined;
}
