import { parseTimelineDateElements } from '../time';

describe('time', () => {
	describe('parseTimelineDateElements', () => {
		it('701', () => {
			const result = parseTimelineDateElements('701');
			expect(result).toMatchObject({
				year: '701',
				month: '01',
				day: '01',
				hour: '00',
			});
		});
	});
});
