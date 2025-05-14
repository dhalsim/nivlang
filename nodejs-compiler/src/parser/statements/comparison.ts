import { TokenKind } from '../../lexer/types';
import { Expression } from '../ast';

import { checkAny, createLocation, ParserContext, previous } from '../context';
import { parseTerm } from '../expressions/term';
import { createError } from '../../error';

export const parseComparison = (context: ParserContext): Expression => {
  const left = parseTerm(context, 'Expect a term in comparison.');

  if (
    checkAny(context)(
      TokenKind.Greater,
      TokenKind.GreaterEqual,
      TokenKind.Less,
      TokenKind.LessEqual
    )
  ) {
    const operator = previous(context).lexeme;
    const right = parseTerm(context, 'Expect a term in comparison.');

    return {
      type: 'BinaryExpression',
      left,
      operator,
      right,
      location: createLocation(context),
    };
  }

  const previousToken = previous(context);

  throw createError('Expect comparison operator.', {
    file: context.filePath,
    start: previousToken.start,
    end: previousToken.end,
  });
};
