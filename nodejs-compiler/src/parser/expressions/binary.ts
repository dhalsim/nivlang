import { TokenKind } from '../../lexer/types';
import type { Expression } from '../ast';
import type { ParserContext } from '../context';
import { advance, checkAny, createLocation } from '../context';
import { parsePrimary } from './primary';
import { createError } from '../../error';

const operators: Map<TokenKind, string> = new Map([
  [TokenKind.Plus, '+'],
  [TokenKind.Minus, '-'],
  [TokenKind.Star, '*'],
  [TokenKind.Slash, '/'],
  [TokenKind.EqualEqual, '=='],
  [TokenKind.NotEqual, '!='],
  [TokenKind.Less, '<'],
  [TokenKind.LessEqual, '<='],
  [TokenKind.Greater, '>'],
  [TokenKind.GreaterEqual, '>='],
  [TokenKind.And, '&&'],
  [TokenKind.Or, '||'],
]);

export const parseBinary = (
  context: ParserContext,
  left: Expression,
  parseExpression: (context: ParserContext) => Expression
): Expression => {
  let termCount = 1;

  while (checkAny(context)(...operators.keys())) {
    const operatorKind = advance(context);
    const operator = operators.get(operatorKind.kind);

    if (!operator) {
      throw new Error(`Unknown operator: ${operatorKind.kind}`);
    }

    const right = parsePrimary(context, parseExpression);
    termCount++;

    if (termCount > 2 && !hasParentheses(left) && !hasParentheses(right)) {
      throw createError(
        'You must use parentheses when combining more than 2 terms (e.g. "1 + (2 * 3)")',
        {
          file: context.filePath,
          start: left.location.start,
          end: right.location.end,
        }
      );
    }

    left = {
      type: 'BinaryExpression',
      left,
      operator,
      right,
      location: createLocation(context, left.location.start, right.location.end),
    };
  }

  return left;
};

function hasParentheses(expr: Expression): boolean {
  if (expr.type === 'BinaryExpression') {
    return hasParentheses(expr.left) || hasParentheses(expr.right);
  }

  return false;
}
