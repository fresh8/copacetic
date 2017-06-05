const dependencyLevel = require('./lib/dependency-level')

const Copacetic = require('./lib/copacetic')

module.exports = name => new Copacetic(name)

module.exports.dependencyLevel = dependencyLevel

module.exports.Middleware = require('./lib/middleware')

module.exports.healthStrategy = Object.freeze({
  http: require('./lib/health-strategies').HttpStrategy,
  mongodb: require('./lib/health-strategies').MongodbStrategy
})

module.exports.healthFactory = require('./lib/health-strategies').healthFactory
