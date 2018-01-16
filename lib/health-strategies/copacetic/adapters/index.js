const AdapterFactoryProvider = require('../../providers').AdapterFactoryProvider
const ClusterMessage = require('./cluster-message')

module.exports = AdapterFactoryProvider({
  clusterMessage: ClusterMessage
})

