const fetch = require('node-fetch')
const MongoClient = require('mongodb').MongoClient
const precond = require('precond')

const _HttpStrategy = require('./http')
const _MongodbStrategy = require('./mongodb')

/**
 * @param {String} timeout
 * @param {Object} [request=fetch] the http client used for a health check
 * @constructs HttpStrategy
 */
function HttpStrategy (timeout = '1 second', request = fetch) {
  return new _HttpStrategy(timeout, request)
}

/**
 * @param {String} timeout
 * @param {Object} [client=MongoClient] the mongo client used for a health check
 * @constructs MongodbStrategy
 */
function MongodbStrategy (timeout = '1 second', client = MongoClient) {
  return new _MongodbStrategy(timeout, client)
}

module.exports.HttpStrategy = HttpStrategy

module.exports.MongodbStrategy = MongodbStrategy

/**
 * @param {String} type - the type of health strategy to construct
 * @param {String} [opts.timeout] the service becomes unhealthy if it does not
 * respond within this period
 * @param {Any} [opts.impl] - some concrete implementation a strategy can use to perform
 * a health check
 * @constructs {HealthStrategy}
 */
module.exports.healthFactory = (type, { timeout, impl } = {}) => {
  precond.checkArgument(
    type === 'http' ||
    type === 'mongodb',
    'Type must be "http", or "mongodb"'
  )

  switch (type) {
    case 'http': return HttpStrategy(timeout, impl)
    case 'mongodb': return MongodbStrategy(timeout, impl)
  }
}
