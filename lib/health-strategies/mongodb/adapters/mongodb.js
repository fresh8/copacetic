/**
 * An adapter for the official node.js MongoDB driver
 * https://github.com/mongodb/node-mongodb-native
 * @class
 */
class MongodbAdapter {
  constructor (mongodb) {
    this.MongoClient = mongodb.MongoClient
    this.client = null
    this.connection = null
  }

  /**
   * @return {Boolean} Whether there is an active mongo connection
   */
  get isConnected () {
    return this.client !== null
  }

  /**
   * @param {String} url MongoDB connection url
   * @param {Number} connectTimeout How long to wait when connecting, before timing out
   */
  connect (url, connectTimeoutMS) {
    return new Promise((resolve, reject) => {
      this.MongoClient.connect(url, {
        connectTimeoutMS
      }, (err, client) => {
        if (err !== null) {
          return reject(err)
        }
        this.client = client

        this.client.on('close', () => {
          this.client = null
        })

        return resolve(true)
      })
    })
  }

  /**
   * Destroys the mongodb connection
   */
  close () {
    if (this.client !== null) {
      this.client.close()
      this.client = null
    }
  }

  /**
   * Attempts to ping mongodb
   * @return {Promise.<Boolean>|Error}
   */
  ping () {
    return new Promise((resolve, reject) => {
      this.client.command({ ping: 1 }, (err) => {
        if (err) {
          this.client = null
          return reject(err)
        }

        return resolve(true)
      })
    })
  }
}

module.exports = mongodb => new MongodbAdapter(mongodb)
