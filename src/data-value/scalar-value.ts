import { BaseValue } from './base-value';

/**
 * 标量
 */
export class ScalarValue extends BaseValue {
	add(aValue: BaseValue): ScalarValue {
		if (aValue instanceof ScalarValue) {
			return new ScalarValue(this.value + aValue.value, this.unit);
		}

		throw new Error('不同类型的值不能相加');
	}

	subtract(aValue: ScalarValue): BaseValue {
		return this.add(new ScalarValue(-aValue.value, aValue.unit));
	}

	clone(): ScalarValue {
		return new ScalarValue(this.value, this.unit);
	}

	toString(): string {
		return `${this.value}`;
	}
}
