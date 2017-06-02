const precond = require('precond')
const humanInterval = require('human-interval')

const HealthStrategy = require('./strategy')

/**
 * checks the availability of a service running over http
 * @class
 * @extends HealthStrategy
 */
class HttpStrategy extends HealthStrategy {
  constructor (timeout, request) {
    super(timeout)

    this.request = request
  }

  cleanup () {}

  /**
   * @param {String} url the endpoint used to check a service's health
   * @param {String} [timeout] the service becomes unhealthy if it does not
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
      .request(url, { timeout: timeoutMS })
      .then((res) => {
        if (res.status >= 400) return Promise.reject(res)

        return Promise.resolve(res)
      })
      .catch(err => Promise.reject(err))
  }
}

module.exports = HttpStrategy
