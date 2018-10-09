const MongoClient = require('mongodb')
const expect = require('chai').expect

const MongodbMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoServer = new MongodbMemoryServer({binary: { version: '3.2.9' }})

describe('MongodbStrategy - using the mongodb adapter', () => {
  let connectionUri
  let MongodbStrategy

  before(() => {
    const CodependencyMock = require('../../../mocks/codependency')
    const Injector = require('../../../../lib/util/injector')
    const MongodbStrategyFactory = require('../../../../lib/health-strategies/mongodb')

    MongodbStrategy = MongodbStrategyFactory(
      Injector(CodependencyMock({
        mongodb: MongoClient
      }))
    )
    return mongoServer.getConnectionString()
      .then(function(uri) {
        connectionUri = uri
      })
  })

  it('should export a function', () => {
    expect(MongodbStrategy).to.be.a('function')
  })

  it('should return a health strategy', () => {
    expect(MongodbStrategy().check).to.be.a('function')
  })

  it('should be have a close method', () => {
    expect(MongodbStrategy().adapter.close).to.be.a('function')
  })

  it('should be have a connect method', () => {
    expect(MongodbStrategy().adapter.connect).to.be.a('function')
  })

  it('should be have a ping method', () => {
    expect(MongodbStrategy().adapter.ping).to.be.a('function')
  })

  it('should return the connection status', () => {
    const strategy = MongodbStrategy()
    expect(strategy.adapter.isConnected).to.equal(false)

    return strategy.adapter.connect(connectionUri)  
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(true)
      })
  })

  it('should close the connection', () => {
    const strategy = MongodbStrategy()

    return strategy.adapter.connect(connectionUri)  
      .then(() => {
        strategy.adapter.close()
        expect(strategy.adapter.isConnected).to.equal(false)

        strategy.adapter.close()
        expect(strategy.adapter.isConnected).to.equal(false)
      })
  })

  it('should cleanup', () => {
    const strategy = MongodbStrategy()

    return strategy.check(connectionUri)
      .then(() => {
        strategy.cleanup()

        expect(strategy.adapter.client).to.equal(null)
      })
  })

  it('should return true when mongo is healthy', () => {
    const strategy = MongodbStrategy()

    return strategy.check(connectionUri)
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  it('should return an error when mongo is unhealthy', () => {
    return MongodbStrategy()
      .check('some-fake-url')
      .catch((err) => {
        expect(err.message).to.contain('Invalid schema')
      })
  })

  it('should handle becoming healthy --> unhealthy', () => {
    const mongoServer = new MongodbMemoryServer({binary: { version: '3.2.9' }})
    return mongoServer.getConnectionString()
      .then(function(uri) {
        const strategy = MongodbStrategy()

        return strategy.check(uri)
          .then((res) => {
            expect(res).to.equal(true)
          })
          .then(() => {
            return mongoServer.stop()
          })
          .then(() => {
            return strategy.check(uri)
          })
          .catch((err) => {
            expect(err.message).to.contain('failed to connect')
          })
    })
  })

  it('should handle becoming unhealthy --> healthy', () => {
    const strategy = MongodbStrategy()

    return strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err).to.be.ok
      })
      .then(() => {
        return strategy.check(connectionUri)
      })
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  it('should handle a connection closing', () => {
    const strategy = MongodbStrategy()

    return strategy
      .check(connectionUri)
      .then((res) => {
        expect(res).to.equal(true)

        return strategy.adapter.client.close()
      })
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(false)
      })
  })
})
