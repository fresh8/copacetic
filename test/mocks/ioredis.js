const EventEmitter = require('events')

class MockIORedisClient extends EventEmitter {
  constructor (shouldConnect, errmsg = '') {
    super()
    this.shouldConnect = shouldConnect
    this.errmsg = errmsg

    if (shouldConnect) {
      setImmediate(() => this.emit('connect'))
    } else {
      setImmediate(() => this.emit('error', new Error(errmsg)))
    }
  }

  connect () {
    return this._mockEvent('connect')
  }

  disconnect () {
    return this._mockEvent('close')
  }

  ping () {
    return this._mockEvent('ping')
  }

  _mockEvent (evt) {
    return new Promise((resolve, reject) => {
      if (this.shouldConnect) {
        setImmediate(() => this.emit(evt))
        return resolve(true)
      }

      setImmediate(() => this.emit('error', new Error(this.errmsg)))
      return reject(new Error(this.errmsg))
    })
  }
}

module.exports = MockIORedisClient
