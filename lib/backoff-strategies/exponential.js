const precond = require('precond')

const BackoffStrategy = require('./strategy')

/**
 * @class
 * @classdesc implements exponential backoff
 * @extends BackoffStrategy
 */
class ExponentialBackoffStrategy extends BackoffStrategy {
  /**
   * @param {Number} opts.constant
   * @param {Number} opts.startExponent
   * @param {Number} opts.failAfter
   * @param {Number} opts.multiplier
   */
  constructor ({ constant = 2, failAfter, multiplier = 1 } = {}) {
    super(failAfter)
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
