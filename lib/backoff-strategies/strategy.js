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
   * @param {Integer} [failAfter] - the total number of attempts a backoff strategy will perform
   */
  constructor (failAfter = 5) {
    precond.checkArgument(failAfter > 0, 'failAfter must be an integer > 0')

    this.failAfter = failAfter
    this.func = noop
  }

  /**
   * starts the execution of "func", backing off at some Interval.
   * @param {Function} func - the function to execute, must have a signature of () => Promise
   * @return {Promise}
   */
  execute (func) {
    this.func = func

    const retry = new Promise((resolve, reject) => {
      let attempt = 1

      const loop = () => {
        this
          .func()
          .then(res => resolve(res))
          .catch((err) => {
            attempt += 1
            if (attempt < this.failAfter) {
              return setTimeout(loop, this._intervalFunc(attempt))
            }
            reject(err)
          })
      }

      loop()
    })

    return retry
  }
}

module.exports = BackoffStrategy
