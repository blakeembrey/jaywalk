import omit = require('object.omit')
import { TestFn, CompiledFn, compose, merge } from '../utils'

export interface RuleOptions {
  description?: string
  meta?: any
  example?: any
}

export class Rule implements RuleOptions {

  type = 'Any'
  description: string
  meta: any = {}
  example: any

  _tests: Array<TestFn<any>> = []

  constructor (options: RuleOptions = {}) {
    if (options.description != null) {
      this.description = options.description
    }

    if (options.meta != null) {
      this.meta = options.meta
    }

    if (options.example != null) {
      this.example = options.example
    }
  }

  /**
   * Synchronous, structural type-check.
   */
  _isType (value: any): number {
    return 0
  }

  /**
   * Check whether a type is a sub-type of this type.
   */
  _typeOf (other: Rule): boolean {
    return other instanceof this.constructor
  }

  /**
   * Compile the tests into a promise chain.
   */
  _compile (): CompiledFn<any> {
    return compose(this._tests)
  }

  /**
   * Use `_extend` to provide option merging.
   */
  _extend (options: any): any {
    return merge(this.toJSON(), options)
  }

  /**
   * Output as a JSON object.
   */
  toJSON () {
    return omit(this, ['_tests'])
  }

}
