const precond = require('precond')
const humanInterval = require('human-interval')

const ConnectThenPingStrategy = require('../generic').ConnectThenPingStrategy

module.exports = (adapter, opts) => new ConnectThenPingStrategy(adapter, opts)
