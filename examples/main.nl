from std import { expect, ifnil, errors, symbol, log, type }
from arrays import { slice, map }

test main = () { 
  param1 = 34
  param2 = 22.3
  param3 = `hello`

  // if expect is wrong, test will fail and log the error
  expect(
    main({ param1, param2, param3 }),
    `hello 56.3`
  )

  expect(
    main({ param1, param3 }),
    `hello 34`
  )
}
type main = { param1: int, param2: ?double, param3: string }: string
func main = { param1, param2, param3 } {
  // logs: type of param1: int, type of return: string
  log(`type of param1: { type(param1) }, type of return: { type(return) }`)

  return `hello {param1 + ifnil(param2, 0)}`
}

test divbyzero = () {
  expect(
    main({ param1: 10, param2: 0 }),
    { nil, errors.divbyzero }
  )

  expect(
    main({ param1: 10, param2: 2 }),
    { `hello 5`,  nil }
  )

  ( result, err ) = divbyzero({ param1: 10, param2: 2 })

  expect(err, nil)
  expect(result, `hello 5`)
}
type divbyzero = { param1: int, param2: int }: ( string, error )
func divbyzero = { param1, param2 } {
  return `hello { param1 / param2 }`
}

type greet = { name: string }: { string, error }
func greet = { name } {
  if name = "Joe" {
    return { 
      nil, 
      symbol({ 
        type: error, 
        code: `NO_JOE`, 
        message: `We don't like Joe` 
      }) 
    }
  }

  return `hello { name }!`
}

test arrays = () { 
  expect(arrays(), [2, 3])
}
func arrays = () {
  arr = [1, 2, 3]

  return slice(arr, -2, 2)
}

test mapping = () {
  expect(mapping(), [2, 5, 8])
}
func mapping = () {
  arr = [1, 2, 3]

  return map(
    arr, 
    ({ i, v}) {
      return v * 2 + i
    }
  )
}
