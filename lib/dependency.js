const isObject = require('lodash.isobject')
const precond = require('precond')

const dependencyLevel = require('./dependency-level')
const HealthFactoryProvider = require('./health-strategies').HealthFactoryProvider
const ExponentialBackoffStrategy = require('./backoff-strategies').ExponentialBackoffStrategy

/**
 * @class
 * @classdesc Holds information about the health of a dependency, and executes strategies for
 * checking a dependency's health
 */
class Dependency {
  /**
   * @param {Function} [backoffStrategy=ExponentialBackoffStrategy] The behaviour of the delay
   * when re-checking a dependencys
   * @param {Function} [healthStrategy=HttpStrategy] The strategy used to check a dependency's
   * health
   * @param {Enum} [level] A description of the reliance on this dependency
   * @param {String} name The identifier to be used for a dependency
   * @param {String} [url] The location where the dependency can be reached
   */
  constructor ({ backoffStrategy, healthStrategy, level, name, url } = {}) {
    precond.checkArgument(
      isObject(backoffStrategy) && backoffStrategy.execute,
      'backoffStrategy must be of type object and have a "execute" method'
    )
    precond.checkArgument(
      isObject(healthStrategy) && healthStrategy.check,
      'healthStrategy must be of type object and have a "check" method'
    )
    precond.checkArgument(
      level === 'HARD' || level === 'SOFT',
      'a dependency must either have a dependency level of HARD or soft'
    )
    precond.checkIsString(name, 'The dependency name must be a string')
    precond.checkIsString(url, 'The dependency url must be a string')

    this.backoffStrategy = backoffStrategy
    this.healthStrategy = healthStrategy
    this.level = level
    this.healthy = true
    this.name = name
    this.url = url
  }

  /**
   * @return {Object} A description of the dependency's health
   */
  get healthSummary () {
    /**
     * Health information about a dependency
     * @typedef {Object} Dependency~HealthInfo
     * @property {String} name
     * @property {Boolean} healthy
     * @property {String} level
     * @property {Date} lastChecked
     */
    return {
      name: this.name,
      healthy: this.healthy,
      level: this.level,
      lastChecked: this.lastChecked
    }
  }

  /**
   * Sets a dependency's status to healthy
   */
  onHealthy () {
    this.healthy = true
    this.lastChecked = new Date()
  }

  /**
   * Sets a dependency's status to unhealthy
   */
  onUnhealthy () {
    this.healthy = false
    this.lastChecked = new Date()
  }

  /**
   * Performs any cleanup needed
   */
  cleanup () {
    this.healthStrategy.cleanup()
  }

  /**
   * @param {Integer} failAfter The number of times a dependency's health
   * will be checked, before giving up
   * @param {Integer} maxDelay The maximum interval of time to wait when retrying
   * @return {Promise}
   */
  check (retries, maxDelay) {
    return this
      .backoffStrategy
      .execute({
        func: () => this.healthStrategy.check(this.url),
        retries,
        maxDelay
      })
      .then(() => {
        this.onHealthy()

        return Promise.accept(this.healthSummary)
      })
      .catch(() => {
        this.onUnhealthy()

        return Promise.reject(this.healthSummary)
      })
  }
}

module.exports = (injector) => {
  const HealthStrategy = HealthFactoryProvider(injector)

  /**
   * @constructs Dependency
   * @param {Object} opts Args for creating an instance of Dependency
   */
  return ({
    backoffStrategy = ExponentialBackoffStrategy({
      failAfter: 3,
      maxDelay: 0,
      multiplier: 1000,
      onSuccessEvt: 'healthy',
      onFailureEvt: 'unhealthy'
    }),
    strategy = { type: 'http' },
    level = dependencyLevel.SOFT,
    name,
    url
  } = {}) => {
    return new Dependency({
      backoffStrategy,
      healthStrategy: HealthStrategy(strategy),
      level,
      name,
      url
    })
  }
}
