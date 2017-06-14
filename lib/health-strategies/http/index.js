const StrategyFactoryProvider = require('../providers').StrategyFactoryProvider
const AdapterFactory = require('./adapters')
const HttpStrategy = require('./strategy')

module.exports = StrategyFactoryProvider(HttpStrategy, AdapterFactory)
