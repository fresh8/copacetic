const StrategyFactoryProvider = require('../providers').StrategyFactoryProvider
const AdapterFactory = require('./adapters')
const IPCStrategy = require('./strategy')

module.exports = StrategyFactoryProvider(IPCStrategy, AdapterFactory)

