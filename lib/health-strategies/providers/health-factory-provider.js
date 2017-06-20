const HttpStrategyFactory = require('../http')
const MongoDbStrategyFactory = require('../mongodb')
const RedisDbStrategyFactory = require('../redis')

/**
 * provides a configurable factory for creating different health strategies
 * @param {Injector} injector
 * @return {function} factory method used for creating different health strategies
 *
 */
module.exports = (injector) => {
  const HttpStrategy = HttpStrategyFactory(injector)
  const MongodbStrategy = MongoDbStrategyFactory(injector)
  const RedisStrategy = RedisDbStrategyFactory(injector)

  /**
   * @param {String} type
   * @param {Object} [opts]
   * @param {Function} [adapter]
   */
  return ({ type, opts = {}, adapter } = {}) => {
    switch (type) {
      case 'http': return HttpStrategy(adapter, opts)
      case 'mongodb': return MongodbStrategy(adapter, opts)
      case 'redis': return RedisStrategy(adapter, opts)
      default: return null
    }
  }
}
