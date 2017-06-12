/**
 * @class
 * @classdesc mongodb adapters are expected to adhere to the interface
 * defined here
 */
class MongoDbTarget {
  /**
   * @return {Boolean} whether there is an active mongo connection
   */
  get isConnected () {
    return this.connection !== null
  }

  /**
   * destroys the mongodb connection
   */
  close () {
    if (this.connection !== null) {
      this.connection.close()
      this.connection = null
    }
  }

  /**
   * attempts to connect to mongodb
   * @param {String} url
   * @param {Integer} [timeout]
   * @return {Promise.<Boolean>|Error}
   */
  connect (url, timeout) {}

  /**
   * attempts to pings mongodb
   * @return {Promise.<Boolean>|Error}
   */
  ping () {}
}

module.exports = MongoDbTarget
