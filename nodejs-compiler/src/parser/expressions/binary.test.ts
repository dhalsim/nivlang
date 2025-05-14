import { describe, test, expect } from '@jest/globals';

import { getTokens } from '../../compiler';
import { createParserContext } from '../context';

import { parseExpression } from './expression';
import { parseBinary } from './binary';
import { parseLiteral } from './literal';

describe('Binary Expression', () => {
  test('should parse a simple binary expression', () => {
    const source = '1 + 2';
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');
    const result = parseBinary(context, parseLiteral(context), parseExpression);

    expect(result).toEqual({
      type: 'BinaryExpression',
      left: {
        type: 'Literal',
        value: 1,
        location: { start: 0, end: 1, file: 'test.nl' },
      },
      operator: '+',
      right: {
        type: 'Literal',
        value: 2,
        location: { start: 4, end: 5, file: 'test.nl' },
      },
      location: { start: 0, end: 5, file: 'test.nl' },
    });
  });

  test('should parse a complex expression with parentheses', () => {
    const source = '1 + (2 * 3)';
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');
    const result = parseExpression(context);

    expect(result).toEqual({
      type: 'BinaryExpression',
      left: { type: 'Literal', value: 1, location: { start: 0, end: 1, file: 'test.nl' } },
      operator: '+',
      right: {
        type: 'BinaryExpression',
        left: {
          type: 'Literal',
          value: 2,
          location: { start: 5, end: 6, file: 'test.nl' },
        },
        operator: '*',
        right: {
          type: 'Literal',
          value: 3,
          location: { start: 9, end: 10, file: 'test.nl' },
        },
        location: { start: 4, end: 11, file: 'test.nl' },
      },
      location: { start: 0, end: 11, file: 'test.nl' },
    });
  });

  test('more parentheses', () => {
    const source = '1 + (2 * (3 + 4))';
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');
    const result = parseExpression(context);

    const expected = {
      type: 'BinaryExpression',
      left: {
        type: 'Literal',
        value: 1,
        location: {
          start: 0,
          end: 1,
          file: 'test.nl',
        },
      },
      operator: '+',
      right: {
        type: 'BinaryExpression',
        left: {
          type: 'Literal',
          value: 2,
          location: {
            start: 5,
            end: 6,
            file: 'test.nl',
          },
        },
        operator: '*',
        right: {
          type: 'BinaryExpression',
          left: {
            type: 'Literal',
            value: 3,
            location: {
              start: 10,
              end: 11,
              file: 'test.nl',
            },
          },
          operator: '+',
          right: {
            type: 'Literal',
            value: 4,
            location: {
              start: 14,
              end: 15,
              file: 'test.nl',
            },
          },
          location: {
            start: 9,
            end: 16,
            file: 'test.nl',
          },
        },
        location: {
          start: 4,
          end: 17,
          file: 'test.nl',
        },
      },
      location: {
        start: 0,
        end: 17,
        file: 'test.nl',
      },
    };

    expect(result).toEqual(expected);
  });

  test('should throw error for expression with more than 3 terms without parentheses', () => {
    const source = '1 + 2 * 3';
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');

    expect(() => parseExpression(context)).toThrow(
      'You must use parentheses when combining more than 2 terms (e.g. "1 + (2 * 3)")'
    );
  });
});
