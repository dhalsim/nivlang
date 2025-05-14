/*
 * Abstract Syntax Tree (AST) Definitions
 *
 * This file defines the structure of our AST nodes that represent the parsed source code.
 * Each node type extends the base Node interface and includes type information and source location.
 */

import { Location } from '../lexer/types';

/* Base interface for all AST nodes */
export interface Node {
  type: string; // Discriminator for node type
  location: Location; // Source location information
}

/* Root node representing the entire program */
export interface Program extends Node {
  type: 'Program';
  declarations: Declaration[]; // List of top-level declarations (functions and types)
}

/* Union type for all declaration types */
export type Declaration = FunctionDeclaration | TypeDeclaration;

/* Function declaration node */
export interface FunctionDeclaration extends Node {
  type: 'FunctionDeclaration';
  name: string; // Function name
  parameters: Parameter[]; // Function parameters
  returnType?: TypeAnnotation; // Optional return type annotation
  body: BlockStatement; // Function body
}

/* Type declaration node */
export interface TypeDeclaration extends Node {
  type: 'TypeDeclaration';
  name: string; // Type name
  definition: TypeAnnotation; // Type definition
}

/* Function type declaration node */
export interface FunctionTypeDeclaration extends Node {
  type: 'FunctionTypeDeclaration';
  name: string; // Function type name
  definition: FunctionType;
}

/* Variable declaration node */
export interface VariableDeclaration extends Node {
  type: 'VariableDeclaration';
  name: string; // Variable name
  initializer: Expression; // Initial value
  typeAnnotation?: TypeAnnotation; // Optional type annotation
}

/* Function parameter node */
export interface Parameter extends Node {
  type: 'Parameter';
  name: string; // Parameter name
  typeAnnotation?: TypeAnnotation; // Optional type annotation
}

/* Block statement node representing a scope */
export interface BlockStatement extends Node {
  type: 'BlockStatement';
  statements: (Statement | Declaration)[]; // List of statements in the block
  returnExpression?: ReturnExpression; // Optional return expression
}

/* Union type for all statement types */
export type Statement = IfStatement | WhileStatement | ForStatement | AssignmentStatement;

/* Assignment statement node */
export interface AssignmentStatement extends Node {
  type: 'AssignmentStatement';
  left: Expression; // Left-hand side (target)
  right: Expression; // Right-hand side (value)
}

/* If statement node */
export interface IfStatement extends Node {
  type: 'IfStatement';
  condition: Expression; // Condition expression
  thenBranch: BlockStatement; // Then branch
  elseBranch?: BlockStatement; // Optional else branch
}

/* While loop node */
export interface WhileStatement extends Node {
  type: 'WhileStatement';
  condition: Expression; // Loop condition
  body: BlockStatement; // Loop body
}

/* For loop node */
export interface ForStatement extends Node {
  type: 'ForStatement';
  initializer?: AssignmentStatement; // Optional initialization
  condition?: Expression; // Optional condition
  increment?: AssignmentStatement; // Optional increment
  body: BlockStatement; // Loop body
}

/* Union type for all expression types */
export type Expression =
  | Literal
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression
  | ArrayExpression
  | ObjectExpression
  | TemplateLiteral;

/* Literal value node (string, number, boolean, null) */
export interface Literal extends Node {
  type: 'Literal';
  value: string | number | boolean | null;
}

/* Number literal node */
export interface LiteralNumber extends Node {
  type: 'LiteralNumber';
  value: number;
}

/* Identifier node (variable or function name) */
export interface Identifier extends Node {
  type: 'Identifier';
  name: string;
}

/* Binary operation node (e.g., a + b) */
export interface BinaryExpression extends Node {
  type: 'BinaryExpression';
  operator: string; // Operator (+, -, *, /, etc.)
  left: Expression; // Left operand
  right: Expression; // Right operand
}

/* Unary operation node (e.g., -a) */
export interface UnaryExpression extends Node {
  type: 'UnaryExpression';
  operator: string; // Operator (-, !)
  argument: Expression; // Operand
}

/* Function call node */
export interface CallExpression extends Node {
  type: 'CallExpression';
  callee: Expression; // Function to call
  arguments: Expression[]; // Arguments
}

/* Member access node (e.g., obj.prop or arr[index]) */
export interface MemberExpression extends Node {
  type: 'MemberExpression';
  object: Expression; // Object being accessed
  property: Expression; // Property or index
  computed: boolean; // Whether it's computed (arr[index]) or not (obj.prop)
}

/* Return statement node */
export interface ReturnExpression extends Node {
  type: 'ReturnExpression';
  expression?: Expression; // Optional return value
}

/* Union type for all type annotation types */
export type TypeAnnotation = SimpleType | ArrayType | InterfaceType | FunctionType;

/* Simple type node (e.g., number, string) */
export interface SimpleType extends Node {
  type: 'SimpleType';
  name: string;
}

/* Array type node */
export interface ArrayType extends Node {
  type: 'ArrayType';
  elementType: TypeAnnotation; // Type of array elements
}

/* Interface/object type node */
export interface InterfaceType extends Node {
  type: 'InterfaceType';
  properties: { [key: string]: TypeAnnotation }; // Property name to type mapping
}

/* Function type node */
export interface FunctionType extends Node {
  type: 'FunctionType';
  parameters: InterfaceType; // Parameter types
  returnType: TypeAnnotation; // Return type
}

/* Object literal node (e.g., { x: 1, y: 2 }) */
export interface ObjectExpression extends Node {
  type: 'ObjectExpression';
  properties: { [key: string]: Expression }; // Property name to value mapping
}

export interface TemplateLiteral extends Node {
  type: 'TemplateLiteral';
  parts: (string | Expression)[];
}

export interface ArrayExpression extends Node {
  type: 'ArrayExpression';
  elements: Expression[];
}
