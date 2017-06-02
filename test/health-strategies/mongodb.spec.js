const expect = require('chai').expect

const MongodbStrategy = require('../../lib/health-strategies').MongodbStrategy

describe('MongodbStrategy', () => {
  const mockClient = {
    shouldAccept: true,
    err: null,
    connect (url, opts, cb) {
      this.shouldAccept ? cb(null, this) : cb(this.err)
    },
    command (opts, cb) {
      this.shouldAccept ? cb(null, this) : cb(this.err)
    },
    on (evt, cb) {
      this.cb = cb
    },
    triggerClose () {
      this.cb()
    }
  }

  it('should export a function', () => {
    expect(MongodbStrategy).to.be.a('function')
  })

  it('should cleanup', () => {
    const strategy = MongodbStrategy('1 second', mockClient)

    strategy
      .check('some-fake-url')
      .then(() => {
        strategy.cleanup()

        expect(strategy.connection).to.equal(null)
      })
  })

  it('should return a health strategy', () => {
    expect(MongodbStrategy().check).to.be.a('function')
  })

  it('should return true when mongo is healthy', () => {
    const strategy = MongodbStrategy('1 second', mockClient)

    strategy
      .check('some-fake-url')
      .then((res) => {
        expect(res).to.equal(true)
      })
      .catch(e => e)

    strategy
        .check('some-fake-url')
        .then((res) => {
          expect(res).to.equal(true)
        })
        .catch(e => e)
  })

  it('should return an error when mongo is unhealthy', () => {
    mockClient.shouldAccept = false
    mockClient.err = 'Something went wrong!'

    MongodbStrategy('1 second', mockClient)
      .check('some-fake-url')
      .catch((err) => {
        expect(err).to.equal('Something went wrong!')
      })
  })

  it('should handle becoming healthy --> unhealthy', () => {
    mockClient.shouldAccept = true

    const strategy = MongodbStrategy('1 second', mockClient)

    strategy
      .check('some-fake-url')
      .then((res) => {
        expect(res).to.equal(true)
      })
      .then(() => {
        mockClient.shouldAccept = false

        return strategy.check('some-fake-url')
      })
      .catch((err) => {
        expect(err).to.equal('Something went wrong!')
      })
  })

  it('should handle becoming unhealthy --> healthy', () => {
    mockClient.shouldAccept = false

    const strategy = MongodbStrategy('1 second', mockClient)

    strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err).to.equal('Something went wrong!')
      })
      .then(() => {
        mockClient.shouldAccept = true

        return strategy.check('some-fake-url')
      })
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  it('should handle a connection closing', () => {
    const strategy = MongodbStrategy('1 second', mockClient)

    strategy
      .check('some-fake-url')
      .then((res) => {
        expect(res).to.equal(true)

        mockClient.triggerClose()

        return strategy.check('some-fake-url')
      })
      .catch((err) => {
        expect(err).to.equal('Something went wrong!')
      })
  })
})
