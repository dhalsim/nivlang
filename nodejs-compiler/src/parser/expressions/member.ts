import { TokenKind } from '../../lexer/types';
import { Expression } from '../ast';
import { CompilerError } from '../../error';
import { check, previous, ParserContext, advance } from '../context';
import { parseExpression } from './expression';

export const parseMember = (context: ParserContext, object: Expression): Expression => {
  // Handle array indexing with [i]
  if (check(context)(TokenKind.LeftBracket)) {
    advance(context); // Consume '['
    const property = parseExpression(context);

    if (!check(context)(TokenKind.RightBracket)) {
      const previousToken = previous(context);

      throw new CompilerError('Expect "]" after array index.', {
        file: context.filePath,
        start: previousToken.start,
        end: previousToken.end,
      });
    }

    const bracket = advance(context); // Consume ']'

    return {
      type: 'MemberExpression',
      object,
      property,
      computed: true,
      location: {
        start: object.location.start,
        end: bracket.end,
        file: context.filePath,
      },
    };
  }

  // Handle object property access with .property
  if (check(context)(TokenKind.Dot)) {
    advance(context); // Consume '.'

    if (!check(context)(TokenKind.Identifier)) {
      const previousToken = previous(context);

      throw new CompilerError('Expect property name after "."', {
        file: context.filePath,
        start: previousToken.start,
        end: previousToken.end,
      });
    }

    const name = advance(context);

    return {
      type: 'MemberExpression',
      object,
      property: {
        type: 'Identifier',
        name: name.lexeme,
        location: {
          start: name.start,
          end: name.end,
          file: context.filePath,
        },
      },
      computed: false,
      location: {
        start: object.location.start,
        end: name.end,
        file: context.filePath,
      },
    };
  }

  const previousToken = previous(context);

  throw new CompilerError('Expect "." or "[" after expression.', {
    file: context.filePath,
    start: previousToken.start,
    end: previousToken.end,
  });
};
