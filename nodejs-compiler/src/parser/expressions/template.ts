import type { TemplateToken } from '../../lexer/types';
import type { Expression, TemplateLiteral } from '../ast';
import { advance, type ParserContext } from '../context';

export const parseTemplateLiteral = (context: ParserContext): TemplateLiteral => {
  const token = advance(context) as TemplateToken;
  const parts: (string | Expression)[] = [];

  for (const part of token.parts) {
    if (part.interpolation) {
      // For interpolation, create an identifier expression
      parts.push({
        type: 'Identifier',
        name: part.interpolation.identifier,
        location: {
          start: part.interpolation.start,
          end: part.interpolation.end,
          file: context.filePath,
        },
      });
    } else {
      // For text parts, just use the text
      parts.push(part.text);
    }
  }

  return {
    type: 'TemplateLiteral',
    parts,
    location: {
      start: token.start,
      end: token.end,
      file: context.filePath,
    },
  };
};
