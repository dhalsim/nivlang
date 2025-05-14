import { expect, test, describe } from '@jest/globals';

import { consume, createParserContext } from '../../../parser/context';
import { parseBlock } from '../../../parser/statements/block';
import { getTokens } from '../../../compiler';
import { TokenKind } from '../../../lexer/types';

describe('parseBlock', () => {
  test('should parse a block with a return statement', () => {
    const source = `{
  x = 10
  return x
}`;
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');

    consume(context)(TokenKind.LeftBrace, 'Expected "{" before a block');

    const result = parseBlock(context)();

    expect(result).toEqual({
      type: 'BlockStatement',
      statements: [
        {
          type: 'AssignmentStatement',
          left: {
            type: 'Identifier',
            name: 'x',
            location: {
              file: 'test.nl',
              start: 4,
              end: 5,
            },
          },
          right: {
            type: 'Literal',
            value: 10,
            location: {
              file: 'test.nl',
              start: 8,
              end: 10,
            },
          },
          location: {
            file: 'test.nl',
            start: 4,
            end: 10,
          },
        },
      ],
      returnExpression: {
        type: 'ReturnExpression',
        expression: {
          type: 'Identifier',
          name: 'x',
          location: {
            file: 'test.nl',
            start: 20,
            end: 21,
          },
        },
        location: {
          file: 'test.nl',
          start: 13,
          end: 21,
        },
      },
      location: {
        file: 'test.nl',
        start: 0,
        end: 23,
      },
    });
  });

  test('should parse a block without a return statement', () => {
    const source = `{
  x = 10
  y = 20
}`;
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');

    consume(context)(TokenKind.LeftBrace, 'Expected "{" before a block');

    const result = parseBlock(context)();

    expect(result).toEqual({
      type: 'BlockStatement',
      statements: [
        {
          type: 'AssignmentStatement',
          left: {
            type: 'Identifier',
            name: 'x',
            location: {
              file: 'test.nl',
              start: 4,
              end: 5,
            },
          },
          right: {
            type: 'Literal',
            value: 10,
            location: {
              file: 'test.nl',
              start: 8,
              end: 10,
            },
          },
          location: {
            file: 'test.nl',
            start: 4,
            end: 10,
          },
        },
        {
          type: 'AssignmentStatement',
          left: {
            type: 'Identifier',
            name: 'y',
            location: {
              file: 'test.nl',
              start: 13,
              end: 14,
            },
          },
          right: {
            type: 'Literal',
            value: 20,
            location: {
              file: 'test.nl',
              start: 17,
              end: 19,
            },
          },
          location: {
            file: 'test.nl',
            start: 13,
            end: 19,
          },
        },
      ],
      returnExpression: undefined,
      location: {
        file: 'test.nl',
        start: 0,
        end: 21,
      },
    });
  });
});
