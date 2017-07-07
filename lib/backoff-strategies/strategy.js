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
   * @param {Function} func - the function to execute, must have a signature of () => Promise
   * @return {Promise}
   */
  execute ({ func = this.func, retries = this.retries, maxDelay = this.maxDelay }) {
    this.func = func

    const retry = new Promise((resolve, reject) => {
      let attempt = 1

      const loop = () => {
        // console.log('called')
        this
          .func()
          .then(res => resolve(res))
          .catch((err) => {
            attempt += 1
            // if retries is 0 just keep retrying
            if (retries === 0) {
              return setTimeout(loop, this._intervalFunc(attempt))
            }
            // otberwise, keep going until some limit
            if (attempt <= retries) {
              // if there is no maximum deley, just backoff again
              if (maxDelay === 0) {
                return setTimeout(loop, this._intervalFunc(attempt))
              }
              // if the maximum delay has been reached
              if ((maxDelay >= 0) && (this.lastDelay >= maxDelay)) {
                return setTimeout(loop, this.lastDelay)
              }
              // calculated a new delay
              this.lastDelay = Math.min(this._intervalFunc(attempt), maxDelay)

              return setTimeout(loop, this.lastDelay)
            }

            return reject(err)
          })
      }

      loop()
    })

    return retry
  }
}

module.exports = BackoffStrategy
