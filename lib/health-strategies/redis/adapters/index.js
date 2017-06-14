const AdapterFactoryProvider = require('../../providers').AdapterFactoryProvider
const IORedisAdapter = require('./ioredis')

module.exports = AdapterFactoryProvider({
  ioredis: IORedisAdapter
})
