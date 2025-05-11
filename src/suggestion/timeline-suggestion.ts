import type {
	Editor,
	EditorPosition,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from 'obsidian';
import { EditorSuggest } from 'obsidian';

class SuggestInfo {
	tagName: string;
	context: EditorSuggestContext;

	constructor(tagName: string, context: EditorSuggestContext) {
		this.tagName = tagName;
		this.context = context;
	}
}

const Keys = [
	'data-event-tags',
	'data-date',
	'data-date-end',
	'data-date-description',
	'data-title',
	'data-name',
	// 'data-value',
	// 'data-time-cost',
	'data-milestone',
];

/**
 * timeline 输入时的key提示
 */
export class TimelineSuggestion extends EditorSuggest<SuggestInfo> {
	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_file: TFile | null,
	): EditorSuggestTriggerInfo | null {
		const line = editor.getLine(cursor.line);

		const match = line.match(/<span class=['"]ob-timelines['"](.*?)/);

		if (!match || match.index === undefined) {
			return null;
		}

		const remainProperties = new Set(Keys);
		const matchedStr = match[1] || '';

		// 标签关闭
		if (matchedStr.includes('>')) {
			return null;
		}

		// 已经输入的属性
		const matchedKeyArr = matchedStr
			.split(' ')
			.filter((item) => !!item)
			.map((item) => {
				const keys = item.split('=');
				return keys[0];
			})
			.filter((item) => !!item);

		// 并且cursor前面是 "空格
		for (const inputedKey of matchedKeyArr) {
			remainProperties.delete(inputedKey);
		}

		// console.log('输入的属性', matchedKeyArr, remainProperties);
		const charBeforeCursor = editor.getRange(
			{
				line: cursor.line,
				ch: 0,
			},
			cursor,
		);

		const query = charBeforeCursor.match(/['"]\s((?:\w+-?)+)$/);
		if (query) {
			return {
				start: {
					line: cursor.line,
					ch: cursor.ch - query[1].length,
				},
				end: cursor,
				query: query[1],
			};
		}

		return null;

		// 在<span class=ob-timelines   >之间
	}

	getSuggestions(
		context: EditorSuggestContext,
	): SuggestInfo[] | Promise<SuggestInfo[]> {
		const line = context.editor.getLine(context.start.line);

		const match = line.match(/^<span class=['"]ob-timelines['"](.*?)>/);

		const remainProperties = new Set(Keys);
		const matchedStr = match?.[1] || '';
		// 已经输入的属性
		const matchedKeyArr = matchedStr
			.split(' ')
			.filter((item) => !!item)
			.map((item) => {
				const keys = item.split('=');
				return keys[0];
			})
			.filter((item) => !!item);

		for (const inputedKey of matchedKeyArr) {
			remainProperties.delete(inputedKey);
		}

		return Array.from(remainProperties)
			.filter((key) => {
				return key.match(new RegExp(context.query));
			})
			.map((key) => {
				return new SuggestInfo(key, context);
			});
	}

	renderSuggestion(value: SuggestInfo, el: HTMLElement): void {
		el.setText(value.tagName);
	}

	selectSuggestion(value: SuggestInfo, _evt: MouseEvent | KeyboardEvent): void {
		// tag=''
		// 增加=''
		value.context.editor.replaceRange(
			value.tagName + "=''",
			value.context.start,
			value.context.end,
		);
		value.context.editor.setCursor({
			line: value.context.end.line,
			ch: value.context.start.ch + value.tagName.length + 2,
		});
	}
}
