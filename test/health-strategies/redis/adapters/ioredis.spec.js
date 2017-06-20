const expect = require('chai').expect
const MockIORedisClient = require('../../../mocks/ioredis')

describe('RedisStrategy - using the ioredis adapter', () => {
  const provideRedisStrategy = (...args) => {
    const CodependencyMock = require('../../../mocks/codependency')
    const Injector = require('../../../../lib/util/injector')
    const RedisStrategyFactory = require('../../../../lib/health-strategies/redis')

    return RedisStrategyFactory(
      Injector(CodependencyMock({
        ioredis: function () {
          return new MockIORedisClient(...args)
        }
      }))
    )
  }

  describe('Definition', () => {
    const RedisStrategy = provideRedisStrategy()

    it('should export a function', () => {
      expect(RedisStrategy).to.be.a('function')
    })

    it('should return a health strategy', () => {
      expect(RedisStrategy().check).to.be.a('function')
    })
  })

  describe('The adapter', () => {
    const RedisStrategy = provideRedisStrategy()

    it('should be have a close method', () => {
      expect(RedisStrategy().adapter.close).to.be.a('function')
    })

    it('should be have a connect method', () => {
      expect(RedisStrategy().adapter.connect).to.be.a('function')
    })

    it('should be have a ping method', () => {
      expect(RedisStrategy().adapter.ping).to.be.a('function')
    })

    it('should have a isConnected property', () => {
      expect(RedisStrategy().adapter.isConnected).to.equal(false)
    })
  })

  it('should cleanup the connection', () => {
    const strategy = provideRedisStrategy(true)()

    strategy
      .check('some-fake-url')
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(true)

        strategy.cleanup()
      })

    strategy.adapter.redis.on('close', () => {
      expect(strategy.adapter.isConnected).to.equal(false)
    })
  })

  it('should return true when redis is healthy', () => {
    const strategy = provideRedisStrategy(true)()

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
    const strategy = provideRedisStrategy(false, 'unreachable')()

    strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
      })
  })

  it('should handle becoming healthy --> unhealthy', () => {
    const strategy = provideRedisStrategy(true)()

    strategy
      .check('some-fake-url')
      .then((res) => {
        expect(res).to.equal(true)

        strategy.adapter.redis.shouldConnect = false
        strategy.adapter.redis.errmsg = 'unreachable'

        return strategy.check('some-fake-url')
      })
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
      })
  })

  it('should handle becoming unhealthy --> healthy', () => {
    const strategy = provideRedisStrategy(false, 'unreachable')()

    strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
        strategy.adapter.redis.shouldConnect = true

        return strategy.check('some-fake-url')
      })
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  it('should handle a connection closing', () => {
    const strategy = provideRedisStrategy(true)()

    strategy
      .check('some-fake-url')
      .then((res) => {
        expect(res).to.equal(true)

        return strategy.adapter.close()
      })
      .then(() => {
        setImmediate(() => {
          expect(strategy.adapter.isConnected).to.equal(false)
        })
      })
  })
})
