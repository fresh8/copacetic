const ExponentialBackoffStrategy = require('./exponential')

/**
 * @constructs ExponentialBackoffStrategy
 * @param {Object} opts - args for creating an instance of ExponentialBackoffStrategy
 */
module.exports.ExponentialBackoffStrategy = (opts) => {
  return new ExponentialBackoffStrategy(opts)
}
