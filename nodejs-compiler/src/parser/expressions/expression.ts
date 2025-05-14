/*
 * Expression Parser
 *
 * This module handles parsing of expressions in the source code.
 * It implements a recursive descent parser that handles:
 * - Primary expressions (literals, identifiers, parenthesized expressions)
 * - Binary expressions (arithmetic and conditional operations)
 * - Function calls
 * - Member access (object properties and array indexing)
 */

import { TokenKind } from '../../lexer/types';
import { Expression } from '../ast';
import { ParserContext, check } from '../context';
import { parseBinary } from './binary';
import { parseCall } from './call';
import { parseMember } from './member';
import { parseObjectLiteral } from './object';
import { parseTemplateLiteral } from './template';
import { parseArray } from './array';
import { parsePrimary } from './primary';

/*
 * Main expression parser entry point.
 * Parses an expression and handles operator precedence.
 * Returns the parsed expression AST node.
 */
export const parseExpression = (context: ParserContext): Expression => {
  if (check(context)(TokenKind.TemplateLiteral)) {
    return parseTemplateLiteral(context);
  }

  if (check(context)(TokenKind.LeftBracket)) {
    return parseArray(context, parseExpression);
  }

  if (check(context)(TokenKind.LeftBrace)) {
    return parseObjectLiteral(context);
  }

  let expr = parsePrimary(context, parseExpression);

  // Handle member expressions and function calls
  // This loop allows chaining like: obj.prop.method()[0]
  while (
    check(context)(TokenKind.LeftParen) ||
    check(context)(TokenKind.Dot) ||
    check(context)(TokenKind.LeftBracket)
  ) {
    if (check(context)(TokenKind.LeftParen)) {
      expr = parseCall(context, expr);
    } else {
      expr = parseMember(context, expr);
    }
  }

  return parseBinary(context, expr, parseExpression);
};
