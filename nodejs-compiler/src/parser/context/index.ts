import { Token } from '../../lexer/types';

export enum ParseContext {
  Type = 'Type',
  Function = 'Function',
  Let = 'Let',
  Expression = 'Expression',
}

export interface ParserContext {
  tokens: Token[];
  current: number;
  verbose: boolean;
  previousContext?: ParseContext;
  filePath: string;
}

export const createParserContext = (
  tokens: Token[],
  filePath: string,
  verbose = false,
  previousContext?: ParseContext
): ParserContext => ({
  tokens,
  current: 0,
  verbose,
  filePath,
  previousContext,
});

export * from './parser-functions';
