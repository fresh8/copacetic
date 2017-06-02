const precond = require('precond')
const humanInterval = require('human-interval')

const HealthStrategy = require('./strategy')

/**
 * checks the availability of a mongodb instance
 * @class
 * @extends HealthStrategy
 */
class MongodbStrategy extends HealthStrategy {
  constructor (timeout, client) {
    super(timeout)

    this.client = client
    this.connection = null
  }

  /**
   * @param {String} url - the mongo url
   * @param {String} timeout - how long to wait until giving up on a connection attempt
   * @return {Promise}
   */
  check (url, timeout = this.timeout) {
    if (this.connection === null) {
      return this._connect(url, timeout)
    }

    return this._ping()
  }

  /**
   * destroys the mongodb connection
   */
  cleanup () {
    if (this.connection !== null) {
      this.connection.close()
      this.connection = null
    }
  }

  /**
   * attempts to connect to mongodb
   */
  _connect (url, timeout) {
    const connectTimeoutMS = humanInterval(timeout)

    precond.checkIsNumber(
      connectTimeoutMS,
      'An invalid format was used for Ping Interval, check human-interval for examples'
    )

    return new Promise((resolve, reject) => {
      this.client.connect(url, {
        connectTimeoutMS
      }, (err, db) => {
        if (err !== null) {
          return reject(err)
        }
        this.connection = db

        this.connection.on('close', () => {
          this.connection = null
        })

        return resolve(true)
      })
    })
  }

  /**
   * attempts to pings mongodb
   */
  _ping () {
    return new Promise((resolve, reject) => {
      this.connection.command({ ping: 1 }, (err) => {
        if (err) {
          this.connection = null
          return reject(err)
        }

        return resolve(true)
      })
    })
  }
}

module.exports = MongodbStrategy
