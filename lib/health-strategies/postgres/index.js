const StrategyFactoryProvider = require('../providers').StrategyFactoryProvider
const AdapterFactory = require('./adapters')
const PostgresStrategy = require('./strategy')

module.exports = StrategyFactoryProvider(PostgresStrategy, AdapterFactory)
