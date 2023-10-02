import type {
	App,
	Editor,
	EditorPosition,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from 'obsidian';
import { EditorSuggest } from 'obsidian';
import { EventTagsManage } from 'src/event-tags-manage';

class SuggestInfo {
	tagName: string;
	context: EditorSuggestContext;

	constructor(tagName: string, context: EditorSuggestContext) {
		this.tagName = tagName;
		this.context = context;
	}
}

/**
 * 标签 suggestion
 */
export class TagSuggestions extends EditorSuggest<SuggestInfo> {
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
		// _data-event-tags="x"_>
		// 在x处触发
		const line = editor.getLine(cursor.line);

		// 是否data-event-tags=''
		const triggerPrefix = ' data-event-tags=';
		const match = line.match(/\sdata-event-tags=['"]([^]*?)['"]/);
		if (!match || match.index === undefined) {
			return null;
		}

		// 从0开始
		const eventTagsStartIndex = match.index + triggerPrefix.length;
		const eventTagsStr = match[1];

		const tags = eventTagsStr.split(';');
		let start = 0;
		let length = 0;
		let query = '';

		// 光标偏移量（从='后面开始算起
		const cursorOffset = cursor.ch - 1 - eventTagsStartIndex;
		let sumOffset = 0;
		for (let index = 0; index < tags.length; index++) {
			const nextTagLength = tags[index].length;
			const nextOffset = nextTagLength + sumOffset;

			if (cursorOffset >= sumOffset && cursorOffset <= nextOffset) {
				// 找到区间, 增加1为;的位子
				length = nextTagLength;
				start = sumOffset;
				query = tags[index];
				break;
			} else {
				sumOffset += nextTagLength;
				// 每个增加一个;的位子
				if (index < tags.length - 1) {
					sumOffset += 1;
				}
			}
		}

		if (!length) {
			return null;
		}

		const dd = {
			start: {
				line: cursor.line,
				ch: eventTagsStartIndex + 1 + start,
			},
			end: {
				line: cursor.line,
				ch: eventTagsStartIndex + 1 + start + length,
			},
			query: query,
		};
		return dd;
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
		const linkResult = `${insertStr};`;
		value.context.editor.replaceRange(
			linkResult,
			value.context.start,
			value.context.end
		);
	}
}
