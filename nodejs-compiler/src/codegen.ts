/*
 * Code Generator
 *
 * This module generates JavaScript code from our AST.
 * It implements a visitor pattern to traverse the AST and generate
 * equivalent JavaScript code with proper formatting and indentation.
 */

import type {
  Program,
  Declaration,
  FunctionDeclaration,
  TypeDeclaration,
  VariableDeclaration,
  Statement,
  Expression,
  BlockStatement,
  ReturnExpression,
  IfStatement,
  WhileStatement,
  ForStatement,
  Literal,
  Identifier,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  AssignmentStatement,
  ObjectExpression,
  TemplateLiteral,
  ArrayExpression,
} from './parser/ast';

export class CodeGenerator {
  private indent = 0; // Current indentation level
  private output = ''; // Generated code buffer

  /*
   * Main entry point for code generation.
   * Takes a program AST and returns the generated JavaScript code.
   */
  generate(program: Program): string {
    this.output = '';
    this.indent = 0;

    // Generate code for each top-level declaration
    for (const declaration of program.declarations) {
      this.declaration(declaration);
    }

    return this.output;
  }

  /*
   * Generates code for a declaration (function or type).
   * Types are currently just commented out as they're not needed in JS.
   */
  private declaration(declaration: Declaration): void {
    switch (declaration.type) {
      case 'FunctionDeclaration':
        this.functionDeclaration(declaration);
        break;
      case 'TypeDeclaration':
        this.typeDeclaration(declaration);
        break;
    }
  }

  /*
   * Generates code for a function declaration.
   * Handles function name, parameters, and body.
   */
  private functionDeclaration(declaration: FunctionDeclaration): void {
    this.write(`function ${declaration.name}(`);
    // Generate parameter list
    for (let i = 0; i < declaration.parameters.length; i++) {
      if (i > 0) {
        this.write(', ');
      }

      this.write(declaration.parameters[i].name);
    }

    this.write(') {\n');
    this.indent++;
    this.blockStatement(declaration.body);
    this.indent--;
    this.write('}\n\n');
  }

  /*
   * Generates a comment for type declarations.
   * Types are not needed in JavaScript, so we just comment them.
   */
  private typeDeclaration(declaration: TypeDeclaration): void {
    this.write(`// Type: ${declaration.name}\n`);
  }

  /*
   * Generates code for a variable declaration.
   * Uses 'let' for all variables as we don't have const in our language yet.
   */
  private variableDeclaration(declaration: VariableDeclaration): void {
    this.write('let ');
    this.write(declaration.name);
    this.write(' = ');
    this.write(this.expression(declaration.initializer));
    this.write(';\n');
  }

  /*
   * Generates code for a statement.
   * Handles different types of statements (if, while, for, assignment).
   */
  private statement(statement: Statement): void {
    switch (statement.type) {
      case 'IfStatement':
        this.ifStatement(statement);
        break;
      case 'WhileStatement':
        this.whileStatement(statement);
        break;
      case 'ForStatement':
        this.forStatement(statement);
        break;
      case 'AssignmentStatement':
        this.assignmentStatement(statement);
        break;
    }
  }

  /*
   * Generates code for a return statement.
   * Handles both return with and without a value.
   */
  private returnStatement(statement: ReturnExpression): void {
    this.writeIndent();
    this.write('return ');
    if (statement.expression) {
      this.write(this.expression(statement.expression));
    }

    this.write(';\n');
  }

  /*
   * Generates code for an assignment statement.
   * Optionally skips the newline for use in for loops.
   */
  private assignmentStatement(statement: AssignmentStatement, skipNewline = false): void {
    this.write(this.expression(statement.left));
    this.write(' = ');
    this.write(this.expression(statement.right));
    if (!skipNewline) {
      this.write(';\n');
    }
  }

  /*
   * Generates code for an if statement.
   * Handles both if and if-else cases.
   */
  private ifStatement(statement: IfStatement): void {
    this.write('if (');
    this.write(this.expression(statement.condition));
    this.write(') {\n');
    this.indent++;
    this.blockStatement(statement.thenBranch);
    this.indent--;
    if (statement.elseBranch) {
      this.writeIndent();
      this.write('} else {\n');
      this.indent++;
      this.blockStatement(statement.elseBranch);
      this.indent--;
    }

    this.writeIndent();
    this.write('}\n');
  }

  /*
   * Generates code for a while loop.
   */
  private whileStatement(statement: WhileStatement): void {
    this.write('while (');
    this.write(this.expression(statement.condition));
    this.write(') {\n');
    this.indent++;
    this.blockStatement(statement.body);
    this.indent--;
    this.writeIndent();
    this.write('}\n');
  }

