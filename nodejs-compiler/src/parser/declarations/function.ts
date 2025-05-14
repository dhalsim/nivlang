import { TokenKind } from '../../lexer/types';
import { createError } from '../../error';

import { FunctionDeclaration, Parameter, FunctionType, FunctionTypeDeclaration } from '../ast';
import {
  checkAndAdvance,
  consume,
  createLocation,
  ParserContext,
  peek,
  previous,
} from '../context';
import { parseBlock } from '../statements/block';

export const functionDeclaration =
  (context: ParserContext) =>
  (typeDeclaration?: FunctionTypeDeclaration): FunctionDeclaration => {
    const previousToken = previous(context);

    const name = consume(context)(
      TokenKind.Identifier,
      'Expected function name, got ' + peek(context).lexeme
    ).lexeme;
    consume(context)(
      TokenKind.Equal,
      'Expected = after function name, got ' + peek(context).lexeme
    );

    if (typeDeclaration && typeDeclaration.name !== name) {
      throw createError('Expected function name to match type name', {
        file: context.filePath,
        start: typeDeclaration.location.start,
        end: typeDeclaration.location.end,
      });
    }

    consume(context)(
      TokenKind.LeftBrace,
      'Expected { before function parameters, got ' + peek(context).lexeme
    );
    const parameters = functionParameters(context)(typeDeclaration?.definition);
    consume(context)(
      TokenKind.RightBrace,
      'Expected } after function parameters, got ' + peek(context).lexeme
    );

    consume(context)(
      TokenKind.LeftBrace,
      'Expected { before function body, got ' + peek(context).lexeme
    );
    const body = parseBlock(context)();

    return {
      type: 'FunctionDeclaration',
      name,
      parameters,
      returnType: typeDeclaration?.definition.returnType,
      body,
      location: createLocation(context, previousToken.start, body.location.end),
    };
  };

export const functionParameters =
  (context: ParserContext) =>
  (typeDeclaration?: FunctionType): Parameter[] => {
    const parameters: Parameter[] = [];

    do {
      const paramName = consume(context)(
        TokenKind.Identifier,
        'Expected parameter name, got ' + peek(context).lexeme
      ).lexeme;

      const paramType = typeDeclaration?.parameters.properties[paramName];

      const previousToken = previous(context);

      parameters.push({
        type: 'Parameter',
        name: paramName,
        typeAnnotation: paramType,
        location: {
          file: context.filePath,
          start: previousToken.start,
          end: previousToken.end,
        },
      });
    } while (checkAndAdvance(context)(TokenKind.Comma));

    return parameters;
  };
