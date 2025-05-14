/*
 * Type Parser
 *
 * This module handles parsing of type annotations in the source code.
 * It supports:
 * - Simple types (e.g., int, string)
 * - Array types (e.g., []int, [][]string)
 * - Interface types (e.g., { name: string, age: int })
 * - Function types (e.g., { name: string, age: int }: int)
 */

import {
  FunctionType,
  FunctionTypeDeclaration,
  InterfaceType,
  TypeAnnotation,
  TypeDeclaration,
} from '../ast';
import { TokenKind } from '../../lexer/types';
import {
  consume,
  ParserContext,
  check,
  createLocation,
  peek,
  checkAndAdvance,
  previous,
  advance,
} from '../context';

export const typeDeclaration = (
  context: ParserContext
): TypeDeclaration | FunctionTypeDeclaration => {
  const start = previous(context).start;

  const name = consume(context)(TokenKind.Identifier, 'Expected identifier after "type" keyword');
  consume(context)(TokenKind.Equal, 'Expected "=" after identifier');

  const annotation = typeAnnotation(context);

  if (annotation.type === 'FunctionType') {
    return {
      type: 'FunctionTypeDeclaration',
      name: name.lexeme,
      definition: annotation,
      location: createLocation(context, start, annotation.location.end),
    };
  }

  return {
    type: 'TypeDeclaration',
    name: name.lexeme,
    definition: annotation,
    location: createLocation(context, start, annotation.location.end),
  };
};

/*
 * Parses a type annotation.
 * Handles:
 * - Simple types (e.g., int, string)
 * - Array types (e.g., []int, [][]string)
 * - Interface types (e.g., { name: string, age: int })
 * - Function types (e.g., { name: string, age: int }: int)
 */
export const typeAnnotation = (context: ParserContext): TypeAnnotation | FunctionType => {
  const start = peek(context).start;

  // Handle array types
  if (check(context)(TokenKind.ArrayType)) {
    advance(context); // Consume '[]'

    const elementType = typeAnnotation(context);

    return {
      type: 'ArrayType',
      elementType,
      location: createLocation(context, start, elementType.location.end),
    };
  }

  // Handle interface and function types
  if (check(context)(TokenKind.LeftBrace)) {
    return parseInterfaceOrFunctionType(context, start);
  }

  // Handle simple types
  const name = consume(context)(TokenKind.Identifier, 'Expected type name');

  return {
    type: 'SimpleType',
    name: name.lexeme,
    location: createLocation(context, start, name.end),
  };
};

/*
 * Parses an interface type or function type.
 * Both start with { and have properties, but function types
 * also have a return type after a colon.
 */
function parseInterfaceOrFunctionType(
  context: ParserContext,
  start: number
): InterfaceType | FunctionType {
  advance(context); // Consume '{'

  const properties: { [key: string]: TypeAnnotation } = {};
  const parametersStart = previous(context).start;

  // Parse properties
  if (!check(context)(TokenKind.RightBrace)) {
    do {
      const name = consume(context)(
        TokenKind.Identifier,
        'Expected property name, got ' + peek(context).lexeme
      );

      consume(context)(TokenKind.Colon, 'Expected : after property name');

      properties[name.lexeme] = typeAnnotation(context);
    } while (checkAndAdvance(context)(TokenKind.Comma));
  }

  const parametersEnd = consume(context)(TokenKind.RightBrace, 'Expected } after interface type');

  // Check if this is a function type (has return type)
  if (check(context)(TokenKind.Colon)) {
    advance(context); // Consume ':'
    const returnType = typeAnnotation(context);

    return {
      type: 'FunctionType',
      parameters: {
        type: 'InterfaceType',
        properties,
        location: createLocation(context, parametersStart, parametersEnd.end),
      },
      returnType,
      location: createLocation(context, start, returnType.location.end),
    };
  }

  // This is an interface type
  return {
    type: 'InterfaceType',
    properties,
    location: createLocation(context, start, parametersEnd.end),
  };
}
