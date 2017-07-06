/**
 * An adapter for the sequelize library
 * https://github.com/sequelize/sequelize
 * @class
 */
class SequelizeAdapter {
  constructor (Sequelize) {
    this.Sequelize = Sequelize
  }

  /**
   * @return {Boolean} Whether there is an active mongo connection
   */
  get isConnected () {
    return this.connection !== null
  }

  /**
   * Destroys the postgres connection
   */
  close () {
    if (this.connection) {
      this.connection.close()
      this.connection = null
    }
  }

  /**
   * Attempts to ping postgres
   * @return {Promise.<Boolean>|Error>}
   */
  ping (url) {
    if (!this.connection) {
      this.connection = new this.Sequelize(url, { logging: false })
    }

    return this.connection.authenticate()
  }
}

module.exports = sequelize => new SequelizeAdapter(sequelize)
