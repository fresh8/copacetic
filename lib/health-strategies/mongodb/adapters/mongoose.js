/**
 * An adapter for the mongoose library
 * https://github.com/Automattic/mongoose
 * @class
 */
class MongooseAdapter {
  constructor (mongoose) {
    this.client = mongoose
    this.connection = null
  }

  /**
   * @return {Boolean} Whether there is an active mongo connection
   */
  get isConnected () {
    return this.connection !== null
  }

  /**
   * @param {String} url Redis connection url
   * @param {Number} connectTimeout How long to wait when connecting, before timing out
   */
  connect (url, connectTimeoutMS) {
    return new Promise((resolve, reject) => {
      this.connection = this.client.createConnection(url, { connectTimeoutMS })

      this.connection.on('connected', () => {
        return resolve(true)
      })

      this.connection.on('error', (err) => {
        this.connection = null
        return reject(err)
      })

      this.connection.on('close', () => {
        this.connection = null
      })
    })
  }

  /**
   * Destroys the mongodb connection
   */
  close () {
    if (this.connection !== null) {
      return new Promise((resolve, reject) => {
        this.connection.close((err) => {
          if (err) {
            return reject(err)
          }

          return resolve(true)
        })
      })
    }

    return Promise.reject(
      new Error('tried to close a connection to mongo, but one does not exist')
    )
  }

  /**
   * Attempts to ping mongodb
   * @return {Promise.<Boolean>|Error>}
   */
  ping () {
    return new Promise((resolve, reject) => {
      this.connection.db.admin().ping((err, result) => {
        if (err) {
          this.connection = null
          return reject(err)
        }

        return resolve(true)
      })
    })
  }
}

module.exports = mongoose => new MongooseAdapter(mongoose)
