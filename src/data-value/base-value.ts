import type { DistanceUnit } from './distance-value';
import type { TimeDurationUnit } from './time-duration-value';

export enum ScalarUnit {
	/** 无单位 */
	None = 'none',
}

export type ValueUnit = DistanceUnit | TimeDurationUnit | ScalarUnit;

export abstract class BaseValue {
	/** 单位 */
	unit: ValueUnit;
	/** 具体的值 */
	value: number;

	constructor(value: number, unit: ValueUnit) {
		this.value = value;
		this.unit = unit;
	}

	abstract add(aValue: BaseValue): BaseValue;

	abstract subtract(aValue: BaseValue): BaseValue;

	abstract clone(): BaseValue;
	toString() {
		return `${this.value}${this.unit}`;
	}
}
