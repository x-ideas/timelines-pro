import type { MetadataCache, TFile } from 'obsidian';
import { getAllTags } from 'obsidian';
import { TagSelectExp } from 'src/expressions/tag-select-exp';

/** 解析出父子tag可能的所有组合 */
function parseTag(tag: string, tagList: string[]) {
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
 * @param {TFile} file 当前文件
 * @param {MetadataCache} metadataCache ob的metadataCache对象
 * @param {string | undefined} tags tags过滤条件，支持逻辑运算
 */
export function filterFileByTags(
	file: TFile,
	metadataCache: MetadataCache,
	tagSelector?: string
) {
	if (!tagSelector) {
		return true;
	}

	// const tagList = tagSelector.split(';').filter((item) => !!item);
	// if (tagList.length === 0) {
	// 	return true;
	// }
	// // NOTE: 增加一个默认的timeline标签，用于过滤timeline文件
	// tagList.push('timeline');

	// const finalSelector = tagSelector ? `${tagSelector} && timeline` : 'timeline';
	const exp = new TagSelectExp(tagSelector);

	const cached = metadataCache.getFileCache(file);
	if (cached) {
		// 文件的tag
		const tags = getAllTags(cached)?.map((e) => e.slice(1, e.length));

		if (tags && tags.length > 0) {
			const filetags: string[] = [];
			tags.forEach((tag) => parseTag(tag, filetags));
			// 这里将父子标签做了一次穷举，例如：#hello/i/am, #hello/i, #hello
			// 所以判断条件为some
			// 如:
			// hello/i => hello, hello/i
			// 选择: hello时， 表示选择父标签， 满足
			// 选择: hello/i时，则只选择hello/i子标签，也满足我们的场景
			// return filetags.some((item) => {
			// 	return exp.test(item);
			// });
			// 这里的;与eventTags保持一致
			return exp.test(filetags.join(';'));

			// tags.some((item) => {
			// 	const ddd = item.split('/');
			// 	return exp.test(item);
			// });

			// return tagList.every((val) => {
			// 	return filetags.indexOf(val as string) >= 0;
			// });
		}
	}

	return false;
}
