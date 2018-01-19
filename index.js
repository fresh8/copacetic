const path = require('path')

const dependencyLevel = require('./lib/dependency-level')
const Dependency = require('./lib/dependency')
const Copacetic = require('./lib/copacetic')
const HealthFactoryProvider = require('./lib/health-strategies').HealthFactoryProvider

const injector = require('./lib/util').Injector(
  require('codependency').register(module, {
    index: ['optionalPeerDependencies', 'devDependencies']
  })
)

module.exports = (name, mode) => Copacetic(Dependency(injector))(name, mode)

module.exports.dependencyLevel = dependencyLevel

module.exports.Middleware = require('./lib/middleware')

module.exports.HealthStrategy = HealthFactoryProvider(injector)

module.exports.joinCluster = require('./lib/cluster')
