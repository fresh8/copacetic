class SequelizeMock {
  constuctor (errmsg) {
    this.errmsg = errmsg
    this.isConnected = false
  }

  close () {
    this.isConnected = false
  }

  authenticate () {
    if (this.errmsg) {
      this.isConnected = false
      return Promise.reject(new Error(this.errmsg))
    }
    this.isConnected = true

    return Promise.resolve(true)
  }
}

module.exports = SequelizeMock
