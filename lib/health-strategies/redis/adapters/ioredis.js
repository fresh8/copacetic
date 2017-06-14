/**
 * An adapter for the ioredis redis client
 * https://github.com/luin/ioredis
 * @class
 */
class IORedisAdapter {
  constructor (IORedis) {
    this.IORedis = IORedis
    this.isConnected = false
  }

  /**
   * @param {String} url Redis connection url
   * @param {Number} connectTimeout How long to wait when connecting, before timing out
   */
  connect (url, connectTimeout) {
    if (this.redis) {
      return this.redis.connect()
    }

    return new Promise((resolve, reject) => {
      this.redis = new this.IORedis(url, {
        connectTimeout
      })
      .on('connect', () => {
        this.isConnected = true
        return resolve(true)
      })
      .on('error', (err) => {
        this.isConnected = false
        return reject(err)
      })
      .on('close', () => {
        this.isConnected = false
      })
    })
  }

  /**
   * Disconnects from redis
   */
  close () {
    if (this.redis) {
      return this.redis.disconnect()
    }
  }

  /**
   * Attempts to ping redis
   * @return {Promise.<Boolean>|Error}
   */
  ping () {
    if (this.redis) {
      return this.redis.ping()
    }

    return Promise.reject('Redis instance does not exist')
  }
}

module.exports = IORedis => new IORedisAdapter(IORedis)
