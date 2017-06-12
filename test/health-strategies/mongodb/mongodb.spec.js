const expect = require('chai').expect

describe('MongodbStrategy', () => {
  const mockMongodbClient = {
    MongoClient: {
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
      },
      close () {}
    }
  }

  let MongodbStrategy

  before(() => {
    const CodependencyMock = require('../../mocks/codependency')
    const Injector = require('../../../lib/util/injector')
    const MongodbStrategyFactory = require('../../../lib/health-strategies/mongodb')

    MongodbStrategy = MongodbStrategyFactory(
      Injector(CodependencyMock({
        mongodb: mockMongodbClient
      }))
    )
  })

  it('should export a function', () => {
    expect(MongodbStrategy).to.be.a('function')
  })

  it('should return a health strategy', () => {
    expect(MongodbStrategy().check).to.be.a('function')
  })

  describe('when using the mongodb client', () => {
    it('should cleanup', () => {
      const strategy = MongodbStrategy()

      strategy
        .check('some-fake-url')
        .then(() => {
          strategy.cleanup()

          expect(strategy.mongoAdapter.connection).to.equal(null)
        })
    })

    it('should return true when mongo is healthy', () => {
      const strategy = MongodbStrategy()

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
      mockMongodbClient.MongoClient.shouldAccept = false
      mockMongodbClient.MongoClient.err = 'Something went wrong!'

      MongodbStrategy()
        .check('some-fake-url')
        .catch((err) => {
          expect(err).to.equal('Something went wrong!')
        })
    })

    it('should handle becoming healthy --> unhealthy', () => {
      mockMongodbClient.MongoClient.shouldAccept = true

      const strategy = MongodbStrategy()

      strategy
        .check('some-fake-url')
        .then((res) => {
          expect(res).to.equal(true)
        })
        .then(() => {
          mockMongodbClient.MongoClient.shouldAccept = false

          return strategy.check('some-fake-url')
        })
        .catch((err) => {
          expect(err).to.equal('Something went wrong!')
        })
    })

    it('should handle becoming unhealthy --> healthy', () => {
      mockMongodbClient.MongoClient.shouldAccept = false

      const strategy = MongodbStrategy()

      strategy
        .check('some-fake-url')
        .catch((err) => {
          expect(err).to.equal('Something went wrong!')
        })
        .then(() => {
          mockMongodbClient.MongoClient.shouldAccept = true

          return strategy.check('some-fake-url')
        })
        .then((res) => {
          expect(res).to.equal(true)
        })
    })

    it('should handle a connection closing', () => {
      const strategy = MongodbStrategy()

      strategy
        .check('some-fake-url')
        .then((res) => {
          expect(res).to.equal(true)

          mockMongodbClient.MongoClient.triggerClose()

          return strategy.check('some-fake-url')
        })
        .catch((err) => {
          expect(err).to.equal('Something went wrong!')
        })
    })
  })
})
