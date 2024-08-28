import { getTimelineEventMomentTime } from '../timeline-event';
import { describe, it, expect } from 'vitest';

describe('timeline-event', () => {
	describe('getTimelineEventMomentTime', () => {
		it('701', () => {
			const res = getTimelineEventMomentTime('701');

			expect(res?.format('YYYY-MM-DD')).toBe('0701-01-01');
		});
	});
});
