import type * as _babel_types from '@babel/types';
import { minimatch } from 'minimatch';
import * as parser from '@babel/parser';

type ITagSelectExpOpt = {
	//
};

/**
 * 标签选择表达式,支持逻辑运算，括号
 * @example
 *  a && (b || !c)
 */
export class TagSelectExp {
	private _exp: string;
	private _opt?: ITagSelectExpOpt;

	private _parseResult?: ReturnType<typeof parser.parse>;

	private testExpression?: Expression;

	constructor(exp: string, opt?: ITagSelectExpOpt) {
		this._exp = exp;
		this._opt = opt;
	}

	test(testStr: string): boolean {
		if (!this._parseResult) {
			this.buildParser();
		}

		return this.testExpression?.run(testStr) || false;
	}

	private buildParser() {
		try {
			this._parseResult = parser.parse(this._exp);

			// 找到第一个表达式
			const firstExpression = this._parseResult.program.body.findIndex(
				(item) => {
					return item.type === 'ExpressionStatement';
				}
			);
			if (firstExpression === -1) {
				throw new Error('表达式解析失败: 未找到表达式');
			}

			this.testExpression = transform(
				(
					this._parseResult.program.body[
						firstExpression
					] as _babel_types.ExpressionStatement
				).expression
			);
		} catch (error: any) {
			throw new Error(`表达式解析失败: ${error?.message}`);
		}
	}
}

function transform(ast: _babel_types.Expression): Expression {
	switch (ast.type) {
		case 'LogicalExpression':
			// && 和 ||
			return new LogicalExpression(
				ast.operator,
				transform(ast.left),
				transform(ast.right)
			);

		// !a
		case 'UnaryExpression':
			return new UnaryExpression(ast.operator, transform(ast.argument));

		// a
		case 'Identifier':
			return new Identifier(ast.name);

		// a/b 层级标签
		case 'BinaryExpression':
			// 看成是identifier:
			return new BinaryExpression(
				ast.operator,
				transform(ast.left),
				transform(ast.right)
			);

		case 'NumericLiteral':
			return new Identifier(ast.value.toString());

		default:
			throw new Error(`不支持的ast类型: ${JSON.stringify(ast)}`);
	}
}

abstract class Expression {
	pattern: string;

	constructor(pattern: string) {
		this.pattern = pattern;
	}

	abstract run(testStr: string): boolean;

	abstract getPattern(): string;
}

class LogicalExpression extends Expression {
	left: Expression;
	right: Expression;
	operator: _babel_types.LogicalExpression['operator'];

	constructor(
		operator: _babel_types.LogicalExpression['operator'],
		left: Expression,
		right: Expression
	) {
		super('');
		this.operator = operator;
		this.left = left;
		this.right = right;
	}

	run(testStr: string) {
		switch (this.operator) {
			case '&&':
				return this.left.run(testStr) && this.right.run(testStr);
			case '||':
				return this.left.run(testStr) || this.right.run(testStr);
			default:
				throw new Error('不支持的运算符');
		}
	}

	getPattern(): string {
		return this.left.getPattern() + this.operator + this.right.getPattern();
	}
}

class UnaryExpression extends Expression {
	operator: _babel_types.UnaryExpression['operator'];

	expression: Expression;

	constructor(
		operator: _babel_types.UnaryExpression['operator'],
		expression: Expression
	) {
		super('');
		this.operator = operator;
		this.expression = expression;
	}

	override run(testStr: string) {
		switch (this.operator) {
			case '!':
				return !this.expression.run(testStr);
			default:
				throw new Error(`不支持的UnaryExpression运算符: ${this.operator}`);
		}
	}

	getPattern(): string {
		return this.operator + this.expression.getPattern();
	}
}

class Identifier extends Expression {
	pattern: string;

	constructor(pattern: string) {
		super(pattern);
		this.pattern = pattern;
	}

	run(testStr: string) {
		const tags = testStr.split(';');
		return tags.some((tag) => minimatch(tag, this.pattern));
	}

	getPattern(): string {
		return this.pattern;
	}
}

/**
 * 因为一些标签有层级关系(a/b)
 */
class BinaryExpression extends Expression {
	left: Expression;
	right: Expression;
	operator: _babel_types.BinaryExpression['operator'];

	constructor(
		operator: _babel_types.BinaryExpression['operator'],
		left: Expression,
		right: Expression
	) {
		super('');
		this.operator = operator;
		this.left = left;
		this.right = right;
	}

	getPattern(): string {
		return this.left.getPattern() + this.operator + this.right.getPattern();
	}

	run(testStr: string) {
		switch (this.operator) {
			case '/': {
				const identifier = new Identifier(this.getPattern());
				return identifier.run(testStr);
			}

			default:
				throw new Error(`unsupported Binary operator: ${this.operator}`);
		}
	}
}
