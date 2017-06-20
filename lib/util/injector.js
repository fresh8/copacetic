/**
 * @class
 * @classdesc requires peer dependencies
 */
class Injector {
  constructor (require) {
    this.require = require
  }

  /**
   * @param {Array<String>} moduleNames - an array of module names
   * @param {Boolean} optional - at least one module must be successfullly resolved, or
   * an error is thrown
   * @return {Object} a resolved dependency or undefined if none are found
   */
  provideAny (moduleNames, optional = true) {
    for (const name of moduleNames) {
      const exported = this.provideOne(name, true)

      if (exported) {
        /**
         * A resolved, optional peer dependency
         * @typedef {Object} Injector~Dependency
         * @property {String} name
         * @property {Module} exported
         */
        return { name, exported }
      }
    }

    if (!optional) {
      throw new Error(`Could not resolve any of ${moduleNames}, but at least one was required`)
    }
  }

  provideOne (moduleName, optional = false) {
    return this.require(moduleName, { optional })
  }
}

module.exports = require => new Injector(require)
