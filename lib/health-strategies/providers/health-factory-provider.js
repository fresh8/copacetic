const HttpStrategyFactory = require('../http')
const MongoDbStrategyFactory = require('../mongodb')

/**
 * provides a configurable factory for creating different health strategies
 * @param {Injector} injector
 * @return {function} factory method used for creating different health strategies
 *
 */
module.exports = (injector) => {
  const HttpStrategy = HttpStrategyFactory(injector)
  const MongodbStrategy = MongoDbStrategyFactory(injector)

  /**
   * @param {String} type
   * @param {Object} [opts]
   * @param {Function} [adapter]
   */
  return ({ type, opts = {}, adapter } = {}) => {
    switch (type) {
      case 'http': return HttpStrategy(adapter, opts)
      case 'mongodb': return MongodbStrategy(adapter, opts)
      default: return null
    }
  }
}
