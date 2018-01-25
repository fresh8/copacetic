const HttpStrategyFactory = require('../http')
const MongoDbStrategyFactory = require('../mongodb')
const RedisStrategyFactory = require('../redis')
const PostgresStrategyFactory = require('../postgres')
const CopaceticStrategyFactory = require('../copacetic')

/**
 * Provides a configurable factory for creating different health strategies
 * @param {Injector} injector
 * @return {function} Factory method used for creating different health strategies
 *
 */
module.exports = (injector) => {
  const HttpStrategy = HttpStrategyFactory(injector)
  const MongodbStrategy = MongoDbStrategyFactory(injector)
  const RedisStrategy = RedisStrategyFactory(injector)
  const PostgresStrategy = PostgresStrategyFactory(injector)
  const CopaceticStrategy = CopaceticStrategyFactory(injector)

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
      case 'postgres': return PostgresStrategy(adapter, opts)
      case 'copacetic': return CopaceticStrategy(adapter, opts)
      case 'mockedStrategy': return injector.provideOne('mockedStrategy', true)
      default: return null
    }
  }
}
