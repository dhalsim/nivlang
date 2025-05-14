import { BlockStatement, Expression, Identifier, Literal, Statement } from '../ast';
import { TokenKind } from '../../lexer/types';
import { check, checkAny, createLocation, ParserContext, peek, advance, consume } from '../context';
import { createError } from '../../error';

import { parseIdentifier, parseLiteral } from '../expressions/term';
import { parseBlock } from './block';

export const parseIfStatement = (context: ParserContext): Statement => {
  const condition = parseCondition(context);

  consume(context)(TokenKind.LeftBrace, 'Expected "{" after if condition, before then branch');

  const thenBranch = parseBlock(context)();

  let elseBranch: BlockStatement | undefined;

  if (check(context)(TokenKind.Else)) {
    advance(context);

    consume(context)(TokenKind.LeftBrace, 'Expected "{" after "else" keyword, before else branch');

    elseBranch = parseBlock(context)();
  }

  return {
    type: 'IfStatement',
    condition,
    thenBranch,
    elseBranch,
    location: createLocation(context),
  };
};

export const parseCondition = (context: ParserContext): Expression => {
  const left = parseIdentifier(context, 'Expected identifier for if condition');

  const condition = checkAny(context)(
    TokenKind.Equal,
    TokenKind.NotEqual,
    TokenKind.Greater,
    TokenKind.GreaterEqual,
    TokenKind.Less,
    TokenKind.LessEqual
  );

  if (!condition) {
    const token = peek(context);

    throw createError('If condition must be a boolean expression.', {
      file: context.filePath,
      start: token.start,
      end: token.end,
    });
  }

  const operator = peek(context).lexeme;

  advance(context);

  const right = parseTerm(context);

  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
    location: createLocation(context, left.location.start, right.location.end),
  };
};

export const parseTerm = (context: ParserContext): Literal | Identifier => {
  if (check(context)(TokenKind.Identifier)) {
    return parseIdentifier(context, 'Expected identifier for if condition');
  }

  if (checkAny(context)(TokenKind.Number, TokenKind.String)) {
    return parseLiteral(context, 'Expected literal for if condition');
  }

  const token = peek(context);

  throw createError('If condition must be a boolean expression.', {
    file: context.filePath,
    start: token.start,
    end: token.end,
  });
};
