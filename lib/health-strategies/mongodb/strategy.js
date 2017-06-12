const precond = require('precond')
const humanInterval = require('human-interval')

const HealthStrategy = require('../strategy')

/**
 * checks the availability of a mongodb instance
 * @class
 * @extends HealthStrategy
 */
class MongodbStrategy extends HealthStrategy {
  constructor (mongoAdapter, { timeout }) {
    super(timeout)

    this.mongoAdapter = mongoAdapter
  }

  /**
   * @param {String} url - the mongo url
   * @param {String} timeout - how long to wait until giving up on a connection attempt
   * @return {Promise}
   */
  check (url, timeout = this.timeout) {
    if (this.mongoAdapter.isConnected) {
      return this.mongoAdapter.ping()
    }

    const connectTimeoutMS = humanInterval(timeout)

    precond.checkIsNumber(
      connectTimeoutMS,
      'An invalid format was used for Ping Interval, check human-interval for examples'
    )

    return this.mongoAdapter.connect(url, connectTimeoutMS)
  }

  /**
   * destroys the mongodb connection
   */
  cleanup () {
    this.mongoAdapter.close()
  }
}

module.exports = MongodbStrategy
