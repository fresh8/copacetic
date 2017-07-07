const noop = require('node-noop').noop
const precond = require('precond')

/**
 * @class
 * @classdesc An abstract class, defining the skeleton for a backoff strategy,
 * it is expected that this will be subclassed, with an implementation of
 * _intervalFunc
 */
class BackoffStrategy {
  /**
   * @param {Integer} [retries=3] The total number of attempts a backoff strategy will perform
   * @param {Integer} [maxDelay=0] The maximum delay before retrying, 0 = no max.
   */
  constructor (retries = 3, maxDelay = 0) {
    precond.checkArgument(retries > 0, 'retries must be an integer > 0')

    this.retries = retries
    this.maxDelay = maxDelay
    this.func = noop
    this.lastDelay = 0
  }

  /**
   * starts the execution of "func", backing off at some Interval.
   * @param {Function} [func=noop] - the function to execute, must have a signature of () => Promise
   * @param {Integer} [retries=1] How many times func will be called before giving up
   * @param {Integer} [maxDelay=0] The maximum interval of time to wait when retrying
   * @return {Promise}
   */
  execute ({ func = this.func, retries = this.retries, maxDelay = this.maxDelay }) {
    this.func = func
    this.lastDelay = 0

    const retry = new Promise((resolve, reject) => {
      let attempt = 1

      const loop = () => {
        this
          .func()
          .then(res => resolve(res))
          .catch((err) => {
            console.log('checking')
            attempt += 1

            if ((retries === 0) || (attempt <= retries)) {
              return setTimeout(
                loop,
                this._scheduleNextTry(attempt, maxDelay)
              )
            }

            return reject(err)
          })
      }
      loop()
    })

    return retry
  }

  /**
   * Calculates the next delay before executing func
   * @param {Integer} attempt
   * @param {Integer} maxDelay
   */
  _scheduleNextTry (attempt, maxDelay = 0) {
    if (maxDelay < 0) {
      maxDelay = 0
    }

    if (maxDelay === 0) {
      return this._intervalFunc(attempt)
    }

    return Math.min(this._intervalFunc(attempt), maxDelay)
  }
}

module.exports = BackoffStrategy
