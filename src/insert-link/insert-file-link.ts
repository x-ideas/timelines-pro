import type { App, TFile, Vault } from 'obsidian';
import type { ITimelineEventItemParsed } from '../type';

/** 插入文件链接 */
export async function insertFileLinkIfNeed(
	currentFile: TFile,
	vault: Vault,
	events: ITimelineEventItemParsed[]
) {
	const fileContent = await vault.read(currentFile);

	// 采用[[文件名]]的形式插入文件链接
	const links = new Set();
	// 判断是否需要插入文件链接
	// 先根据创建时间排序

	for (const event of events.sort(
		(aEv, bEv) => aEv.file.stat.ctime - bEv.file.stat.ctime
	)) {
		if (
			!fileContent.includes(`[[${event.file.basename}]]`) &&
			// 排除自身
			event.file.path !== currentFile.path
		) {
			links.add(`[[${event.file.basename}]]`);
		}
	}

	if (links.size > 0) {
		const newFileContent = fileContent + '\n' + Array.from(links).join('\n');

		vault.modify(currentFile, newFileContent);
	}
}
