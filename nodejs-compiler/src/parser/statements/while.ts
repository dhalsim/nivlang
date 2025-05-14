import { TokenKind } from '../../lexer/types';

import { parseExpression } from '../expressions/expression';
import { Statement } from '../ast';
import { createLocation, consume } from '../context';

import { parseBlock } from './block';
import { ParserContext } from '../context';

export const parseWhileStatement = (context: ParserContext): Statement => {
  const condition = parseExpression(context);

  consume(context)(TokenKind.LeftBrace, 'Expected "{" after "while" condition');

  const body = parseBlock(context)();

  return {
    type: 'WhileStatement',
    condition,
    body,
    location: createLocation(context),
  };
};
