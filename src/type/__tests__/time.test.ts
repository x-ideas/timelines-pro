import { hasTimeRangeIntersection, parseTimelineDateElements } from '../time';

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

	describe('hasTimeRangeIntersection', () => {
		it('sss', () => {
			expect(
				hasTimeRangeIntersection(
					['1646/10', '1662/3'],
					// 开区间
					['1645/07/27', undefined]
				)
			).toBe(true);
		});
	});
});
