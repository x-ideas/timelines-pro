import { BaseValue } from './base-value';

export enum DistanceUnit {
	Meter = 'm',
	Kilometer = 'km',
}

/** 是否是距离的单位 */
export function isDistanceUnit(unit: string): boolean {
	return Object.values(DistanceUnit).includes(unit as DistanceUnit);
}

export class DistanceValue extends BaseValue {
	add(aValue: BaseValue): DistanceValue {
		if (aValue.value === 0) {
			return this;
		}

		// 类型是否一致
		if (aValue instanceof DistanceValue) {
			const mindd = this.toMeterDistanceValue();
			const aMin = aValue.toMeterDistanceValue();

			const factor = this.getFactor(this.unit as DistanceUnit);

			// 相加
			return new DistanceValue((mindd.value + aMin.value) / factor, this.unit);
		} else {
			throw new Error(
				`不同类型的值不能相加: ${this.toString()}, ${aValue.toString()}`
			);
		}
	}

	subtract(aValue: DistanceValue): BaseValue {
		return this.add(new DistanceValue(-aValue.value, aValue.unit));
	}

	clone(): DistanceValue {
		return new DistanceValue(this.value, this.unit);
	}

	toMeterDistanceValue() {
		const factor = this.getFactor(this.unit as DistanceUnit);
		const dd = this.getFactor(DistanceUnit.Meter);

		return new DistanceValue((this.value * factor) / dd, DistanceUnit.Meter);
	}

	/**
	 * 基本单位，看作是米
	 */
	getFactor(fromUnit: DistanceUnit, toUnit = DistanceUnit.Meter) {
		switch (fromUnit) {
			case DistanceUnit.Meter:
				return 1;
			case DistanceUnit.Kilometer:
				return 1000;
			default:
				throw new Error(`未知的长度单位: ${this.unit}`);
		}
	}

	toString(): string {
		if (this.unit === DistanceUnit.Meter) {
			// 防止m被dataview当作是时间单位
			return `${this.value}米`;
		}
		return super.toString();
	}
}
