import { TokenKind } from '../../lexer/types';
import { Expression } from '../ast';
import { CompilerError } from '../../error';
import { check, previous, ParserContext, advance } from '../context';
import { parseExpression } from './expression';

export const parseCall = (context: ParserContext, callee: Expression): Expression => {
  const args: Expression[] = [];

  // Parse arguments
  if (!check(context)(TokenKind.RightParen)) {
    do {
      args.push(parseExpression(context));
    } while (check(context)(TokenKind.Comma) && advance(context));
  }

  // Expect closing parenthesis
  if (!check(context)(TokenKind.RightParen)) {
    const previousToken = previous(context);

    throw new CompilerError('Expect ")" after arguments.', {
      file: context.filePath,
      start: previousToken.start,
      end: previousToken.end,
    });
  }

  const paren = advance(context); // Consume ')'

  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    location: {
      start: callee.location.start,
      end: paren.end,
      file: context.filePath,
    },
  };
};
