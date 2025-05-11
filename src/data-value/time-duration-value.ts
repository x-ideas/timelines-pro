import { BaseValue } from './base-value';

export enum TimeDurationUnit {
	Second = 'sec',
	Minute = 'min',
	Hour = 'h',
	Day = 'd',
	Week = 'w',
	Month = 'mo',
	Year = 'yr',
}

/** 是否是时间长度的单位 */
export function isTimeDurationUnit(unit: string): boolean {
	return Object.values(TimeDurationUnit).includes(unit as TimeDurationUnit);
}

/**
 * 时长
 */
export class TimeDurationValue extends BaseValue {
	add(aValue: BaseValue): TimeDurationValue {
		if (aValue.value === 0) {
			return this;
		}

		// 类型是否一致
		if (isTimeDurationUnit(aValue.unit)) {
			const mindd = this.toMinTimeDurationValue();
			const aMin = (aValue as TimeDurationValue).toMinTimeDurationValue();

			// 相加
			return new TimeDurationValue(
				mindd.value + aMin.value,
				TimeDurationUnit.Minute,
			);
		} else {
			throw new Error(
				`不同类型的值不能相加: ${this.toString()}, ${aValue.toString()}`,
			);
		}
	}

	subtract(aValue: TimeDurationValue): BaseValue {
		return this.add(new TimeDurationValue(-aValue.value, aValue.unit));
	}

	clone(): TimeDurationValue {
		return new TimeDurationValue(this.value, this.unit);
	}

	/** 转换为分钟 */
	toMinTimeDurationValue() {
		const factor = this.getFactor(this.unit as TimeDurationUnit);
		const minToSecondFactor = this.getFactor(TimeDurationUnit.Minute);

		return new TimeDurationValue(
			(this.value * factor) / minToSecondFactor,
			TimeDurationUnit.Minute,
		);
	}

	/**
	 * 获取转换到second的因子
	 */
	getFactor(fromUnit: TimeDurationUnit, _toUnit = TimeDurationUnit.Second) {
		switch (fromUnit) {
			case TimeDurationUnit.Second:
				return 1;
			case TimeDurationUnit.Minute:
				return 60;
			case TimeDurationUnit.Hour:
				return 60 * 60;
			case TimeDurationUnit.Day:
				return 60 * 60 * 24;
			case TimeDurationUnit.Week:
				return 60 * 60 * 24 * 7;
			case TimeDurationUnit.Month:
				return 60 * 60 * 24 * 30;
			case TimeDurationUnit.Year:
				return 60 * 60 * 24 * 365;
			default:
				throw new Error(`未知的时间单位: ${this.unit}`);
		}
	}
}
