import { expect, test, describe } from '@jest/globals';

import { compile } from '../compiler';

describe('Compiler', () => {
  test('compiles simple function', () => {
    const source = `
type add = { a: int, b: int }: int
func add = { a, b } {
  return a + b
}
`;

    const expected = `
function add(a, b) {
  return a + b;
}
`;

    expect(compile(source, 'test.nl').trim()).toBe(expected.trim());
  });

  test('compiles if statement', () => {
    const source = `
type max = { a: int, b: int }: int
  func max = { a, b } {
    if a > b {
      return a
    } else {
      return b
    }
  }
`;

    const expected = `
function max(a, b) {
  if (a > b) {
    return a;
  } else {
    return b;
  }
}
`;

    expect(compile(source, 'test.nl').trim()).toBe(expected.trim());
  });

  test('compiles while loop', () => {
    const source = `
type factorial = { n: int }: int
  func factorial = { n } {
    result = 1
    while n > 0 {
      result = result * n
      n = n - 1
    }
    return result
  }
`;

    const expected = `
function factorial(n) {
  result = 1;
  while (n > 0) {
    result = result * n;
    n = n - 1;
  }
  return result;
}
`;

    expect(compile(source, 'test.nl').trim()).toBe(expected.trim());
  });

  test('compiles string interpolation', () => {
    const source = `
type greet = { name: string }: string
func greet = { name } {
  return \`hello {name}!\`
}
`;

    const expected = `
function greet(name) {
  return \`hello \${name}!\`;
}
`;

    expect(compile(source, 'test.nl').trim()).toBe(expected.trim());
  });

  test('compiles object literal', () => {
    const source = `
// Type: point
type point = { x: int, y: int }
type createPoint = { x: int, y: int }: point
func createPoint = { x, y } {
  return { x, y }
}
`;

    const expected = `// Type: point
function createPoint(x, y) {
  return { x: x, y: y };
}`;

    expect(compile(source, 'test.nl').trim()).toBe(expected.trim());
  });

  test('compiles array operations', () => {
    const source = `
type sum = { arr: []int }: int
func sum = { arr } {
  result = 0
  for i = 0; i < arr.length; i = i + 1 {
    result = result + arr[i]
  }
  return result
}
`;

    const expected = `
function sum(arr) {
  result = 0;
  for (i = 0; i < arr.length; i = i + 1) {
    result = result + arr[i];
  }
  return result;
}`;

    const result = compile(source, 'test.nl').trim();

    expect(result).toBe(expected.trim());
  });
});
