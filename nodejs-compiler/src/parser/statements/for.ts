import { consume, ParserContext, peek } from '../context';
import { createLocation } from '../context';
import { TokenKind } from '../../lexer/types';
import { parseExpression } from '../expressions/expression';
import { Statement } from '../ast';
import { parseBlock } from './block';
import { parseAssignment } from './assignment';

/*
  for i = 0; i < arr.length; i = i + 1 {
    // body
  }
*/
export const parseForStatement = (context: ParserContext): Statement => {
  const initializer = parseAssignment(context);

  consume(context)(
    TokenKind.Semicolon,
    'Expected ";" after initializer for for loop, got ' + peek(context).lexeme
  );

  const condition = parseExpression(context);

  consume(context)(
    TokenKind.Semicolon,
    'Expected ";" after condition for for loop, got ' + peek(context).lexeme
  );

  const increment = parseAssignment(context);

  consume(context)(
    TokenKind.LeftBrace,
    'Expected "{" after increment for for loop, got ' + peek(context).lexeme
  );

  const body = parseBlock(context)();

  return {
    type: 'ForStatement',
    initializer,
    condition,
    increment,
    body,
    location: createLocation(context),
  };
};
