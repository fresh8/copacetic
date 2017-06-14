/**
 * An adapter for the official node.js MongoDB driver
 * https://github.com/mongodb/node-mongodb-native
 * @class
 */
class MongodbAdapter {
  constructor (mongodb) {
    super()
    this.client = mongodb.MongoClient
    this.connection = null
  }

  /**
   * @return {Boolean} whether there is an active mongo connection
   */
  get isConnected () {
    return this.connection !== null
  }

  connect (url, connectTimeoutMS) {
    return new Promise((resolve, reject) => {
      this.client.connect(url, {
        connectTimeoutMS
      }, (err, db) => {
        if (err !== null) {
          return reject(err)
        }
        this.connection = db

        this.connection.on('close', () => {
          this.connection = null
        })

        return resolve(true)
      })
    })
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
   * attempts to pings mongodb
   * @return {Promise.<Boolean>|Error}
   */
  ping () {
    return new Promise((resolve, reject) => {
      this.connection.command({ ping: 1 }, (err) => {
        if (err) {
          this.connection = null
          return reject(err)
        }

        return resolve(true)
      })
    })
  }
}

module.exports = mongodb => new MongodbAdapter(mongodb)
