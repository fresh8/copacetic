const precond = require('precond')
const humanInterval = require('human-interval')

const HealthStrategy = require('../strategy')

/**
 * checks the availability of a redis instance
 * @class
 * @extends HealthStrategy
 */
class RedisStrategy extends HealthStrategy {
  constructor (redisAdapter, { timeout } = {}) {
    super(timeout)

    this.redisAdapter = redisAdapter
  }

  /**
   * @param {String} url - the redis url
   * @param {String} timeout - how long to wait until giving up on a connection attempt
   * @return {Promise}
   */
  check (url, timeout = this.timeout) {
    if (this.redisAdapter.isConnected) {
      return this.redisAdapter.ping()
    }

    const connectTimeoutMS = humanInterval(timeout)

    precond.checkIsNumber(
      connectTimeoutMS,
      'An invalid format was used for Ping Interval, check human-interval for examples'
    )

    return this.redisAdapter.connect(url, connectTimeoutMS)
  }

  /**
   * destroys the mongodb connection
   */
  cleanup () {
    this.redisAdapter.close()
  }
}

module.exports = RedisStrategy
