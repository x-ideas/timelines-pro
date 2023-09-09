import type { TimelinesSettings } from './types';

export const DEFAULT_SETTINGS: TimelinesSettings = {
	timelineTag: 'timeline',
	sortDirection: true,

	noTag: 'none',
};

export const RENDER_TIMELINE =
	/<!--TIMELINE BEGIN source=['"]([^"]*?)['"]-->([\s\S]*?)<!--TIMELINE END-->/i;
