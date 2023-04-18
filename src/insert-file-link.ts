import type { App, TFile } from 'obsidian';
import type { ITimelineEventItemExtend } from './types';

/** 插入文件链接 */
export async function insertFileLinkIfNeed(
	currentFile: TFile,
	app: App,
	events: ITimelineEventItemExtend[]
) {
	const fileContent = await app.vault.read(currentFile);

	// 采用[[文件名]]的形式插入文件链接
	const links = new Set();
	// 判断是否需要插入文件链接
	for (const event of events) {
		if (!fileContent.includes(`[[${event.file.name}]]`)) {
			links.add(`[[${event.file.name}]]`);
		}
	}

	if (links.size > 0) {
		const newFileContent = fileContent + '\n' + Array.from(links).join('\n');

		app.vault.modify(currentFile, newFileContent);
	}
}
