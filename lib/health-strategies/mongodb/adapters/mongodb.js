/**
 * An adapter for the official node.js MongoDB driver
 * https://github.com/mongodb/node-mongodb-native
 * @class
 */
class MongodbAdapter {
  constructor (mongodb) {
    this.MongoClient = mongodb.MongoClient
    this.client = null
    this.db = null
  }

  /**
   * @return {Boolean} Whether there is an active mongo connection
   */
  get isConnected () {
    if (this.client) {
      return this.client.isConnected()
    }
    return false
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
        this.db = client.db()

        this.client.on('close', () => {
          this.client = null
          this.db = null
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
      this.db = null
    }
  }

  /**
   * Attempts to ping mongodb
   * @return {Promise.<Boolean>|Error}
   */
  ping () {
    return new Promise((resolve, reject) => {
      this.db.command({ ping: 1 }, (err) => {
        if (err) {
          this.client = null
          this.db = null
          return reject(err)
        }

        return resolve(true)
      })
    })
  }
}

module.exports = mongodb => new MongodbAdapter(mongodb)
