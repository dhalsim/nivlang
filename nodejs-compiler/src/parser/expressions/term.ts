import { TokenKind, Primitives } from '../../lexer/types';
import type { Identifier, Literal } from '../ast';
import { checkAny, type ParserContext, peek } from '../context';
import { CompilerError } from '../../error';
import { check, createLocation, previous, consume } from '../context';
import { parseLiteral } from './literal';

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
