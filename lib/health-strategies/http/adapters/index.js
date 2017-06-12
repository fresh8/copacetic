const AdapterFactoryProvider = require('../../providers').AdapterFactoryProvider
const NodeFetchAdapter = require('./node-fetch')

module.exports = AdapterFactoryProvider({
  'node-fetch': NodeFetchAdapter
})
