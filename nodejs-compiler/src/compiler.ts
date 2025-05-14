import * as fs from 'fs';
import * as path from 'path';

import { Lexer } from './lexer';
import { parser } from './parser/parser';
import { CodeGenerator } from './codegen';
import { CompilerError } from './error/types';
import { createSourceFile, getLineAndColumn, Token } from './lexer/types';
import { createParserContext } from './parser/context';

export function compile(source: string, filePath: string): string {
  try {
    const tokens = getTokens(source, filePath);
    const context = createParserContext(tokens, filePath);
    const ast = parser(context);
    const generator = new CodeGenerator();

    return generator.generate(ast);
  } catch (error) {
    if (error instanceof CompilerError) {
      const sourceFile = createSourceFile(filePath, source);
      const location = getLineAndColumn(sourceFile, error.location?.start ?? 0);

      const locationString = `${filePath}:${location.line}:${location.column}`;

      throw new Error(`${error.message} at ${locationString}`);
    }

    throw error;
  }
}

export function compileFile(filePath: string): string {
  const source = fs.readFileSync(filePath, 'utf-8');

  return compile(source, filePath);
}

export function compileDirectory(dirPath: string): void {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (file.endsWith('.nl')) {
      const filePath = path.join(dirPath, file);
      const output = compileFile(filePath);
      const outputPath = filePath.replace('.nl', '.js');
      fs.writeFileSync(outputPath, output);
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide a file or directory to compile');
    process.exit(1);
  }

  const target = args[0];
  const stats = fs.statSync(target);

  if (stats.isDirectory()) {
    compileDirectory(target);
  } else if (stats.isFile()) {
    const output = compileFile(target);
    const outputPath = target.replace('.nl', '.js');
    fs.writeFileSync(outputPath, output);
  } else {
    console.error('Invalid target');
    process.exit(1);
  }
}

export function getTokens(source: string, filePath: string): Token[] {
  const sourceFile = createSourceFile(filePath, source);

  const lexer = new Lexer(source, sourceFile);

  return lexer.scanTokens();
}
