import { Location, Token, TokenKind } from '../../lexer/types';
import { createError } from '../../error';

import { ParserContext } from '.';

export const isAtEnd = (context: ParserContext): boolean =>
  context.current === context.tokens.length - 1;

export const peek = (context: ParserContext): Token => context.tokens[context.current];

export const advance = (context: ParserContext): Token => {
  if (!isAtEnd(context)) {
    context.current++;
  }

  return context.tokens[context.current - 1];
};

export const previous = (context: ParserContext): Token => {
  if (context.current === 0) {
    throw createError('No previous token', {
      file: context.filePath,
      start: 0,
      end: 0,
    });
  }

  return context.tokens[context.current - 1];
};

export const check =
  (context: ParserContext) =>
  (kind: TokenKind): boolean => {
    if (isAtEnd(context)) {
      return false;
    }

    return peek(context).kind === kind;
  };

export const checkAndAdvance =
  (context: ParserContext) =>
  (kind: TokenKind): boolean => {
    if (check(context)(kind)) {
      advance(context);

      return true;
    }

    return false;
  };

export const checkAny =
  (context: ParserContext) =>
  (...kinds: TokenKind[]): boolean => {
    if (isAtEnd(context)) {
      return false;
    }

    return kinds.includes(peek(context).kind);
  };

export const checkNewline = (context: ParserContext): boolean => {
  if (isAtEnd(context)) {
    return false;
  }

  const token = peek(context);

  return token.kind === TokenKind.Semicolon;
};

export const consume =
  (context: ParserContext) =>
  (type: TokenKind, message: string): Token => {
    if (check(context)(type)) {
      return advance(context);
    }

    const token = peek(context);

    throw createError(message, {
      file: context.filePath,
      start: token.start,
      end: token.end,
    });
  };

export const createLocation = (context: ParserContext, start?: number, end?: number): Location => {
  const previousToken = previous(context);

  return {
    start: start ?? previousToken.start,
    end: end ?? previousToken.end,
    file: context.filePath,
  };
};