  /*
   * Generates code for a for loop.
   * Handles all three parts: initializer, condition, and increment.
   */
  private forStatement(statement: ForStatement): void {
    this.write('for (');
    if (statement.initializer) {
      this.assignmentStatement(statement.initializer, true);
    }

    this.write('; ');
    if (statement.condition) {
      this.write(this.expression(statement.condition));
    }

    this.write('; ');
    if (statement.increment) {
      this.assignmentStatement(statement.increment, true);
    }

    this.write(') {\n');
    this.indent++;
    this.blockStatement(statement.body);
    this.indent--;
    this.writeIndent();
    this.write('}\n');
  }

  /*
   * Generates code for a block of statements.
   * Handles both regular statements and declarations.
   * Also handles the optional return expression at the end.
   */
  private blockStatement(statement: BlockStatement): void {
    for (const stmt of statement.statements) {
      this.writeIndent();
      if (stmt.type === 'FunctionDeclaration' || stmt.type === 'TypeDeclaration') {
        this.declaration(stmt);
      } else {
        this.statement(stmt);
      }
    }

    if (statement.returnExpression) {
      this.returnStatement(statement.returnExpression);
    }
  }

  /*
   * Generates code for an expression.
   * Handles all types of expressions (literals, identifiers, binary, etc.).
   */
  private expression(expr: Expression): string {
    switch (expr.type) {
      case 'Literal':
        return this.literal(expr);
      case 'Identifier':
        return this.identifier(expr);
      case 'BinaryExpression':
        return this.binaryExpression(expr);
      case 'UnaryExpression':
        return this.unaryExpression(expr);
      case 'CallExpression':
        return this.callExpression(expr);
      case 'MemberExpression':
        return this.memberExpression(expr);
      case 'ArrayExpression':
        return this.arrayExpression(expr);
      case 'ObjectExpression':
        return this.objectExpression(expr);
      case 'TemplateLiteral':
        return this.templateLiteral(expr);
    }

    throw new Error('Unsupported expression type');
  }

  /*
   * Generates code for a literal value.
   * Handles strings, numbers, booleans, and null.
   */
  private literal(expression: Literal): string {
    if (expression.value === null) {
      return 'null';
    } else if (typeof expression.value === 'string') {
      return `\`${expression.value}\``;
    } else {
      return String(expression.value);
    }
  }

  /*
   * Generates code for an identifier (variable or function name).
   */
  private identifier(expression: Identifier): string {
    return expression.name;
  }

  /*
   * Generates code for a binary expression.
   * Adds parentheses when needed to maintain operator precedence.
   */
  private binaryExpression(expression: BinaryExpression): string {
    const needsParens =
      expression.left.type === 'BinaryExpression' ||
      expression.right.type === 'BinaryExpression' ||
      expression.left.type === 'UnaryExpression' ||
      expression.right.type === 'UnaryExpression';

    if (needsParens) {
      return `(${this.expression(expression.left)} ${expression.operator} ${this.expression(expression.right)})`;
    }

    return `${this.expression(expression.left)} ${expression.operator} ${this.expression(expression.right)}`;
  }

  /*
   * Generates code for a unary expression (e.g., -a, !b).
   */
  private unaryExpression(expression: UnaryExpression): string {
    return `${expression.operator}${this.expression(expression.argument)}`;
  }

  /*
   * Generates code for a function call.
   * Handles the callee and argument list.
   */
  private callExpression(expression: CallExpression): string {
    return `${this.expression(expression.callee)}(${expression.arguments.map(this.expression).join(', ')})`;
  }

  /*
   * Generates code for member access.
   * Handles both dot notation (obj.prop) and computed access (arr[index]).
   */
  private memberExpression(expression: MemberExpression): string {
    return `${this.expression(expression.object)}${expression.computed ? `[${this.expression(expression.property)}]` : `.${this.expression(expression.property)}`}`;
  }

  /*
   * Generates code for an object literal.
   * Handles property names and values.
   */
  private objectExpression(expression: ObjectExpression): string {
    const entries = Object.entries(expression.properties);

    return `{ ${entries.map(([key, value]) => `${key}: ${this.expression(value)}`).join(', ')} }`;
  }

  private arrayExpression(expr: ArrayExpression): string {
    return `[${expr.elements.map((e) => this.expression(e)).join(', ')}]`;
  }

  private templateLiteral(expr: TemplateLiteral): string {
    const parts = expr.parts.map((part) => {
      if (typeof part === 'string') {
        // Escape any backticks in the string
        return part.replace(/`/g, '\\`');
      } else {
        // Convert our {name} syntax to JavaScript's ${name} syntax
        return `\${${this.expression(part)}}`;
      }
    });

    return `\`${parts.join('')}\``;
  }

  /*
   * Appends a string to the output buffer.
   */
  private write(str: string): void {
    this.output += str;
  }

  /*
   * Writes the current indentation level to the output buffer.
   * Uses two spaces per indentation level.
   */
  private writeIndent(): void {
    this.output += '  '.repeat(this.indent);
  }
}
