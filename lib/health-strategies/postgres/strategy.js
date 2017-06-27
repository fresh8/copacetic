const PingStrategy = require('../generic').PingStrategy

module.exports = (adapter, opts) => new PingStrategy(adapter, opts)
