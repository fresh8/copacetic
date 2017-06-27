const AdapterFactoryProvider = require('../../providers').AdapterFactoryProvider
const SequelizeAdapter = require('./sequelize')

module.exports = AdapterFactoryProvider({
  sequelize: SequelizeAdapter
})
