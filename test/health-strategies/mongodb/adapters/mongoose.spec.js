const expect = require('chai').expect

const MongodbMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoServer = new MongodbMemoryServer({ binary: { version: '3.2.9' } })
const mongoose = require('mongoose')

describe('MongodbStrategy - using the mongoose adapter', () => {
  let connectionUri
  let provideMongodbStrategy

  before(() => {
    provideMongodbStrategy = (...args) => {
      const CodependencyMock = require('../../../mocks/codependency')
      const Injector = require('../../../../lib/util/injector')
      const MongodbStrategyFactory = require('../../../../lib/health-strategies/mongodb')

      return MongodbStrategyFactory(
        Injector(CodependencyMock({
          mongoose: mongoose
        }))
      )
    }
    return mongoServer.getConnectionString()
      .then(function (uri) {
        connectionUri = uri
      })
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

    return strategy
      .check(connectionUri)
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(true)
        return strategy.cleanup()
      })
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(false)
      })
  })

  it('should return true when mongo is healthy', () => {
    const strategy = provideMongodbStrategy()()

    return strategy
      .check(connectionUri)
      .then((res) => {
        expect(res).to.equal(true)

        return strategy.check(connectionUri)
      })
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  it('should return an error when mongo is unhealthy', () => {
    const strategy = provideMongodbStrategy()()
    const mongoServer = new MongodbMemoryServer({ binary: { version: '3.2.9' } })
    let connectionUri
    return mongoServer.getConnectionString()
      .then(uri => {
        connectionUri = uri
        return mongoServer.stop()
      })
      .then(() => {
        return strategy
          .check(connectionUri)
      })
      .catch((err) => {
        expect(err.message).to.contain('ECONNREFUSED')
      })
  })

  it('should handle becoming healthy --> unhealthy', () => {
    const strategy = provideMongodbStrategy()()
    const mongoServer = new MongodbMemoryServer({ binary: { version: '3.2.9' } })
    let connectionUri
    return mongoServer.getConnectionString()
      .then(uri => {
        connectionUri = uri
        return strategy.check(uri)
      })
      .then((res) => {
        expect(res).to.equal(true)
        return strategy.check(connectionUri)
      })
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
      })
  })

  it('should handle becoming unhealthy --> healthy', () => {
    const strategy = provideMongodbStrategy('unreachable')()

    return strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err).to.be.ok

        return strategy.check(connectionUri)
      })
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  describe('when closing the connection', () => {
    it('should throw an error if no connection exists', () => {
      const strategy = provideMongodbStrategy('unreachable')()

      return strategy
        .adapter
        .close()
        .catch((err) => {
          expect(err.message).to.equal('tried to close a connection to mongo, but one does not exist')
        })
    })

    it('should return true if everything went OK', () => {
      const strategy = provideMongodbStrategy()()

      return strategy
        .check(connectionUri)
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

      return strategy
        .check(connectionUri)
        .then(() => {
          strategy.adapter.connection.errmsg = 'unreachable'
          return strategy.check()
        })
        .catch(() => {
          expect(strategy.adapter.isConnected).to.equal(false)
        })
    })
  })
})
