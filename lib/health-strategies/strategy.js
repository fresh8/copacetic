const precond = require('precond')
const humanInterval = require('human-interval')

/**
 * @class
 * @classdesc An abstract class, defining the skeleton for a health
 * check strategy
 */
class HealthStrategy {
  /**
   * @param {String} [timeout] The service becomes unhealthy if it does not
   * respond within this period
   */
  constructor (timeout = '1 second') {
    precond.checkIsNumber(
      humanInterval(timeout),
      'An invalid format was used for Ping Interval, check human-interval for examples'
    )

    if (new.target === HealthStrategy) {
      throw new TypeError('HealthStrategy cannot be constructed directly')
    }

    this.timeout = timeout
  }

  /**
   * Check whether a service is healthy
   * @abstract
   */
  check () {
    throw new Error('check() must be implemented by a subclass')
  }

  /**
   * Any cleanup operation that may need to be done when a service
   * is destroyed
   * @abstract
   */
  cleanup () {
    throw new Error('clenup() must be implemented by a subclass')
  }
}

module.exports = HealthStrategy
