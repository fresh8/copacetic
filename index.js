const path = require('path')

const dependencyLevel = require('./lib/dependency-level')
const Dependency = require('./lib/dependency')
const Copacetic = require('./lib/copacetic')
const HealthFactoryProvider = require('./lib/health-strategies').HealthFactoryProvider

const injector = require('./lib/util').Injector(
  require('codependency').register(module)
)

module.exports = name => Copacetic(Dependency(injector))(name)

module.exports.dependencyLevel = dependencyLevel

module.exports.Middleware = require('./lib/middleware')

module.exports.HealthStrategy = HealthFactoryProvider(injector)
