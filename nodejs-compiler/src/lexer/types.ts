export enum TokenKind {
  // Single-character tokens
  LeftParen = 'LeftParen',
  RightParen = 'RightParen',
  LeftBrace = 'LeftBrace',
  RightBrace = 'RightBrace',
  LeftBracket = 'LeftBracket',
  RightBracket = 'RightBracket',
  Comma = 'Comma',
  Dot = 'Dot',
  Minus = 'Minus',
  Plus = 'Plus',
  Semicolon = 'Semicolon',
  Slash = 'Slash',
  Star = 'Star',
  Colon = 'Colon',
  Question = 'Question',

  // One or two character tokens
  Bang = 'Bang',
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  EqualEqual = 'EqualEqual',
  Greater = 'Greater',
  GreaterEqual = 'GreaterEqual',
  Less = 'Less',
  LessEqual = 'LessEqual',
  Arrow = 'Arrow',
  ArrayType = 'ArrayType',

  // Literals
  Identifier = 'Identifier',
  String = 'String',
  TemplateLiteral = 'TemplateLiteral',
  Number = 'Number',

  // Keywords
  And = 'And',
  Else = 'Else',
  False = 'False',
  For = 'For',
  Func = 'Func',
  If = 'If',
  In = 'In',
  Import = 'Import',
  Nil = 'Nil',
  Or = 'Or',
  Return = 'Return',
  Test = 'Test',
  True = 'True',
  Type = 'Type',
  While = 'While',

  // Special tokens
  Eof = 'Eof',
  Error = 'Error',
  Len = 'Len',
}

export const Primitives = [
  TokenKind.Number,
  TokenKind.String,
  TokenKind.TemplateLiteral,
  TokenKind.True,
  TokenKind.False,
  TokenKind.Nil,
];

export const ConditionalOperators = [
  TokenKind.Equal,
  TokenKind.NotEqual,
  TokenKind.Greater,
  TokenKind.GreaterEqual,
  TokenKind.Less,
];

export const ArithmeticOperators = [
  TokenKind.Plus,
  TokenKind.Minus,
  TokenKind.Star,
  TokenKind.Slash,
];

export interface Token {
  kind: TokenKind;
  lexeme: string;
  literal: string | number | null;
  path: string;
  start: number;
  end: number;
}

export interface TemplateToken extends Token {
  kind: TokenKind.TemplateLiteral;
  literal: null;
  parts: {
    text: string;
    interpolation?: {
      identifier: string;
      start: number;
      end: number;
    };
  }[];
}

export function createToken(
  kind: TokenKind,
  lexeme: string,
  literal: string | number | null,
  path: string,
  start: number,
  end: number
): Token {
  return { kind, lexeme, literal, path, start, end };
}

export function createTemplateToken(
  lexeme: string,
  parts: TemplateToken['parts'],
  path: string,
  start: number,
  end: number
): TemplateToken {
  return {
    kind: TokenKind.TemplateLiteral,
    lexeme,
    literal: null,
    path,
    start,
    end,
    parts,
  };
}

export interface Location {
  start: number;
  end: number;
  file: string;
}

export interface SourceFile {
  path: string;
  content: string;
  lineOffsets: number[]; // index of every `\n` to map offset -> line
}

export function createSourceFile(path: string, content: string): SourceFile {
  const lineOffsets: number[] = [0]; // Start with offset 0 for first line
  let offset = 0;

  for (const char of content) {
    offset++;
    if (char === '\n') {
      lineOffsets.push(offset);
    }
  }

  return { path, content, lineOffsets };
}

export function getLineAndColumn(
  sourceFile: SourceFile,
  offset: number
): { line: number; column: number } {
  // Find the last line offset that's less than or equal to our target offset
  let line = 0;
  for (let i = 0; i < sourceFile.lineOffsets.length; i++) {
    if (sourceFile.lineOffsets[i] > offset) {
      break;
    }

    line = i;
  }

  // Column is the difference between the offset and the start of the line
  const column = offset - sourceFile.lineOffsets[line] + 1;

  return { line: line + 1, column }; // Convert to 1-based line numbers
}
