const expect = require('chai').expect

describe('MongodbStrategy - using the mongoose adapter', () => {
  let provideMongodbStrategy

  before(() => {
    provideMongodbStrategy = (...args) => {
      const CodependencyMock = require('../../../mocks/codependency')
      const Injector = require('../../../../lib/util/injector')
      const MongodbStrategyFactory = require('../../../../lib/health-strategies/mongodb')
      const MockMongooseClient = require('../../../mocks/mongoose')

      return MongodbStrategyFactory(
        Injector(CodependencyMock({
          mongoose: new MockMongooseClient(...args)
        }))
      )
    }
  })

  describe('Definition', () => {
    it('should export a function', () => {
      expect(provideMongodbStrategy()).to.be.a('function')
    })

    it('should return a health strategy', () => {
      expect(provideMongodbStrategy()().check).to.be.a('function')
    })
  })

  describe('The adapter', () => {
    it('should be have a close method', () => {
      expect(provideMongodbStrategy()().adapter.close).to.be.a('function')
    })

    it('should be have a connect method', () => {
      expect(provideMongodbStrategy()().adapter.connect).to.be.a('function')
    })

    it('should be have a ping method', () => {
      expect(provideMongodbStrategy()().adapter.ping).to.be.a('function')
    })

    it('should have a isConnected property', () => {
      expect(provideMongodbStrategy()().adapter.isConnected).to.equal(false)
    })
  })

  it('should cleanup the connection', () => {
    const strategy = provideMongodbStrategy()()

    strategy
      .check('some-fake-url')
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(true)

        strategy.cleanup()
      })

    strategy.adapter.connection.on('close', () => {
      expect(strategy.adapter.isConnected).to.equal(false)
    })
  })

  it('should return true when mongo is health', () => {
    const strategy = provideMongodbStrategy()()

    // It should connect to redis first
    strategy
      .check('some-fake-url')
      .then((res) => {
        expect(res).to.equal(true)

        // It should ping redis once connected
        return strategy.check('some-fake-url')
      })
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  it('should return an error when mongo is unhealthy', () => {
    const strategy = provideMongodbStrategy('unreachable')()

    strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
      })
  })

  it('should handle becoming healthy --> unhealthy', () => {
    const strategy = provideMongodbStrategy()()

    strategy
      .check('some-fake-url')
      .then((res) => {
        expect(res).to.equal(true)

        strategy.adapter.connection.errmsg = 'unreachable'

        return strategy.check('some-fake-url')
      })
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
      })
  })

  it('should handle becoming unhealthy --> healthy', () => {
    const strategy = provideMongodbStrategy('unreachable')()

    strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
        strategy.adapter.client.errmsg = false

        return strategy.check('some-fake-url')
      })
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  describe('when closing the connection', () => {
    it('should throw an error if no connection exists', () => {
      const strategy = provideMongodbStrategy('unreachable')()

      strategy
        .adapter
        .close()
        .catch((err) => {
          expect(err.message).to.equal('tried to close a connection to mongo, but one does not exist')
        })
    })

    it('should return an error if something went wrong when closing the connection', () => {
      const strategy = provideMongodbStrategy()()

      strategy
        .check('some-fake-url')
        .then(() => {
          strategy.adapter.connection.errmsg = 'unreachable'

          return strategy.adapter.close()
        })
        .catch((err) => {
          expect(err.message).to.equal('unreachable')
        })
    })

    it('should return true if everything went OK', () => {
      const strategy = provideMongodbStrategy()()

      strategy
        .check('some-fake-url')
        .then(() => {
          return strategy.adapter.close()
        })
        .then((res) => {
          expect(res).to.equal(true)
        })
    })
  })

  describe('when pinging the connection', () => {
    it('should remove the connection if an error occurs', () => {
      const strategy = provideMongodbStrategy()()

      strategy
        .check('some-fake-url')
        .then(() => {
          strategy.adapter.connection.errmsg = 'unreachable'
          return strategy.check()
        })
        .then(() => {
          console.log('aye')
        })
        .catch(() => {
          expect(strategy.adapter.isConnected).to.equal(false)
        })
    })
  })
})
