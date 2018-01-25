/**
 * @class
 * @classdesc requires peer dependencies
 */
class Injector {
  constructor (require) {
    this.require = require
  }

  /**
   * @param {Array<String>} moduleNames An array of module names
   * @param {Boolean} optional At least one module must be successfullly resolved, or
   * an error is thrown
   * @return {Object} A resolved dependency or undefined if none are found
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

  provideOne (moduleName, optional = false, allowSystem = false) {
    try {
      return this.require(moduleName, { optional })
    } catch (e) {
      if (e.message.indexOf('not found') > -1 && allowSystem) {
        return require(moduleName)
      }
      throw e
    }
  }
}

module.exports = require => new Injector(require)
