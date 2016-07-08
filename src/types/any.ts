import assert = require('assert')
import { TestFn, CompiledFn, compose, toNext, Ref, toValue, Context } from '../utils'
import { Rule, RuleOptions } from './rule'

export interface AnyOptions extends RuleOptions {
  required?: boolean
  default?: any | Ref
  uses?: Rule[]
}

export class Any extends Rule implements AnyOptions {

  type = 'Any'
  required = true
  default: any | Ref
  uses: Rule[] = []

  constructor (options: AnyOptions = {}) {
    super(options)

    if (options.default != null) {
      this.default = options.default
    }

    if (options.required != null) {
      this.required = options.required

      assert.ok(typeof this.required === 'boolean', `Expected "required" to be a boolean`)
    }

    if (options.uses != null) {
      this.uses = options.uses
    }

    this._tests.push(toDefaultTest(this.default))
    this._tests.push(toRequiredTest(this.required))
  }

  _isType (value: any, path: string[], context: Context): number {
    if (value == null) {
      if (this.required === false || this.default != null) {
        return 1
      }

      throw context.error(path, 'Any', 'required', this.required, value)
    }

    return 1 // Any value assigns to `any`.
  }

  /**
   * Compile types, making sure `uses` is always executed last.
   */
  _compile (): CompiledFn<any> {
    return compose([
      super._compile(),
      ...this.uses.map(type => type._compile())
    ])
  }

  /**
   * Override `_extend` to concat `uses`.
   */
  _extend (options: AnyOptions): AnyOptions {
    const result = super._extend(options) as AnyOptions

    if (options.uses) {
      result.uses = this.uses.concat(options.uses)
    }

    return result
  }

  /**
   * Override `toJSON` to serialise `uses` to JSON types.
   */
  toJSON () {
    const json = super.toJSON()
    json.uses = this.uses.map(x => x.toJSON())
    return json
  }

}

/**
 * Generate a "required" function.
 */
function toRequiredTest (required: boolean): TestFn<any> {
  if (!required) {
    return function (value, path, context, next) {
      // Skip the rest of validation for empty values.
      if (value == null) {
        return value
      }

      return next(value)
    }
  }

  return function (value, path, context, next) {
    if (value == null) {
      throw context.error(path, 'Any', 'required', required, value)
    }

    return next(value)
  }
}

/**
 * Set the default value during validation.
 */
function toDefaultTest (defaulted: any): TestFn<any> {
  if (defaulted == null) {
    return toNext
  }

  const defaultValue = toValue(defaulted)

  return function (value, path, context, next) {
    return next(value == null ? defaultValue(path, context) : value)
  }
}
