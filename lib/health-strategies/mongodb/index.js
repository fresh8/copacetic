const StrategyFactoryProvider = require('../providers').StrategyFactoryProvider
const AdapterFactory = require('./adapters')
const MongodbStrategy = require('./strategy')

module.exports = StrategyFactoryProvider(MongodbStrategy, AdapterFactory)
