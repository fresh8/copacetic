const precond = require('precond')

const BackoffStrategy = require('./strategy')

/**
 * @class
 * @classdesc implements exponential backoff
 * @extends BackoffStrategy
 */
class ExponentialBackoffStrategy extends BackoffStrategy {
  /**
   * @param {Number} [constant=2]
   * @param {Number} [multiplier=1]
   * @param {Number} [failAfter=3]
   * @param {Number} [maxDelay=0]
   */
  constructor ({ constant = 2, multiplier = 1, failAfter, maxDelay } = {}) {
    super(failAfter, maxDelay)
    precond.checkArgument(constant > 0, 'startDelay must be an integer > 0')
    precond.checkArgument(multiplier > 0, 'multiplier must be an integer > 0')

    this.constant = constant
    this.multiplier = multiplier
  }

  /**
   * @param {Integer} attempt
   * @return {Number} The backoff time
   */
  _intervalFunc (attempt) {
    return Math.pow(this.constant, attempt) * this.multiplier
  }
}

module.exports = ExponentialBackoffStrategy
