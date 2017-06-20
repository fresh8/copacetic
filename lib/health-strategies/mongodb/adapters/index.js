const AdapterFactoryProvider = require('../../providers').AdapterFactoryProvider
const MongodbAdapter = require('./mongodb')
const MongooseAdapter = require('./mongoose')

module.exports = AdapterFactoryProvider({
  mongodb: MongodbAdapter,
  mongoose: MongooseAdapter
})
