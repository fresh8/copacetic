const AdapterFactoryProvider = require('../../providers').AdapterFactoryProvider
const MongodbAdapter = require('./mongodb')

module.exports = AdapterFactoryProvider({
  mongodb: MongodbAdapter
})
