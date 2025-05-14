import { TokenKind, Primitives } from '../../lexer/types';
import { Identifier, Literal } from '../ast';
import { checkAny, ParserContext, peek } from '../context';
import { CompilerError, createError } from '../../error';
import { check, createLocation, previous, advance, consume } from '../context';

export const parseTerm = (context: ParserContext, message?: string): Literal | Identifier => {
  if (checkAny(context)(...Primitives)) {
    return parseLiteral(context, message);
  }

  if (check(context)(TokenKind.Identifier)) {
    return parseIdentifier(context);
  }

  const previousToken = previous(context);

  throw new CompilerError('Expect term.', {
    file: context.filePath,
    start: previousToken.start,
    end: previousToken.end,
  });
};

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

export const parseIdentifier = (context: ParserContext, message?: string): Identifier => {
  const token = consume(context)(
    TokenKind.Identifier,
    message ?? `Expected identifier, got ${peek(context).lexeme}`
  );

  return {
    type: 'Identifier',
    name: token.lexeme,
    location: createLocation(context),
  };
};
