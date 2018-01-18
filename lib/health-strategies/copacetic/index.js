const StrategyFactoryProvider = require('../providers').StrategyFactoryProvider
const AdapterFactory = require('./adapters')
const CopaceticStrategy = require('./strategy')

module.exports = StrategyFactoryProvider(CopaceticStrategy, AdapterFactory)

