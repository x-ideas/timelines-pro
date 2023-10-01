import { ScalarUnit, type BaseValue } from './base-value';
import type { DistanceUnit } from './distance-value';
import { DistanceValue, isDistanceUnit } from './distance-value';
import { ScalarValue } from './scalar-value';
import type { TimeDurationUnit } from './time-duration-value';
import { TimeDurationValue, isTimeDurationUnit } from './time-duration-value';

/**
 * 解析数据值
 */
export function parserDataValue(val?: string): BaseValue {
	// const reg = /^(-?\d+\.?\d+)\s*([a-zA-Z]+)?$/;
	const reg = /^(-?\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/;
	if (!val) {
		return new ScalarValue(0, ScalarUnit.None);
	}

	const match = val.match(reg);
	if (!match) {
		return new ScalarValue(0, ScalarUnit.None);
	}

	const value = Number(match[1]);
	const unit = match[2] || ScalarUnit.None;

	if (isTimeDurationUnit(unit)) {
		return new TimeDurationValue(value, unit as TimeDurationUnit);
	}

	if (isDistanceUnit(unit)) {
		return new DistanceValue(value, unit as DistanceUnit);
	}

	return new ScalarValue(value, ScalarUnit.None);
}
