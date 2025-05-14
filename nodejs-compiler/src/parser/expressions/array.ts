import { TokenKind } from '../../lexer/types';
import { Expression } from '../ast';
import { CompilerError } from '../../error';
import { check, previous, ParserContext, advance } from '../context';

/*
 * Parses an array literal or array indexing expression.
 */
export const parseArray = (
  context: ParserContext,
  parseExpression: (context: ParserContext) => Expression
): Expression => {
  const leftBracket = advance(context); // Consume '['

  // If we see a right bracket immediately, this is an empty array
  if (check(context)(TokenKind.RightBracket)) {
    const rightBracket = advance(context); // Consume ']'

    return {
      type: 'ArrayExpression',
      elements: [],
      location: {
        start: leftBracket.start,
        end: rightBracket.end,
        file: context.filePath,
      },
    };
  }

  // Parse array elements
  const elements: Expression[] = [];
  do {
    elements.push(parseExpression(context));
  } while (check(context)(TokenKind.Comma) && advance(context));

  // Expect closing bracket
  if (!check(context)(TokenKind.RightBracket)) {
    const previousToken = previous(context);

    throw new CompilerError('Expect "]" after array elements.', {
      file: context.filePath,
      start: previousToken.start,
      end: previousToken.end,
    });
  }

  const rightBracket = advance(context); // Consume ']'

  return {
    type: 'ArrayExpression',
    elements,
    location: {
      start: leftBracket.start,
      end: rightBracket.end,
      file: context.filePath,
    },
  };
};
