import { TokenKind, Primitives } from '../../lexer/types';
import type { Expression } from '../ast';
import { CompilerError } from '../../error';
import { check, previous, type ParserContext, advance, checkAny } from '../context';
import { parseTerm } from './term';
import { parseCall } from './call';
import { parseMember } from './member';
import { parseObjectLiteral } from './object';

/*
 * Parses a primary expression:
 * - Literals (numbers, strings, booleans)
 * - Identifiers (variables, function names)
 * - Parenthesized expressions
 * Then handles any following:
 * - Function calls (e.g., func())
 * - Member access (e.g., obj.prop, arr[index])
 */
export const parsePrimary = (
  context: ParserContext,
  parseExpression: (context: ParserContext) => Expression
): Expression => {
  let expr: Expression;

  // Handle literals and identifiers
  if (checkAny(context)(...Primitives, TokenKind.Identifier)) {
    expr = parseTerm(context);
  }
  // Handle object literals
  else if (check(context)(TokenKind.LeftBrace)) {
    advance(context); // Consume '{'
    expr = parseObjectLiteral(context);
  }
  // Handle parenthesized expressions
  else if (check(context)(TokenKind.LeftParen)) {
    const leftParen = advance(context); // Consume '('
    expr = parseExpression(context);

    // Expect closing parenthesis
    if (!check(context)(TokenKind.RightParen)) {
      const previousToken = previous(context);

      throw new CompilerError('Expect ")" after expression.', {
        file: context.filePath,
        start: previousToken.start,
        end: previousToken.end,
      });
    }

    const rightParen = advance(context); // Consume ')'

    // Update location to include parentheses
    expr = {
      ...expr,
      location: {
        start: leftParen.start,
        end: rightParen.end,
        file: context.filePath,
      },
    };
  } else {
    const previousToken = previous(context);

    throw new CompilerError('Expect expression.', {
      file: context.filePath,
      start: previousToken.start,
      end: previousToken.end,
    });
  }

  // Handle member expressions and function calls
  // This loop allows chaining like: obj.prop.method()[0]
  while (
    check(context)(TokenKind.LeftParen) ||
    check(context)(TokenKind.Dot) ||
    check(context)(TokenKind.LeftBracket)
  ) {
    if (check(context)(TokenKind.LeftParen)) {
      advance(context); // Consume '('
      expr = parseCall(context, expr);
    } else {
      expr = parseMember(context, expr);
    }
  }

  return expr;
};
