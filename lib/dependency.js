const isObject = require('lodash.isobject')
const precond = require('precond')

const dependencyLevel = require('./dependency-level')
const HealthStrategyProvider = require('./health-strategies').HealthStrategyProvider
const ExponentialBackoffStrategy = require('./backoff-strategies').ExponentialBackoffStrategy

/**
 * @class
 * @classdesc holds information about the health of a dependency, and executes strategies for
 * checking a dependency's health
 */
class Dependency {
  /**
   * @param {Function} [backoffStrategy=ExponentialBackoffStrategy] the behaviour of the delay
   * when re-checking a dependency
   * @param {Function} [healthStrategy=HttpStrategy] the strategy used to check a dependency's
   * health
   * @param {Enum} [level] - a description of the reliance on this dependency
   * @param {String} name the identifier to be used for a dependency
   * @param {String} [url] the location where the dependency can be reached
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
   * @return {Object} a description of the dependency's health
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
   * sets a dependency's status to healthy
   */
  onHealthy () {
    this.healthy = true
    this.lastChecked = new Date()
  }

  /**
   * sets a dependency's status to unhealthy
   */
  onUnhealthy () {
    this.healthy = false
    this.lastChecked = new Date()
  }

  /**
   * performs any cleanup needed
   */
  cleanup () {
    this.healthStrategy.cleanup()
  }

  /**
   * @param {Integer} retries the number of times a dependency's health
   * will be checked, before giving up
   * @return {Promise}
   */
  check (retries) {
    return this
      ._getHealthStrategy(retries)
      .then(() => {
        this.onHealthy()

        return Promise.accept(this.healthSummary)
      })
      .catch(() => {
        this.onUnhealthy()

        return Promise.reject(this.healthSummary)
      })
  }

  /**
   * @param {Integer} retries the number of attempts to be made, before marking
   * a dependency as unhealthy
   * @return {Promise}
   */
  _getHealthStrategy (retries) {
    if (retries > 1) {
      return this
        .backoffStrategy
        .execute(() => this.healthStrategy.check(this.url))
    }

    return this
      .healthStrategy
      .check(this.url)
  }
}

module.exports = (injector) => {
  const HealthStrategy = HealthStrategyProvider(injector)

  /**
   * @constructs Dependency
   * @param {Object} opts - args for creating an instance of Dependency
   */
  return ({
    backoffStrategy = ExponentialBackoffStrategy({
      failAfter: 3,
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
