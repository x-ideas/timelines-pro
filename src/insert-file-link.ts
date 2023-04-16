import type { App, TFile } from 'obsidian';
import type { IEventDrawArgs } from './types';

/** 插入文件链接 */
export async function insertFileLinkIfNeed(
	currentFile: TFile,
	app: App,
	events: IEventDrawArgs[]
) {
	const fileContent = await app.vault.read(currentFile);

	// 采用[[文件名]]的形式插入文件链接
	const links = new Set();
	// 判断是否需要插入文件链接
	for (const event of events) {
		const reg = new RegExp(`\\[\\[${event.file.name}\\]\\]`);
		if (!reg.test(fileContent)) {
			links.add(`[[${event.file.name}]]`);
		}
	}

	if (links.size > 0) {
		const newFileContent =
			fileContent + '\n## 附录\n' + Array.from(links).join('\n');

		app.vault.modify(currentFile, newFileContent);
	}
}
