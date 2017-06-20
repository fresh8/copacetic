const EventEmitter = require('events')

class MockMongooseConnection extends EventEmitter {
  constructor (errmsg) {
    super()
    this.errmsg = errmsg

    this.db = {
      admin: () => ({
        ping: (cb) => {
          if (this.errmsg) {
            return cb(new Error(this.errmsg))
          }

          return cb(null)
        }
      })
    }

    if (!errmsg) {
      setImmediate(() => this.emit('connected'))
    } else {
      setImmediate(() => this.emit('error', new Error(errmsg)))
    }
  }

  close (cb) {
    setImmediate(() => this.emit('close'))

    if (this.errmsg) {
      return cb(new Error(this.errmsg))
    }

    return cb(null)
  }
}

class MockMongooseClient {
  constructor (errmsg) {
    this.errmsg = errmsg
  }

  createConnection () {
    return new MockMongooseConnection(this.errmsg)
  }
}

module.exports = MockMongooseClient
