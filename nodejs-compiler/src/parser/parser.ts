import { TokenKind } from '../lexer/types';
import { createError } from '../error';
import { Declaration, Program } from './ast';

import { functionDeclaration } from './declarations/function';
import { typeDeclaration } from './declarations/type';
import { check, createLocation, isAtEnd, ParserContext, previous, advance } from './context';

export const parser = (context: ParserContext): Program => {
  const declarations: Declaration[] = [];

  while (!isAtEnd(context)) {
    declarations.push(declaration(context));
  }

  return {
    type: 'Program',
    declarations,
    location: createLocation(context, 0, previous(context).end),
  };
};

function declaration(context: ParserContext): Declaration {
  // Optional type declaration for functions
  if (check(context)(TokenKind.Type)) {
    advance(context);

    const td = typeDeclaration(context);

    if (td.type === 'FunctionTypeDeclaration') {
      if (check(context)(TokenKind.Func)) {
        advance(context);

        return functionDeclaration(context)(td);
      } else {
        throw createError('Expected function declaration after type declaration', {
          file: context.filePath,
          start: td.location.start,
          end: td.location.end,
        });
      }
    }

    return td;
  }

  if (check(context)(TokenKind.Func)) {
    advance(context);

    return functionDeclaration(context)();
  }

  const previousToken = previous(context);

  throw createError('Expected type or function declaration', {
    file: context.filePath,
    start: previousToken.start,
    end: previousToken.end,
  });
}
