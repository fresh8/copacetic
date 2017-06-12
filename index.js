const path = require('path')

const dependencyLevel = require('./lib/dependency-level')
const Dependency = require('./lib/dependency')
const Copacetic = require('./lib/copacetic')
const HealthStrategyProvider = require('./lib/health-strategies').HealthStrategyProvider

const injector = require('./lib/util').injector(
  require('codependency').register(module)
)

module.exports = name => Copacetic(Dependency(injector))(name)

module.exports.dependencyLevel = dependencyLevel

module.exports.Middleware = require('./lib/middleware')

module.exports.healthStrategy = Object.freeze({
  http: require('./lib/health-strategies').HttpStrategy,
  mongodb: require('./lib/health-strategies').MongodbStrategy
})

module.exports.HealthStrategy = HealthStrategyProvider(injector)
