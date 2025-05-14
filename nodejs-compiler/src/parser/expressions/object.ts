import { TokenKind } from '../../lexer/types';
import { Expression, ObjectExpression } from '../ast';
import { check, ParserContext, advance, consume, peek } from '../context';
import { parseExpression } from './expression';

export const parseObjectLiteral = (context: ParserContext): ObjectExpression => {
  const leftBrace = advance(context);
  const properties: { [key: string]: Expression } = {};

  // Parse properties
  if (!check(context)(TokenKind.RightBrace)) {
    do {
      // Parse property name
      const name = consume(context)(
        TokenKind.Identifier,
        'Expected property name, got ' + peek(context).lexeme
      );

      // If there's a colon, parse the value expression
      if (check(context)(TokenKind.Colon)) {
        advance(context); // Consume ':'
        properties[name.lexeme] = parseExpression(context);
      } else {
        // No colon means use the identifier as both name and value
        properties[name.lexeme] = {
          type: 'Identifier',
          name: name.lexeme,
          location: {
            start: name.start,
            end: name.end,
            file: context.filePath,
          },
        };
      }
    } while (check(context)(TokenKind.Comma) && advance(context));
  }

  // Expect closing brace
  const end = consume(context)(TokenKind.RightBrace, 'Expected } after object literal').end;

  return {
    type: 'ObjectExpression',
    properties,
    location: {
      start: leftBrace.start,
      end,
      file: context.filePath,
    },
  };
};
