import { describe, test, expect } from '@jest/globals';

import { getTokens } from '../../compiler';

import { createParserContext } from '../context';

import { parseLiteral } from './literal';

describe('Binary Expression', () => {
  test('should parse a number literal', () => {
    const source = '42';
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');
    const result = parseLiteral(context);

    expect(result).toEqual({
      type: 'Literal',
      value: 42,
      location: {
        start: 0,
        end: 2,
        file: 'test.nl',
      },
    });
  });

  test('should parse a string literal', () => {
    const source = '"hello"';
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');
    const result = parseLiteral(context);

    expect(result).toEqual({
      type: 'Literal',
      value: 'hello',
      location: {
        start: 0,
        end: 7,
        file: 'test.nl',
      },
    });
  });
});
