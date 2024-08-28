import type {
	App,
	Editor,
	EditorPosition,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from 'obsidian';
import { EditorSuggest } from 'obsidian';
import { EventTagsManage } from '../event-tags-manage';

class SuggestInfo {
	tagName: string;
	context: EditorSuggestContext;

	constructor(tagName: string, context: EditorSuggestContext) {
		this.tagName = tagName;
		this.context = context;
	}
}

/**
 * markdown block中的tag suggestion
 */
export class MarkdownBlockTagSuggestion extends EditorSuggest<SuggestInfo> {
	private _app: App;

	constructor(app: App) {
		super(app);
		this._app = app;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile
	): EditorSuggestTriggerInfo | null {
		// 是否位于markdown block
		const line = editor.getLine(cursor.line);
		const match = line.match(/^(?:tags|eventTags)\s*=\s*(.*)/);

		if (match) {
			// && || !, ()符号
			const blackList = ['&', '|', '!', '(', ')', ' ', '='];
			// 找到正在输入的那个tag
			let start = cursor.ch;
			while (start > 1 && !blackList.includes(line.charAt(start - 1))) {
				start--;
			}

			let end = cursor.ch;
			while (!blackList.includes(line.charAt(end)) && end < line.length) {
				end++;
			}

			const result = {
				start: {
					line: cursor.line,
					ch: start,
				},
				end: {
					line: cursor.line,
					ch: end,
				},
				query: line.substring(start, end),
			};
			return result;
		}
		return null;
	}

	getSuggestions(context: EditorSuggestContext): SuggestInfo[] {
		if (!context.query) {
			return [];
		}

		const tagsMap = EventTagsManage.getInstance().getEventTags();

		const tagSet = new Set<string>();

		// const res: SuggestInfo[] = new Set([]);
		for (const fileTagInfo of tagsMap.values()) {
			// 测试
			for (const eventInfo of fileTagInfo.eventTags) {
				// 事件标签
				for (const eventTag of eventInfo.parsedEventTags || []) {
					if (eventTag.match(new RegExp(context.query))) {
						tagSet.add(eventTag);
					}
				}
			}

			const tags =
				this._app.metadataCache.getFileCache(fileTagInfo.file)?.tags || [];
			const tagArr = tags.map((info) => info.tag);
			for (const fileTag of tagArr) {
				if (fileTag.match(new RegExp(context.query))) {
					tagSet.add(fileTag);
				}
			}
		}

		const tagArr = Array.from(tagSet);
		return tagArr.map((tag) => {
			return new SuggestInfo(tag, context);
		});
	}

	renderSuggestion(value: SuggestInfo, el: HTMLElement) {
		el.setText(value.tagName);
	}

	selectSuggestion(value: SuggestInfo, evt: MouseEvent | KeyboardEvent) {
		// 去掉tag前面的#
		const insertStr = value.tagName.startsWith('#')
			? value.tagName.substring(1)
			: value.tagName;
		const linkResult = `${insertStr}`;
		value.context.editor.replaceRange(
			linkResult,
			value.context.start,
			value.context.end
		);
	}
}
