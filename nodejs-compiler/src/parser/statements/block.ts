import { ReturnExpression, Statement } from '../ast';
import { BlockStatement } from '../ast';
import { TokenKind } from '../../lexer/types';

import {
  ParserContext,
  advance,
  check,
  checkAny,
  consume,
  createLocation,
  peek,
  previous,
} from '../context';

import { parseStatement } from './index';
import { parseReturnExpression } from './return';

export const parseBlock = (context: ParserContext) => (): BlockStatement => {
  const previousToken = previous(context);

  const statements: Statement[] = [];

  while (!checkAny(context)(TokenKind.RightBrace, TokenKind.Return)) {
    statements.push(parseStatement(context));
  }

  let returnExpression: ReturnExpression | undefined;
  if (check(context)(TokenKind.Return)) {
    advance(context);

    returnExpression = parseReturnExpression(context);
  }

  consume(context)(TokenKind.RightBrace, 'Expected "}" after a block');

  return {
    type: 'BlockStatement',
    statements,
    returnExpression,
    location: createLocation(context, previousToken.start, peek(context).end),
  };
};
