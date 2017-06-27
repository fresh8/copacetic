const expect = require('chai').expect

describe('Postgres strategy - using the sequelize adapter', () => {
  let providePostgresStrategy

  before(() => {
    providePostgresStrategy = (...args) => {
      const CodependencyMock = require('../../../mocks/codependency')
      const Injector = require('../../../../lib/util/injector')
      const PostgresStrategyFactory = require('../../../../lib/health-strategies/postgres')
      const SequelizeMock = require('../../../mocks/sequelize')

      return PostgresStrategyFactory(
        Injector(CodependencyMock({
          sequelize: function () {
            return new SequelizeMock(...args)
          }
        }))
      )
    }
  })

  describe('Definition', () => {
    it('should export a function', () => {
      expect(providePostgresStrategy()).to.be.a('function')
    })

    it('should return a health strategy', () => {
      expect(providePostgresStrategy()().check).to.be.a('function')
    })
  })

  describe('The adapter', () => {
    it('should be have a close method', () => {
      expect(providePostgresStrategy()().adapter.close).to.be.a('function')
    })

    it('should be have a ping method', () => {
      expect(providePostgresStrategy()().adapter.ping).to.be.a('function')
    })
  })

  describe('when closing the connection', () => {
    it('should do nothing if no connection exists', () => {
      const strategy = providePostgresStrategy()()

      expect(strategy.adapter.connection).to.equal(undefined)
      strategy.adapter.close()
      expect(strategy.adapter.connection).to.equal(undefined)
    })
  })

  it('should cleanup connection', () => {
    const strategy = providePostgresStrategy()()

    strategy
      .check('some-fake-url')
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(true)

        return strategy.cleanup()
      })
      .then(() => {
        expect(strategy.adapter.isConnected).to.equal(false)
      })
  })

  it('should return true when postgres is healthy', () => {
    const strategy = providePostgresStrategy()()

    strategy
      .check('some-fake-url')
      // create the connection
      .then((res) => {
        expect(res).to.equal(true)

        return strategy.check('some-fake-url')
      })
      // just ping
      .then((res) => {
        expect(res).to.equal(true)
      })
  })

  it('should return an error when postgres is unhealthy', () => {
    const strategy = providePostgresStrategy('unreachable')()

    strategy
      .check('some-fake-url')
      .catch((err) => {
        expect(err.message).to.equal('unreachable')
      })
  })
})
