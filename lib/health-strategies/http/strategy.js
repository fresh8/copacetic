const precond = require('precond')
const humanInterval = require('human-interval')

const HealthStrategy = require('../strategy')

/**
 * Checks the availability of a service running over http
 * @class
 * @extends HealthStrategy
 */
class HttpStrategy extends HealthStrategy {
  constructor (httpAdapter, { timeout } = {}) {
    super(timeout)

    this.httpAdapter = httpAdapter
  }

  /**
   * @param {String} url The endpoint used to check a service's health
   * @param {String} [timeout] The service becomes unhealthy if it does not
   * response within this period
   * @return {Promise}
   */
  check (url, timeout = this.timeout) {
    const timeoutMS = humanInterval(timeout)

    precond.checkIsNumber(
      timeoutMS,
      'An invalid format was used for Ping Interval, check human-interval for examples'
    )

    return this
      .httpAdapter
      .request(url, { timeout: timeoutMS })
      .then((res) => {
        if (this.httpAdapter.clientErr(res)) {
          return Promise.reject(res)
        }

        return Promise.resolve(res)
      })
  }

  cleanup () {}
}

module.exports = (adapter, opts) => new HttpStrategy(adapter, opts)
