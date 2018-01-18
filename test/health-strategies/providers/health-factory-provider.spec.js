const expect = require('chai').expect
const noop = require('node-noop').noop

describe('HealthFactoryProvider', () => {
  const CodependencyMock = require('../../mocks/codependency')
  const Injector = require('../../../lib/util/injector')
  const HealthFactoryProvider = require('../../../lib/health-strategies/providers')
    .HealthFactoryProvider

  const injector = Injector(CodependencyMock({
    'node-fetch': noop,
    'mongodb': noop,
    'ioredis': noop,
    'sequelize': noop,
    'cluster-messages': noop
  }))

  it('should export a function', () => {
    expect(HealthFactoryProvider).to.be.a('function')
  })

  it('should return a configurable factory', () => {
    expect(HealthFactoryProvider(injector)).to.be.a('function')
  })

  it('should return a http strategy', () => {
    const httpStrategy = HealthFactoryProvider(injector)({ type: 'http' })

    expect(httpStrategy.check).to.be.a('function')
    expect(httpStrategy.httpAdapter.request).to.be.a('function')
  })

  it('should return a mongodb strategy', () => {
    const mongoStrategy = HealthFactoryProvider(injector)({ type: 'mongodb' })

    expect(mongoStrategy.check).to.be.a('function')
    expect(mongoStrategy.adapter.connect).to.be.a('function')
  })

  it('should return a redis strategy', () => {
    const mongoStrategy = HealthFactoryProvider(injector)({ type: 'redis' })

    expect(mongoStrategy.check).to.be.a('function')
    expect(mongoStrategy.adapter.connect).to.be.a('function')
  })

  it('should return a postgres strategy', () => {
    const postgresStrategy = HealthFactoryProvider(injector)({ type: 'postgres' })

    expect(postgresStrategy.check).to.be.a('function')
    expect(postgresStrategy.adapter.ping).to.be.a('function')
  })

  it("should return a copacetic strategy", () => {
    const copaceticStrategy = HealthFactoryProvider(injector)({ type: 'copacetic' })

    expect(copaceticStrategy.check).to.be.a('function')
    expect(copaceticStrategy.adapter.checkHealth).to.be.a('function')
  })

  it('should return null if a strategy is not available', () => {
    const notAStrategy = HealthFactoryProvider(injector)({ type: 'not-implemented' })

    expect(notAStrategy).to.equal(null)
  })
})
