const precond = require('precond')

const ConnectThenPingStrategy = require('../generic').ConnectThenPingStrategy

module.exports = (adapter, opts) => new ConnectThenPingStrategy(adapter, opts)
