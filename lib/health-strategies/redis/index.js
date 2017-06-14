const StrategyFactoryProvider = require('../providers').StrategyFactoryProvider
const AdapterFactory = require('./adapters')
const RedisStrategy = require('./strategy')

module.exports = StrategyFactoryProvider(RedisStrategy, AdapterFactory)
