type expect = { actual: any, expected: any }: ( nil, error )
func expect = { actual, expected } {
  if !equals(actual, expected) {
    return (
      nil, 
      symbol({
        type: error,
        code: `EXPECTATION_FAILED`,
        message: `Expected {expected} but got {actual}`
      })
    )
  }
  return ( nil, nil )
}

type equals = { a: any, b: any }: bool
func equals = { a, b } {
  if a = nil && b = nil {
    return true
  }
  if a = nil || b = nil {
    return false
  }
  if typeof(a) != typeof(b) {
    return false
  }
  if typeof(a) = types.object {
    return equalsObject(a, b)
  }
  if typeof(a) = types.array {
    return equalsArray(a, b)
  }
  return a = b
}

type equalsObject = { a: object, b: object }: bool
func equalsObject = { a, b } {
  keysA = keys(a)
  keysB = keys(b)
  
  if length(keysA) != length(keysB) {
    return false
  }
  
  for key in keysA {
    if !has(b, key) {
      return false
    }
    if !equals(a[key], b[key]) {
      return false
    }
  }
  
  return true
}

type equalsArray = { a: array, b: array }: bool
func equalsArray = { a, b } {
  if length(a) != length(b) {
    return false
  }
  
  for i = 0; i < length(a); i++ {
    if !equals(a[i], b[i]) {
      return false
    }
  }
  
  return true
}

type keys = { obj: object }: array
func keys = { obj } {
  result = []
  for key, _ in obj {
    push(result, key)
  }
  return result
}

type values = { obj: object }: array
func values = { obj } {
  result = []
  for key in obj {
    push(result, obj[key])
  }
  return result
}

type has = { obj: object, key: string }: bool
func has = { obj, key } {
  for k in obj {
    if k = key {
      return true
    }
  }
  return false
}

type length = { value: any }: int
func length = { value } {
  if typeof(value) = types.array {
    return arrayLength(value)
  }
  
  if typeof(value) = types.object {
    return objectLength(value)
  }
  
  if typeof(value) = types.string {
    return stringLength(value)
  }
  
  panic({
    type: error,
    code: `INVALID_LENGTH`,
    message: `Cannot get length of {typeof(value)}`
  })
}

type ifnil = { value: ?any, default: any }: any
func ifnil = { value, default } {
  if value = nil {
    return default
  }
  return value
}

errors = {
  divbyzero: symbol({
    type: error,
    code: `DIVISION_BY_ZERO`,
    message: `Division by zero is not allowed`
  })
}

type symbol = { type: string, code: string, message: string }: error
func symbol = { type, code, message } {
  return {
    type,
    code,
    message
  }
} 