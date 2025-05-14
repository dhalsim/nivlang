import { expect, test, describe } from '@jest/globals';

import { consume, createLocation, createParserContext } from '../context';
import { parseIfStatement } from './if';

import { getTokens } from '../../compiler';
import { TokenKind } from '../../lexer/types';

describe('parseIfStatement', () => {
  test('should parse an if statement', () => {
    const source = 'if x > 0 { return x }';

    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');

    consume(context)(TokenKind.If, 'Expected "if" keyword');
    const result = parseIfStatement(context);

    expect(result).toEqual({
      type: 'IfStatement',
      condition: {
        type: 'BinaryExpression',
        left: {
          type: 'Identifier',
          name: 'x',
          location: {
            file: 'test.nl',
            start: 3,
            end: 4,
          },
        },
        operator: '>',
        right: {
          type: 'Literal',
          value: 0,
          location: {
            file: 'test.nl',
            start: 7,
            end: 8,
          },
        },
        location: {
          file: 'test.nl',
          start: 3,
          end: 8,
        },
      },
      thenBranch: {
        type: 'BlockStatement',
        statements: [],
        returnExpression: {
          type: 'ReturnExpression',
          expression: {
            type: 'Identifier',
            name: 'x',
            location: {
              file: 'test.nl',
              start: 18,
              end: 19,
            },
          },
          location: {
            file: 'test.nl',
            start: 11,
            end: 19,
          },
        },
        location: {
          file: 'test.nl',
          start: 9,
          end: 21,
        },
      },
      elseBranch: undefined,
      location: createLocation(context),
    });
  });

  test('a function call is not permitted as a condition', () => {
    const source = 'if someFunc() { return 1 }';

    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');

    expect(() => parseIfStatement(context)).toThrow();
  });
});
