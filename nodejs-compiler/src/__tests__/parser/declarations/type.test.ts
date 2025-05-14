import { expect, test, describe } from '@jest/globals';

import { consume, createParserContext } from '../../../parser/context';
import { getTokens } from '../../../compiler';
import { typeDeclaration } from '../../../parser/declarations/type';
import { TokenKind } from '../../../lexer/types';
import { FunctionTypeDeclaration } from '../../../parser/ast';

describe('parseTypeDeclaration', () => {
  test('should parse a type declaration', () => {
    const source = 'type add = { a: int, b: int }: int';
    const context = createParserContext(getTokens(source, 'test.nl'), 'test.nl');

    consume(context)(TokenKind.Type, 'Expected "type" keyword');

    const result = typeDeclaration(context);

    const expected: FunctionTypeDeclaration = {
      type: 'FunctionTypeDeclaration',
      name: 'add',
      definition: {
        type: 'FunctionType',
        parameters: {
          type: 'InterfaceType',
          properties: {
            a: {
              type: 'SimpleType',
              name: 'int',
              location: {
                file: 'test.nl',
                start: 16,
                end: 19,
              },
            },
            b: {
              type: 'SimpleType',
              name: 'int',
              location: {
                file: 'test.nl',
                start: 24,
                end: 27,
              },
            },
          },
          location: {
            file: 'test.nl',
            start: 11,
            end: 29,
          },
        },
        returnType: {
          type: 'SimpleType',
          name: 'int',
          location: {
            file: 'test.nl',
            start: 31,
            end: 34,
          },
        },
        location: {
          file: 'test.nl',
          start: 11,
          end: 34,
        },
      },
      location: {
        file: 'test.nl',
        start: 0,
        end: 34,
      },
    };

    expect(result).toEqual(expected);
  });
});
