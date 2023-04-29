import { TagSelectExp } from '../tag-select-exp';

describe('tag select测试', () => {
	const eventTags = '南明史;书籍;其他;读书笔记';
	test('单个selectTag', () => {
		const exsit = new TagSelectExp('书籍');
		expect(exsit.test(eventTags)).toBe(true);

		const notExsit = new TagSelectExp('书籍1');
		expect(notExsit.test(eventTags)).toBe(false);

		const notExsit2 = new TagSelectExp('书籍1;书籍2');
		expect(notExsit2.test(eventTags)).toBe(false);

		const notBook = new TagSelectExp('!书籍');
		expect(notBook.test(eventTags)).toBe(false);
		expect(notBook.test('南明史;其他')).toBe(true);
	});

	test('selectTag 逻辑运算"', () => {
		const condition1 = new TagSelectExp('书籍 && 其他');
		expect(condition1.test('南明史;书籍;其他;读书笔记')).toBe(true);
		expect(condition1.test('南明史;书籍;读书笔记')).toBe(false);

		const condition2 = new TagSelectExp('书籍 || 其他');
		expect(condition2.test('南明史;书籍;其他;读书笔记')).toBe(true);
		expect(condition2.test('南明史;书籍;读书笔记')).toBe(true);

		const condition3 = new TagSelectExp('!其他');
		expect(condition3.test('南明史;书籍;其他;读书笔记')).toBe(false);
		expect(condition3.test('南明史;书籍;读书笔记')).toBe(true);

		const condition4 = new TagSelectExp('书籍 && !其他');
		expect(condition4.test('南明史;书籍;其他;读书笔记')).toBe(false);
		expect(condition4.test('南明史;书籍;读书笔记')).toBe(true);

		const condition5 = new TagSelectExp('书籍 || !其他');
		expect(condition5.test('南明史;书籍;其他;读书笔记')).toBe(true);
		expect(condition5.test('南明史;读书笔记')).toBe(true);

		const condition6 = new TagSelectExp('书籍 && (其他 || 读书笔记)');
		expect(condition6.test('南明史;书籍')).toBe(false);
		expect(condition6.test('南明史;书籍;其他')).toBe(true);
		expect(condition6.test('南明史;书籍;读书笔记')).toBe(true);

		const condition7 = new TagSelectExp(
			'书籍 && (其他 || (读书笔记 && 南明史))'
		);
		expect(condition7.test('其他;书籍')).toBe(true);
		expect(condition7.test('南明史;书籍')).toBe(false);
		expect(condition7.test('读书笔记;书籍')).toBe(false);
		expect(condition7.test('南明史;书籍;读书笔记')).toBe(true);
	});
});
