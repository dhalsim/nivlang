# Nivlang Features

## Language Overview
Nivlang is a modern programming language that compiles to Javascript. It combines TypeScript-like syntax with powerful features for type safety and error handling. The language is designed to be beginner-friendly with optional typing while providing strong type safety when needed.

## Syntax Goodies

- Paranthesis is required for Expressions that has more than 2 terms. `2 + (3 * 2)`
- A conditional or assignment has the same equality operators. `if x = 3 { x = 4 }`
- If condition's left side must be an identifier, right side must be a term (identifier or literal). i.e a function call is not permitted: `if x = someFunc() { ... }` would fail.

## Core Features

### Type System
- Optional typing for functions (types can be added gradually)
- Runtime type inspection

### Runtime Type Information (WIP)
```nl
// Type inspection at runtime
log(`type of param1: { type(param1) }, type of return: { type(return) }`)

// Type checking
if type(value) = types.string {
  // handle string
}
```

### Function Definitions
```nl
// With types
type functionName = { param1: type1, param2: type2 }: returnType
func functionName = { param1, param2 } {
  // function body
}

// Without types (for beginners)
func simpleFunction = { param1, param2 } {
  // function body
}
```

### Error Handling (WIP)
- Error-first pattern with tuple returns
- No exceptions, all errors are returned as values
- Standard error format using `symbol`
```nl
( result, err ) = someFunction()
if err != nil {
  return ( nil, err )
}
```

### Testing (WIP)
- Built-in test framework
- Expression-based assertions
- Automatic error logging and test failure
- Compiler sugar for test functions
```nl
// Simple test with automatic error handling
test myTest = () {
  expect(5, 3)  // Will automatically fail, log error, and stop test
}

// Manual error handling if needed
test complexTest = () {
  err = expect(actual, expected)
  if err != nil {
    // Custom error handling
    return { nil, err }
  }
  return { nil, nil }
}
```

### Array Operations (WIP)
- Array literals
- Slice operations
- Higher-order functions
```nl
// Array definition
arr = [1, 2, 3]

// Slice operation
sliced = slice(arr, -2, 2)  // [2, 3]

// Map operation
mapped = map(arr, ({ i, v }) {
  return v * 2 + i
})
```

### String Interpolation
- Backtick-based string literals
- Expression interpolation
```nl
`hello {name}`
```

### Object Features (WIP)
- Object destructuring
- Property access
- Object comparison (deep equality)
- Object iteration
```nl
{ key, value } = obj
for key, value in obj {
  // iteration body
}
```

### Standard Library (WIP)
- Error handling utilities
- Type checking and comparison
- Object manipulation
- Testing utilities
- Array operations
- Logging utilities

### Comparison Operations
- Value-based equality (`=`)
- Deep object comparison
- Type-aware comparison

### Import System
```nl
from std import { expect, ifnil, errors, symbol, log }
from arrays import { slice, map }
```

## Language Design Principles
1. Error handling as values
2. First-class types
3. Expression-oriented
4. Optional type safety
5. Consistent patterns
6. WebAssembly target
7. Beginner-friendly with room to grow
8. Rich standard library

## Future Considerations
- Pattern matching
- More type utilities
