import { createError } from '../../error';
import { TokenKind } from '../../lexer/types';

import type { Literal } from '../ast';
import { advance, check, createLocation, peek, type ParserContext } from '../context';

export const parseLiteral = (context: ParserContext, message?: string): Literal => {
  if (check(context)(TokenKind.Number)) {
    const token = advance(context);

    return {
      type: 'Literal',
      value: Number(token.lexeme),
      location: createLocation(context),
    };
  }

  if (check(context)(TokenKind.String)) {
    const token = advance(context);

    return {
      type: 'Literal',
      value: token.lexeme.slice(1, -1), // Remove quotes
      location: createLocation(context),
    };
  }

  if (check(context)(TokenKind.True)) {
    advance(context);

    return {
      type: 'Literal',
      value: true,
      location: createLocation(context),
    };
  }

  if (check(context)(TokenKind.False)) {
    advance(context);

    return {
      type: 'Literal',
      value: false,
      location: createLocation(context),
    };
  }

  if (check(context)(TokenKind.Nil)) {
    advance(context);

    return {
      type: 'Literal',
      value: null,
      location: createLocation(context),
    };
  }

  const token = peek(context);

  throw createError(message ?? 'Expect literal.', {
    file: context.filePath,
    start: token.start,
    end: token.end,
  });
};
