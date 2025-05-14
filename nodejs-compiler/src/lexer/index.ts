import {
  SourceFile,
  Token,
  TokenKind,
  createToken,
  TemplateToken,
  createTemplateToken,
} from './types';

export class Lexer {
  private start = 0;
  private current = 0;
  private tokens: Token[] = [];
  private sourceMap: Map<string, SourceFile> = new Map();

  constructor(
    private source: string,
    private sourceFile: SourceFile
  ) {
    this.sourceMap.set(sourceFile.path, sourceFile);
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(
      createToken(TokenKind.Eof, '', null, this.sourceFile.path, this.start, this.current)
    );

    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case '(':
        this.addToken(TokenKind.LeftParen);
        break;
      case ')':
        this.addToken(TokenKind.RightParen);
        break;
      case '{':
        this.addToken(TokenKind.LeftBrace);
        break;
      case '}':
        this.addToken(TokenKind.RightBrace);
        break;
      case '[':
        if (this.match(']')) {
          this.addToken(TokenKind.ArrayType);
        } else {
          this.addToken(TokenKind.LeftBracket);
        }

        break;
      case ']':
        this.addToken(TokenKind.RightBracket);
        break;
      case ',':
        this.addToken(TokenKind.Comma);
        break;
      case '.':
        this.addToken(TokenKind.Dot);
        break;
      case '-':
        this.addToken(TokenKind.Minus);
        break;
      case '+':
        this.addToken(TokenKind.Plus);
        break;
      case ';':
        this.addToken(TokenKind.Semicolon);
        break;
      case '*':
        this.addToken(TokenKind.Star);
        break;
      case ':':
        this.addToken(TokenKind.Colon);
        break;
      case '?':
        this.addToken(TokenKind.Question);
        break;
      case '!':
        this.addToken(this.match('=') ? TokenKind.NotEqual : TokenKind.Bang);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenKind.EqualEqual : TokenKind.Equal);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenKind.LessEqual : TokenKind.Less);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenKind.GreaterEqual : TokenKind.Greater);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenKind.Slash);
        }

        break;
      case ' ':
      case '\r':
      case '\t':
      case '\n':
        break;
      case '"':
        this.string();
        break;
      case '`':
        this.templateLiteral();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          throw new Error(`Unexpected character: ${c}`);
        }

        break;
    }
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error('Unterminated string.');
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenKind.String, value);
  }

  private templateLiteral(): void {
    const parts: TemplateToken['parts'] = [];
    let currentPart = '';

    while (this.peek() !== '`' && !this.isAtEnd()) {
      if (this.peek() === '{') {
        // Add the current text part if any
        if (currentPart) {
          parts.push({ text: currentPart });
          currentPart = '';
        }

        this.advance(); // Consume '{'

        // Skip whitespace
        while (this.peek() === ' ' || this.peek() === '\t') {
          this.advance();
        }

        // Capture identifier
        const idStart = this.current;
        while (this.isAlphaNumeric(this.peek())) {
          this.advance();
        }

        const idEnd = this.current;
        const identifier = this.source.substring(idStart, idEnd);

        // Skip whitespace
        while (this.peek() === ' ' || this.peek() === '\t') {
          this.advance();
        }

        if (this.peek() !== '}') {
          throw new Error('Expected } after template interpolation');
        }

        this.advance(); // Consume '}'
        parts.push({ text: '', interpolation: { identifier, start: idStart, end: idEnd } });
        continue;
      }

      currentPart += this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error('Unterminated template literal.');
    }

    // Add any remaining text
    if (currentPart) {
      parts.push({ text: currentPart });
    }

    // If we have no parts (empty template literal), add an empty text part
    if (parts.length === 0) {
      parts.push({ text: '' });
    }

    this.advance(); // Consume closing backtick

    const token = createTemplateToken(
      this.source.substring(this.start, this.current),
      parts,
      this.sourceFile.path,
      this.start,
      this.current
    );
    this.tokens.push(token);
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(TokenKind.Number, value);
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    let type = this.keywords.get(text);
    if (type === undefined) {
      type = TokenKind.Identifier;
    }

    this.addToken(type);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source[this.current] !== expected) {
      return false;
    }

    this.current++;

    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return '\0';
    }

    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }

    return this.source[this.current + 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    this.current++;

    return this.source[this.current - 1];
  }

  private addToken(type: TokenKind, literal: string | number | null = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(
      createToken(type, text, literal, this.sourceFile.path, this.start, this.current)
    );
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private keywords = new Map<string, TokenKind>([
    ['and', TokenKind.And],
    ['else', TokenKind.Else],
    ['false', TokenKind.False],
    ['for', TokenKind.For],
    ['func', TokenKind.Func],
    ['if', TokenKind.If],
    ['in', TokenKind.In],
    ['import', TokenKind.Import],
    ['nil', TokenKind.Nil],
    ['or', TokenKind.Or],
    ['return', TokenKind.Return],
    ['test', TokenKind.Test],
    ['true', TokenKind.True],
    ['type', TokenKind.Type],
    ['while', TokenKind.While],
  ]);
}
