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

  close () {
    if (this.redis) {
      this.redis.disconnect()
    }
  }

  ping () {
    if (this.redis) {
      return this.redis.ping()
    }

    return Promise.reject('Redis instance does not exist')
  }
}

module.exports = IORedis => new IORedisAdapter(IORedis)
