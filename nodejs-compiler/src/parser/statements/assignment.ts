import type { AssignmentStatement } from '../ast';
import { TokenKind } from '../../lexer/types';

import { createLocation, consume, type ParserContext } from '../context';
import { parseExpression } from '../expressions/expression';

import { parseIdentifier } from '../expressions/term';

export const parseAssignment = (context: ParserContext): AssignmentStatement => {
  const identifier = parseIdentifier(context);

  consume(context)(TokenKind.Equal, 'Expect "=" after identifier.');

  const literal = parseExpression(context);

  return {
    type: 'AssignmentStatement',
    left: identifier,
    right: literal,
    location: createLocation(context, identifier.location.start, literal.location.end),
  };
};
