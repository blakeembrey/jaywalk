import {
  AnyType,
  StringType,
  IntegerType,
  fromJSON,
  FloatType
} from './index'

describe('fromJSON', () => {
  it('should transform JSON to object model', () => {
    const type = fromJSON({ '@type': 'Any' })

    expect(type).toBeInstanceOf(AnyType)
  })
})

describe('AnyType', () => {
  it('should create `Any` type', () => {
    const type = fromJSON({ '@type': 'Any' })

    expect(type).toBeInstanceOf(AnyType)
    expect(type.isAssignable(new IntegerType())).toEqual(true)
    expect(new StringType().isAssignable(type)).toEqual(false)
  })
})

describe('IntegerType', () => {
  it('should create `Integer` type', () => {
    const type = fromJSON({ '@type': 'Integer' })

    expect(type).toBeInstanceOf(IntegerType)
    expect(type.isAssignable(new StringType())).toEqual(false)
    expect(new StringType().isAssignable(type)).toEqual(false)
  })
})

describe('ListType', () => {
  it('should create `List` type', () => {
    const typeWithAny = fromJSON({ '@type': 'List', items: { '@type': 'Any' } })
    const typeWithString = fromJSON({
      '@type': 'List',
      items: { '@type': 'String' }
    })

    expect(new AnyType().isAssignable(typeWithAny)).toEqual(true)
    expect(new AnyType().isAssignable(typeWithString)).toEqual(true)
    expect(new StringType().isAssignable(typeWithString)).toEqual(false)
    expect(typeWithAny.isAssignable(typeWithString)).toEqual(true)
    expect(typeWithString.isAssignable(typeWithAny)).toEqual(false)
    expect(typeWithAny.isAssignable(new StringType())).toEqual(false)
  })
})

describe('ObjectType', () => {
  it('should create `Object` type', () => {
    const type = fromJSON({
      '@type': 'Object',
      properties: [
        {
          '@type': 'Property',
          key: 'foo',
          value: { '@type': 'Float' }
        }
      ]
    })

    const typeWithRequired = fromJSON({
      '@type': 'Object',
      properties: [
        {
          '@type': 'Property',
          key: 'foo',
          value: { '@type': 'Float' },
          required: true
        }
      ]
    })

    const typeWithMismatch = fromJSON({
      '@type': 'Object',
      properties: [
        {
          '@type': 'Property',
          key: 'bar',
          value: { '@type': 'String' }
        }
      ]
    })

    expect(type.isAssignable(new FloatType())).toEqual(false)
    expect(type.isAssignable(typeWithRequired)).toEqual(true)
    expect(typeWithRequired.isAssignable(type)).toEqual(false)
    expect(new FloatType().isAssignable(type)).toEqual(false)
    expect(type.isAssignable(typeWithMismatch)).toEqual(true)
    expect(typeWithMismatch.isAssignable(type)).toEqual(true)
    expect(typeWithMismatch.isAssignable(typeWithRequired)).toEqual(true)
    expect(typeWithRequired.isAssignable(typeWithMismatch)).toEqual(false)
  })
})
