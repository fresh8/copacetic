const precond = require('precond')
const humanInterval = require('human-interval')

const HealthStrategy = require('../strategy')

/**
 * Connect to an adapter, then ping that adapter when connected
 * to check its health
 * @class
 * @extends HealthStrategy
 */
class ConnectThenPingStrategy extends HealthStrategy {
  constructor (adapter, { timeout } = {}) {
    super(timeout)

    this.adapter = adapter
  }

  /**
   * @param {String} url The connection url
   * @param {String} timeout How long to wait until giving up on a connection attempt
   * @return {Promise}
   */
  check (url, timeout = this.timeout) {
    if (this.adapter.isConnected) {
      return this.adapter.ping()
    }

    const connectTimeoutMS = humanInterval(timeout)

    precond.checkIsNumber(
      connectTimeoutMS,
      'An invalid format was used for Ping Interval, check human-interval for examples'
    )

    return this.adapter.connect(url, connectTimeoutMS)
  }

  /**
   * Destroys the connection
   */
  cleanup () {
    return this.adapter.close()
  }
}

module.exports = ConnectThenPingStrategy
